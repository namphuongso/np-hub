# Hướng Dẫn Cho Developer

Tài liệu này giúp dev mới có thể bắt đầu đóng góp nhanh cho `@namphuongtechnologi/np-hub`.

## 1) Mục tiêu dự án

- Xây dựng một widget hỗ trợ dùng chung dưới dạng Web Component trong NP Hub.
- Nhúng được vào mọi website (HTML tĩnh, React, hoặc framework khác).
- Tập trung logic map API và validate vào một nơi.

## 2) Công nghệ sử dụng

- TypeScript
- Web Component native (`customElements`)
- `tsup` để build bundle (ESM, CJS, IIFE)
- `vitest` để test
- `eslint` để lint

## 3) Cấu trúc thư mục

- `src/core`: nghiệp vụ chính (config/validation)
- `src/services`: API và side effects
- `src/component`: UI của web component và vòng đời sự kiện
- `src/types`: kiểu dữ liệu public
- `src/register.ts`: đăng ký custom element
- `src/index.ts`: public exports của thư viện
- `tests/unit`: unit test
- `examples/static-html`: ví dụ nhúng web tĩnh tại local

## 4) Khởi tạo môi trường

Yêu cầu:

- Node.js `>= 18` (theo `package.json`)
- npm `>= 9` (khuyến nghị dùng bản đi kèm Node LTS)

```bash
npm install
```

## 5) Chạy source khi phát triển

### Build/watch source

```bash
# chạy watch mode để build lại khi có thay đổi
npm run dev
```

```bash
# build production (ra thư mục dist/)
npm run build
```

### Chạy thử local với ví dụ static HTML

Sau khi `npm run build`, chạy local server từ root repo:

```bash
cd "/Users/lyquocvan/Documents/NamPhuongSo/NP Hub"
npm run build
npx serve .
```

Mở URL test:

- `http://localhost:3000/examples/static-html/`

> Không chạy `npx serve examples/static-html` vì sẽ không truy cập được `/dist/np-hub.min.global.js` local và dễ rơi vào code cũ.

Hoặc bạn có thể mở file:

- `examples/static-html/index.html`

File này dùng script local `examples/static-html/np-hub.js` để nhúng widget và test nhanh hành vi UI/event.

## 6) Chạy test và các bước kiểm tra chất lượng

```bash
# unit test
npm run test
```

```bash
# lint
npm run lint
```

```bash
# kiểm tra type
npm run typecheck
```

```bash
# kiểm tra package hoạt động khi consumer import (module resolution)
npm run test:module-resolution
```

Lệnh tổng hợp nên chạy trước khi tạo PR:

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

## 7) Quy trình phát triển

1. Tạo branch cho feature.
2. Cập nhật code đúng module (`core`, `services`, hoặc `component`).
3. Thêm hoặc cập nhật unit test.
4. Chạy bộ kiểm tra chất lượng trước khi tạo PR.
5. Tạo PR kèm test plan rõ ràng.

## 8) Quy tắc code

- Không đặt logic map API trực tiếp trong handler UI.
- Giữ logic resolve config tại `src/core/config` và validate tại `src/core/validation`.
- UI widget (`src/component`) chỉ xử lý launcher, modal form, prefill và emit event.
- Widget hỗ trợ upload file trên form và gán URL qua `setFormPrefill`.
- Chỉ emit các public event đã được tài liệu hóa.
- Giữ backward compatibility cho public contract, trừ khi bump major.

## 9) Public contract

### Sự kiện

- `np-hub-open`: phát ra khi mở modal
- `np-hub-close`: phát ra khi đóng modal
- `np-hub-submit-success`: phát ra khi gọi API thành công
- `np-hub-submit-error`: phát ra khi validate/API thất bại

### Methods

- `setUser(user)`: prefill thông tin người gửi (optional khi config; form UI vẫn bắt buộc nhập)
- `setConfig(config)`: cấu hình thông tin dự án (`projectId`, `isDev`, `priority`, `coordinators`, `emailContacts`)
- `setFormPrefill(data)`: prefill nội dung form (`content`, `attachments`) (optional)
- `open()` / `close()`: điều khiển modal

### Attributes

- `project-id`, `is-dev`, `width`, `height`

Logo nút nổi được nhúng sẵn trong bundle (`src/component/assets/np-support-logo.png`, đóng gói dưới dạng data URL khi build), không nhận cấu hình từ ngoài.

## 10) Quy tắc chọn API

URL API cố định tại `src/core/config/endpoints.ts`:

- Không có `is-dev` → Production
- Có `is-dev` → Development

## 11) Checklist trước khi merge

- Code compile thành công
- Test pass
- Lint pass
- Cập nhật README/docs nếu hành vi API thay đổi
- Không hardcode thông tin nhạy cảm (credentials/secrets)
