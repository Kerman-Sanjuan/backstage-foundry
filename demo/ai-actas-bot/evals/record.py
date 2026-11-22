"""Record real model output as fixtures for replay mode.

Run this once against a real deployment before you rely on the gate, and again whenever
you change the prompt deliberately. Recording is a decision, not a side effect: a fixture
that quietly drifts from the code is worse than no fixture.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FIXTURES = ROOT / "fixtures"


def main() -> int:
    from agent.client import LiveClient

    client = LiveClient()
    cases = [
        json.loads(line)
        for line in (ROOT / "dataset.jsonl").read_text(encoding="utf-8").splitlines()
        if line.strip()
    ]
    FIXTURES.mkdir(exist_ok=True)
    for case in cases:
        completion = client.complete(case["id"], case["transcript"])
        payload = {
            "_synthetic": False,
            "case_id": case["id"],
            "model_text": completion.text,
            "usage": {
                "input_tokens": completion.input_tokens,
                "output_tokens": completion.output_tokens,
            },
            "latency_ms": completion.latency_ms,
        }
        (FIXTURES / f"{case['id']}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
        )
        print(f"recorded {case['id']}  {completion.input_tokens:>5} in / {completion.output_tokens:>4} out")
    print(f"\n{len(cases)} fixtures written to {FIXTURES}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
