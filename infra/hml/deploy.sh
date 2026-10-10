#!/usr/bin/env bash
# Troca a imagem do backend na EC2 e volta para a anterior se a nova não ficar saudável.
# Uso: sudo /opt/tcgmarket/deploy.sh ghcr.io/pi3-tcg/tcgmarket-backend:sha-<commit com 40 caracteres>
#
# Não imprime variáveis de ambiente nem logs da aplicação: a saída vai para o log
# público do GitHub Actions. Para investigar, use "docker compose logs" na EC2.
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/tcgmarket}"
IMAGE_REPO="${IMAGE_REPO:-ghcr.io/pi3-tcg/tcgmarket-backend}"
STATE_DIR="$APP_DIR/state"

log() { printf '[deploy] %s\n' "$*"; }
fail() { log "ERRO: $*"; exit 1; }

target="${1:-}"
pattern="^${IMAGE_REPO//./\\.}:sha-[0-9a-f]{40}$"
[[ "$target" =~ $pattern ]] || fail "uso: deploy.sh ${IMAGE_REPO}:sha-<commit com 40 caracteres>"

cd "$APP_DIR"
mkdir -p "$STATE_DIR"

exec 9>"$STATE_DIR/deploy.lock"
flock -n 9 || fail "outro deploy já está em andamento"

[ -f backend.env ] || fail "$APP_DIR/backend.env não existe (veja infra/hml/README.md)"
env_mode="$(stat -c '%a' backend.env)"
case "$env_mode" in
  600 | 400) ;;
  *) fail "backend.env precisa de permissão 600 (atual: $env_mode)" ;;
esac

set_image() {
  local tmp
  tmp="$(mktemp "$APP_DIR/.env.XXXXXX")"
  { grep -v '^BACKEND_IMAGE=' .env 2>/dev/null || true; echo "BACKEND_IMAGE=$1"; } >"$tmp"
  chmod 644 "$tmp"
  mv "$tmp" .env
}

start_backend() {
  set_image "$1"
  docker compose up -d --no-deps backend
}

refresh_proxy() {
  docker compose config --services | grep -qx caddy || return 0
  grep -q '^API_DOMAIN=.' .env || fail "perfil https ativo, mas API_DOMAIN está vazio no .env"
  docker compose up -d caddy
  docker compose exec -T caddy caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
}

prune_images() {
  local keep_previous ref
  keep_previous="$(cat "$STATE_DIR/previous_image" 2>/dev/null || true)"
  docker image ls "$IMAGE_REPO" --format '{{.Repository}}:{{.Tag}}' | while read -r ref; do
    case "$ref" in
      "$target" | "$keep_previous" | *:"<none>") ;;
      *) docker image rm "$ref" >/dev/null 2>&1 || true ;;
    esac
  done
  docker image prune -f >/dev/null
}

current="$(cat "$STATE_DIR/current_image" 2>/dev/null || true)"
log "versão atual: ${current:-nenhuma}"
log "versão alvo:  $target"

docker pull -q "$target" >/dev/null || fail "não foi possível baixar $target (a tag existe? a EC2 tem acesso ao GHCR?)"

# Sobe a nova versão só depois do pull para reduzir o tempo fora do ar.
start_backend "$target"

if "$APP_DIR/healthcheck.sh"; then
  if [ "$current" != "$target" ]; then
    [ -n "$current" ] && echo "$current" >"$STATE_DIR/previous_image"
    echo "$target" >"$STATE_DIR/current_image"
  fi
  refresh_proxy
  prune_images
  log "sucesso: $target no ar"
  exit 0
fi

log "a nova versão não ficou saudável"
if [ -z "$current" ] || [ "$current" = "$target" ]; then
  fail "não há versão anterior diferente para restaurar; verifique com 'docker compose logs backend'"
fi

log "restaurando $current"
start_backend "$current"
if "$APP_DIR/healthcheck.sh"; then
  fail "deploy de $target falhou; rollback para $current concluído"
fi
fail "deploy falhou e o rollback para $current também não ficou saudável: intervenção manual necessária"
