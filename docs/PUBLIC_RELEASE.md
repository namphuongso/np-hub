# Hướng Dẫn Phát Hành Public

Tài liệu này mô tả cách chuẩn bị và phát hành `@namphuongtechnologi/np-hub`.

## Cách nhanh — một lệnh

Toàn bộ quy trình được gom về một lệnh chạy tuần tự. Dev chỉ cần chọn option khi được hỏi:

```bash
npm run release
```

Lệnh này sẽ tự động:

1. Kiểm tra đăng nhập NPM (tự mở `npm login` nếu chưa).
2. Chạy Quality Gate: `lint` → `typecheck` → `test` → `build`.
3. Hỏi chọn version: `patch` / `minor` / `major` / `skip`.
4. Kiểm tra nội dung package (`npm pack --dry-run`).
5. Hỏi `public` / `restricted`, xác nhận rồi publish.

Nếu bất kỳ bước nào thất bại, quy trình dừng ngay để dev xử lý.

Các mục bên dưới mô tả từng bước thủ công để tham khảo hoặc khi cần làm tay.

## 1) Điều kiện trước khi phát hành

- Đăng nhập NPM bằng đúng tài khoản công ty.
- Có quyền publish trong scope `@namphuongtechnologi`.
- CI hoặc kiểm tra local đã pass.

## 2) Cổng chất lượng (Quality Gate)

Chạy đầy đủ các bước kiểm tra bắt buộc:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## 3) Quản lý version

Dùng semantic versioning:

- patch: sửa lỗi, không phá API
- minor: thêm tính năng tương thích ngược
- major: thay đổi có breaking change

Cập nhật version:

```bash
npm version patch
```

Có thể thay bằng `minor` hoặc `major` khi phù hợp.

## 4) Kiểm tra nội dung package

Kiểm tra nội dung sẽ được publish:

```bash
npm pack --dry-run
```

Xác nhận package có các file:

- `dist/*`
- `README.md`
- `LICENSE`
- `docs/*`

## 5) Publish

Đăng nhập NPM trước khi publish:

```bash
npm login
```

Với package scoped phát hành public:

```bash
npm publish --access public
```

Với package private:

```bash
npm publish --access restricted
```

## 6) Kiểm tra sau publish

- Kiểm tra trang package trên npm.
- Xác nhận README hiển thị đúng.
- Cài ở một project mẫu sạch để test:

```bash
npm install @namphuongtechnologi/np-hub
```

## 7) Mẫu release notes

- Version:
- Ngày phát hành:
- Loại: patch/minor/major
- Tóm tắt:
- Breaking changes:
- Hướng dẫn migration:
