# NP Hub

NP Hub là thư viện Web Component, không phụ thuộc framework, có thể nhúng vào **web tĩnh**, **React** và các frontend stack chạy JavaScript trên trình duyệt.

Widget hiển thị dưới dạng **nút tròn nổi** ở góc dưới bên phải màn hình. Khi người dùng nhấn vào nút, một **modal form** mở ra để điền thông tin và gửi yêu cầu hỗ trợ.

Toàn bộ giao diện (logo, CSS, layout) do thư viện quản lý. Website tích hợp chỉ cần cung cấp cấu hình API và thông tin form; không cần và không thể tuỳ biến logo hay style.

## Cài đặt

```bash
npm install @namphuongtechnologi/np-hub
```

---

## A) Tích hợp web tĩnh (HTML)

Dùng khi website không có bundler (HTML thuần, WordPress, landing page tĩnh, v.v.).

### Bước 1 — Lấy file bundle

Sau khi cài package, copy file bundle từ `node_modules`:

```
node_modules/@namphuongtechnologi/np-hub/dist/np-hub.min.global.js
```

Host file này lên CDN hoặc static server của bạn (ví dụ `https://cdn.example.com/np-hub.min.global.js`).

### Bước 2 — Nhúng vào trang HTML

```html
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NP Hub</title>
  </head>
  <body>
    <!-- 1. Khai báo widget -->
    <np-hub project-id="NPP" is-dev></np-hub>

    <!-- 2. Load bundle (tự đăng ký custom element <np-hub>) -->
    <script src="https://cdn.example.com/np-hub.min.global.js"></script>

    <!-- 3. Cấu hình dữ liệu và lắng nghe sự kiện -->
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

### Ghi chú web tĩnh

| Mục                | Chi tiết                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Bundle             | `dist/np-hub.min.global.js` — IIFE, không cần import                                              |
| `project-id`       | Bắt buộc — mã dự án trên hệ thống hỗ trợ                                                          |
| `is-dev`           | Boolean attribute — dùng API Development; bỏ qua để dùng Production mặc định                       |
| `setUser()`        | Điền sẵn thông tin người gửi; người dùng vẫn có thể sửa                                           |
| `setFormPrefill()` | Điền sẵn nội dung form; người dùng vẫn có thể sửa                                                 |
| Đính kèm           | Người dùng upload file trực tiếp trên form, hoặc truyền URL qua `setFormPrefill({ attachments })` |

---

## B) Tích hợp React

Dùng khi app React có bundler (Vite, Next.js, CRA, v.v.).

### Bước 1 — Import widget

```ts
import "@namphuongtechnologi/np-hub/widget";
```

Dòng import này đăng ký custom element `<np-hub>` — chỉ cần gọi **một lần** ở entry hoặc component host.

### Bước 2 — Tạo component host

```tsx
import { useEffect, useRef } from "react";
import type { SupportWidgetElement } from "@namphuongtechnologi/np-hub";
import "@namphuongtechnologi/np-hub/widget";

export function SupportWidgetHost() {
  const widgetRef = useRef<SupportWidgetElement>(null);

  useEffect(() => {
    const el = widgetRef.current;
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

  return <np-hub ref={widgetRef} project-id="NPP" is-dev />;
}
```

Render `<SupportWidgetHost />` một lần trong layout (ví dụ `App.tsx` hoặc root layout).

### TypeScript — khai báo JSX (tuỳ chọn)

Nếu TypeScript báo lỗi với thẻ `<np-hub>`, thêm file `np-hub.d.ts`:

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

### Ghi chú React

| Mục          | Chi tiết                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- |
| Entry import | `@namphuongtechnologi/np-hub/widget` — side-effect, đăng ký element                      |
| Ref type     | `SupportWidgetElement` export từ `@namphuongtechnologi/np-hub`                           |
| Attributes   | Dùng kebab-case: `project-id`, `is-dev`                                                  |
| Cleanup      | Luôn `removeEventListener` trong `useEffect` return                                      |
| SSR          | Widget chỉ chạy trên browser — render trong `useEffect` hoặc dynamic import nếu dùng SSR |

---

## Cấu hình API

URL API được cố định trong thư viện:

| Môi trường | URL |
| --- | --- |
| Production (mặc định) | `https://namphuong-api.azurewebsites.net` |
| Development | `https://namphuong-api-dev.azurewebsites.net` |

Chỉ cần truyền `is-dev` khi muốn dùng API Development. Không truyền thì dùng Production.

```html
<!-- Production -->
<np-hub project-id="NPP"></np-hub>

<!-- Development -->
<np-hub project-id="NPP" is-dev></np-hub>
```

## Thuộc tính (Attributes)

| Attribute      | Bắt buộc | Mô tả                                                 |
| -------------- | -------- | ----------------------------------------------------- |
| `project-id` | Có       | Mã dự án                                              |
| `is-dev`     | Không    | Boolean — dùng API Development; mặc định là Production |
| `width`        | Không    | Kích thước nút nổi; số hiểu là `px` (mặc định `72px`) |
| `height`       | Không    | Kích thước nút nổi (mặc định `72px`)                  |

Logo và vị trí mặc định (góc dưới phải) do thư viện quản lý. Dùng `width`/`height` để chỉnh kích thước nút.

## Phương thức

| Phương thức                                                                       | Mô tả                                        |
| --------------------------------------------------------------------------------- | -------------------------------------------- |
| `setUser({ name, email, phoneNumber })`                                           | Điền sẵn `Requester`, `Email`, `PhoneNumber` |
| `setFormPrefill({ content, attachments, priority, coordinators, emailContacts })` | Điền sẵn nội dung form                       |
| `open()`                                                                          | Mở modal form                                |
| `close()`                                                                         | Đóng modal form                              |

### `setFormPrefill` input

| Trường          | Kiểu       | Mô tả                      |
| --------------- | ---------- | -------------------------- |
| `content`       | `string`   | Nội dung yêu cầu           |
| `attachments`   | `string[]` | URL file đính kèm gán sẵn  |
| `priority`      | `number`   | Mức ưu tiên (mặc định `0`) |
| `coordinators`  | `string[]` | Danh sách coordinator      |
| `emailContacts` | `string[]` | Danh sách email liên hệ    |

## Form và gửi API

Widget gửi request dạng `multipart/form-data` tới endpoint:

```
POST {baseUrl}/api/supportcenter/create-request-anonymous
```

Các trường gửi lên:

- `Requester`, `PhoneNumber`, `Email` — từ `setUser()` hoặc người dùng nhập
- `Content` — nội dung yêu cầu
- `ProjectId` — từ `project-id`
- `Priority` — mức ưu tiên
- `Attachments` — file upload từ form và/hoặc URL truyền qua `setFormPrefill`
- `Coordinators`, `EmailContacts` — danh sách string

## Sự kiện

| Sự kiện                 | Khi nào phát ra                                         |
| ----------------------- | ------------------------------------------------------- |
| `np-hub-open`           | Mở modal                                                |
| `np-hub-close`          | Đóng modal                                              |
| `np-hub-submit-success` | Gọi API thành công — `event.detail` chứa response       |
| `np-hub-submit-error`   | Validate hoặc gọi API thất bại — `event.detail.message` |

## Xử lý sự cố

| Lỗi                                        | Cách xử lý                                    |
| ------------------------------------------ | --------------------------------------------- |
| `projectId is required.`                   | Kiểm tra attribute `project-id`               |
| `user.name/email/phoneNumber is required.` | Gọi `setUser(...)` hoặc để người dùng nhập đủ |
| `Content is required.`                     | Người dùng cần nhập nội dung trước khi submit |
| Gọi API thất bại                           | Kiểm tra `is-dev` nếu đang test môi trường Development |
| Nút quá to/nhỏ                             | Dùng `width`/`height`                         |

## License

MIT
