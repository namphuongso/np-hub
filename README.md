# @namphuongtechnologi/np-hub

Floating support widget for Nam Phương So applications. Drop it into any static site or React app — users open a form, submit a support request, and the request is sent to the Nam Phương API.

[![npm version](https://img.shields.io/npm/v/@namphuongtechnologi/np-hub.svg)](https://www.npmjs.com/package/@namphuongtechnologi/np-hub)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

---

## Features

- **Web Component** (`<np-hub>`) — works in plain HTML and most frameworks
- **React wrapper** — typed `SupportWidget` component
- **Drag-and-drop launcher** — position persists in `localStorage`
- **Form prefill** — optional user / content / attachment seeding; required fields still validated on submit
- **Submit feedback toast** — centered popup on success or API error; auto-closes or user can dismiss
- **Configurable stacking** — optional `zIndex` (default `10000`)
- **Environment switch** — Production by default; Development via `isDev` / `is-dev`

---

## Installation

```bash
npm install @namphuongtechnologi/np-hub
```

**Peer dependency (React wrapper only):** `react` `>= 18`

**CDN (static HTML, no bundler):** pin the version to match the package you want (current: `0.2.3`):

```
https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.2.3/dist/np-hub.min.global.js
```

---

## Quick start

### Static HTML (CDN)

Create a config script, then include it once in your page.

**`np-hub.js`**

```js
var NP_HUB_CDN =
  "https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.2.3/dist/np-hub.min.global.js";

function initNpHub() {
  var widget = document.createElement("np-hub");

  widget.setConfig({
    projectId: "NPP",
    isDev: false,
    priority: 0,
    coordinators: [],
    emailContacts: [],
  });

  document.body.appendChild(widget);

  widget.addEventListener("np-hub-submit-success", function (event) {
    console.log("Support request created:", event.detail);
  });

  widget.addEventListener("np-hub-submit-error", function (event) {
    console.error("Support request failed:", event.detail);
  });
}

var script = document.createElement("script");
script.src = NP_HUB_CDN;
script.onload = initNpHub;
document.head.appendChild(script);
```

**`index.html`**

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Site</title>
  </head>
  <body>
    <script src="./np-hub.js"></script>
  </body>
</html>
```

### Web Component via npm (bundler)

```js
import "@namphuongtechnologi/np-hub/widget";

const widget = document.createElement("np-hub");
widget.setConfig({
  projectId: "NPP",
  isDev: false,
});
document.body.appendChild(widget);
```

### React

Requires React `>= 18`. Mount **once** at the application root (`App.tsx`, `main.tsx`, or root layout).

```tsx
import { SupportWidget } from "@namphuongtechnologi/np-hub/react";

export default function App() {
  return (
    <>
      {/* app content */}
      <SupportWidget
        projectId="NPP"
        isDev={false}
        priority={0}
        coordinators={[]}
        emailContacts={[]}
        onSubmitSuccess={(detail) => console.log("Success:", detail)}
        onSubmitError={(error) => console.error("Error:", error)}
      />
    </>
  );
}
```

---

## Configuration

### `setConfig` / React props

| Name            | Required | Default | Description                                                                                                            |
| --------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------- |
| `projectId`     | React: yes · WC: no | — | Project code forwarded to the API. If set, must be a non-empty string.                                                 |
| `isDev`         | No       | `false` | `true` → Development API; otherwise Production                                                                         |
| `priority`      | No       | —       | Request priority. Sent only when set (number).                                                                         |
| `coordinators`  | No       | `[]`    | Coordinator email list                                                                                                 |
| `emailContacts` | No       | `[]`    | Contact emails that receive the notification                                                                           |
| `toastDuration` | No       | `4000`  | Toast auto-close delay in ms. Number, or `{ success?: number, error?: number }`                                        |
| `zIndex`        | No       | `10000` | CSS `z-index` of the floating widget. Omit to keep the default.                                                        |

### Prefill (optional)

| Name         | Method / prop                    | Description                                                                 |
| ------------ | -------------------------------- | --------------------------------------------------------------------------- |
| User         | `setUser` / `user`               | Prefills name, email, phone. Form UI still requires these fields on submit. |
| Form content | `setFormPrefill` / `formPrefill` | Prefills `content` and `attachments` (array of **URL strings**; fetched on submit). |

```js
// Web Component
widget.setUser({
  name: "Nguyen Van A",
  email: "a@example.com",
  phoneNumber: "0912345678",
});

widget.setFormPrefill({
  content: "Describe the issue...",
  attachments: ["https://example.com/screenshot.png"],
});
```

```tsx
// React
<SupportWidget
  projectId="NPP"
  user={{
    name: "Nguyen Van A",
    email: "a@example.com",
    phoneNumber: "0912345678",
  }}
  formPrefill={{
    content: "Describe the issue...",
    attachments: ["https://example.com/screenshot.png"],
  }}
/>
```

### Launcher size & position

Default: **65×65px**, anchored **20px** from the bottom-right corner.

| Attribute / prop   | Description                                         |
| ------------------ | --------------------------------------------------- |
| `width` / `height` | Launcher size (default `65`)                        |
| `right` / `bottom` | Offset from bottom-right (default `20`)             |
| `left` / `top`     | Use instead of `right` / `bottom` for other corners |

Numeric values from React props are treated as pixels. After the user drags the launcher, the stored `localStorage` position takes precedence.

```js
widget.setAttribute("right", "24");
widget.setAttribute("bottom", "24");
```

```tsx
<SupportWidget projectId="NPP" right={24} bottom={24} />
```

### Stacking order (`zIndex`)

Default: **10000**. Raise it if the widget sits under other overlays on the host page.

```js
widget.setConfig({ projectId: "NPP", zIndex: 20000 });
// or: widget.setAttribute("z-index", "20000");
```

```tsx
<SupportWidget projectId="NPP" zIndex={20000} />
```

### Submit feedback toast

After a successful API submit or an API/exception failure, the widget shows a **centered toast** with the result message.

| Behavior          | Detail                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| When shown        | Submit success, or API / runtime error                                                                |
| When hidden       | Missing required fields (only inline field highlighting)                                              |
| Auto-close        | After `toastDuration` ms (default `4000`). Pauses countdown on cursor hover.                          |
| Copy actions      | Success toast: quick-copy for request code and lookup URL                                             |
| Manual close      | User can dismiss via the `×` button                                                                   |
| Success follow-up | Modal closes automatically after the success toast auto-closes (`toastDuration` / `success` value)    |

`toastDuration` can be a single number (applies to both success/error) or structured with separate values:

```js
widget.setConfig({
  projectId: "NPP",
  toastDuration: {
    success: 3000, // closes success toast after 3s
    error: 8000, // keeps error toast open for 8s
  },
});
```

```tsx
<SupportWidget
  projectId="NPP"
  toastDuration={{ success: 3000, error: 8000 }}
/>
```

---

## Events & methods

### Events (Web Component)

| Event                   | When                             |
| ----------------------- | -------------------------------- |
| `np-hub-open`           | Modal opens                      |
| `np-hub-close`          | Modal closes                     |
| `np-hub-submit-success` | API accepted the support request |
| `np-hub-submit-error`   | Validation or API failure        |

React equivalent props: `onOpen`, `onClose`, `onSubmitSuccess`, `onSubmitError`.

### Methods (Web Component)

| Method                 | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| `setConfig(config)`    | Apply project / API settings                                           |
| `setUser(user)`        | Prefill requester fields                                               |
| `setFormPrefill(data)` | Prefill content / attachment URLs                                      |
| `open()` / `close()`   | Open or close the modal                                                |
| `showDemoToast(type)`  | Show a dummy toast for testing/dev (`"success"` or `"error"`)          |

---

## Package entry points

| Import                                 | Use when                                      |
| -------------------------------------- | --------------------------------------------- |
| `@namphuongtechnologi/np-hub/react`    | React apps (`SupportWidget`)                  |
| `@namphuongtechnologi/np-hub/widget`   | Register `<np-hub>` in a bundler / vanilla JS |
| `@namphuongtechnologi/np-hub`          | Types + `registerSupportWidget` / element     |

CDN users only need the `np-hub.min.global.js` script (auto-registers `<np-hub>`).

---

## API environments

| Environment                      | Base URL                                      |
| -------------------------------- | --------------------------------------------- |
| Production (default)             | `https://namphuong-api.azurewebsites.net`     |
| Development (`isDev` / `is-dev`) | `https://namphuong-api-dev.azurewebsites.net` |

Use Production on live sites. Reserve Development for local / staging.

---

## Troubleshooting

| Error                                      | Resolution                                                         |
| ------------------------------------------ | ------------------------------------------------------------------ |
| `projectId cannot be empty.`               | If provided, `projectId` / `project-id` must be a non-empty string |
| `user.name/email/phoneNumber is required.` | Requester fields are required on submit; `user` only prefills      |
| `Content is required.`                     | User must enter message content before submit                      |
| Widget hidden under modals / sticky UI     | Raise `zIndex` (default `10000`)                                   |
| API call fails in local testing            | Set `isDev` / `is-dev` when targeting the Development environment  |
| CDN 404 / old behavior                     | Pin CDN URL to the same version as the npm package you intend      |

---

## More docs (shipped in the package)

| Document                                         | Audience     |
| ------------------------------------------------ | ------------ |
| [`docs/USAGE_STATIC_REACT.md`](./docs/USAGE_STATIC_REACT.md) | Integrators  |
| [`docs/DEVELOPER_GUIDE.md`](./docs/DEVELOPER_GUIDE.md)       | Contributors |
| [`docs/PUBLIC_RELEASE.md`](./docs/PUBLIC_RELEASE.md)         | Maintainers  |

After `npm install`, these files live under `node_modules/@namphuongtechnologi/np-hub/docs/`.

---

## License

MIT © Nam Phương So
