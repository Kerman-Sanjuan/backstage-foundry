"""The contract between the agent and everything downstream.

A meeting-minutes agent is only useful if the minutes are machine-checkable, so the
contract is a schema and not a paragraph in a prompt. This is the same shape the eval
suite checks and the same shape the template ships in `agent/schema.py`.
"""

from __future__ import annotations

# The fields a minute must carry. Anything missing is a broken contract, not a
# quality debate: `schema_valid` is binary on purpose.
REQUIRED_TOP_LEVEL = ("summary", "decisions", "action_items")


def validate(doc: dict | None) -> list[str]:
    """Return a list of contract violations. An empty list means the document is valid."""
    errors: list[str] = []

    if not isinstance(doc, dict):
        return ["output is not a JSON object"]

    for field in REQUIRED_TOP_LEVEL:
        if field not in doc:
            errors.append(f"missing field: {field}")

    summary = doc.get("summary")
    if not isinstance(summary, str) or not summary.strip():
        errors.append("summary must be a non-empty string")

    decisions = doc.get("decisions")
    if not isinstance(decisions, list):
        errors.append("decisions must be a list")
    else:
        for i, d in enumerate(decisions):
            if not isinstance(d, dict) or not isinstance(d.get("text"), str) or not d["text"].strip():
                errors.append(f"decisions[{i}].text must be a non-empty string")

    items = doc.get("action_items")
    if not isinstance(items, list):
        errors.append("action_items must be a list")
    else:
        for i, it in enumerate(items):
            if not isinstance(it, dict):
                errors.append(f"action_items[{i}] must be an object")
                continue
            if not isinstance(it.get("task"), str) or not it["task"].strip():
                errors.append(f"action_items[{i}].task must be a non-empty string")
            owner = it.get("owner", None)
            if owner is not None and not isinstance(owner, str):
                errors.append(f"action_items[{i}].owner must be a string or null")
            due = it.get("due", None)
            if due is not None and not isinstance(due, str):
                errors.append(f"action_items[{i}].due must be an ISO date string or null")

    return errors
