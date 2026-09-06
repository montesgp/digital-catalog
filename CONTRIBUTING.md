# Contributing to digital-catalog

Thank you for improving this open-source catalog. This repository is a static
vanilla JavaScript application: it intentionally has no package manager, build
step, or framework.

## Quick path

1. Read the [README](README.md), [Code of Conduct](CODE_OF_CONDUCT.md), and
   [Security Policy](SECURITY.md).
2. Fork the repository, branch from `dev`, and keep the change focused.
3. Run `node scripts/check-structure.mjs` before opening a pull request to `dev`.

## Branching and releases

- `dev` is the integration branch. The maintainer may commit directly; external
  contributors submit pull requests.
- `main` is production and receives changes only by promotion pull request from
  `dev` after required checks pass.
- Create contributor branches from `dev` with a Conventional Commit prefix:
  `feat/`, `fix/`, `docs/`, `ci/`, `chore/`, `refactor/`, `style/`, `perf/`,
  `test/`, `build/`, or `revert/`.

Examples: `feat/catalog-filter`, `fix/empty-decants`, `docs/quick-start`.

## Pull requests

Use the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) and:

- choose exactly one `type:*` label;
- use Conventional Commit messages, without `Co-Authored-By` or AI-attribution
  trailers;
- include the validation command and result;
- include screenshots for visual changes; and
- update documentation when behavior or configuration changes.

Small, reviewable pull requests are easier to validate and revert.

## Working with catalog data

The configured Apps Script endpoint accesses active operational Sheets. Do not
copy, paste, commit, or publish their rows, exports, identifiers, credentials,
or customer information in issues, pull requests, fixtures, or tests. Quality
gates are deliberately offline and must stay that way.

## Code conventions

- Preserve the existing ES module and vanilla JavaScript style.
- Avoid new dependencies unless there is a documented reason and maintainer
  agreement; the site is designed to remain static and inspectable.
- Keep image and other static assets local when they are part of the product.

## Security

Do not disclose vulnerabilities in public issues. Follow
[SECURITY.md](SECURITY.md).
