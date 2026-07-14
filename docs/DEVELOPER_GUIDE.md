# Developer Guide

Guide for contributors working on `@namphuongtechnologi/np-hub`.

---

## Goals

- Ship a reusable support widget as a native Web Component
- Support static HTML, React, and other hosts without duplicating business logic
- Keep API mapping and validation centralized in `src/core`

---

## Stack

| Concern    | Choice                                  |
| ---------- | --------------------------------------- |
| Language   | TypeScript                              |
| UI runtime | Native Web Component (`customElements`) |
| Bundler    | `tsup` (ESM, CJS, IIFE)                 |
| Tests      | `vitest`                                |
| Lint       | `eslint`                                |
| Node       | `>= 18`                                 |

---

## Repository layout

| Path                   | Responsibility                         |
| ---------------------- | -------------------------------------- |
| `src/core`             | Config resolution & validation         |
| `src/services`         | HTTP / API side effects                |
| `src/component`        | Widget UI, template, styles, lifecycle |
| `src/react`            | React wrapper (`SupportWidget`)        |
| `src/types`            | Public TypeScript types                |
| `src/register.ts`      | Custom element registration            |
| `src/index.ts`         | Library public exports                 |
| `tests/unit`           | Unit tests                             |
| `examples/static-html` | Local static integration sample        |

---

## Setup

```bash
npm install
```

Recommended: npm that ships with a current Node LTS (`npm >= 9`).

---

## Local development

### Build / watch

```bash
npm run dev      # watch mode
npm run build    # production build → dist/
```

### Preview with the static example

Serve from the **repository root** so `/dist` is reachable:

```bash
npm run build
npx serve .
```

Open:

```
http://localhost:3000/examples/static-html/
```

Do **not** run `npx serve examples/static-html` — the page will fail to load `/dist/np-hub.min.global.js` and may appear to use stale assets.

The demo harness is `examples/static-html/np-hub.js`.

---

## Quality checks

```bash
npm run test
npm run lint
npm run typecheck
npm run test:module-resolution
```

Before opening a PR:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

---

## Development workflow

1. Create a feature branch.
2. Change the correct module (`core`, `services`, `component`, or `react`).
3. Add or update unit tests.
4. Run the quality gate above.
5. Open a PR with a clear test plan.

---

## Coding standards

- Do not map API payloads inside UI event handlers — keep that in `src/core` / `src/services`.
- Resolve config in `src/core/config`; validate in `src/core/validation`.
- `src/component` owns launcher, modal, prefill, submit toast, and public events only.
- Emit only documented public events.
- Preserve backward compatibility of the public contract unless shipping a major version.

---

## Public contract

### Events

| Event                   | Fired when                |
| ----------------------- | ------------------------- |
| `np-hub-open`           | Modal opens               |
| `np-hub-close`          | Modal closes              |
| `np-hub-submit-success` | API accepts the request   |
| `np-hub-submit-error`   | Validation or API failure |

### Methods

| Method                 | Purpose                                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------------------- |
| `setConfig(config)`    | Project / API settings (`projectId`, `isDev`, `priority`, `coordinators`, `emailContacts`, `toastDuration`) |
| `setUser(user)`        | Prefill requester fields (still required on submit)                                                         |
| `setFormPrefill(data)` | Prefill `content` / `attachments`                                                                           |
| `open()` / `close()`   | Control modal visibility                                                                                    |

### Attributes

| Attribute                        | Purpose                                             |
| -------------------------------- | --------------------------------------------------- |
| `project-id`, `is-dev`           | Project & environment                               |
| `width`, `height`                | Launcher size (default `65px`)                      |
| `right`, `bottom`, `left`, `top` | Launcher insets (default `right`/`bottom` = `20px`) |

If the user has dragged the launcher, the `localStorage` position overrides attributes until cleared.

The launcher logo is embedded in the bundle (`src/component/assets/np-support-logo.png` → data URL at build time) and is not externally configurable.

### Submit feedback toast

Implemented in `src/component/support-widget.element.ts` with markup in `support-widget.template.html` and styles in `support-widget.styles.css`.

| Behavior     | Detail                                                           |
| ------------ | ---------------------------------------------------------------- |
| Trigger      | API submit success, or API / runtime error                       |
| Not shown    | Client-side required-field validation (inline field errors only) |
| Position     | Centered overlay toast                                           |
| Auto-close   | `toastDuration` from `setConfig` (default `4000` ms)             |
| Manual close | `toast-close-btn` dismisses immediately                          |
| Success      | Toast shown, then modal auto-closes after ~1.2s                  |

Invalid `toastDuration` values (`<= 0`, `NaN`, `Infinity`) fall back to `4000`.

---

## API environment selection

Resolved in `src/core/config/endpoints.ts`:

| Condition                         | Environment |
| --------------------------------- | ----------- |
| `is-dev` / `isDev` unset or false | Production  |
| `is-dev` / `isDev` true           | Development |

---

## Pre-merge checklist

- [ ] Build succeeds
- [ ] Tests pass
- [ ] Lint & typecheck pass
- [ ] README / docs updated when public behavior changes
- [ ] No credentials or secrets committed
