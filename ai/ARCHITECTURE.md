# ARCHITECTURE

## Overview

Two halves, one argument.

`platform/` is what the platform team maintains: the template, the infrastructure and the gateway
policy. `demo/` is one instance of the golden path: what a team receives and is then allowed to change.

> The portal tells you what exists. The repository tells you what is allowed.

That sentence is the shape of the repository. If a change blurs the boundary between the two halves,
it is probably the wrong change.

## The three artefacts

| Artefact | Where | What it proves |
|---|---|---|
| The template | `platform/backstage/template/` | a team gets a working repository without asking |
| The generated repository | `demo/ai-actas-bot/` | the golden path runs, and the gate runs with it |
| The required check | `demo/ai-actas-bot/evals/thresholds.yaml` | the platform team's judgement executes without them |

## Who owns what

| Piece | Owns | Does not own |
|---|---|---|
| **Foundry** | resource (network, security, deployments), projects, quotas, tracing, evaluations | who owns the repo, whether the team complies, when a release ships |
| **Backstage** | catalog (owner, dependencies) and the template | deployments, evaluations. There is no official Foundry plugin |
| **GitHub** | repo, PR, required check, federated OIDC | which model is used |
| **AI gateway** | per-caller TPM, chargeback by identity | model quality |

Full reasoning in `docs/00-architecture.md`.

## How the gate works

```
dataset.jsonl  ──►  agent (prompt + schema)  ──►  minutes JSON
                                                        │
thresholds.yaml ──►  four deterministic metrics  ◄──────┘
                            │
                      exit 0 or exit 1  ──►  required check on main
```

- `agent/schema.py` is the platform's: it is the interface downstream reads.
- `agent/prompt.py` is the team's: it is what the gate measures, and changing it is the point.
- `evals/evaluators.py` holds the metrics; `evals/run.py` is the gate; `evals/record.py` records real
  model output into fixture form.

Two transports, one code path: `ReplayClient` reads a JSON file, `LiveClient` calls the deployment.
The gate is the same gate in both, which is what makes the demo honest.

## Repository layout

```
docs/               6 files, the reference architecture. Read these for the "why"
platform/
  README.md         what the platform team owns
  backstage/template/
    template.yaml   the five-field form
    actions/        foundry-project.ts, ~80 lines, because no plugin exists
    skeleton/       what a team receives; fetched by the template
  terraform/        resource, project, deployment. Shape of the boundary, not a module
  policies/         llm-token-limit.xml
demo/
  ai-actas-bot/
    agent/          prompt, schema, transport
    evals/          dataset, thresholds, metrics, runner, fixtures
    scripts/        synthetic fixture generator (see the disclosure)
```

## Known limits, stated on purpose

- **The gate checks the agent against the dataset, not the dataset against reality.** A green gate with
  twenty wrong cases is a green gate.
- **`decisions_recall` is fuzzy string matching.** It will not catch a decision reworded beyond
  recognition. That is why the threshold is 0.80 and not 1.00.
- **`schema_valid` checks shape, not meaning.** A renamed field passes the gate and breaks the consumer.
  Detecting that needs a contract test, which is a different file and a different conversation.
- **Gateway policies only apply to traffic routed through the gateway.** Closing the bypass needs Azure
  Policy plus a backend restricted to the gateway's identity.
- **The fixtures are synthetic.** They prove the gate works, not that a model works.

## Naming and layout conventions

- Directories are lowercase and hyphenated; Python modules are snake_case.
- One concern per file: `evaluators.py` does not run anything, `run.py` does not define metrics.
- Comments explain *why*, in the present tense. If a line needs a comment to say *what* it does, rename
  the thing instead.
- Everything readable by a human who was not in the room.
