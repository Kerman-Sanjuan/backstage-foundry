# Demo infrastructure: one button up, one button down

The 3 December talk shows a gateway in front of a Foundry model. That needs real
resources for a week, and then it must be gone. This folder is the lifecycle of those
resources, driven by one manually dispatched workflow:

`.github/workflows/demo-azure.yml`

| Input | What it does |
|---|---|
| `action: up` | resource group, Foundry account and one small deployment, AI Gateway, aliases, policies, two team keys |
| `action: down` | deletes the resource group and waits until it is actually gone |
| `action: status` | read-only: what exists, which caps are in force, when the keys expire |

`down` refuses to run unless you type the resource group name in `confirm`.

## Why it is built this way

- **Everything in one resource group.** Nothing is shared with the rest of your
  subscription, so deleting the group is the whole teardown. There is no list of
  resources to remember.
- **Keys expire.** `ttl_days` (7 by default) is applied to both team keys. A forgotten
  teardown stops working on its own.
- **Caps live in the pipeline, not in the portal.** `infra/azure/policies.json` holds
  the token limit per caller plus a **shared** monthly ceiling on requests and on
  estimated spend. A shared counter (`counterKey: []`) is the only one that answers
  "how do I guarantee the number of calls": no caller can walk past it.
- **No secrets in git and no secrets in logs.** The workflow federates into Azure with
  OIDC. Key values are never printed; the repository is public.

## One-time setup (about ten minutes)

The workflow needs an app registration federated to this repository and the
`vars` below. Run this once with the Azure CLI, signed in as yourself:

```bash
RG_SETUP=rg-aigw-demo-setup          # any name; it only holds the identity
APP=aigw-demo-github
REPO=Kerman-Sanjuan/backstage-foundry

az group create -n "$RG_SETUP" -l westeurope

az ad app create --display-name "$APP" --query appId -o tsv > app-id.txt
APP_ID=$(cat app-id.txt)

az ad sp create --id "$APP_ID"
az role assignment create --assignee "$APP_ID" --role Contributor \
  --scope "/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-aigw-demo-*"

# Federated credential: only this repository, only the foundry environment.
az ad app federated-credential create --id "$APP_ID" --parameters "{
  \"name\": \"github-foundry\",
  \"issuer\": \"https://token.actions.githubusercontent.com\",
  \"subject\": \"repo:${REPO}:environment:foundry\",
  \"audiences\": [\"api://AzureADTokenExchange\"]
}"

gh variable set AZURE_CLIENT_ID --body "$APP_ID"
gh variable set AZURE_TENANT_ID --body "$(az account show --query tenantId -o tsv)"
gh variable set AZURE_SUBSCRIPTION_ID --body "$(az account show --query id -o tsv)"
```

Two notes on that setup:

- The role assignment above targets a resource-group pattern. Azure does not accept
  wildcards in `--scope`, so assign `Contributor` on the subscription and rely on the
  federated credential being repository-scoped, or create the demo group once by hand
  and assign on it. Pick one and write it down.
- The GitHub **environment** must be called `foundry` (the workflow pins it). Create it
  under Settings > Environments if it does not exist.

## Using it

```bash
# from the CLI
gh workflow run demo-azure.yml -f action=up -f suffix=k3rman -f alert_email=you@example.com
gh workflow run demo-azure.yml -f action=status
gh workflow run demo-azure.yml -f action=down -f confirm=rg-aigw-demo-k3rman

# or from the Actions tab: Run workflow, pick the action
```

Read the values you need in the run summary: runtime URL, alias, key names and expiry.
Key values are in the portal (AI Gateway > Access > Keys) or:

```bash
az aigateway api-key list-secrets -g rg-aigw-demo-k3rman --gateway-name aigw-k3rman \
  -n team-a --query primaryKey -o tsv
```

## Running the scripts without GitHub

The workflow only calls these three files, so they work the same locally:

```bash
SUFFIX=k3rman REGION=westeurope ALERT_EMAIL=you@example.com bash infra/azure/up.sh
SUFFIX=k3rman bash infra/azure/status.sh
SUFFIX=k3rman bash infra/azure/down.sh
DRY_RUN=1 SUFFIX=k3rman REGION=westeurope bash infra/azure/up.sh   # prints, does not create
```

## Cost, said plainly

- The gateway is free before 1 January 2027, and free afterwards up to 10,000 requests
  per gateway per month. Past that, the service fee is 500 USD per gateway per month.
- The Foundry deployment bills per token, at one capacity unit (1K tokens per minute).
  A rehearsal and a talk are cents.
- Deleting the resource group deletes every one of those charges. A soft-deleted
  Foundry account keeps its name reserved for a few days, but does not bill.

## What this does not cover yet

- The Backstage catalog entry and the Foundry **project** for demo 1. This pipeline
  covers the gateway demo: account, deployment, gateway, keys, caps.
- Wiring the budget to an automation runbook that deletes the group on its own. Today
  the budget only emails; the hard stop is `action: down`.
