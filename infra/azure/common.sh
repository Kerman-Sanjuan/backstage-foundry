#!/usr/bin/env bash
# Shared helpers for the demo lifecycle scripts.
#
# The scripts are the body of the workflow, not a second opinion: what runs on the
# runner is exactly what runs when you type it here. Keep them boring.
#
# DRY_RUN=1 prints every az call instead of running it, so the sequence can be
# reviewed without a subscription.

set -euo pipefail

: "${SUFFIX:?SUFFIX is required}"
# REGION is only needed to create things; down and status must work without it.
REGION="${REGION:-}"
MODEL="${MODEL:-gpt-4o-mini}"
TTL_DAYS="${TTL_DAYS:-7}"
IP_ALLOW="${IP_ALLOW:-}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
DRY_RUN="${DRY_RUN:-0}"

# Names are derived, never typed twice: up and down must agree even months later.
RG="rg-aigw-demo-${SUFFIX}"
GATEWAY="aigw-${SUFFIX}"
ACCOUNT="ai-${SUFFIX}"      # Foundry account, globally unique and lowercase
PROVIDER="foundry-models"
ALIAS="${MODEL}"

run() {
  if [ "$DRY_RUN" = "1" ]; then
    printf '+ %s\n' "$*"
    return 0
  fi
  "$@"
}

# run_out: same, but the output is captured. In a dry run it prints and echoes a
# placeholder so the caller can keep going.
run_out() {
  if [ "$DRY_RUN" = "1" ]; then
    printf '+ %s\n' "$*" >&2
    printf 'DRY-RUN\n'
    return 0
  fi
  "$@"
}

need() {
  command -v "$1" >/dev/null 2>&1 || { printf 'missing command: %s\n' "$1" >&2; exit 1; }
}

say() {
  printf '\n== %s\n' "$*"
}

# GitHub writes the job summary to this file; a local run prints to stdout instead.
summary() {
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    cat >>"$GITHUB_STEP_SUMMARY"
  else
    cat
  fi
}

# The subscription id is only used to build resource ids for logs and summaries.
subscription_id() {
  run_out az account show --query id -o tsv
}

# GNU date and BSD date disagree on how to add days. The runner is Linux, a laptop may
# be a Mac, and both must produce the same string.
plus_days() {
  if date -u -d "+$1 days" +%Y-%m-%dT00:00:00Z 2>/dev/null; then
    return 0
  fi
  date -u -v+"$1"d +%Y-%m-%dT00:00:00Z
}
