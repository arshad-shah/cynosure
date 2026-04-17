# Security Policy

## Supported versions

While Lumen is pre-v1.0.0, only the `main` branch receives fixes. Post-v1.0.0
the latest major receives full support and the previous major receives
security fixes for six months.

| Version   | Supported |
| --------- | --------- |
| `0.x`     | main only |
| `1.x`     | planned   |

## Reporting a vulnerability

Please report vulnerabilities privately. **Do not open a public issue.**

- Email: **arshad@arshadshah.com**
- Subject: `[lumen security] <short description>`

Include:

1. A description of the issue and its impact.
2. Reproduction steps (a minimal repo or gist is ideal).
3. Affected versions and environments.
4. Any suggested mitigations.

## Response expectations

- Acknowledgement within **3 business days**.
- Triage and initial assessment within **7 business days**.
- A fix or mitigation plan communicated within **30 days**.

Once a fix ships, the release notes will credit the reporter unless
anonymity is requested.

## Scope

In scope:

- Components shipped under `@lumen/*` packages.
- Published build artefacts on npm.
- Docs site at `lumen.arshadshah.com`.

Out of scope:

- Consumer applications that depend on Lumen.
- Third-party libraries listed as peer dependencies.
