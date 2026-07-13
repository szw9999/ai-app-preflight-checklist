#!/usr/bin/env python3
"""Submit the canonical checklist URL to the IndexNow global endpoint."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlencode, urlsplit
from urllib.request import urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CONFIG = ROOT / "indexnow-config.json"
ENDPOINT = "https://api.indexnow.org/indexnow"
KEY_PATTERN = re.compile(r"^[A-Za-z0-9-]{8,128}$")


def validate_submission_config(url: str, key: str, key_location: str) -> None:
    if not KEY_PATTERN.fullmatch(key):
        raise ValueError("IndexNow key must contain 8-128 letters, numbers, or dashes.")

    target = urlsplit(url)
    location = urlsplit(key_location)
    if target.scheme != "https" or location.scheme != "https":
        raise ValueError("IndexNow URL and key location must use HTTPS.")
    if not target.hostname or target.hostname != location.hostname:
        raise ValueError("IndexNow URL and key location must share the same host.")
    if not location.path.endswith(f"/{key}.txt"):
        raise ValueError("IndexNow key filename must match the submitted key.")

    covered_path = location.path.rsplit("/", 1)[0] + "/"
    if not target.path.startswith(covered_path):
        raise ValueError("IndexNow key location does not cover the submitted URL path.")


def build_submission_url(url: str, key: str, key_location: str) -> str:
    validate_submission_config(url, key, key_location)
    query = urlencode(
        {"url": url, "key": key, "keyLocation": key_location},
        safe="",
    )
    return f"{ENDPOINT}?{query}"


def load_config(path: Path = DEFAULT_CONFIG) -> dict[str, str]:
    data = json.loads(path.read_text(encoding="utf-8"))
    required = {"url", "key", "keyLocation"}
    if not isinstance(data, dict) or set(data) != required:
        raise ValueError("indexnow-config.json must contain exactly url, key, and keyLocation.")
    values = {name: str(value) for name, value in data.items()}
    validate_submission_config(values["url"], values["key"], values["keyLocation"])
    return values


def submit(submission_url: str, timeout: float = 30.0) -> int:
    with urlopen(submission_url, timeout=timeout) as response:
        return int(response.status)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--url", help="Override the configured URL for another page covered by the same key.")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    config = load_config(args.config)
    submitted_url = args.url or config["url"]
    submission_url = build_submission_url(
        submitted_url, config["key"], config["keyLocation"]
    )
    if args.dry_run:
        print(submission_url)
        return 0

    status = submit(submission_url)
    if status not in {200, 202}:
        raise SystemExit(f"IndexNow returned unexpected HTTP status {status}.")
    print(f"IndexNow received the URL with HTTP status {status}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
