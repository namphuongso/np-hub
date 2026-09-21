# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.6] - 2026-09-21

### Added

- Custom launcher button image and icon support:
  - Web Component `<np-hub>`: added `image` and `icon` attributes and property setters (`setImage`, `setIcon`), supporting URLs or inline SVG/HTML markup, plus `<slot name="launcher-icon">` for custom icon elements.
  - React wrapper `<SupportWidget>`: added `image` and `icon` props supporting image URLs, SVG markup, or custom `ReactNode` icons with automatic slot projection.
  - Asset resolution mechanism prioritizing `image` (cover) over `icon` / slotted icon over default logo fallback.
- Unit test suite for launcher asset resolution and CSS URL formatting (`tests/unit/launcher-asset.test.ts`).

---

## [0.2.5] - 2026-09-17

### Added

- GitHub Actions automated publish workflow (`.github/workflows/publish.yml`).
- `CHANGELOG.md` to document version releases.

---

## [0.2.4] - 2026-09-17

### Documentation

- Updated usage guides and quick start docs.

---

## [0.2.3] - 2026-09-17

### Changed

- Refactored `SupportWidget` React wrapper state management by replacing `useRef` with `useState` for element tracking to ensure seamless lifecycle synchronization.

---

## [0.2.2] - 2026-09-17

### Added

- Configurable per-type toast notification durations (`successDurationMs`, `errorDurationMs`).
- Toast hover-pause behavior to improve readability.
- Quick-copy to clipboard action on toast errors.

### Changed

- Redesigned toast notification UI with enhanced styling, layout, and interaction capabilities.

---

## [0.2.1] - 2026-09-17

### Added

- Granular toast auto-close timing.
- Copy-to-clipboard functionality for API feedback.

---

## [0.2.0] - 2026-09-17

### Added

- Redesigned toast UI for submission feedback and notifications.
- Integrated `submit feedback toast` directly inside `<np-hub>` widget.

---

## [0.1.11] - 2026-09-17

### Changed

- Improved API response error handling and edge-case status parsing.

---

## [0.1.10] - 2026-09-17

### Documentation

- Updated CDN links and integration examples.

---

## [0.1.9] - 2026-09-17

### Fixed

- Fixed minor layout alignment in modal footer.

---

## [0.1.5] - 2026-09-17

### Changed

- Improved release script (`scripts/release.mjs`) with git working tree status check.

---

## [0.1.3] - 2026-09-17

### Changed

- Enhanced TypeScript module resolution and export mappings for both ESM (`.js`) and CommonJS (`.cjs`).

---

## [0.1.1] - 2026-09-17

### Added

- First-class React wrapper export (`@namphuongtechnologi/np-hub/react`).
- Interactive release CLI wizard (`npm run release`).
- Localized support widget UI (Vietnamese).
- Multi-file attachment uploads using `FormData`.
- Draggable launcher button with position persistence in `localStorage`.

---

## [0.1.0] - 2026-09-17

### Added

- Initial release of `@namphuongtechnologi/np-hub` Web Component (`<np-hub>`).
- Support ticket creation API service.
- Standalone global bundle (`np-hub.min.global.js`) for CDN usage.
