# Hướng Dẫn Sử Dụng (Web Tĩnh và React)

Tài liệu này dành cho các team tích hợp `@namphuongtechnologi/np-hub`.

Phiên bản rút gọn cho npm: xem `README.md` ở root repo.

## Tổng quan UI

Widget hiển thị dưới dạng **nút tròn nổi** ở góc dưới bên phải. Khi người dùng nhấn vào nút, **modal form** mở ra để điền thông tin và gửi yêu cầu hỗ trợ.

Toàn bộ giao diện (logo, CSS, layout) do thư viện quản lý. Website tích hợp chỉ cần cung cấp cấu hình API và thông tin form.

Website tích hợp có thể truyền dữ liệu sẵn qua `setUser()` và `setFormPrefill()`. Người dùng cuối vẫn có thể chỉnh sửa các trường trước khi submit.

## Cài đặt

```bash
npm install @namphuongtechnologi/np-hub
```

---

## A) Tích hợp web tĩnh (HTML)

### Bước 1 — Lấy file bundle

Sau khi cài package:

```
node_modules/@namphuongtechnologi/np-hub/dist/np-hub.min.global.js
```

Host file lên CDN hoặc static server. Ví dụ dev local: `examples/static-html/index.html`.

### Bước 2 — Nhúng vào trang

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NP Hub</title>
  </head>
  <body>
    <np-hub project-id="NPP" is-dev></np-hub>

    <script src="https://cdn.example.com/np-hub.min.global.js"></script>
    <script>
      const widget = document.querySelector("np-hub");

      widget.setUser({
        name: "Nguyen Van A",
        email: "a@gmail.com",
        phoneNumber: "0912345678",
      });

      widget.setFormPrefill({
        content: "Mô tả sự cố cần hỗ trợ...",
        attachments: ["https://files.example.com/attachment-1.png"],
        priority: 0,
        coordinators: [],
        emailContacts: [],
      });

      widget.addEventListener("np-hub-submit-success", (event) => {
        console.log("Tạo yêu cầu thành công:", event.detail);
      });

      widget.addEventListener("np-hub-submit-error", (event) => {
        console.error("Lỗi gửi yêu cầu:", event.detail);
      });
    </script>
  </body>
</html>
```

---

## B) Tích hợp React

### Import

```ts
import "@namphuongtechnologi/np-hub/widget";
```

### Component host

```tsx
import { useEffect, useRef } from "react";
import type { SupportWidgetElement } from "@namphuongtechnologi/np-hub";
import "@namphuongtechnologi/np-hub/widget";

export function SupportWidgetHost() {
  const ref = useRef<SupportWidgetElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setUser({
      name: "Nguyen Van A",
      email: "a@gmail.com",
      phoneNumber: "0912345678",
    });

    el.setFormPrefill({
      content: "Mô tả sự cố cần hỗ trợ...",
      attachments: ["https://files.example.com/attachment-1.png"],
      priority: 0,
      coordinators: [],
      emailContacts: [],
    });

    const onSuccess = (event: Event) => {
      console.log("Tạo yêu cầu thành công:", (event as CustomEvent).detail);
    };
    const onError = (event: Event) => {
      console.error("Lỗi gửi yêu cầu:", (event as CustomEvent).detail);
    };

    el.addEventListener("np-hub-submit-success", onSuccess);
    el.addEventListener("np-hub-submit-error", onError);
    return () => {
      el.removeEventListener("np-hub-submit-success", onSuccess);
      el.removeEventListener("np-hub-submit-error", onError);
    };
  }, []);

  return (
    <np-hub
      ref={ref}
      project-id="NPP"
      is-dev
    />
  );
}
```

### TypeScript JSX (tuỳ chọn)

```ts
import type { SupportWidgetElement } from "@namphuongtechnologi/np-hub";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "np-hub": React.DetailedHTMLProps<
        React.HTMLAttributes<SupportWidgetElement>,
        SupportWidgetElement
      > & {
        "project-id"?: string;
        "is-dev"?: boolean;
        width?: string | number;
        height?: string | number;
      };
    }
  }
}
```

---

## C) Cấu hình

| Attribute | Bắt buộc | Mô tả |
|---|---|---|
| `project-id` | Có | Mã dự án |
| `is-dev` | Không | Boolean — dùng API Development; mặc định là Production |
| `width` | Không | Kích thước nút nổi (mặc định `72px`) |
| `height` | Không | Kích thước nút nổi (mặc định `72px`) |

URL API cố định trong thư viện: Production `https://namphuong-api.azurewebsites.net`, Development `https://namphuong-api-dev.azurewebsites.net`.

## D) Public methods

- `setUser({ name, email, phoneNumber })` — điền sẵn `Requester`, `Email`, `PhoneNumber`
- `setFormPrefill({ content, attachments, priority, coordinators, emailContacts })` — điền sẵn nội dung form
- `open()` — mở modal form
- `close()` — đóng modal form

### `setFormPrefill` input

| Trường | Kiểu | Mô tả |
|---|---|---|
| `content` | `string` | Nội dung yêu cầu |
| `attachments` | `string[]` | URL file đính kèm gán sẵn |
| `priority` | `number` | Mức ưu tiên, mặc định `0` |
| `coordinators` | `string[]` | Danh sách coordinator |
| `emailContacts` | `string[]` | Danh sách email liên hệ |

## E) Form và gửi API

Widget gửi `multipart/form-data` tới:

```
POST {baseUrl}/api/supportcenter/create-request-anonymous
```

Người dùng có thể upload file trực tiếp trên form. Website cũng có thể gán URL sẵn qua `setFormPrefill({ attachments })`.

## F) Sự kiện

- `np-hub-open` — mở modal
- `np-hub-close` — đóng modal
- `np-hub-submit-success` — gọi API thành công
- `np-hub-submit-error` — validate hoặc gọi API thất bại

## G) Xử lý sự cố

- Lỗi `projectId is required.`: kiểm tra đã truyền `project-id`.
- Lỗi `user.name/email/phoneNumber is required.`: gọi `setUser(...)` hoặc để người dùng nhập đủ.
- Lỗi `Content is required.`: người dùng cần nhập nội dung trước khi submit.
- Gọi API thất bại: kiểm tra `is-dev` nếu đang test môi trường Development.
- Nút quá to/nhỏ: dùng `width`/`height`.
