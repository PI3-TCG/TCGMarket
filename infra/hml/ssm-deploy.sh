#!/usr/bin/env bash
# Roda no GitHub Actions: pede à EC2, via SSM Run Command, que sincronize os
# arquivos de infra/hml do commit SCRIPTS_SHA e execute o deploy.sh com a imagem.
# Não exige porta de entrada aberta na EC2.
set -euo pipefail

: "${AWS_REGION:?defina AWS_REGION}"
: "${HML_INSTANCE_ID:?defina HML_INSTANCE_ID}"
: "${IMAGE_REPO:?defina IMAGE_REPO}"
: "${IMAGE_SHA:?defina IMAGE_SHA}"
: "${SCRIPTS_SHA:?defina SCRIPTS_SHA}"
: "${GITHUB_REPOSITORY:?defina GITHUB_REPOSITORY}"

WAIT_SECONDS="${WAIT_SECONDS:-900}"

[[ "$IMAGE_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "IMAGE_SHA inválido"; exit 1; }
[[ "$SCRIPTS_SHA" =~ ^[0-9a-f]{40}$ ]] || { echo "SCRIPTS_SHA inválido"; exit 1; }
[[ "$HML_INSTANCE_ID" =~ ^i-[0-9a-f]{8,17}$ ]] || { echo "HML_INSTANCE_ID inválido"; exit 1; }

image="${IMAGE_REPO}:sha-${IMAGE_SHA}"
base_url="https://raw.githubusercontent.com/${GITHUB_REPOSITORY}/${SCRIPTS_SHA}/infra/hml"

# O agente SSM executa com /bin/sh (dash no Ubuntu), então o script remoto é POSIX.
remote_script="$(cat <<EOF
set -eu
APP_DIR=/opt/tcgmarket
TMP=\$(mktemp -d)
trap 'rm -rf "\$TMP"' EXIT
for f in compose.yaml Caddyfile deploy.sh healthcheck.sh rollback.sh; do
  curl -fsSL --retry 3 "${base_url}/\$f" -o "\$TMP/\$f"
done
install -m 0644 "\$TMP/compose.yaml" "\$TMP/Caddyfile" "\$APP_DIR/"
install -m 0755 "\$TMP/deploy.sh" "\$TMP/healthcheck.sh" "\$TMP/rollback.sh" "\$APP_DIR/"
"\$APP_DIR/deploy.sh" "${image}"
EOF
)"

parameters="$(jq -cn --arg script "$remote_script" \
  '{commands: ($script | split("\n")), executionTimeout: ["840"]}')"

echo "Enviando deploy de ${image} para ${HML_INSTANCE_ID}"
command_id="$(aws ssm send-command \
  --region "$AWS_REGION" \
  --instance-ids "$HML_INSTANCE_ID" \
  --document-name AWS-RunShellScript \
  --comment "tcgmarket hml sha-${IMAGE_SHA:0:12}" \
  --timeout-seconds 600 \
  --parameters "$parameters" \
  --query Command.CommandId \
  --output text)"
echo "SSM CommandId: ${command_id}"

deadline=$((SECONDS + WAIT_SECONDS))
status=Pending
while [ "$SECONDS" -lt "$deadline" ]; do
  sleep 10
  status="$(aws ssm get-command-invocation \
    --region "$AWS_REGION" \
    --command-id "$command_id" \
    --instance-id "$HML_INSTANCE_ID" \
    --query Status \
    --output text 2>/dev/null || echo Pending)"
  case "$status" in
    Pending | InProgress | Delayed) continue ;;
    *) break ;;
  esac
done

echo "Status final: ${status}"
for stream in StandardOutputContent StandardErrorContent; do
  echo "----- ${stream} -----"
  aws ssm get-command-invocation \
    --region "$AWS_REGION" \
    --command-id "$command_id" \
    --instance-id "$HML_INSTANCE_ID" \
    --query "$stream" \
    --output text 2>/dev/null || true
done

[ "$status" = "Success" ]
