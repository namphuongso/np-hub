# Public Release Guide

How to prepare and publish `@namphuongtechnologi/np-hub` to npm.

---

## Recommended — one command

```bash
npm run release
```

The release script walks you through:

1. NPM auth (opens `npm login` if needed)
2. Quality gate: `lint` → `typecheck` → `test` → `build`
3. Version bump: `1` patch / `2` minor / `3` major / `4` skip
4. Package contents check (`npm pack --dry-run`)
5. Access choice: `1` public / `2` restricted, then confirm and publish

Any failing step aborts the run. Use the manual steps below only when you need to intervene.

---

## Prerequisites

- Logged in to npm with the company account
- Publish rights on the `@namphuongtechnologi` scope
- Local or CI quality checks already green

---

## Manual quality gate

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`prepublishOnly` runs the same gate automatically before publish.

---

## Versioning

Follow [Semantic Versioning](https://semver.org/):

| Bump | Use when |
| ---- | -------- |
| `patch` | Bug fixes, no API break |
| `minor` | Backward-compatible features |
| `major` | Breaking changes |

```bash
npm version patch   # or minor / major
```

---

## Inspect package contents

```bash
npm pack --dry-run
```

Confirm the tarball includes:

- `dist/*`
- `README.md`
- `LICENSE`
- `docs/*`

README is the primary surface on the npm package page — verify it renders correctly before publishing.

---

## Publish

```bash
npm login
```

Scoped public package:

```bash
npm publish --access public
```

Private / restricted:

```bash
npm publish --access restricted
```

---

## Post-publish verification

1. Open the package page on [npm](https://www.npmjs.com/package/@namphuongtechnologi/np-hub) and confirm README rendering.
2. Install into a clean sample project:

```bash
npm install @namphuongtechnologi/np-hub
```

3. Smoke-test both the React import and the CDN / IIFE bundle if the release touches distribution.

---

## Release notes template

```md
## @namphuongtechnologi/np-hub x.y.z

**Date:** YYYY-MM-DD  
**Type:** patch | minor | major

### Summary
-

### Breaking changes
- None

### Migration
- N/A
```
