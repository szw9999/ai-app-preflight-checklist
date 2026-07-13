(function attachChecklistData(root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  }
  if (root) {
    root.PreflightChecklistData = data;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createChecklistData() {
  return Object.freeze([
    {
      id: "repository-evidence",
      title: "Repository evidence",
      summary: "Make the project reproducible and reviewable before anyone depends on it.",
      items: [
        {
          id: "lockfile",
          title: "Dependency lockfile is committed",
          detail: "The lockfile matches the documented package manager and is not ignored by version control."
        },
        {
          id: "readme",
          title: "Setup and environment requirements are documented",
          detail: "The README covers installation, required variables, and the main user flow."
        },
        {
          id: "critical-test",
          title: "A critical user action has an automated test",
          detail: "At least one test protects the workflow whose failure would block real users."
        },
        {
          id: "continuous-integration",
          title: "Automated checks run on proposed changes",
          detail: "Continuous integration verifies the documented build or test command before merging."
        },
        {
          id: "license",
          title: "Usage rights are explicit",
          detail: "The repository includes an appropriate license or a clear private-use notice."
        }
      ]
    },
    {
      id: "trust-boundaries",
      title: "Secrets and trust boundaries",
      summary: "Treat generated interface code as untrusted until server-side behavior is verified.",
      items: [
        {
          id: "no-live-secrets",
          title: "Source files contain no working credentials",
          detail: "API keys, tokens, passwords, and private keys are absent from code and commit history."
        },
        {
          id: "example-env",
          title: "Example environment files use placeholders",
          detail: "Documentation shows variable names without exposing values that grant access."
        },
        {
          id: "server-authorization",
          title: "Authorization is enforced on the server",
          detail: "Protected actions do not rely only on hidden buttons, routes, or client-side role checks."
        },
        {
          id: "untrusted-input",
          title: "Untrusted input is validated at its destination",
          detail: "HTML, URLs, filenames, redirects, and identifiers are constrained before use."
        },
        {
          id: "safe-errors",
          title: "Errors avoid sensitive internal details",
          detail: "User-facing and logged errors do not expose tokens, private data, or internal paths."
        }
      ]
    },
    {
      id: "release-readiness",
      title: "Release readiness",
      summary: "A successful local preview is not enough evidence for a dependable release.",
      items: [
        {
          id: "clean-build",
          title: "A clean checkout can produce the release build",
          detail: "The documented command succeeds without relying on undeclared local files."
        },
        {
          id: "interface-states",
          title: "Failure and waiting states are usable",
          detail: "Loading, empty, error, unauthorized, and slow-network states remain understandable."
        },
        {
          id: "mobile-layout",
          title: "Required actions remain visible on small screens",
          detail: "Mobile layouts avoid horizontal overflow and do not hide critical controls."
        },
        {
          id: "monitoring",
          title: "Release failures can be detected without leaking data",
          detail: "Logs or monitoring expose actionable failures while excluding credentials and private content."
        },
        {
          id: "rollback",
          title: "A rollback path has been tested",
          detail: "The previous known-good release can be restored with a documented procedure."
        }
      ]
    }
  ]);
});
