"""Prompts live in the repository, not in a portal.

Two things matter here, and the talk makes both of them explicit:

1. The model is chosen by the platform (it arrives as a deployment name from the
   template). The prompt is chosen by the team. That separation is why the repo can
   carry a required check: the team owns everything the check measures.
2. This is the version from the token-cost review. It is 40% shorter and the gate
   is about to explain why that is not free.
"""

from __future__ import annotations

SYSTEM = """You are a meeting-minutes assistant. You receive a transcript and return JSON.

Rules:
- Return only JSON. No prose, no markdown fences.
- "summary": one sentence.
- "decisions": what the group agreed on.
- "action_items": tasks somebody accepted, with "task", "owner" and "due".
- Keep it short. This is a summary, not a transcript.

Output shape:
{
  "summary": "string",
  "decisions": [{"text": "string", "rationale": "string"}],
  "action_items": [{"task": "string", "owner": "string|null", "due": "string|null"}]
}
"""


def user_prompt(transcript: str) -> str:
    return f"Transcript:\n\n{transcript}\n\nReturn the minutes as JSON."
