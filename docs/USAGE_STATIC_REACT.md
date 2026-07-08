# Hướng Dẫn Sử Dụng (Web Tĩnh và React)

Phiên bản rút gọn cho npm: xem `README.md` ở root repo.

## Web tĩnh

Tạo `np-hub.js` (cấu hình + load CDN), nhúng vào `index.html`:

```html
<script src="./np-hub.js"></script>
```

Ví dụ: `examples/static-html/`.

## React

```bash
npm install @namphuongtechnologi/np-hub
```

```tsx
import { SupportWidget } from "@namphuongtechnologi/np-hub/react";

// Đặt một lần trong App.tsx / main.tsx / root layout
<SupportWidget projectId="NPP" user={{ name: "...", email: "...", phoneNumber: "..." }} />
```

Xem `README.md` để biết đầy đủ props và callback.
