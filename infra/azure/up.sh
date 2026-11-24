#!/usr/bin/env bash
# Brings up the whole demo in one shot: a resource group, a Foundry account with one
# small deployment, an Azure AI Gateway in front of it, two team keys and the policies
# that cap what a caller can spend.
#
# Everything lives in one resource group on purpose: `down.sh` deletes the group and
# with it every charge. Nothing here survives a group delete.
#
# Usage:  SUFFIX=k3rman REGION=westeurope bash infra/azure/up.sh
#         DRY_RUN=1 ... to print the calls without a subscription.

set -euo pipefail
cd "$(dirname "$0")"
. ./common.sh

need az
need jq

[ -n "$REGION" ] || { printf 'REGION is required (for example westeurope)\n' >&2; exit 1; }

say "subscription"
run az account show --query '{name:name, id:id, user:user.name}' -o table

say "resource group ${RG}"
run az group create -n "$RG" -l "$REGION" \
  --tags project=backstage-foundry talk=azure-cloud-lab-2026 managed-by=github-actions

# ---------------------------------------------------------------- Foundry ---
# The model goes in first: the gateway imports deployments, it does not create them.
say "Foundry account ${ACCOUNT}"
if [ "$(run_out az cognitiveservices account list -g "$RG" --query "length([?name=='${ACCOUNT}'])" -o tsv)" = "0" ]; then
  run az cognitiveservices account create -n "$ACCOUNT" -g "$RG" -l "$REGION" \
    --kind AIServices --sku S0 --custom-domain "$ACCOUNT" --yes
else
  printf 'account %s already exists, reusing it\n' "$ACCOUNT"
fi

ACCOUNT_ID="$(run_out az cognitiveservices account show -n "$ACCOUNT" -g "$RG" --query id -o tsv)"

say "deployment ${MODEL} in ${REGION}"
# Never invent a model version: ask the region what it actually has. A hardcoded
# version is how a demo breaks three months later.
VERSION="$(run_out az cognitiveservices model list -l "$REGION" \
  --query "[?model.name=='${MODEL}'] | sort_by(@, &model.version) | [-1].model.version" -o tsv)"
if [ "$DRY_RUN" != "1" ] && { [ -z "$VERSION" ] || [ "$VERSION" = "null" ]; }; then
  printf 'model %s is not available in %s. Available chat models:\n' "$MODEL" "$REGION" >&2
  az cognitiveservices model list -l "$REGION" \
    --query "[?model.capabilities.chatCompletion=='true'].model.name" -o tsv | sort -u >&2
  exit 1
fi

if [ "$(run_out az cognitiveservices account deployment list -n "$ACCOUNT" -g "$RG" --query "length([?name=='${MODEL}'])" -o tsv)" = "0" ]; then
  # One capacity unit is 1K tokens per minute: the smallest ceiling Foundry sells, and
  # the one that bounds the damage if a key leaks.
  run az cognitiveservices account deployment create -n "$ACCOUNT" -g "$RG" \
    --deployment-name "$MODEL" --model-name "$MODEL" --model-version "$VERSION" \
    --model-format OpenAI --sku-name Standard --sku-capacity "${TPM_CAPACITY:-1}"
else
  printf 'deployment %s already exists, reusing it\n' "$MODEL"
fi

# ----------------------------------------------------------------- gateway ---
say "AI Gateway ${GATEWAY}"
if [ "$(run_out az aigateway show -g "$RG" -n "$GATEWAY" --query 'name' -o tsv 2>/dev/null || true)" = "" ]; then
  run az aigateway create -g "$RG" -n "$GATEWAY" -l "$REGION"
  # A gateway provisions in about a minute; wait for it instead of racing the import.
  for _ in $(seq 1 30); do
    STATE="$(run_out az aigateway show -g "$RG" -n "$GATEWAY" --query 'properties.provisioningState' -o tsv 2>/dev/null || true)"
    [ "$STATE" = "Succeeded" ] && break
    [ "$DRY_RUN" = "1" ] && break
    sleep 10
  done
else
  printf 'gateway %s already exists, reusing it\n' "$GATEWAY"
fi

say "import the Foundry deployments"
# The import registers the provider, grants the gateway identity Foundry User on the
# account and publishes a default alias per deployment. It does not create deployments.
run az aigateway model-provider import -g "$RG" --gateway-name "$GATEWAY" \
  -n "$PROVIDER" --foundry-resource-id "$ACCOUNT_ID"

say "alias ${ALIAS}"
if [ "$(run_out az aigateway model-alias show -g "$RG" --gateway-name "$GATEWAY" -n "$ALIAS" --query 'name' -o tsv 2>/dev/null || true)" = "" ]; then
  MODEL_ID="$(run_out az aigateway model show -g "$RG" --gateway-name "$GATEWAY" \
    --provider-name "$PROVIDER" -n "$MODEL" --query id -o tsv)"
  if [ "$DRY_RUN" != "1" ] && { [ -z "$MODEL_ID" ] || [ "$MODEL_ID" = "null" ]; }; then
    printf 'the import did not register %s; refusing to create an alias without a backend\n' "$MODEL" >&2
    az aigateway model list -g "$RG" --gateway-name "$GATEWAY" -o table >&2
    exit 1
  fi
  run az aigateway model-alias create -g "$RG" --gateway-name "$GATEWAY" \
    -n "$ALIAS" --routing-name "$ALIAS" \
    --backend-model "resource-id=${MODEL_ID}" priority=0 weight=100
else
  printf 'alias %s already exists, reusing it\n' "$ALIAS"
fi

# ---------------------------------------------------------------- policies ---
say "policies: token limit per team, shared monthly ceiling, shared cost ceiling"
# The shared ones are the ones that answer "how do I guarantee the number of calls":
# counterKey [] is a single counter for every caller, so nothing can exceed it.
POLICY_FILE="policies.json"
if [ -n "$IP_ALLOW" ]; then
  POLICY_FILE="$(mktemp)"
  jq --arg cidr "$IP_ALLOW" \
    '. + [{type:"ipFilter", scope:"workspace", action:"Allow", cidrRanges:[$cidr]}]' \
    policies.json >"$POLICY_FILE"
  printf 'ip filter: only %s may call the gateway\n' "$IP_ALLOW"
fi

run az aigateway policy set -g "$RG" --gateway-name "$GATEWAY" --policies "@${POLICY_FILE}"

if [ "$DRY_RUN" != "1" ]; then
  POLICIES="$(az aigateway policy list -g "$RG" --gateway-name "$GATEWAY" -o json)"
  for type in tokenLimit requestRateLimit costLimit; do
    if [ "$(jq --arg t "$type" '[.. | objects | select(.type? == $t)] | length' <<<"$POLICIES")" = "0" ]; then
      printf 'policy %s did not stick. Read it back before the demo:\n' "$type" >&2
      jq . <<<"$POLICIES" >&2
      exit 1
    fi
  done
fi

# -------------------------------------------------------------------- keys ---
say "one key per team, with an expiry"
EXPIRES="$(plus_days "$TTL_DAYS")"
for team in team-a team-b; do
  if [ "$(run_out az aigateway api-key list -g "$RG" --gateway-name "$GATEWAY" --query "length([?name=='${team}'])" -o tsv 2>/dev/null || echo 0)" = "0" ]; then
    run az aigateway api-key create -g "$RG" --gateway-name "$GATEWAY" -n "$team"
  fi
  # The expiry is the safety net for a forgotten teardown, not a formality.
  run az aigateway api-key update -g "$RG" --gateway-name "$GATEWAY" -n "$team" --expiration-date "$EXPIRES"
done

# ------------------------------------------------------------------ budget ---
if [ -n "$ALERT_EMAIL" ]; then
  say "budget alert to ${ALERT_EMAIL}"
  SUB="$(subscription_id)"
  BUDGET_BODY="$(mktemp)"
  jq -n --arg email "$ALERT_EMAIL" --arg start "$(date -u +%Y-%m-01T00:00:00Z)" \
    --arg end "$(plus_days 365)" '{
      properties: {
        category: "Cost",
        amount: 1,
        timeGrain: "Monthly",
        timePeriod: {startDate: $start, endDate: $end},
        notifications: {
          "actual-50": {enabled: true, operator: "GreaterThan", threshold: 50, contactEmails: [$email]},
          "actual-100": {enabled: true, operator: "GreaterThan", threshold: 100, contactEmails: [$email]}
        }
      }
    }' >"$BUDGET_BODY"
  # A budget only warns. It is here so a mistake costs an email before it costs money.
  run az rest --method put --url \
    "https://management.azure.com/subscriptions/${SUB}/resourceGroups/${RG}/providers/Microsoft.Consumption/budgets/demo-monthly?api-version=2024-08-01" \
    --body "@${BUDGET_BODY}" >/dev/null || printf 'budget not created, continuing (it is an alert, not a control)\n'
fi

# ----------------------------------------------------------------- summary ---
URL="$(run_out az aigateway show -g "$RG" -n "$GATEWAY" --query 'properties.frontend.defaultHostname' -o tsv 2>/dev/null || echo '<gateway hostname>')"

summary <<EOF
## Demo infrastructure is up

| | |
|---|---|
| Resource group | \`${RG}\` |
| Region | \`${REGION}\` |
| Gateway | \`${GATEWAY}\` |
| Runtime URL | https://${URL}/default/models/openai/v1/chat/completions |
| Model alias | \`${ALIAS}\` (Foundry deployment \`${MODEL}\`, capacity ${TPM_CAPACITY:-1}K TPM) |
| Keys | \`team-a\`, \`team-b\`, expire ${EXPIRES} |

### Where the keys are

The values are not printed here on purpose (this repository is public). Read them in
the portal: **AI Gateway > ${GATEWAY} > Access > Keys > View**, or from a shell with
permission:

\`\`\`bash
az aigateway api-key list-secrets -g ${RG} --gateway-name ${GATEWAY} -n team-a --query primaryKey -o tsv
\`\`\`

### What is capped

- Token limit per caller: see \`infra/azure/policies.json\`.
- Shared monthly ceiling on requests and a shared cost ceiling: one counter for all
  callers, so no single key can walk past it.
- Foundry deployment: ${TPM_CAPACITY:-1}K tokens per minute, the smallest ceiling.

### Turning it off

Run this workflow again with \`action: down\` and \`confirm: ${RG}\`. The keys also expire
on their own on ${EXPIRES}.
EOF
