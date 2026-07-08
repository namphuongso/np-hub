# NP Hub

NP Hub là widget hỗ trợ dạng nút nổi góc dưới phải. Nhúng được vào **web tĩnh** hoặc **React**.

---

## A) Web tĩnh (HTML)

Không cần `npm install`. Tạo **một file JS** cấu hình, rồi nhúng vào `index.html`.

**`np-hub.js`** — load thư viện từ CDN và cấu hình tại đây:

```js
var NP_HUB_CDN =
  "https://cdn.jsdelivr.net/npm/@namphuongtechnologi/np-hub@0.1.1/dist/np-hub.min.global.js";

function initNpHub() {
  var widget = document.createElement("np-hub");
  widget.setAttribute("project-id", "NPP"); // bắt buộc
  // widget.setAttribute("is-dev", "");     // bỏ comment nếu dùng API dev
  document.body.appendChild(widget);

  widget.setUser({
    name: "Nguyen Van A",
    email: "a@gmail.com",
    phoneNumber: "0912345678",
  });

  widget.setFormPrefill({
    content: "Mô tả sự cố cần hỗ trợ...",
    attachments: [],
    priority: 0,
    coordinators: [],
    emailContacts: [],
  });

  widget.addEventListener("np-hub-submit-success", function (event) {
    console.log("Tạo yêu cầu thành công:", event.detail);
  });

  widget.addEventListener("np-hub-submit-error", function (event) {
    console.error("Lỗi gửi yêu cầu:", event.detail);
  });
}

var script = document.createElement("script");
script.src = NP_HUB_CDN;
script.onload = initNpHub;
document.head.appendChild(script);
```

**`index.html`** — chỉ cần một dòng:

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

Ví dụ đầy đủ: `examples/static-html/`.

---

## B) React

```bash
npm install @namphuongtechnologi/np-hub
```

Import `SupportWidget` và đặt **một lần** ở root app (ví dụ `App.tsx`, `main.tsx` hoặc root layout):

```tsx
import { SupportWidget } from "@namphuongtechnologi/np-hub/react";

export default function App() {
  return (
    <>
      {/* nội dung app */}
      <SupportWidget
        projectId="NPP"
        isDev
        user={{
          name: "Nguyen Van A",
          email: "a@gmail.com",
          phoneNumber: "0912345678",
        }}
        formPrefill={{
          content: "Mô tả sự cố cần hỗ trợ...",
          attachments: [],
          priority: 0,
          coordinators: [],
          emailContacts: [],
        }}
        onSubmitSuccess={(detail) => console.log("Thành công:", detail)}
        onSubmitError={(error) => console.error("Lỗi:", error)}
      />
    </>
  );
}
```

### Props

| Prop                 | Bắt buộc | Mô tả                                         |
| -------------------- | -------- | --------------------------------------------- |
| `projectId`          | Có       | Mã dự án                                      |
| `isDev`              | Không    | `true` = API Development; mặc định Production |
| `user`               | Không    | Điền sẵn tên, email, SĐT                      |
| `formPrefill`        | Không    | Điền sẵn nội dung form                        |
| `width` / `height`   | Không    | Kích thước nút nổi (mặc định `72px`)          |
| `onSubmitSuccess`    | Không    | Callback khi gửi thành công                   |
| `onSubmitError`      | Không    | Callback khi gửi lỗi                          |
| `onOpen` / `onClose` | Không    | Callback khi mở/đóng modal                    |

---

## Cấu hình API

| Môi trường                       | URL                                           |
| -------------------------------- | --------------------------------------------- |
| Production (mặc định)            | `https://namphuong-api.azurewebsites.net`     |
| Development (`is-dev` / `isDev`) | `https://namphuong-api-dev.azurewebsites.net` |

## Xử lý sự cố

| Lỗi                                        | Cách xử lý                                               |
| ------------------------------------------ | -------------------------------------------------------- |
| `projectId is required.`                   | Kiểm tra `project-id` / `projectId`                      |
| `user.name/email/phoneNumber is required.` | Truyền `user` hoặc để người dùng nhập đủ                 |
| `Content is required.`                     | Người dùng cần nhập nội dung trước khi submit            |
| Gọi API thất bại                           | Kiểm tra `is-dev` / `isDev` nếu đang test môi trường dev |

## License

MIT
