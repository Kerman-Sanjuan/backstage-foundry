"""Evaluators. Deterministic where it is possible, fuzzy only where it is not.

Every function returns per-case detail plus a score, because the gate has to explain
itself in the pull request: "0.71" is not actionable, "case c07, decision 2 not found"
is.
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass, field
from difflib import SequenceMatcher

# Above this ratio two sentences are considered the same decision, worded differently.
# Calibrated against the dataset; swap for an LLM judge if you need real paraphrase
# robustness, at the price of a non-deterministic gate.
DECISION_MATCH = 0.62
TASK_MATCH = 0.55


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(c for c in value if not unicodedata.combining(c))
    value = value.casefold()
    return re.sub(r"[^a-z0-9 ]+", " ", value).strip()


def ratio(a: str, b: str) -> float:
    return SequenceMatcher(None, norm(a), norm(b)).ratio()


@dataclass
class CaseResult:
    case_id: str
    schema_valid: float = 0.0
    decisions_recall: float = 0.0
    owner_accuracy: float = 0.0
    invented_owners: float = 0.0
    input_tokens: int = 0
    output_tokens: int = 0
    latency_ms: int = 0
    notes: list[str] = field(default_factory=list)


def score_case(case: dict, doc: dict | None, schema_errors: list[str], completion) -> CaseResult:
    result = CaseResult(
        case_id=case["id"],
        input_tokens=completion.input_tokens,
        output_tokens=completion.output_tokens,
        latency_ms=completion.latency_ms,
    )
    result.schema_valid = 0.0 if schema_errors else 1.0
    for err in schema_errors:
        result.notes.append(f"schema: {err}")

    if doc is None:
        # Nothing to measure. Leave the quality metrics at zero rather than skipping the
        # case: a model that returns garbage must not improve the average by being empty.
        result.notes.append("no parsable output, quality metrics scored 0")
        return result

    truth = case["ground_truth"]
    produced_decisions = [d.get("text", "") for d in doc.get("decisions", []) if isinstance(d, dict)]

    # decisions_recall: of what was actually decided, how much did it capture.
    expected = truth.get("decisions", [])
    if expected:
        found = 0
        for want in expected:
            best = max((ratio(want, got) for got in produced_decisions), default=0.0)
            if best >= DECISION_MATCH:
                found += 1
            else:
                result.notes.append(f"decisions: missed (best {best:.2f}) :: {want}")
        result.decisions_recall = found / len(expected)
    else:
        result.decisions_recall = 1.0

    # owner_accuracy: the right task with the wrong person is the failure that erodes trust.
    expected_items = truth.get("action_items", [])
    if expected_items:
        hits = 0
        produced_items = [i for i in doc.get("action_items", []) if isinstance(i, dict)]
        for want in expected_items:
            best_i, best_r = -1, 0.0
            for i, got in enumerate(produced_items):
                r = ratio(want["task"], got.get("task", ""))
                if r > best_r:
                    best_i, best_r = i, r
            if best_r >= TASK_MATCH:
                got_owner = produced_items[best_i].get("owner")
                if _same_person(want.get("owner"), got_owner):
                    hits += 1
                else:
                    result.notes.append(
                        f"owner: expected {want.get('owner')!r}, got {got_owner!r} :: {want['task']}"
                    )
            else:
                result.notes.append(f"action item not found (best {best_r:.2f}) :: {want['task']}")
        result.owner_accuracy = hits / len(expected_items)
    else:
        result.owner_accuracy = 1.0

    # invented_owners: names that are not in the transcript. Counted, not averaged,
    # because one invented owner is one person wrongly assigned work.
    haystack = norm(case["transcript"]) + " " + norm(" ".join(case.get("participants", [])))
    invented = 0
    for item in doc.get("action_items", []):
        if not isinstance(item, dict):
            continue
        owner = item.get("owner")
        if owner and norm(owner) not in haystack:
            invented += 1
            result.notes.append(f"invented owner: {owner!r} :: {item.get('task', '')}")
    result.invented_owners = float(invented)

    return result


def _same_person(expected: str | None, got: str | None) -> bool:
    if expected is None or got is None:
        return expected is None and got is None
    a, b = norm(expected), norm(got)
    if a == b:
        return True
    # "marta" vs "marta ruiz" should not fail the check; "marta" vs "javier" must.
    return ratio(a, b) >= 0.80 or a in b or b in a
