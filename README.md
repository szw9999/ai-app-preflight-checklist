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

The paid-product link is deliberately hidden while `checkoutUrl` is empty. `site-config.json` is the source of truth and `site-config.js` is generated for direct browser use.

Validate a future public checkout URL without changing files:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts\activate-checkout.ps1 -CheckoutUrl "https://example.lemonsqueezy.com/buy/example" -DryRun
```

After merchant onboarding provides the real public URL, the same script can configure, test, commit, push, wait for GitHub Pages, and verify the live configuration by adding `-Publish`.

## Search Discovery

The site includes canonical metadata, structured data, `robots.txt`, and `sitemap.xml`. The IndexNow verification file is scoped to this GitHub Pages project path.

Validate the IndexNow request without submitting it:

```powershell
python -B scripts\submit_indexnow.py --dry-run
```

Submit only after a meaningful public content update:

```powershell
python -B scripts\submit_indexnow.py
```

An HTTP 200 or 202 means the URL notification was received. It does not guarantee crawling, indexing, ranking, traffic, or sales.

## Public URL

https://szw9999.github.io/ai-app-preflight-checklist/
