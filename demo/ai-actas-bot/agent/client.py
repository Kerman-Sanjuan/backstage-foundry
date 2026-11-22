"""Transport for the agent. Replay and live share the same interface on purpose.

The gate must be the same gate in both modes, otherwise the demo proves nothing about
production. Only the transport changes: a JSON file on disk, or an HTTPS call to the
deployment the platform gave you.

Live mode talks OpenAI-compatible chat completions, which is what a Foundry project
exposes. Point FOUNDRY_ENDPOINT at the APIM GenAI gateway instead of the project and the
caller identity becomes the attribution key — same code, different URL.
"""

from __future__ import annotations

import json
import os
import time
from dataclasses import dataclass
from pathlib import Path

from . import prompt


@dataclass
class Completion:
    text: str
    input_tokens: int
    output_tokens: int
    latency_ms: int


class ReplayClient:
    """Reads recorded model output. Deterministic, offline, free."""

    def __init__(self, fixtures_dir: Path):
        self.fixtures_dir = Path(fixtures_dir)

    def complete(self, case_id: str, transcript: str) -> Completion:
        path = self.fixtures_dir / f"{case_id}.json"
        if not path.exists():
            raise FileNotFoundError(
                f"no fixture for {case_id}. Run `make record` against a real deployment, "
                f"or check that the dataset and the fixtures are in sync."
            )
        data = json.loads(path.read_text(encoding="utf-8"))
        return Completion(
            text=data["model_text"],
            input_tokens=data["usage"]["input_tokens"],
            output_tokens=data["usage"]["output_tokens"],
            latency_ms=data.get("latency_ms", 0),
        )


class LiveClient:
    """Calls the deployment. Import is lazy so replay mode needs no dependencies."""

    def __init__(self) -> None:
        endpoint = os.environ.get("FOUNDRY_ENDPOINT", "").strip()
        if not endpoint:
            raise SystemExit("FOUNDRY_ENDPOINT is not set. Copy .env.example to .env, or use replay mode.")
        self.deployment = os.environ.get("FOUNDRY_DEPLOYMENT", "gpt-4o-mini")

        from openai import OpenAI  # local import: replay mode must not need it

        # Federated OIDC in CI, API key locally. No secret is stored either way.
        api_key = os.environ.get("FOUNDRY_API_KEY", "").strip()
        if api_key:
            self._client = OpenAI(base_url=endpoint, api_key=api_key)
        else:
            from azure.identity import DefaultAzureCredential, get_bearer_token_provider

            token = get_bearer_token_provider(
                DefaultAzureCredential(), "https://ai.azure.com/.default"
            )
            self._client = OpenAI(base_url=endpoint, api_key=token())

    def complete(self, case_id: str, transcript: str) -> Completion:
        started = time.monotonic()
        response = self._client.chat.completions.create(
            model=self.deployment,
            messages=[
                {"role": "system", "content": prompt.SYSTEM},
                {"role": "user", "content": prompt.user_prompt(transcript)},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        elapsed = int((time.monotonic() - started) * 1000)
        usage = response.usage
        return Completion(
            text=response.choices[0].message.content or "",
            input_tokens=getattr(usage, "prompt_tokens", 0),
            output_tokens=getattr(usage, "completion_tokens", 0),
            latency_ms=elapsed,
        )


def get_client(mode: str, fixtures_dir: Path):
    if mode == "live":
        return LiveClient()
    return ReplayClient(fixtures_dir)
