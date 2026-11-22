# This repository was generated from the platform template

You did not set this up. The platform team did, and that is the point: the parts that are
the same in every AI application are already done, and the parts that are yours are marked.

## What is yours

`agent/prompt.py` — the wording. Change it whenever you want, that is your domain knowledge.
`evals/dataset.jsonl` — the cases that matter to your workload. Grow it.

## What is not yours to change without a conversation

`agent/schema.py` — downstream systems read this shape.
`evals/thresholds.yaml` — the bar you agreed to clear. Lowering a threshold is a decision,
not a fix; make it in a pull request where someone can see it.
`infra/` — provisioned by the platform template, tied to your project and your quota.

## The gate

`evals/thresholds.yaml` is enforced as a required check on `main`. A red gate blocks the
merge. That is deliberate: it is what lets you ship without asking the platform team to
review your prompt.

```bash
make demo     # or: pip install -r evals/requirements.txt && python -m evals.run
```

## Where the model comes from

`FOUNDRY_DEPLOYMENT` names a deployment the platform team created. `FOUNDRY_ENDPOINT`
points at the gateway, not at a model endpoint. Do not hardcode either: both are set as
repository variables.

Authentication is federated OIDC. There is no API key in this repository, and adding one
would be a regression.
