"""The gate.

Reads thresholds.yaml, runs the agent over the dataset, scores every case, compares the
aggregate with the thresholds and exits non-zero if any metric misses.

That exit code is the whole point. A check that warns is not a check: it is a comment.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from statistics import mean

import yaml

from agent import prompt, schema
from agent.client import get_client
from evals import evaluators

ROOT = Path(__file__).resolve().parent
DEMO = ROOT.parent

BOLD, DIM, RESET = "\033[1m", "\033[2m", "\033[0m"
GREEN, RED, YELLOW = "\033[32m", "\033[31m", "\033[33m"


def load_json_document(text: str) -> tuple[dict | None, list[str]]:
    """Models put markdown fences around JSON often enough that it is worth handling."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("\n", 1)[-1]
        if cleaned.rstrip().endswith("```"):
            cleaned = cleaned.rstrip()[:-3]
    try:
        doc = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        return None, [f"output is not valid JSON: {exc.msg}"]
    return doc, schema.validate(doc)


def main() -> int:
    mode = "live" if os.environ.get("LIVE") == "1" else "replay"
    thresholds = yaml.safe_load((ROOT / "thresholds.yaml").read_text(encoding="utf-8"))
    limits = thresholds["evaluators"]

    cases = [
        json.loads(line)
        for line in (ROOT / thresholds["dataset"]).read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]

    client = get_client(mode, ROOT / "fixtures")
    results = []
    for case in cases:
        completion = client.complete(case["id"], case["transcript"])
        doc, errors = load_json_document(completion.text)
        results.append(evaluators.score_case(case, doc, errors, completion))

    scores = {
        "schema_valid": mean(r.schema_valid for r in results),
        "decisions_recall": mean(r.decisions_recall for r in results),
        "owner_accuracy": mean(r.owner_accuracy for r in results),
        "invented_owners": sum(r.invented_owners for r in results),
    }

    deployment = os.environ.get("FOUNDRY_DEPLOYMENT", "gpt-4o-mini")
    print()
    print(f"{BOLD}ai-actas-bot · evaluation gate{RESET}")
    print(f"{DIM}mode {mode} · {len(cases)} cases · deployment {deployment}{RESET}")
    print()
    print(f"{'metric':<20}{'score':>8}   {'threshold':<12}{'':<2}")

    failures = []
    for name, rule in limits.items():
        score = scores[name]
        if "min" in rule:
            passed = score >= rule["min"] - 1e-9
            rule_text = f">= {rule['min']:.2f}"
        else:
            passed = score <= rule["max"] + 1e-9
            rule_text = f"<= {rule['max']:g}"
        if name == "invented_owners":
            score_text = f"{int(score)}"
        else:
            score_text = f"{score:.3f}"
        status = f"{GREEN}PASS{RESET}" if passed else f"{RED}FAIL{RESET}"
        print(f"{name:<20}{score_text:>8}   {rule_text:<12} {status}")
        if not passed:
            failures.append(name)

    # Reported, not gated. This is the other question — cost and latency — and it belongs
    # to the attribution story, not to correctness.
    in_tokens = sum(r.input_tokens for r in results)
    out_tokens = sum(r.output_tokens for r in results)
    cost = (
        in_tokens / 1_000_000 * float(os.environ.get("COST_INPUT_PER_1M", "0.15"))
        + out_tokens / 1_000_000 * float(os.environ.get("COST_OUTPUT_PER_1M", "0.60"))
    )
    print()
    print(f"{DIM}usage   {in_tokens:,} in / {out_tokens:,} out tokens · est. cost ${cost:.4f}{RESET}")
    if mode == "live":
        latencies = sorted(r.latency_ms for r in results)
        p95 = latencies[max(0, int(len(latencies) * 0.95) - 1)]
        print(f"{DIM}latency p95 {p95 / 1000:.1f}s (informational, not gated){RESET}")
    else:
        print(f"{DIM}latency not measured in replay mode{RESET}")

    if failures:
        print()
        print(f"{YELLOW}details{RESET}")
        for r in results:
            if r.notes:
                for note in r.notes:
                    print(f"  {r.case_id}  {note}")
        print()
        print(f"{RED}{BOLD}GATE: FAIL{RESET} — {len(failures)} metric(s) below threshold: {', '.join(failures)}")
        return 1

    print()
    print(f"{GREEN}{BOLD}GATE: PASS{RESET}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
