# Hệ thống Quản lý Tài sản — Hướng dẫn chạy và kiểm thử

> Tài liệu dành cho người hướng dẫn (thầy): cài đặt, chạy hệ thống và kiểm thử chức năng hiện có.
>
> Cấu trúc dự án (2 phần đã ghép chung một thư mục):
> - `backend/` — API server (NestJS + Prisma + PostgreSQL), nhánh A
> - `frontend/` — giao diện web (React + Vite + TypeScript), nhánh C

---

## 1. Yêu cầu cài đặt trước

| Thành phần | Phiên bản khuyến nghị | Tải về |
|---|---|---|
| Node.js | **20.19+ hoặc 22.12+ trở lên** (máy kiểm thử dùng v24.8) | https://nodejs.org |
| PostgreSQL | 14 trở lên (kiểm thử dùng bản mới nhất) | https://www.postgresql.org/download/ |
| Trình duyệt | Chrome / Edge mới nhất | — |

Kiểm tra Node đã cài:

```powershell
node -v
npm -v
```

---

## 2. Chuẩn bị cơ sở dữ liệu PostgreSQL

Backend cấu hình kết nối trong `backend/.env`:

```
DATABASE_URL="postgresql://postgres:111111@localhost:5432/qlts?schema=public"
```

Nghĩa là: user `postgres`, mật khẩu `111111`, database tên `qlts`, chạy tại `localhost:5432`.

**Các bước:**

1. Mở **pgAdmin** (cài kèm PostgreSQL) hoặc dùng SQL Shell (`psql`).
2. Đăng nhập bằng mật khẩu bạn đặt lúc cài PostgreSQL.
3. Tạo database `qlts` (nếu chưa có). Bằng psql:

```sql
CREATE DATABASE "qlts";
```

4. **Nếu mật khẩu postgres của bạn khác `111111`**: sửa file `backend/.env` cho khớp, hoặc đặt lại mật khẩu postgres thành `111111` để khỏi sửa gì.
5. Khởi động dịch vụ PostgreSQL: kiểm tra trong **Services** (Windows) mục `postgresql-x64-...` đang `Running`.

---

## 3. Chạy Backend (API server)

Mở terminal (PowerShell), vào thư mục backend:

```powershell
cd D:\hancom\tttn-quan-ly-tai-san\backend
npm install
npx prisma generate
npx prisma migrate deploy
```

Giải thích:
- `npm install` — tải thư viện (chỉ làm 1 lần, hoặc khi `package.json` thay đổi).
- `npx prisma generate` — sinh code client cho Prisma từ `prisma/schema.prisma`.
- `npx prisma migrate deploy` — tạo đúng các bảng trong database `qlts` theo migration có sẵn (`20261028020024_add_asset_category_tables`).

Chạy server:

```powershell
npm run start:dev
```

Kết quả mong đợi — terminal in dòng kiểu:

```
Nest application successfully started
```

Kiểm tra nhanh: mở **http://localhost:3000/api/docs** — trang Swagger tài liệu API.
(Có lỗi `ECONNREFUSED 127.0.0.1:5432` = PostgreSQL chưa chạy; có lỗi xác thực = sai mật khẩu trong `.env`.)

⚠️ Để server chạy tiếp, **giữ nguyên cửa sổ terminal này**.

---

## 4. Chạy Frontend (giao diện web)

Mở **cửa sổ terminal thứ hai**, vào thư mục frontend:

```powershell
cd D:\hancom\tttn-quan-ly-tai-san\frontend
npm install
npm run dev
```

Kết quả mong đợi — terminal in:

```
VITE ready in ... ms
➜  Local:   http://localhost:5173/
```

Mở **http://localhost:5173** bằng trình duyệt.

⚠️ Giữ nguyên cửa sổ terminal thứ hai này. Frontend gọi API tới `http://localhost:3000/api/...` qua proxy của Vite (đã cấu hình sẵn trong `vite.config.ts`), nên **backend phải đang chạy** thì mới có dữ liệu.

---

## 5. Kiểm thử theo trình tự

### 5.1. Đăng nhập (bản thử nghiệm, chưa nối server)

Trang đăng nhập hiện dùng **tài khoản tạm (hardcode)** — chưa kết nối auth phía server:

| Tài khoản | Mật khẩu | Quyền | Đi tới |
|---|---|---|---|
| `manager` | `123456` | Quản lý (MANAGER) | `/dashboard` |
| `user1` | `123456` | Người dùng (USER) | `/my-assets` |

> Ghi chú: phiên đăng nhập lưu trong localStorage/sessionStorage trình duyệt. Chức năng đăng nhập thật (JWT phía backend) là phần phát triển tiếp theo.

### 5.2. Danh sách tài sản (trang "Tài sản của tôi")

Đăng nhập `user1` → mục **Tài sản của tôi** (`/my-assets`).

- Backend đang chạy nhưng **database còn trống** → bảng trống là đúng, không phải lỗi.
- Thử thanh tìm kiếm, nút **Làm mới**, bộ lọc trạng thái — hoạt động trên dữ liệu nhận từ API.

### 5.3. Tạo dữ liệu thật qua Prisma Studio (để trang không trống)

Backend hiện chỉ có API quản lý **tài sản** (không có API tạo nhóm/khu vực), nên nhập dữ liệu ban đầu dùng **Prisma Studio** — giao diện quản trị dữ liệu có sẵn của Prisma.

Tại **cửa sổ terminal backend thứ ba** (backend không cần dừng, nhưng cùng thư mục):

```powershell
cd D:\hancom\tttn-quan-ly-tai-san\backend
npx prisma studio
```

Terminal sẽ in `Prisma Studio is up on http://localhost:5555`. Mở **http://localhost:5555** trên trình duyệt, tạo dữ liệu theo thứ tự (nhấn nút **Add record**):

1. Bảng **Facility** (cơ sở/trung tâm): điền `name`, các cột còn lại có thể bỏ trống.
2. Bảng **Area** (khu vực): điền `name`, chọn `facilityId` trỏ tới Facility vừa tạo.
3. Bảng **AssetGroup** (nhóm tài sản): điền `name`, `code`.
4. Bảng **Asset** (tài sản): điền `assetCode` (mã tài sản), `name`, chọn `groupId`, `areaId` từ danh sách vừa tạo; các cột khác có thể bỏ trống.

Quay lại trang **Tài sản của tôi** trên frontend → nhấn **Làm mới** → tài sản vừa tạo xuất hiện. Hoặc dùng luôn chức năng tạo qua Swagger `POST /api/assets` (xem 5.4) khi đã có `groupId`/`areaId`/`facilityId`.

Trường hiển thị trên trang: tên tài sản, mã tài sản (`assetCode`), nhóm, đơn vị/trung tâm (từ facility), khu vực, trạng thái (`managementStatus`: AVAILABLE / IN_USE / INACTIVE), tình trạng (`condition`: GOOD / NEEDS_INSPECTION / BROKEN), ngày bàn giao.

Để dừng Prisma Studio: nhấn `Ctrl + C` ở terminal thứ ba.

### 5.4. Kiểm tra API trực tiếp (không qua frontend)

Vào Swagger `/api/docs`, các endpoint hiện có (controller duy nhất là tài sản; bắt buộc `assetCode`, `name`, `groupId`, `areaId`, `facilityId` khi POST):

| Method | Đường dẫn | Chức năng |
|---|---|---|
| GET | `/api/assets` | Danh sách tài sản (đã include nhóm, khu vực, đơn vị, người nhận) |
| GET | `/api/assets/:id` | Chi tiết một tài sản (kèm lịch sử) |
| POST | `/api/assets` | Tạo tài sản |
| PATCH | `/api/assets/:id` | Cập nhật tài sản |

> Lưu ý: module auth và API nhóm/khu vực là phần phát triển tiếp theo, chưa có trong phiên bản này.

---

## 6. Sự cố thường gặp

| Hiện tượng | Nguyên nhân | Cách xử lý |
|---|---|---|
| Trang web mở nhưng bảng trống, F12 Network báo lỗi `ERR_CONNECTION_REFUSED` | Backend chưa chạy (hoặc chết) | Chạy lại `npm run start:dev` ở thư mục backend |
| Backend in lỗi `ECONNREFUSED ... :5432` | PostgreSQL chưa chạy | Bật dịch vụ PostgreSQL trong Services |
| Backend in lỗi xác thực (authentication failed) | Mật khẩu postgres trong `backend/.env` sai | Sửa `.env` cho khớp mật khẩu thật |
| `P1001: Can't reach database server` | Database `qlts` chưa tạo | Tạo database như mục 2 |
| Backend báo lỗi `PrismaClient` chưa được khởi tạo | Quên `npx prisma generate` | Chạy lại lệnh trong mục 3 |
| Bảng vẫn trống sau khi tạo tài sản qua Swagger | Chưa nhấn "Làm mới" trên frontend, hoặc tạo `POST` thất bại (thiếu `groupId`/`areaId`) | Xem phản hồi của Swagger để biết lỗi cụ thể |
| Port 3000 hoặc 5173 bị chiếm | Ứng dụng khác dùng port | Đóng ứng dụng đó; frontend chỉnh port trong `vite.config.ts`, backend chỉnh biến `PORT` |
| Đang `npm run dev`/`start:dev` mà sửa file | Chế độ watch tự khởi động lại | Chờ vài giây, xem thông báo trong terminal |

---

## 7. Tóm tắt khởi động nhanh (3 lệnh + 2 lệnh)

```powershell
# Terminal 1 — Backend
cd D:\hancom\tttn-quan-ly-tai-san\backend
npm install ; npx prisma generate ; npx prisma migrate deploy ; npm run start:dev

# Terminal 2 — Frontend
cd D:\hancom\tttn-quan-ly-tai-san\frontend
npm install ; npm run dev

# Trình duyệt
# Frontend: http://localhost:5173        (đăng nhập manager/user1 — mật khẩu 123456)
# Swagger : http://localhost:3000/api/docs
```

---

## 8. Việc phát triển tiếp theo

- [ ] Auth backend (users/auth module, đăng nhập JWT thật, phân quyền theo `Role`)
- [ ] Nối trang đăng nhập frontend sang API thật, bỏ tài khoản hardcode
- [ ] Seed dữ liệu mẫu (script `prisma/seed.ts`) để trình diễn không cần tạo tay
- [ ] Trang Manager (dashboard / tickets / history) đang là placeholder
