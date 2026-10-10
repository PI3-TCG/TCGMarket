#!/usr/bin/env bash
# Espera o backend ficar "healthy" e continuar respondendo durante uma janela de estabilidade.
# Uso: healthcheck.sh [timeout_em_segundos] [estabilidade_em_segundos]
set -euo pipefail

CONTAINER="${CONTAINER:-tcgmarket-backend}"
READY_URL="${READY_URL:-http://127.0.0.1:8080/api/health/ready}"
TIMEOUT="${1:-${HEALTH_TIMEOUT:-180}}"
STABILITY="${2:-${HEALTH_STABILITY:-30}}"
INTERVAL=5

log() { printf '[healthcheck] %s\n' "$*"; }

inspect() {
  docker inspect -f "$1" "$CONTAINER" 2>/dev/null || echo ""
}

restarts_at_start="$(inspect '{{.RestartCount}}')"

restarted() {
  [ "$(inspect '{{.RestartCount}}')" != "$restarts_at_start" ] || [ "$(inspect '{{.State.Running}}')" != "true" ]
}

report_crash() {
  log "contêiner parou ou reiniciou (reinícios=$(inspect '{{.RestartCount}}'), OOMKilled=$(inspect '{{.State.OOMKilled}}'))"
}

deadline=$((SECONDS + TIMEOUT))
while true; do
  status="$(inspect '{{if .State.Health}}{{.State.Health.Status}}{{end}}')"
  case "$status" in
    healthy) break ;;
    unhealthy) log "contêiner ficou unhealthy"; exit 1 ;;
    "") log "contêiner $CONTAINER não encontrado ou sem healthcheck"; exit 1 ;;
  esac
  if restarted; then report_crash; exit 1; fi
  if [ "$SECONDS" -ge "$deadline" ]; then
    log "não ficou healthy em ${TIMEOUT}s (último estado: $status)"
    exit 1
  fi
  sleep "$INTERVAL"
done

log "healthy; observando por ${STABILITY}s"
stable_until=$((SECONDS + STABILITY))
while [ "$SECONDS" -lt "$stable_until" ]; do
  code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "$READY_URL" || true)"
  if [ "$code" != "200" ]; then
    log "readiness respondeu HTTP $code durante a janela de estabilidade"
    exit 1
  fi
  if restarted; then report_crash; exit 1; fi
  sleep "$INTERVAL"
done

log "OK"
