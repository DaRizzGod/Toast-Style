# Ordering System (Toast-Style) — AWS + Next.js + AI Ops

This repo is a production‑lean starter:
- **Frontend**: Next.js (App Router) → S3 + CloudFront
- **Backend**: API Gateway (HTTP API) + Lambda (Node 20, TypeScript)
- **Data**: DynamoDB (Menu, Orders)
- **Auth**: Cognito
- **Payments**: Stripe (Checkout + Webhooks)
- **AI Ops**: EventBridge → Lambda (incident triage) → Slack webhook

## Prereqs
- Node.js 20+
- Terraform 1.6+
- AWS CLI configured (default region suggested: `us-west-2`)
- A Stripe account (test keys)

## Quick Start
1. **Clone & install**
   ```bash
   npm -C app/backend install
   npm -C app/frontend install
   ```
2. **Copy env**
   ```bash
   cp .env.example app/backend/.env && cp .env.example app/frontend/.env
   ```
3. **Build backend (bundle Lambdas)**
   ```bash
   npm -C app/backend run build
   ```
4. **Deploy infra**
   ```bash
   cd infra
   terraform init
   terraform apply -auto-approve
   ```
   Outputs include **CloudFront URL**, **API base URL**, **Cognito IDs**.

5. **Publish frontend** (static export → S3)
   ```bash
   export NEXT_PUBLIC_API_BASE="$(terraform -chdir=infra output -raw api_base_url)"
   export NEXT_PUBLIC_COGNITO_USER_POOL_ID="$(terraform -chdir=infra output -raw cognito_user_pool_id)"
   export NEXT_PUBLIC_COGNITO_CLIENT_ID="$(terraform -chdir=infra output -raw cognito_client_id)"
   npm -C app/frontend run build
   npm -C app/frontend run export
   aws s3 sync app/frontend/out s3://$(terraform -chdir=infra output -raw web_bucket)/ --delete
   ```

6. **Seed menu (optional)**
   ```bash
   aws dynamodb put-item      --table-name $(terraform -chdir=infra output -raw menu_table)      --item '{"pk":{"S":"REST#righteous"},"sk":{"S":"ITEM#margherita"},"name":{"S":"Margherita"},"priceCents":{"N":"1200"},"category":{"S":"Pizza"},"isAvailable":{"BOOL":true}}'
   ```

7. **Stripe webhook**
   - In Stripe Dashboard, add endpoint: `POST <api_base_url>/stripe/webhook` 
   - Events: `checkout.session.completed`

## Dev scripts
- `make package` – bundles Lambdas into `dist/`
- `make deploy` – `terraform apply` + sync frontend

## Clean up
```bash
cd infra && terraform destroy
```
