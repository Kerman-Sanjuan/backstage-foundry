#!/usr/bin/env bash
# Deletes the demo resource group and proves it is gone.
#
# This is the half that matters: as long as the group does not exist, nothing in this
# demo can bill. Keys, gateway, Foundry account, budget: all of it lives inside it.
#
# Usage:  SUFFIX=k3rman bash infra/azure/down.sh

set -euo pipefail
cd "$(dirname "$0")"
. ./common.sh

need az

say "what is about to disappear"
if [ "$(run_out az group exists -n "$RG" -o tsv)" = "false" ]; then
  printf 'resource group %s does not exist: nothing to delete, nothing billing\n' "$RG"
  summary <<EOF
## Nothing to delete

\`${RG}\` does not exist in this subscription. Nothing from this demo is running.
EOF
  exit 0
fi

run az resource list -g "$RG" --query '[].{name:name, type:type}' -o table

say "deleting ${RG}"
# --no-wait returns as soon as Azure accepts the job; the polling below is what turns
# "accepted" into "verified".
run az group delete -n "$RG" --yes --no-wait

if [ "$DRY_RUN" = "1" ]; then
  printf 'dry run: skipping the wait\n'
  exit 0
fi

say "waiting for the group to be gone (bounded to 20 minutes)"
for i in $(seq 1 120); do
  if [ "$(az group exists -n "$RG" -o tsv)" = "false" ]; then
    printf 'gone, confirmed on check %s\n' "$i"
    break
  fi
  if [ "$i" = "120" ]; then
    printf 'the group still exists after 20 minutes; check the portal before walking away\n' >&2
    exit 1
  fi
  sleep 10
done

# A soft-deleted Foundry account keeps its name reserved but does not bill. Saying so
# here saves the next person half an hour of "the name is taken".
summary <<EOF
## Demo infrastructure is gone

| | |
|---|---|
| Resource group | \`${RG}\` deleted |
| Verified | \`az group exists\` returns false |

The Foundry account may keep its name reserved for a couple of days after deletion.
It does not bill. If a later run cannot reuse the name, change \`suffix\`.
EOF
