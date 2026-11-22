# 03 · The golden path

What a team receives, and what they are then allowed to break.

```
agent/          the code the team owns
  prompt.py       the wording — theirs, and it is what the gate measures
  schema.py       the output contract — the platform's, because it is what downstream reads
  client.py       transport — points at the gateway, never at a model endpoint
evals/          the code that judges agent/
  dataset.jsonl   inputs and expected outcomes
  thresholds.yaml the gate, in eight lines
  run.py          exit code 0 or 1. Nothing else
infra/          the project, the deployment, the quota
.github/        the workflow that runs the gate as a required check
```

## The one asymmetry worth explaining

`schema.py` belongs to the platform; `prompt.py` belongs to the team.

Why: the schema is the interface other systems consume — a broken field name breaks a
downstream report, and nobody in the team can see that report. The prompt is domain
knowledge, and only the team knows whether the minutes are good.

This is what "platform as a product" means in practice: you own the interface, they own the
judgement, and the gate is where the two meet.

## Why a meeting-minutes agent

Any reference architecture looks clever in a diagram. The demo needs a workload where a
human can look at the output and say "that is wrong" in ten seconds. Minutes qualify:

- the input is text, so the demo needs no data pipeline
- the output is structured, so the gate can be deterministic
- the failure modes are recognisable: a missed decision, a wrong owner, an invented name
- it is obviously useful, which stops the conversation from becoming "but who would use
  this"

## What the team changes on day two

They will change the prompt. That is the point. The gate exists so that changing it is safe
and does not require asking the platform team.

They will also try to change the schema, and the gate will not stop them — `schema_valid`
only checks the shape, not the meaning of a field. That is a known and accepted limit:
detecting a semantic breaking change needs a consumer contract test, which is a different
file and a different conversation.

> Say this out loud in the talk. A gate that implies it catches everything is a gate that
> gets switched off the first time something slips through.
