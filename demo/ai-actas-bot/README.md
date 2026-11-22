# ai-actas-bot

A meeting-minutes agent with a gate in front of it. This is one instance of the golden
path: what a team receives from the platform template and is then allowed to change.

```
agent/     the code a team owns    (prompt, schema, transport)
evals/     the code that judges it (dataset, thresholds, metrics)
scripts/   fixture generation, only for offline replay
```

## The shape of the contract

Transcription in, structured minutes out:

```json
{
  "summary": "string",
  "decisions": [{ "text": "string", "rationale": "string" }],
  "action_items": [{ "task": "string", "owner": "string|null", "due": "string|null" }]
}
```

`owner` is a name from the transcript or `null`. Never guessed. That rule is the one the
gate is built around, because a wrong owner is the failure that makes a team stop trusting
the tool — worse than a missing decision.

## What the gate checks

| Metric | Kind | Threshold |
|---|---|---|
| `schema_valid` | deterministic | 1.00 |
| `decisions_recall` | fuzzy match, paraphrase-tolerant | 0.80 |
| `owner_accuracy` | deterministic | 0.75 |
| `invented_owners` | deterministic count | 0 |

Latency and token cost are printed but **not gated**: they answer the business question
("what does this team spend"), not the correctness one. Mixing them into the same gate is
how teams end up tuning a prompt against a budget.

## Two modes, one code path

```bash
make demo              # replay: recorded responses, offline, deterministic, ~2s
make demo LIVE=1       # live: real deployment, real latency, real cost
make record            # re-record fixtures from the live deployment
```

`ReplayClient` and `LiveClient` implement the same `complete()` contract, so the gate is
literally the same gate. Only the transport changes. That is deliberate: a demo that
exercises different code from production proves nothing.

**The fixtures in `evals/fixtures/` are synthetic.** This repository was written without an
Azure subscription; `scripts/make_synthetic_fixtures.py` generates them from the dataset
ground truth with a controlled amount of drift. They prove the gate works, not that the
model works. Replace them with `make record` before relying on any number here.

## Why replay mode exists

Evaluating against a real deployment takes minutes and costs money per run. That is fine for
a nightly job and unacceptable as a required check on every pull request. Replay makes the
gate fast and reproducible; live mode is how you keep the fixtures honest.

The honest sentence to say out loud: *this same gate, against the real endpoint, takes two
minutes and costs a few cents — and it is the same code.*

## Adding a metric

1. Add a function in `evals/evaluators.py` returning a number per case.
2. Add it to `CaseResult` and to `score_case`.
3. Add a line in `evals/thresholds.yaml`.

If it needs an LLM to judge, it does not belong in a required check. Put it in a nightly
report instead: a non-deterministic gate blocks merges for reasons nobody can reproduce.
