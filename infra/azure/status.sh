#!/usr/bin/env bash
# Read-only view of what is deployed, what the caps are and when the keys die.
# Safe to run at any time, including right before walking on stage.
#
# Usage:  SUFFIX=k3rman bash infra/azure/status.sh

set -euo pipefail
cd "$(dirname "$0")"
. ./common.sh

need az

if [ "$(run_out az group exists -n "$RG" -o tsv)" = "false" ]; then
  printf 'resource group %s does not exist: nothing deployed, nothing billing\n' "$RG"
  summary <<EOF
## Nothing deployed

\`${RG}\` does not exist. Run the workflow with \`action: up\` when you need the demo.
EOF
  exit 0
fi

say "resources"
run az resource list -g "$RG" --query '[].{name:name, type:type}' -o table

say "gateway"
run az aigateway show -g "$RG" -n "$GATEWAY" \
  --query '{state:properties.provisioningState, url:properties.frontend.defaultHostname}' -o table

say "policies in force"
run az aigateway policy list -g "$RG" --gateway-name "$GATEWAY" \
  --query '[].{type:type, count:count, amount:amount, period:period, counterKey:counterKey}' -o table

say "aliases"
run az aigateway model-alias list -g "$RG" --gateway-name "$GATEWAY" -o table

say "keys (names and expiry only, never values)"
run az aigateway api-key list -g "$RG" --gateway-name "$GATEWAY" \
  --query '[].{name:name, state:state, expires:properties.expirationDate}' -o table

summary <<EOF
## Demo status

Resource group \`${RG}\` exists. Caps and key expiry above.

Reminder: the gateway is free up to 10,000 requests per month and free altogether
before 1 January 2027. The cliff is real: past 10,000 requests the service fee is
500 USD per gateway per month.

To stop everything: \`action: down\`, \`confirm: ${RG}\`.
EOF
