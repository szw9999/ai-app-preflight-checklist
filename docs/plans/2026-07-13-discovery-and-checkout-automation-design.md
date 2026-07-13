# Discovery and Checkout Automation Design

## Goal

Turn the existing interactive checklist into a compounding inbound entry point and reduce the post-onboarding checkout activation work to one repeatable command. The design must not add paid advertising, fake engagement, account credentials, or a storefront URL that does not exist.

## Chosen Approach

Keep one useful public tool rather than creating thin keyword pages. Improve the page's search semantics, canonical metadata, social preview metadata, structured data, and crawl notifications. Use IndexNow for participating search engines because it supports a hosted verification file and does not require a separate account.

The checkout configuration will move to `site-config.json` as the source of truth. A Python script will validate a public HTTPS checkout URL and generate `site-config.js`, preserving direct `file://` use of the checklist. A PowerShell wrapper will run unit and browser tests and, only when explicitly asked to publish, commit the two configuration files, push them, wait for the exact GitHub Pages commit, and verify the deployed configuration.

## Data Flow

1. Search visitors open the static GitHub Pages checklist.
2. The browser loads the generated JavaScript configuration without a backend.
3. While `checkoutUrl` is empty, the purchase button remains hidden.
4. After merchant onboarding, the public checkout URL is passed to the activation script.
5. The script validates and writes configuration, runs tests, and optionally publishes.
6. IndexNow is notified only after meaningful public content changes.

## Error Handling

- Reject non-HTTPS, local, private-address, credential-bearing, and fragment-bearing checkout URLs.
- Refuse automated publication from a dirty Git worktree so unrelated files are not committed.
- Compare the full local commit hash with the full GitHub Pages build commit.
- Treat IndexNow HTTP 200 and 202 as receipt only, never as proof of ranking or traffic.
- Keep the previous public configuration if validation or tests fail.

## Verification

- Node tests verify metadata, structured data, crawl files, and JSON-to-JavaScript configuration parity.
- Python tests verify checkout URL validation and IndexNow request construction.
- The existing browser smoke test verifies the checklist and hidden checkout state.
- After deployment, read the live page, live configuration, key file, GitHub Pages build status, and submit the updated URL once.

