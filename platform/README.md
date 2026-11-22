# platform/

What the platform team owns and a product team does not.

```
backstage/template/     the form, the skeleton and the custom action
terraform/              the resource, the project, the quota
policies/               the gateway policy that decides who may spend what
```

The rule for this folder: **if a team can change it in their own repository, it does not
belong here.** Anything here requires a platform team PR, a version bump and, if it changes
the skeleton, a migration path for the repositories already generated.

## The five fields, and what they actually do

| Field | Effect |
|---|---|
| `name` | joins the catalog entry to the cost report |
| `owner` | the catalog's only real job |
| `model` | restricted to the approved catalog; arrives as a deployment name, never a model name |
| `tpm` | allocated at creation; the quota exists before the first invoice |
| `personal_data` | changes what is generated: retention policy + redaction step |

## Terraform

Not applied anywhere. There is no subscription in this repository and no state file, by
design. `terraform plan` against your own subscription is the first thing you should run,
and the first thing you should expect to change: resource providers move.

What it demonstrates is the shape of the boundary, not a deployable module:

- the resource carries network, identity and the model deployment
- the project is created *inside* the resource, never next to it
- the quota is set at the deployment, and the per-caller split lives in the gateway
- the gateway is a separate resource, so a team can be given a project without being given
  the ability to spend without limit

## Updating generated repositories

The hard part nobody demos. A template that generates twenty repositories and cannot update
them is copy-paste with extra steps.

Options, in increasing order of effort: re-run the template with `--dry-run` and a diff
comment, a Renovate-style bot that opens PRs against generated repos, or a shared package the
generated repos consume. Pick one before the tenth team, not after.
