# 02 · Self-service without losing the boundary

The second jump: from "I set it up for you" to "you set it up, inside the rails".

## What Backstage is, precisely

Backstage is a catalog with a scaffolding engine attached. In this architecture it does two
things and nothing else:

1. **Catalog** — who owns the workload, what it depends on, which model it consumes.
2. **Template** — a form that creates a repository from a skeleton.

It does not deploy, it does not evaluate, and it does not know what a model deployment is.

> Backstage is CNCF **Incubating**, not graduated. Get this right in the talk; there is
> always someone in the room who knows.

## The five fields

The demo template asks for exactly five things. Every field that is missing here is a
decision a team makes ad hoc in `main` at 6pm on a Friday.

| Field | Why the platform team owns it |
|---|---|
| `name` | naming convention, so the catalog and the cost report can be joined |
| `owner` | the catalog's only real job. No owner, no platform |
| `model` | chosen from the approved catalog, not typed free-hand |
| `tpm` | a quota is allocated at creation, not negotiated after the first invoice |
| `personal_data` | `true` forces the retention policy and the redaction step in the template |

The last one is the interesting one: the field does not just record a fact, it **changes
what gets generated**. That is what separates a template from a form.

## What the template must not let you decide

This is the line that matters on stage:

> The interesting thing is not that it creates a repository. It is what it does not let you
> decide.

Not permitted, by construction:

- a model that is not in the catalog
- a region other than the approved ones
- a deployment without an evaluation dataset
- a repository without an owner
- a pipeline without the required check

## No official Foundry plugin

Be explicit about this, because it is the honest answer to "why not just install the plugin":

- The Backstage Azure module (`@backstage/plugin-scaffolder-backend-module-azure`) publishes
  to Azure DevOps.
- There is no official Foundry scaffolder action.
- The platform team writes a small TypeScript action that calls the Foundry control-plane
  API with the caller's federated identity.

That action is ~80 lines. It is in `platform/backstage/template/actions/`. Saying "we wrote
eighty lines" is more credible than implying a plugin exists.

## Cost of the boundary

A template is a product: it needs an owner, a version, a changelog and a way to update the
repositories it already generated. That last part is the one everybody forgets, and it is
the one that decides whether the tenth team benefits from the work done for the second.

> A template you cannot update is a copy-paste with extra steps.
