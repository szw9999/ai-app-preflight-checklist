#!/usr/bin/env python3
"""Validate a public checkout URL and generate the browser configuration."""

from __future__ import annotations

import argparse
import ipaddress
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]
SOURCE_PATH = ROOT / "site-config.json"
OUTPUT_PATH = ROOT / "site-config.js"
REQUIRED_KEYS = {"checkoutUrl", "productName", "priceLabel"}


def validate_checkout_url(value: str) -> str:
    candidate = value.strip()
    parsed = urlsplit(candidate)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("Checkout URL must be a public HTTPS URL.")
    if parsed.username or parsed.password:
        raise ValueError("Checkout URL must not contain embedded credentials.")
    if parsed.fragment:
        raise ValueError("Checkout URL must not contain a fragment.")

    hostname = parsed.hostname.lower().rstrip(".")
    if hostname == "localhost" or hostname.endswith((".localhost", ".local")):
        raise ValueError("Checkout URL must not point to a local host.")
    try:
        address = ipaddress.ip_address(hostname)
    except ValueError:
        address = None
    if address is not None and not address.is_global:
        raise ValueError("Checkout URL must not point to a private or reserved address.")
    return candidate


def load_site_config(path: Path = SOURCE_PATH) -> dict[str, Any]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or set(data) != REQUIRED_KEYS:
        raise ValueError("site-config.json must contain exactly the supported keys.")
    return data


def render_site_config_js(data: dict[str, Any]) -> str:
    payload = json.dumps(data, ensure_ascii=True, indent=2)
    return f"window.PREFLIGHT_SITE_CONFIG = Object.freeze({payload});\n"


def write_atomic(path: Path, content: str) -> None:
    temporary = path.with_name(f"{path.name}.tmp")
    temporary.write_text(content, encoding="utf-8")
    temporary.replace(path)


def configure_checkout(url: str, dry_run: bool = False) -> dict[str, Any]:
    data = load_site_config()
    data["checkoutUrl"] = validate_checkout_url(url)
    if not dry_run:
        write_atomic(
            SOURCE_PATH,
            json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        )
        write_atomic(OUTPUT_PATH, render_site_config_js(data))
    return data


def check_generated_config() -> None:
    expected = render_site_config_js(load_site_config())
    actual = OUTPUT_PATH.read_text(encoding="utf-8")
    if actual != expected:
        raise SystemExit("site-config.js is not synchronized with site-config.json.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--url", help="Official public checkout URL to activate.")
    group.add_argument("--check", action="store_true", help="Verify generated config parity.")
    parser.add_argument("--dry-run", action="store_true", help="Validate without writing files.")
    args = parser.parse_args()

    if args.check:
        check_generated_config()
        print("Checkout configuration is synchronized.")
        return 0

    data = configure_checkout(args.url, dry_run=args.dry_run)
    action = "Validated" if args.dry_run else "Configured"
    print(f"{action} checkout URL for {data['productName']}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
