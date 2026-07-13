const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

test("page metadata targets the AI-built app pre-launch query", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

  assert.match(html, /<link rel="canonical" href="https:\/\/szw9999\.github\.io\/ai-app-preflight-checklist\/">/);
  assert.match(html, /<title>AI-Built App Pre-Launch Checklist \| React &amp; TypeScript<\/title>/);
  assert.match(html, /<h1 id="page-title">AI-built app pre-launch evidence checklist<\/h1>/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
});

test("page exposes valid free web application structured data", () => {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);

  assert.ok(match, "Expected JSON-LD structured data in index.html");
  const data = JSON.parse(match[1]);
  assert.equal(data["@type"], "WebApplication");
  assert.equal(data.isAccessibleForFree, true);
  assert.equal(data.offers.price, "0");
  assert.equal(data.url, "https://szw9999.github.io/ai-app-preflight-checklist/");
});

test("crawl files point to the canonical public URL", () => {
  const robots = fs.readFileSync(path.join(root, "robots.txt"), "utf8");
  const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");

  assert.match(robots, /Sitemap: https:\/\/szw9999\.github\.io\/ai-app-preflight-checklist\/sitemap\.xml/);
  assert.match(sitemap, /<loc>https:\/\/szw9999\.github\.io\/ai-app-preflight-checklist\/<\/loc>/);
  assert.match(sitemap, /<lastmod>2026-07-13<\/lastmod>/);
});

test("generated browser configuration matches the JSON source", () => {
  const source = JSON.parse(fs.readFileSync(path.join(root, "site-config.json"), "utf8"));
  const script = fs.readFileSync(path.join(root, "site-config.js"), "utf8");
  const sandbox = { window: {} };

  vm.runInNewContext(script, sandbox);
  assert.deepEqual(JSON.parse(JSON.stringify(sandbox.window.PREFLIGHT_SITE_CONFIG)), source);
});

test("homepage links to a transparent synthetic sample report", () => {
  const homepage = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const sample = fs.readFileSync(path.join(root, "sample-report.html"), "utf8");

  assert.match(homepage, /id="sample-report-link"[^>]+href="sample-report\.html"/);
  assert.match(sample, /synthetic test project/i);
  assert.match(sample, /local read-only static inspection/i);
  assert.match(sample, /Raw HTML injection path/);
  assert.match(sample, /not a security certification/i);
  assert.match(sample, /href="\.\/"[^>]*>Back to the interactive checklist<\/a>/);
});
