---
name: change-the-golden-path
description: Change the Backstage template or the skeleton a team receives. Use when the user says "add a field to the form", "the template should also create X", "change the golden path", "update the scaffolded repo", "make the template ask for the region", or when a generated repository needs a change that every future repository should also get.
---

# Change the golden path

Two artefacts, and confusing them is the usual mistake.

| Artefact | Path | Decides |
|---|---|---|
| the form | `platform/backstage/template/template.yaml` | what a team chooses, and what they are not allowed to choose |
| the skeleton | `platform/backstage/template/skeleton/` | what the generated repository contains |

The template fetches the skeleton with `fetch:template` and a relative `./skeleton` URL. One golden path,
one source of truth: improving the skeleton improves every new project.

## The five fields

`name`, `owner`, `model`, `tpm`, `personal_data`. Before adding a sixth, ask what breaks if the team
decides it themselves at 6pm in `main`. If the answer is "nothing", do not add the field.

- `model` is an `enum` of approved deployments, never free text. It is a cost and compliance decision.
- `tpm` is allocated at creation, not negotiated after the first invoice.
- `personal_data` is not a record of a fact: it **changes what gets generated**.

## What the template must not let you decide

This is the sentence the talk depends on. Keep it true:

- a model outside the catalog
- a deployment without an evaluation dataset
- a repository without an owner
- a pipeline without the required check

## Rules

- **The custom action stays small.** `foundry:ensure-project` is about eighty lines because no official
  Foundry scaffolder action exists — the Azure module publishes to Azure DevOps. Do not grow it into a
  control plane.
- **The action fails closed.** If the project cannot be ensured, the repository must not be created. A
  repository whose `infra/` cannot deploy is worse than an error message.
- **Never return a key from an action.** The generated pipeline uses federated OIDC.
- **The job name in the skeleton's workflow must match `requiredStatusCheckContexts`** in the publish
  step, or branch protection protects nothing.
- **The skeleton must be green on its first minute.** A team that receives a red check on an untouched
  repository learns to ignore checks.

## Verify

Generate a throwaway repository through the template and confirm: the repository exists, the required
check runs on the pull request it opens, and `make demo` in it passes before anyone edits anything.

Then delete it. A golden path that has only been used once is a demo, not a product.
