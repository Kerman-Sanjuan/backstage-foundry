# 04 · The gate

The third jump, and the centre of the talk: from "I review it" to "the pipeline verifies it".

## The argument

Without a gate, every team needs someone from the platform team to review their change.
That person becomes the bottleneck, and the platform has scaled from zero teams to zero.

A gate turns your judgement into something that runs without you. That is not a
quality-improvement story. It is the only mechanism by which a platform team stops being a
queue.

## Eight lines

```yaml
dataset: dataset.jsonl
evaluators:
  schema_valid:     { min: 1.00 }
  decisions_recall: { min: 0.80 }
  owner_accuracy:   { min: 0.75 }
  invented_owners:  { max: 0 }
```

Four metrics, chosen for what they cost to be wrong:

| Metric | Failure it represents |
|---|---|
| `schema_valid` | the output is not usable by anything downstream |
| `decisions_recall` | the minutes miss what was decided — the product is worse than useless |
| `owner_accuracy` | the right task assigned to the wrong person |
| `invented_owners` | a name that was never in the room |

`invented_owners` is a count, not a ratio, and its threshold is zero. One invented owner is
one person wrongly assigned work. Averaging it across twenty cases hides exactly the
failure that destroys trust in the tool.

## Required, or it is a comment

The most common way to ship a gate that protects nothing: the check runs, it is green or
red, and `main` does not require it. Then a red check becomes a conversation, and
conversations have deadlines.

> A check that warns is not a check. It is a comment with better formatting.

## Determinism

Four metrics, no LLM judge. This is a requirement, not a preference:

- a required check must be reproducible: same commit, same result
- a non-deterministic gate blocks merges for reasons nobody can explain
- if you need judgement, put it in a nightly report, not in the merge path

Where determinism is not possible, it is contained: `decisions_recall` uses fuzzy string
matching and will not catch a decision reworded beyond recognition. That limitation is
documented, and it is the argument for keeping the threshold below 1.00 rather than
pretending the metric is exact.

## Cost control

Evaluation should not run on every commit. It runs on pull requests that touch what the
gate measures:

```yaml
paths:
  - "demo/ai-actas-bot/agent/**"
  - "demo/ai-actas-bot/evals/**"
```

Replay mode makes that cheap and fast. Live mode against a real deployment costs minutes and
money, so it is manual or nightly — and it is how you keep the replay fixtures honest.

## The limit to state explicitly

The gate checks that the agent still does what the dataset says. It does not check that the
dataset is right, that the thresholds are still the ones the business needs, or that a new
failure mode exists outside the twenty cases.

> Your gate is exactly as good as your dataset, and your dataset is the thing nobody wants
> to own. Say that before someone else does.
