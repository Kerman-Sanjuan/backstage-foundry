---
name: add-an-evaluation
description: Add a metric, a dataset case or a threshold to the evaluation gate. Use when the user says "add a metric", "add an evaluator", "cover this failure mode", "grow the dataset", "the gate does not catch X", or wants to change what the required check measures before shipping an agent change.
---

# Add an evaluation

Three files, in this order. The order matters: a metric without a threshold is a number nobody acts on.

## 1. The metric

`demo/ai-actas-bot/evals/evaluators.py`

Add a field to `CaseResult`, compute it in `score_case`, and append a `note` for every case that fails —
the note is what the pull request will show, and "0.71" is not actionable.

```python
@dataclass
class CaseResult:
    ...
    cites_source: float = 0.0
```

## 2. The threshold

`demo/ai-actas-bot/evals/thresholds.yaml`

```yaml
  cites_source: { min: 0.90 }
```

One line. If it needs a paragraph to justify, the metric is not ready.

## 3. The case, if the metric needs one

`demo/ai-actas-bot/evals/dataset.jsonl` — one JSON object per line, with `ground_truth`. Then the
fixtures, which are recorded, not written: `make record`, or the synthetic generator with the
disclosure that comes with it.

## The rules that keep the gate usable

- **Deterministic or nothing.** No LLM judge in a required check. Same commit, same result, or it is a
  nightly report.
- **Count the absolute failures that cost trust** separately from the ratios. `invented_owners` is a
  count for a reason: one is already one too many.
- **A metric that never fails is not a metric.** Before opening the pull request, break the agent on
  purpose and confirm your metric catches it. If it does not move, it measures nothing.
- **Do not tune the dataset to the prompt.** Adding only the cases the current prompt passes turns the
  gate into a mirror.

## Verify

```bash
make demo                      # green on main
git checkout demo/gate-fails
make demo                      # still red, and for the reasons it was red before
```

If the second command comes back green, your new metric is either not wired or too generous.
