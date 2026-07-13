# AI App Preflight Checklist

A free, interactive evidence checklist for React and TypeScript applications built with AI assistance.

## What It Does

- Records each item as Confirmed, Needs work, or Not checked.
- Stores progress only in the current browser using local storage.
- Downloads a plain-text summary suitable for a release review.
- Works as a static site without remote scripts, analytics, or a backend.

This is a planning aid, not a penetration test, security certification, or guarantee that an application is defect-free.

## Local Use

Open `index.html` in a current desktop browser.

Run the core tests:

```powershell
npm.cmd test
```

Run the browser smoke test:

```powershell
python -B tests\ui_smoke.py
```

## Checkout Link

The paid-product link is deliberately hidden while `checkoutUrl` is empty in `site-config.js`. After the storefront is live, replace the empty value with the official checkout URL and rerun both test commands before publishing.

## Public URL

https://szw9999.github.io/ai-app-preflight-checklist/
