# 05 · Attribution

The fourth jump: from an invoice with no owner to a number a team recognises as theirs.

## Two questions, not one

| Question | Who asks | Answered by |
|---|---|---|
| Why did this answer come out wrong? | the engineer | traces, per request, in the project |
| How much does team X spend on application Y? | the business | token counters at the gateway, per caller |

Trying to answer both from one place produces a dashboard nobody uses. Foundry's OTel
traces answer the first. The gateway answers the second, because it is the only component
that sees a caller identity on every request.

## Tokens, not requests

`llm-token-limit` counts **prompt + completion tokens**, per `counter-key`, over a rate
(tokens per minute) or a quota (hourly to yearly), or both. Exceeding the rate returns
`429`; exceeding the quota returns `403`.

A 200-token answer and a 30 000-token summary are one request each. Any limit expressed in
requests is a limit on nothing.

```xml
<llm-token-limit
    counter-key="@(context.Subscription.Id)"
    tokens-per-minute="500"
    estimate-prompt-tokens="true"
    remaining-tokens-header-name="x-remaining-tokens" />
```

`estimate-prompt-tokens="true"` makes the gateway estimate before forwarding, which is what
stops an oversized prompt from reaching the backend and only then being refused.

## The state of the tooling, as of late 2026

This moved, and the talk has to reflect it:

- **APIM as an AI gateway**: still supported, not deprecated. Policies live in APIM.
- **Azure AI Gateway**: a distinct resource type with its own management experience
  (`az aigateway`), separate from API Management.
- **AI gateway inside Foundry**: a preview integration that exposes gateway-managed models
  and tools to projects.
- **Token limits are no longer created or edited in the Foundry portal.** Existing settings
  remain visible read-only; changes are made in APIM policy XML or through code.

That last point is worth saying out loud in a room full of Azure architects: if your slide
says "configure the token limit in Foundry", it is out of date. It is a policy now.

## Why a gateway and not just Foundry's quotas

Foundry already has deployment rate limits, PTU spillover, RBAC, content filters and cost
visibility. For a single-team workload that is enough, and adding a gateway adds a runtime
dependency for no gain.

A gateway earns its place when several callers **share** model capacity and you need:

- per-caller limits on a shared deployment
- attribution by caller identity across projects and teams
- stable aliases instead of coupling applications to backend model names
- consistent policy across providers and agent frameworks

> If you cannot say which team spent what, you do not have a platform. You have a shared
> credit card.

## The honest caveat

Gateway controls apply only to traffic routed through the gateway. A team with a key to the
model endpoint bypasses every policy you wrote. Closing that requires denying direct model
deployments in spoke projects (Azure Policy) and restricting the backend to the gateway's
managed identity — which is a governance decision, not a gateway feature.
