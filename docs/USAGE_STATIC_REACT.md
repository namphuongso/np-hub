# Hướng Dẫn Sử Dụng (Web Tĩnh và React)

Tài liệu này dành cho các team tích hợp `@namphuongtechnologi/np-hub`.

## Tổng quan UI

Widget hiển thị dưới dạng **nút tròn nổi** ở góc dưới bên phải. Khi người dùng nhấn vào nút, **modal form** mở ra để điền thông tin và gửi yêu cầu hỗ trợ.

Toàn bộ giao diện (logo, CSS, layout) do thư viện quản lý. Website tích hợp chỉ cần cung cấp cấu hình API và thông tin form.

Website tích hợp có thể truyền dữ liệu sẵn qua `setUser()` và `setFormPrefill()`. Người dùng cuối vẫn có thể chỉnh sửa các trường trước khi submit.

## Cài đặt

```bash
npm install @namphuongtechnologi/np-hub
```

## A) Tích hợp với HTML tĩnh

### Cách 1: Dùng artifact sau khi build từ NPM

Sau khi build, host file `dist/np-hub.min.global.js` lên CDN của bạn.

```html
<script src="https://cdn.example.com/np-hub.min.global.js"></script>

<np-hub project-id="NPP"></np-hub>

<script>
  const widget = document.querySelector("np-hub");

  widget.setUser({
    name: "Nguyen Van A",
    email: "a@gmail.com",
    phoneNumber: "0912345678"
  });

  widget.setFormPrefill({
    content: "Mô tả sự cố cần hỗ trợ...",
    attachments: ["https://files.example.com/attachment-1.png"],
    priority: 0,
    coordinators: [],
    emailContacts: []
  });

  widget.addEventListener("np-hub-submit-success", (event) => {
    console.log("Tạo yêu cầu thành công:", event.detail);
  });

  widget.addEventListener("np-hub-submit-error", (event) => {
    console.error("Lỗi gửi yêu cầu:", event.detail);
  });
</script>
```

### Cách 2: Host static nội bộ

Copy bundle đã tạo vào static assets và nhúng bằng URL tương đối. Ví dụ đầy đủ có tại `examples/static-html/index.html`.

## B) Tích hợp với React

```tsx
import { useEffect, useRef } from "react";
import "@namphuongtechnologi/np-hub/widget";

export function SupportWidgetHost() {
  const ref = useRef<any>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.setUser({
      name: "Nguyen Van A",
      email: "a@gmail.com",
      phoneNumber: "0912345678"
    });

    el.setFormPrefill({
      content: "Mô tả sự cố cần hỗ trợ...",
      attachments: ["https://files.example.com/attachment-1.png"],
      priority: 0,
      coordinators: [],
      emailContacts: []
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
      is-developer
    />
  );
}
```

## C) Cấu hình

- `project-id` (bắt buộc)
- `api-base-url` (tùy chọn, ưu tiên cao nhất)
- `is-developer` (tùy chọn, chuyển sang API Development)
- `width` (tùy chọn, kích thước nút nổi; số hiểu là `px`; mặc định `72px`)
- `height` (tùy chọn, kích thước nút nổi; mặc định `72px`)

Thứ tự ưu tiên API: `api-base-url` > `is-developer` > mặc định Production.

Logo nút nổi được nhúng sẵn trong thư viện, không cấu hình từ bên ngoài. Vị trí mặc định là góc dưới bên phải; dùng `width`/`height` để chỉnh kích thước cho phù hợp với web.

## D) Public methods

- `setUser({ name, email, phoneNumber })` — điền sẵn `Requester`, `Email`, `PhoneNumber`
- `setFormPrefill({ content, attachments, priority, coordinators, emailContacts })` — điền sẵn nội dung form
- `open()` — mở modal form
- `close()` — đóng modal form

### `setFormPrefill` input

| Trường | Kiểu | Mô tả |
|---|---|---|
| `content` | `string` | Nội dung yêu cầu |
| `attachments` | `string[]` | Danh sách file đính kèm (URL hoặc đường dẫn) |
| `priority` | `number` | Mức ưu tiên, mặc định `0` |
| `coordinators` | `string[]` | Danh sách coordinator |
| `emailContacts` | `string[]` | Danh sách email liên hệ |

## E) Form và payload API

Widget **không có UI upload file**. Trường `Attachments` nhận danh sách string do website truyền vào hoặc người dùng nhập trực tiếp (mỗi giá trị trên một dòng, hoặc JSON array).

Payload gửi lên API:

```json
{
  "Requester": "Nguyen Van A",
  "PhoneNumber": "0912345678",
  "Email": "a@gmail.com",
  "Content": "Mô tả sự cố...",
  "ProjectId": "NPP",
  "Priority": 0,
  "Attachments": ["https://files.example.com/attachment-1.png"],
  "Coordinators": [],
  "EmailContacts": []
}
```

## F) Sự kiện

- `np-hub-open` — mở modal
- `np-hub-close` — đóng modal
- `np-hub-submit-success` — gọi API thành công
- `np-hub-submit-error` — validate hoặc gọi API thất bại

## G) Xử lý sự cố

- Lỗi `projectId is required.`: kiểm tra đã truyền `project-id`.
- Lỗi `user.name is required.`, `user.email is required.`, hoặc `user.phoneNumber is required.`: gọi `setUser(...)` hoặc để người dùng nhập đủ thông tin người gửi trước khi submit.
- Lỗi `Content is required.`: người dùng cần nhập nội dung yêu cầu trước khi submit.
- Gọi API thất bại: kiểm tra `api-base-url` hoặc cấu hình `is-developer`.
- Nút hiển thị quá to/nhỏ: dùng `width`/`height` để điều chỉnh kích thước nút cho phù hợp với layout.
