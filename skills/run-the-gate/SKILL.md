---
name: run-the-gate
description: Run the evaluation gate of the demo agent and explain its result. Use when the user says "run the gate", "why is the check red", "make demo fails", "evaluate the agent", "run the evals", or when a pull request touches demo/ai-actas-bot/agent or demo/ai-actas-bot/evals and someone needs to know whether it can merge.
---

# Run the gate

The gate is four deterministic metrics compared against seven lines of YAML, exiting 0 or 1. Nothing
else. If you find yourself explaining a fifth thing, you are describing a different system.

## The command

```bash
make demo        # replay mode: recorded responses, offline, deterministic, ~2s
make demo LIVE=1 # live: real deployment, real latency, real cost
```

Replay needs only `pyyaml`. Live needs `.env` filled from `.env.example`.

## What the output means

```
metric                 score   threshold
schema_valid           1.000   >= 1.00      PASS
decisions_recall       0.925   >= 0.80      PASS
owner_accuracy         0.975   >= 0.75      PASS
invented_owners            0   <= 0         PASS
```

| Metric | Fails when | What it tells you |
|---|---|---|
| `schema_valid` | the output does not parse, or a required field is missing | the contract broke. Not a quality debate |
| `decisions_recall` | the minutes miss what was decided | the product is worse than useless |
| `owner_accuracy` | right task, wrong person | the failure that makes a team stop trusting it |
| `invented_owners` | a name that was never in the transcript | one invented owner is one person wrongly assigned work |

`invented_owners` is a **count with a threshold of zero**, not an average. Averaging it across twenty
cases hides exactly the failure that destroys trust.

## Reading a failure

Every failure prints one line per case under `details`:

```
c07  owner: expected 'Elena Prat', got 'Patricia Gil' :: Revisar el histórico...
c03  decisions: missed (best 0.62) :: Elegir el proveedor...
```

`best 0.62` is the similarity of the closest decision produced — useful to distinguish "it did not
capture it" from "it worded it differently".

## Do not

- **Do not lower a threshold to make it green.** That is the decision the whole file exists to make
  visible. If a threshold is wrong, say so and change it in a pull request with the reasoning.
- **Do not add a metric that needs an LLM to judge.** The gate must be reproducible. Propose it as a
  nightly report instead.
- **Do not delete a case that fails.** Fix the prompt or explain why the case is wrong.
- **Do not confuse replay with live.** Replay proves the gate works; live proves the model works. Only
  the second one costs money, and that is why it is not on every pull request.

## When a fixture is missing

```
FileNotFoundError: no fixture for c21
```

The dataset grew and the fixtures did not. Either `make record` against a deployment, or generate the
synthetic set with `python scripts/make_synthetic_fixtures.py` and say out loud that you did the second.
