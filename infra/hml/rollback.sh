#!/usr/bin/env bash
# Volta para a versão anterior registrada (ou para a imagem informada) pelo mesmo fluxo do deploy.
# Uso: sudo /opt/tcgmarket/rollback.sh [ghcr.io/pi3-tcg/tcgmarket-backend:sha-<commit>]
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/tcgmarket}"

target="${1:-$(cat "$APP_DIR/state/previous_image" 2>/dev/null || true)}"
if [ -z "$target" ]; then
  echo "[rollback] nenhuma versão anterior registrada em $APP_DIR/state/previous_image; informe a imagem" >&2
  exit 1
fi

exec "$APP_DIR/deploy.sh" "$target"
