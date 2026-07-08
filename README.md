# NP Hub

NP Hub là thư viện Web Component, không phụ thuộc framework, có thể nhúng vào web tĩnh, React và các frontend stack chạy JavaScript trên trình duyệt.

Widget hiển thị dưới dạng **nút tròn nổi** ở góc dưới bên phải màn hình. Khi người dùng nhấn vào nút, một **modal form** mở ra để điền thông tin và gửi yêu cầu hỗ trợ.

Toàn bộ giao diện (logo, CSS, layout) do thư viện quản lý. Website tích hợp chỉ cần cung cấp cấu hình API và thông tin form; không cần và không thể tuỳ biến logo hay style.

## Cài đặt

```bash
npm install @namphuongtechnologi/np-hub
```

## Bắt đầu nhanh (NPM)

```ts
import "@namphuongtechnologi/np-hub/widget";

const widget = document.createElement("np-hub");
widget.setAttribute("project-id", "NPP");
widget.setAttribute("is-developer", "");

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

document.body.appendChild(widget);
```

## Sử dụng cho web tĩnh

Bạn có thể publish file `dist/np-hub.min.global.js` lên CDN nội bộ rồi nhúng trực tiếp.

```html
<!doctype html>
<html>
  <body>
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
    </script>
  </body>
</html>
```

## Sử dụng cho React

```tsx
import { useEffect, useRef } from "react";
import "@namphuongtechnologi/np-hub/widget";

export default function SupportWidgetHost() {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const el = widgetRef.current;
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
    el.addEventListener("np-hub-submit-success", onSuccess);
    return () => el.removeEventListener("np-hub-submit-success", onSuccess);
  }, []);

  return (
    <np-hub
      ref={widgetRef}
      project-id="NPP"
      is-developer
    />
  );
}
```

## Thứ tự ưu tiên cấu hình API

1. `api-base-url`
2. `is-developer`
3. API Production mặc định

## Thuộc tính (Attributes)

- `project-id` (bắt buộc)
- `api-base-url` (tùy chọn, ưu tiên cao nhất)
- `is-developer` (tùy chọn, boolean attribute — chuyển sang API Development)
- `width` (tùy chọn, kích thước nút nổi; số sẽ hiểu là `px`, ví dụ `72` hoặc `4rem`; mặc định `72px`)
- `height` (tùy chọn, kích thước nút nổi; mặc định `72px`)

> Logo trên nút nổi được nhúng sẵn trong thư viện, không cấu hình từ bên ngoài. Vị trí mặc định là góc dưới bên phải; có thể dùng `width`/`height` để chỉnh kích thước nút cho phù hợp với web.

## Phương thức

- `setUser({ name, email, phoneNumber })` — điền sẵn thông tin người gửi (`Requester`, `Email`, `PhoneNumber`)
- `setFormPrefill({ content, attachments, priority, coordinators, emailContacts })` — điền sẵn nội dung form; người dùng vẫn có thể chỉnh sửa trước khi gửi
- `open()` — mở modal form
- `close()` — đóng modal form

## Form và payload API

Modal form gửi payload theo body API chuẩn:

- `Requester`, `PhoneNumber`, `Email` — từ `setUser()` hoặc người dùng nhập trực tiếp
- `Content` — nội dung yêu cầu
- `ProjectId` — từ attribute `project-id`
- `Priority` — mức ưu tiên (mặc định `0`)
- `Attachments` — danh sách string (URL hoặc đường dẫn file), **không có UI upload file**
- `Coordinators`, `EmailContacts` — danh sách string

Trường `Attachments` nhận mỗi giá trị trên một dòng, hoặc một JSON array.

## Sự kiện

- `np-hub-open` — phát ra khi mở modal
- `np-hub-close` — phát ra khi đóng modal
- `np-hub-submit-success` — phát ra khi gọi API thành công
- `np-hub-submit-error` — phát ra khi validate hoặc gọi API thất bại

## Tài liệu nội bộ

- Onboarding dev mới: `docs/DEVELOPER_GUIDE.md`
- Quy trình phát hành public: `docs/PUBLIC_RELEASE.md`
- Hướng dẫn tích hợp (web tĩnh và React): `docs/USAGE_STATIC_REACT.md`
