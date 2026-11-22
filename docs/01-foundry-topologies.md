# 01 · Resource, project, topology

The first jump in the talk: from one AI project to many.

## Resource versus project

| | Foundry resource | Foundry project |
|---|---|---|
| Is | network, encryption, model deployments, quota boundary | a workspace inside a resource |
| Owned by | platform team | the team building the workload |
| Answers | what is allowed and what it costs | what this team is building |
| Creating one | once per governance boundary | self-service, via the template |

Most newer agent-centric Foundry APIs support project-scope permissioning. Some traditional
services (for example speech-to-text) still require access at the parent resource scope —
which means the isolation you designed on paper may not be the isolation you can enforce
for every capability. Check the capability matrix before promising project-level RBAC to
thirty teams.

## Three topologies

| Topology | When | What it buys | What it costs |
|---|---|---|---|
| One resource, many projects | starting out, exploration | speed, one place to govern | shared blast radius, quota attribution is coarse |
| One resource per business unit | separate billing and permissions | clean cost and RBAC boundaries | more platform work per unit |
| One resource per environment (dev/test/prod) | when real data exists | promote a version without rebuilding it | 3× the infrastructure surface |

The recommendation that survives contact with reality: **one project per team, one project
per environment.** Teams that start with one shared project for everyone end up with flat
RBAC, a shared quota and no answer to "who consumed this".

## The hub-and-spoke contract, in writing

Microsoft's AI landing zone pattern splits responsibility explicitly. The workload team
owns its spoke: its address space, its resources, its private endpoints, its identities. The
platform team owns the hub: the virtual network, firewall policy, routes and peering.

If that split is not written down, you do not have a platform. You have a disagreement that
will surface during an incident, at the worst possible moment.

Reference: `ai-ml/architecture/baseline-microsoft-foundry-landing-zone` and
`azure.github.io/AI-Landing-Zones`.

## About limits

There are documented limits on resources per region and subscription, and on projects per
resource. They exist and you should read the current table before designing.

But the limit does not decide the topology. Nobody reaches a quota limit by having too many
teams; they reach it by having no naming convention, no owner field and no deletion
process. A hundred resources is a lot of governance. It is not a lot of numbers.

> The constraint you hit first is never the API quota. It is that nobody knows which of the
> ninety resources to delete.

## The decision to take

**One project per application or per team?** Per team, and one per environment.

An application is a deployable; a team is a cost centre and an owner. The catalog needs the
second one to answer the only question that matters at scale: *who do I call*.
