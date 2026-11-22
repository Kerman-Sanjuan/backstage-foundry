#!/usr/bin/env python3
"""Generate SYNTHETIC fixtures for replay mode.

Why this file exists, stated plainly: this repository was written without an Azure
subscription, so there is no real model output in it. The gate still has to be runnable
offline and deterministic, which means it needs recorded responses. This script produces
them from the dataset ground truth, adding the kind of drift a real model shows: paraphrased
decisions, a forgotten one here, a wrong owner there.

Therefore: these fixtures prove that the gate works, not that a model works. Run
`make record` against a real deployment to replace them. Every generated file carries
`"_synthetic": true` so nobody can mistake one for a recording.

    python scripts/make_synthetic_fixtures.py              # healthy prompt
    python scripts/make_synthetic_fixtures.py --degraded    # the prompt that gets reverted
"""

from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

DEMO = Path(__file__).resolve().parent.parent
OUT = DEMO / "evals" / "fixtures"

# The paraphrase an LLM actually produces: same decision, different opening.
PREFIXES = ["Se acuerda que ", "Queda decidido: ", "Decisión: ", "Se aprueba "]
TASK_PREFIXES = ["Se encarga de ", "Pendiente: ", "Tarea: ", ""]

# Deliberate, deterministic drift so the gate is not a perfect 1.000.
# Healthy prompt: two forgotten decisions, one wrong owner.
FORGET = {("c05", 0), ("c14", 0)}
SWAP_OWNER = {("c12", 1): "Sergio Nogueira"}

# Degraded prompt (the "cheaper" version): forgets a lot and invents names.
DEGRADED_FORGET = {("c01", 0), ("c02", 1), ("c05", 0), ("c06", 0), ("c08", 1), ("c09", 0),
                   ("c11", 1), ("c12", 0), ("c14", 0), ("c16", 1), ("c19", 0), ("c20", 1)}
INVENTED = {("c03", 0): "Carlos Mendoza", ("c07", 1): "Patricia Gil", ("c17", 0): "Álvaro Sanz"}


def paraphrase(text: str, prefix: str) -> str:
    return prefix + text[0].lower() + text[1:]


def build(case: dict, degraded: bool) -> dict:
    truth = case["ground_truth"]
    forget = DEGRADED_FORGET if degraded else FORGET
    rnd = random.Random(case["id"])

    decisions = []
    for i, text in enumerate(truth["decisions"]):
        if (case["id"], i) in forget:
            continue
        decisions.append({"text": paraphrase(text, rnd.choice(PREFIXES)),
                          "rationale": "Acordado en la reunión."})

    items = []
    for i, item in enumerate(truth["action_items"]):
        owner = item.get("owner")
        if degraded:
            if (case["id"], i) in INVENTED:
                owner = INVENTED[(case["id"], i)]
        elif (case["id"], i) in SWAP_OWNER:
            owner = SWAP_OWNER[(case["id"], i)]
        items.append({"task": paraphrase(item["task"], rnd.choice(TASK_PREFIXES)), "owner": owner, "due": None})

    doc = {
        "summary": f"Reunión con {len(truth['decisions'])} decisiones y "
                   f"{len(truth['action_items'])} tareas asignadas.",
        "decisions": decisions,
        "action_items": items,
    }
    model_text = json.dumps(doc, ensure_ascii=False, indent=2)
    return {
        "_synthetic": True,
        "case_id": case["id"],
        "model_text": model_text,
        "usage": {
            "input_tokens": max(1, len(case["transcript"]) // 4),
            "output_tokens": max(1, len(model_text) // 4),
        },
        "latency_ms": 0,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--degraded", action="store_true")
    args = parser.parse_args()

    cases = [json.loads(l) for l in (DEMO / "evals" / "dataset.jsonl").read_text(encoding="utf-8").splitlines() if l.strip()]
    OUT.mkdir(exist_ok=True)
    for case in cases:
        payload = build(case, args.degraded)
        (OUT / f"{case['id']}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
                                               encoding="utf-8")
    print(f"{len(cases)} synthetic fixtures written to {OUT} (degraded={args.degraded})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
