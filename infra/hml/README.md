# TCG Market — Homologação (HML) na AWS

Fluxo: **merge na `main` → testes no GitHub Actions → imagem no GHCR com tag do commit → deploy na EC2 via AWS Systems Manager → verificação de saúde (com rollback automático)**.

O backend é compilado só no GitHub Actions. A EC2 apenas baixa a imagem pronta. A persistência em HML é o **MongoDB Atlas**; não existe MongoDB na EC2.

> **Situação atual:** o código está pronto, mas o deploy automático fica **desligado** até a variável de repositório `HML_DEPLOY_ENABLED` valer `true`. Enquanto isso, o merge na `main` só roda os testes e publica a imagem. Os passos manuais estão na [seção 9](#9-checklist-de-ativação).

## 1. Arquivos

| Arquivo | Função |
| --- | --- |
| `backend/Dockerfile` | Build multi-stage: JDK 25 + Maven Wrapper no build, JRE 25 no runtime, usuário não-root `app` (uid 10001). |
| `backend/.dockerignore` | Envia ao build só `pom.xml`, `mvnw`, `.mvn/` e `src/`. Nunca envia `.env`. |
| `.github/workflows/backend-ci-cd.yml` | CI em PR, publicação no GHCR e deploy em HML. |
| `infra/hml/compose.yaml` | Backend (sempre) e Caddy (perfil `https`). Sem MongoDB. |
| `infra/hml/Caddyfile` | Proxy reverso com HTTPS automático (Let's Encrypt). |
| `infra/hml/deploy.sh` | Troca a imagem, espera a saúde e volta para a versão anterior se falhar. |
| `infra/hml/healthcheck.sh` | Espera o contêiner ficar `healthy` e continuar respondendo por uma janela de estabilidade. |
| `infra/hml/rollback.sh` | Volta para a versão anterior registrada (ou uma imagem informada). |
| `infra/hml/ssm-deploy.sh` | Roda no Actions: envia o deploy para a EC2 via SSM Run Command. |

O `backend/docker-compose.yml` continua sendo o ambiente de **desenvolvimento** (MongoDB local) e não é usado em HML.

## 2. Pipeline

| Evento | Testes | Imagem no GHCR | Deploy em HML |
| --- | --- | --- | --- |
| PR para `main` | sim (MongoDB descartável no runner) | não | não |
| Push/merge na `main` | sim | sim, se os testes passarem | sim, se a imagem foi publicada e `HML_DEPLOY_ENABLED=true` |
| `workflow_dispatch` na `main` sem `image_sha` | sim | sim | sim (mesmas condições) |
| `workflow_dispatch` na `main` com `image_sha` | não | não | reimplanta a imagem `sha-<image_sha>` já publicada |

- Os jobs de PR usam `pull_request` (nunca `pull_request_target`), não têm acesso a segredos nem ao environment `hml`, e o token só lê o repositório.
- O workflow só dispara quando muda algo em `backend/**`, `infra/hml/**` ou no próprio workflow. **Atenção:** se no futuro esse check virar obrigatório no ruleset da `main`, PRs que só mexem no frontend ficarão aguardando; nesse caso remova o filtro `paths` do `pull_request`.
- Tags publicadas: `ghcr.io/pi3-tcg/tcgmarket-backend:sha-<commit completo>` (imutável, usada no deploy) e `:hml` (ponteiro de conveniência, nunca usado no deploy).
- Deploys são serializados (`concurrency: deploy-hml`, sem cancelar o que está rodando). Todos os jobs têm `timeout-minutes`.

### Por que SSM e não SSH ou runner self-hosted

| Opção | Avaliação |
| --- | --- |
| **SSM Run Command (escolhida)** | Nenhuma porta de entrada precisa ser aberta. O Actions recebe credenciais temporárias via OIDC, sem chave AWS guardada no GitHub. A role só consegue enviar comandos para esta instância e só pode ser assumida pelo environment `hml`. Run Command, IAM e OIDC não têm custo. Exige role na EC2 e agente SSM ativo (o agente já vem nas AMIs Ubuntu oficiais). |
| SSH de runner do GitHub | Runners têm IPs variáveis: exigiria abrir a porta 22 para faixas enormes ou para a internet, e guardar chave privada no GitHub. Descartado. |
| Runner self-hosted na EC2 | O repositório é **público**: um runner self-hosted pode executar código de terceiros. Também consome RAM da `t3.small` e exige manutenção. Descartado. |

## 3. AWS — preparar o acesso do pipeline (uma vez)

Nada aqui cria recursos pagos. Substitua `<ACCOUNT_ID>` e `<INSTANCE_ID>` (ex.: `i-0abc...`).

### 3.1 Role da EC2 para o agente SSM

1. IAM → Roles → Create role → *AWS service* → *EC2*.
2. Anexe a política gerenciada **`AmazonSSMManagedInstanceCore`**. Nome sugerido: `tcgmarket-hml-ec2`.
3. EC2 → instância `tcgmarket-api-hml` → Actions → Security → **Modify IAM role** → selecione a role.
4. Na EC2, confirme o agente e reinicie para pegar a credencial:

   ```bash
   sudo snap services amazon-ssm-agent
   sudo snap restart amazon-ssm-agent
   ```

5. Systems Manager → Fleet Manager: a instância deve aparecer como *Online*. Isso também libera o **Session Manager**, que dá terminal na EC2 sem SSH (opcional: depois de validar, a regra da porta 22 pode até ser removida).

O agente precisa de saída HTTPS (443) para os endpoints do SSM. O security group padrão libera toda a saída; não é necessário VPC endpoint (que seria pago).

### 3.2 Provedor OIDC do GitHub

IAM → Identity providers → Add provider → *OpenID Connect*:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

### 3.3 Role de deploy assumida pelo GitHub Actions

IAM → Roles → Create role → *Custom trust policy*. Nome sugerido: `tcgmarket-hml-github-deploy`.

Trust policy (só jobs do environment `hml` deste repositório):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": "repo:PI3-TCG/TCGMarket:environment:hml"
        }
      }
    }
  ]
}
```

Política inline de permissões (só esta instância e só o documento `AWS-RunShellScript`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SendDeployCommand",
      "Effect": "Allow",
      "Action": "ssm:SendCommand",
      "Resource": [
        "arn:aws:ssm:us-east-1::document/AWS-RunShellScript",
        "arn:aws:ec2:us-east-1:<ACCOUNT_ID>:instance/<INSTANCE_ID>"
      ]
    },
    {
      "Sid": "ReadDeployResult",
      "Effect": "Allow",
      "Action": ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"],
      "Resource": "*"
    }
  ]
}
```

> Quem assume essa role executa comandos como root na EC2. Por isso o environment `hml` deve aceitar **apenas a branch `main`** (seção 4).

### 3.4 Security group

- 22/TCP: só o IP pessoal do responsável (ou remover e usar Session Manager).
- 80 e 443/TCP: abertos. Enquanto o perfil `https` não estiver ativo, nada escuta nessas portas.
- **Não** criar regras para 8080 nem 27017. O backend publica a 8080 só em `127.0.0.1`.

## 4. GitHub — environment, variáveis e pacote

Nenhum segredo precisa ser cadastrado no GitHub: a AWS usa OIDC e o GHCR usa o `GITHUB_TOKEN` efêmero do próprio job.

1. **Environment `hml`** restrito à `main`:

   ```bash
   gh api -X PUT repos/PI3-TCG/TCGMarket/environments/hml \
     -F 'deployment_branch_policy[protected_branches]=false' \
     -F 'deployment_branch_policy[custom_branch_policies]=true'
   gh api -X POST repos/PI3-TCG/TCGMarket/environments/hml/deployment-branch-policies \
     -f name=main -f type=branch
   ```

   Opcional: em Settings → Environments → `hml`, adicionar *Required reviewers* para aprovar cada deploy.

2. **Variáveis do environment `hml`** (não são segredos):

   ```bash
   gh variable set AWS_REGION          --env hml --body us-east-1 -R PI3-TCG/TCGMarket
   gh variable set AWS_DEPLOY_ROLE_ARN --env hml --body 'arn:aws:iam::<ACCOUNT_ID>:role/tcgmarket-hml-github-deploy' -R PI3-TCG/TCGMarket
   gh variable set HML_INSTANCE_ID     --env hml --body '<INSTANCE_ID>' -R PI3-TCG/TCGMarket
   # Só depois do HTTPS pronto (seção 7):
   gh variable set HML_API_URL         --env hml --body 'https://<subdominio-da-api>' -R PI3-TCG/TCGMarket
   ```

3. **Pacote no GHCR.** O primeiro push na `main` cria `ghcr.io/pi3-tcg/tcgmarket-backend`. Pacotes novos de organização nascem privados.
   - **Recomendado:** tornar o pacote **público** (o repositório já é público e a imagem não contém segredos). Organização → Packages → `tcgmarket-backend` → Package settings → Change visibility. Assim a EC2 baixa sem credencial. Se a organização bloquear pacotes públicos, um owner precisa liberar em Settings → Packages.
   - Alternativa privada: na EC2, `sudo docker login ghcr.io -u <usuario> --password-stdin` com um token **somente de leitura de pacotes** (`read:packages`) de uma conta com acesso. O Docker grava esse token sem criptografia em `/root/.docker/config.json`; o token expira e precisará ser renovado.
   - Se o push falhar com 403, confirme em Package settings → *Manage Actions access* que o repositório `TCGMarket` tem papel **Write**.

4. **Ativação**, por último (variável de repositório, porque é lida antes do job entrar no environment):

   ```bash
   gh variable set HML_DEPLOY_ENABLED --body true -R PI3-TCG/TCGMarket
   ```

## 5. EC2 — preparação (uma vez)

Execute na EC2 (SSH ou Session Manager). `<SHA>` é o commit da `main` que contém `infra/hml/`.

```bash
sudo install -d -m 0750 /opt/tcgmarket /opt/tcgmarket/state
SHA=<SHA>
for f in compose.yaml Caddyfile deploy.sh healthcheck.sh rollback.sh; do
  sudo curl -fsSL -o "/opt/tcgmarket/$f" "https://raw.githubusercontent.com/PI3-TCG/TCGMarket/$SHA/infra/hml/$f"
done
sudo chmod 0755 /opt/tcgmarket/*.sh
```

A cada deploy pelo pipeline, esses arquivos são atualizados automaticamente a partir do commit implantado.

### 5.1 Variáveis da aplicação (`/opt/tcgmarket/backend.env`)

Crie o arquivo vazio com permissão restrita **antes** de escrever nele, e gere o `JWT_SECRET` direto no arquivo, sem exibi-lo:

```bash
sudo install -m 600 -o root -g root /dev/null /opt/tcgmarket/backend.env
printf 'JWT_SECRET=%s\n' "$(openssl rand -base64 48)" | sudo tee -a /opt/tcgmarket/backend.env > /dev/null
sudo nano /opt/tcgmarket/backend.env
```

Conteúdo esperado (nomes iguais a `backend/.env.example`):

```dotenv
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>/<banco_hml>?retryWrites=true&w=majority&serverSelectionTimeoutMS=5000
JWT_SECRET=<gerado acima: 48 bytes aleatórios, acima do mínimo de 32>
JWT_EXPIRATION=24h
CORS_ALLOWED_ORIGINS=https://<frontend-hml>,http://localhost:5173
ADMIN_EMAIL=
POKEMON_TCG_API_KEY=
```

- Com o perfil `hml`, a aplicação **não sobe** sem `CORS_ALLOWED_ORIGINS`, para evitar CORS aberto.
- O `deploy.sh` recusa rodar se `backend.env` não tiver permissão `600`.
- Nunca copie esse arquivo para o repositório nem cole o conteúdo em issues, PRs ou chats.

### 5.2 Configuração do Compose (`/opt/tcgmarket/.env`)

Arquivo sem segredos. `BACKEND_IMAGE` é mantido pelo `deploy.sh`; as outras linhas são suas:

```dotenv
# Ative só depois do DNS pronto (seção 7):
# COMPOSE_PROFILES=https
# API_DOMAIN=api-hml.exemplo.com.br
```

### 5.3 Memória (opcional, recomendado)

A `t3.small` tem 2 GiB. O backend fica limitado a 900 MiB (heap em 65% disso) e o Caddy a 128 MiB. Um swap de 1 GiB no EBS existente dá margem contra OOM sem custo adicional:

```bash
sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5.4 Primeiro deploy

Com as seções 3, 4 e 5 prontas, rode o workflow manualmente (Actions → *Backend CI/CD (HML)* → *Run workflow* na `main`) ou, direto na EC2:

```bash
sudo /opt/tcgmarket/deploy.sh ghcr.io/pi3-tcg/tcgmarket-backend:sha-<commit completo>
curl -s http://127.0.0.1:8080/api/health/ready
```

## 6. MongoDB Atlas

- **Usuário:** crie um usuário exclusivo de HML com papel `readWrite` **apenas** no banco de HML (Database Access → *Specific privileges*). Não use o usuário de administração.
- **Rede:** em Network Access, libere só o IP público da EC2 (`/32`). **Não** use `0.0.0.0/0`.
- **IP dinâmico:** o IP público da EC2 muda quando a instância é parada e iniciada (reboot mantém). Depois de um stop/start, atualize a liberação no Atlas, o DNS (seção 7) e a regra SSH. Um Elastic IP resolveria, mas só deve ser alocado com aprovação: a AWS cobra todo IPv4 público por hora (inclusive o atual) e cobra também Elastic IP parado.
- **TLS:** URIs `mongodb+srv://` já usam TLS.
- **Teste:** depois do deploy, `curl -s http://127.0.0.1:8080/api/health/ready` na EC2 deve responder `"status":"UP"`. Com `DOWN` (HTTP 503), o problema está na conexão com o Atlas (IP não liberado, usuário/senha, nome do cluster).

## 7. DNS e HTTPS (pendente: domínio não definido)

HTTPS **não está ativo** e não deve ser simulado por IP. Quando houver um subdomínio:

1. Crie um registro `A` apontando o subdomínio (ex.: `api-hml.<dominio>`) para o IP público atual da EC2.
2. Confirme a resolução: `dig +short api-hml.<dominio>`.
3. Em `/opt/tcgmarket/.env`, descomente `COMPOSE_PROFILES=https` e preencha `API_DOMAIN`.
4. Aplique: `sudo /opt/tcgmarket/deploy.sh "$(cat /opt/tcgmarket/state/current_image)"`. O Caddy obtém o certificado da Let's Encrypt (precisa das portas 80 e 443 abertas).
5. Teste de fora: `curl -s https://api-hml.<dominio>/api/health/ready`.
6. Cadastre `HML_API_URL` no environment `hml` para o pipeline verificar o endpoint público a cada deploy.
7. Ajuste `CORS_ALLOWED_ORIGINS` com a URL real do frontend de HML.

O Spring usa `server.forward-headers-strategy=framework` no perfil `hml`, então respeita os cabeçalhos `X-Forwarded-*` enviados pelo Caddy. Isso é seguro porque a porta 8080 só é alcançável pela própria EC2 e pela rede interna do Compose.

## 8. Operação

### Saúde

- `GET /api/health`: liveness, resposta fixa, público.
- `GET /api/health/ready`: readiness, faz `ping` no MongoDB; `200 UP` ou `503 DOWN`, sem detalhes do erro. Público. É o que o healthcheck do Docker, o `deploy.sh` e o pipeline usam.

### Deploy e rollback

- **Deploy:** o `deploy.sh` baixa a imagem antes de trocar (o contêiner antigo segue no ar durante o download), recria o backend e exige `healthy` em até 180 s mais 30 s de estabilidade respondendo `200`.
- **Rollback automático:** se a nova versão não ficar saudável, crashar ou reiniciar, o script volta para a versão anterior, confirma a saúde dela e encerra com erro (o job do Actions fica vermelho).
- **Rollback manual na EC2:** `sudo /opt/tcgmarket/rollback.sh` (volta para `state/previous_image`) ou `sudo /opt/tcgmarket/rollback.sh ghcr.io/pi3-tcg/tcgmarket-backend:sha-<commit>`.
- **Rollback pelo GitHub:** *Run workflow* na `main` com `image_sha` = commit desejado. Não recompila, só reimplanta a imagem existente.
- A EC2 mantém localmente só a imagem atual e a anterior; as demais continuam no GHCR.

**Limitações reais:**

- Há uma janela curta sem serviço (dezenas de segundos) enquanto o contêiner é recriado e o Spring sobe. Blue/green exigiria duas JVMs na mesma `t3.small`, o que é arriscado com 2 GiB.
- O rollback troca só a imagem. Alterações de dados feitas no Atlas pela versão nova não são desfeitas.

### Logs e diagnóstico (na EC2)

```bash
cd /opt/tcgmarket
sudo docker compose ps
sudo docker compose logs --tail 200 backend
sudo docker compose logs --tail 100 caddy
sudo docker stats --no-stream
sudo docker inspect -f '{{.State.OOMKilled}} {{.RestartCount}}' tcgmarket-backend
cat state/current_image state/previous_image
```

Logs do Docker têm rotação (3 arquivos de 10 MB por contêiner). A saída do `deploy.sh` vai para o log **público** do GitHub Actions; por isso ele não imprime variáveis nem logs da aplicação.

### Troubleshooting

| Sintoma | Causa provável |
| --- | --- |
| Job de deploy aparece como *skipped* | `HML_DEPLOY_ENABLED` não é `true` (variável de repositório), ou testes/publicação falharam. |
| `Not authorized to perform sts:AssumeRoleWithWebIdentity` | Trust policy: `sub` deve ser `repo:PI3-TCG/TCGMarket:environment:hml`; provedor OIDC ausente. |
| `InvalidInstanceId` no `send-command` | Instância sem a role `AmazonSSMManagedInstanceCore` ou agente SSM parado/offline. |
| `não foi possível baixar ...` | Pacote privado sem `docker login` na EC2, ou a tag não existe (a publicação falhou). |
| Readiness `503 DOWN` | Atlas recusando a conexão: IP da EC2 fora do Network Access, credenciais ou URI. |
| Aplicação não sobe: `Could not resolve placeholder 'CORS_ALLOWED_ORIGINS'` | Variável ausente em `backend.env`. |
| `OOMKilled=true` | Memória insuficiente: ativar swap (5.3) e revisar `mem_limit`. |
| Caddy sem certificado | DNS ainda não aponta para o IP atual, ou porta 80/443 bloqueada. |
| Deploy falha ao baixar os scripts | O SSM baixa `infra/hml/` de `raw.githubusercontent.com`; isso exige o repositório público. Se ele virar privado, troque essa etapa. |

## 9. Checklist de ativação

1. [ ] Role `AmazonSSMManagedInstanceCore` na EC2 e instância *Online* no Fleet Manager (3.1).
2. [ ] Provedor OIDC e role de deploy com trust policy restrita ao environment `hml` (3.2, 3.3).
3. [ ] Environment `hml` restrito à `main` e variáveis `AWS_REGION`, `AWS_DEPLOY_ROLE_ARN`, `HML_INSTANCE_ID` (4).
4. [ ] Usuário e Network Access do Atlas (6).
5. [ ] `/opt/tcgmarket` preparado, `backend.env` com permissão 600 (5).
6. [ ] Merge deste PR → imagem publicada → pacote tornado público ou `docker login` na EC2 (4.3).
7. [ ] Primeiro deploy manual e `/api/health/ready` = `UP` (5.4).
8. [ ] `HML_DEPLOY_ENABLED=true` (4.4).
9. [ ] Domínio, DNS, perfil `https`, `HML_API_URL` e CORS final (7).

## 10. Custos e limites

Preços de tabela on-demand em `us-east-1`; confirme no AWS Billing, porque podem mudar. Nada além do que já existe é criado por esta automação.

| Item | Estimativa mensal |
| --- | --- |
| EC2 `t3.small` (US$ 0,0208/h × 730 h) | ~US$ 15,20 |
| EBS gp3 20 GiB (US$ 0,08/GB-mês) | ~US$ 1,60 |
| IPv4 público (US$ 0,005/h) | ~US$ 3,65 |
| SSM Run Command, Session Manager, IAM, OIDC | US$ 0 |
| Transferência de saída | primeiros 100 GB/mês gratuitos |
| GitHub Actions e GHCR (repositório e pacote públicos) | US$ 0 |
| **Total** | **~US$ 20,50/mês**, ~US$ 62 de outubro a dezembro, descontados dos créditos |

- Instâncias T3 nascem em modo *unlimited*: uso de CPU acima da linha de base por muito tempo gera cobrança de créditos extras. Como o build acontece no GitHub, o uso esperado é baixo; confira em EC2 → instância → *Credit specification* (mudar para *standard* não tem custo).
- **Não** foram criados RDS, ECR, Load Balancer, NAT Gateway, VPC endpoints, Route 53, CloudWatch Logs nem Elastic IP.
- Se o pacote ficar privado, o GHCR tem cota gratuita de armazenamento por conta/organização; verifique o plano da organização.
