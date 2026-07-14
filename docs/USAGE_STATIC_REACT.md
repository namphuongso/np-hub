# Usage — Static HTML & React

Consumer-facing integration guide for `@namphuongtechnologi/np-hub`.

For the full API surface (props, events, environments, troubleshooting), see the root [`README.md`](../README.md).

---

## Prerequisites

- Modern browser with Custom Elements support
- React `>= 18` when using the React wrapper
- A valid Nam Phương project context (`projectId` when required by your environment)

---

## Static HTML

Load the CDN bundle via a small config script, then include that script on every page where the widget should appear.

### 1. Create `np-hub.js`

```js
var NP_HUB_CDN =
  "https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.1.9/dist/np-hub.min.global.js";

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

### 2. Include in `index.html`

```html
<script src="./np-hub.js"></script>
```

Reference implementation: [`examples/static-html/`](../examples/static-html/).

### Position the launcher

Default: bottom-right, `20px` inset.

```js
widget.setAttribute("right", "24");
widget.setAttribute("bottom", "40");

// Alternate corner:
// widget.setAttribute("left", "20");
// widget.setAttribute("bottom", "20");
```

### Optional prefill

```js
widget.setUser({
  name: "Nguyen Van A",
  email: "a@example.com",
  phoneNumber: "0912345678",
});

widget.setFormPrefill({
  content: "Describe the issue...",
  attachments: [],
});
```

Prefill does **not** skip validation. Name, email, phone, and content remain required on submit.

### Submit feedback toast

On submit **success** or **API error**, a centered toast appears with the result message. It auto-closes after `toastDuration` milliseconds (default `4000`) or the user can dismiss it with `×`.

Hovering the mouse cursor over the toast pauses the auto-close countdown. The success toast also contains quick-copy buttons for copying the support request code and lookup link.

Validation errors (missing required fields) do **not** show a toast — only inline field highlighting.

`toastDuration` can be a single number (for both success and error toasts) or an object specifying separate durations:

```js
widget.setConfig({
  projectId: "NPP",
  // Single duration:
  toastDuration: 6000, 
  
  // Or separate success/error durations:
  // toastDuration: { success: 3000, error: 8000 }
});
```

---

## React

### Install

```bash
npm install @namphuongtechnologi/np-hub
```

### Mount once at the root

```tsx
import { SupportWidget } from "@namphuongtechnologi/np-hub/react";

export default function App() {
  return (
    <>
      {/* application tree */}
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

### Position & size

```tsx
<SupportWidget
  projectId="NPP"
  width={65}
  height={65}
  right={24}
  bottom={40}
/>
```

### Optional prefill

```tsx
<SupportWidget
  projectId="NPP"
  user={{
    name: "Nguyen Van A",
    email: "a@example.com",
    phoneNumber: "0912345678",
  }}
  formPrefill={{
    content: "Describe the issue...",
    attachments: [],
  }}
/>
```

### Submit feedback toast

```tsx
<SupportWidget
  projectId="NPP"
  // Single duration for both success/error toasts
  toastDuration={6000}
  // Or configure separately:
  // toastDuration={{ success: 3000, error: 8000 }}
  onSubmitSuccess={(detail) => console.log("Success:", detail)}
  onSubmitError={(error) => console.error("Error:", error)}
/>
```

`toastDuration` controls how long the success/error toast stays visible before auto-closing. The countdown pauses on mouse hover. Users can copy the request code or lookup link directly from the success toast.

---

## Environments

| Flag                         | API base                                          |
| ---------------------------- | ------------------------------------------------- |
| Default (`isDev` omitted / `false`) | `https://namphuong-api.azurewebsites.net`  |
| `isDev={true}` / `is-dev`    | `https://namphuong-api-dev.azurewebsites.net`     |

Use Production credentials and endpoints for live sites. Reserve Development for local and staging only.

---

## Related documents

- [`README.md`](../README.md) — package overview & full reference
- [`DEVELOPER_GUIDE.md`](./DEVELOPER_GUIDE.md) — contributing locally
- [`PUBLIC_RELEASE.md`](./PUBLIC_RELEASE.md) — publishing to npm
