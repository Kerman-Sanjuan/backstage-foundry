# AGENTS.md

Hub for AI coding agents working in this repository. Keep this file short; the detail lives in the docs
and skills it points to.

This is conference material: a reference architecture plus a runnable demo. It is not a product, and
nothing here runs in production. That changes what "done" means — a claim must be reproducible on a
laptop with no Azure subscription, or it does not belong in the talk.

## What's here

```text
ai/
├── AGENTS.md          # this file: index, rules, where to look
├── ARCHITECTURE.md    # the three artefacts, the flow, who owns what, known limits
docs/                  # the reference architecture, for humans reading after the talk
platform/              # what the platform team owns: template, IaC, gateway policy
demo/ai-actas-bot/     # one instance of the golden path, with a working gate
skills/                # operational skills for agents
```

## Stack (summary)

**Azure AI Foundry** for the resource, the projects and the evaluations. **Backstage** for the catalog
and the template. **GitHub** for the repository, the PR and the required check. **Python 3.11+** for the
demo — no framework, one dependency for the gate (`pyyaml`). Full detail: [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Read these first

- The map and the boundaries: [`ARCHITECTURE.md`](ARCHITECTURE.md)
- The argument of the talk: [`docs/00-architecture.md`](../docs/00-architecture.md)
- The gate, which is the centre of it: [`docs/04-the-gate.md`](../docs/04-the-gate.md)
- The demo you are about to change: [`demo/ai-actas-bot/README.md`](../demo/ai-actas-bot/README.md)

## Rules

1. **The repository is the argument, not the handout.** The split between `platform/` and `demo/` is the
   message. Do not flatten it.
2. **Every number in `docs/` must be verifiable.** If a figure expires (a limit, a GA date, a version),
   update it or delete it. A stale number in a talk is worse than no number.
3. **No customer names, no internal figures, no employer data.** This repository is public. The examples
   are invented; keep them that way.
4. **The replay fixtures are synthetic and say so.** `_synthetic: true`, the `NOTICE`, and the generator
   are visible on purpose. Do not "clean up" the disclosure: `make record` is what replaces them.
5. **The gate stays deterministic.** Four metrics, no LLM judge. A non-deterministic required check
   blocks merges for reasons nobody can reproduce. If you need judgement, propose it as a nightly
   report, not as a gate.
6. **One golden path.** The skeleton in `platform/backstage/template/skeleton/` is the source; the
   template fetches it. Do not copy it into a second place.
7. **`demo/gate-fails` is a demo branch.** It exists to be a red check on stage. Never merge it.
8. **Thresholds are lowered in a visible pull request**, never in a quiet commit. That is the whole
   point of the file being seven lines long.
9. **No secrets.** `.env.example` only. CI authenticates with GitHub OIDC.

## Skills

Load them before acting, not after getting stuck.

| Skill | Use when |
|---|---|
| `run-the-gate` | running the evaluation gate, or explaining a failure |
| `add-an-evaluation` | adding a metric, a case or a threshold |
| `change-the-golden-path` | changing the template or the skeleton a team receives |
| `rehearse-the-demo` | preparing or timing the live demo |
