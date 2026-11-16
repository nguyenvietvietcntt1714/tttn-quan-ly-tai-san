# Hệ Thống Quản Lý Tài Sản — Hướng Dẫn Cài Đặt, Khởi Tạo Database & Chạy Thử

> Tài liệu hướng dẫn cài đặt, tạo Database PostgreSQL, nạp dữ liệu demo (`database/qlts_demo_dump.sql` hoặc `npm run db:seed`) và chạy hệ thống.

## Cấu trúc dự án

- `database/qlts_demo_dump.sql` — **File SQL Dump đầy đủ (cấu trúc bảng + dữ liệu demo sẵn có: 4 tài khoản, 4 phòng ban, 60 tài sản, 6 phiếu nghiệp vụ & lịch sử biến động)**.
- `backend/` — API Server (NestJS 12 + Prisma ORM + PostgreSQL + JWT Auth).
- `frontend/` — Giao diện Web (React + TypeScript + Vite + Tailwind CSS — Giao diện sáng màu).

---

## 1. Yêu cầu môi trường

| Thành phần | Phiên bản khuyến nghị |
|---|---|
| Node.js | 18.x / 20.x / 22.x trở lên |
| PostgreSQL | 14 trở lên |

---

## 2. Tạo Database và Import dữ liệu Demo (Quan trọng)

Nhóm đã đính kèm sẵn cả **File SQL Dump (`database/qlts_demo_dump.sql`)** lẫn **Seeder tự động (`prisma/seed.ts`)**. Anh/thầy có thể chọn **Cách 1 (Import trực tiếp file SQL dump)** hoặc **Cách 2 (Dùng Prisma Migrate + Seed)**.

### Bước 2.1: Tạo file `backend/.env`

Copy file `.env.example` sang `.env` trong thư mục `backend/`:

```powershell
cd backend
cp .env.example .env
```

Nội dung mặc định trong `backend/.env`:

```env
DATABASE_URL="postgresql://postgres:111111@localhost:5432/qlts?schema=public"
JWT_SECRET="my_secure_secret_key_123456"
PORT=3000
```

*(Lưu ý: Thay `postgres:111111` bằng user/mật khẩu PostgreSQL trên máy của anh nếu khác).*

### Bước 2.2: Tạo Database tên `qlts`

Mở **psql (SQL Shell)** hoặc **pgAdmin 4**, chạy lệnh tạo database `qlts`:

```sql
CREATE DATABASE "qlts" WITH ENCODING 'UTF8';
```

Hoặc chạy trực tiếp bằng dòng lệnh PowerShell / Terminal:

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE qlts;"
```

### Bước 2.3: Nạp dữ liệu Demo vào Database `qlts`

#### Cách 1: Import trực tiếp từ file Dump `database/qlts_demo_dump.sql` (Khuyên dùng — Nhanh nhất)

Tại thư mục gốc của dự án (`tttn-quan-ly-tai-san`), chạy lệnh:

```powershell
psql -U postgres -h localhost -p 5432 -d qlts -f database/qlts_demo_dump.sql
```

*(Hoặc trong **pgAdmin 4**: Chuột phải vào database `qlts` → **Query Tool** → Mở file `database/qlts_demo_dump.sql` → Nhấn **Execute / F5**. File dump được xuất ở định dạng `INSERT INTO` chuẩn UTF-8 nên chạy tương thích trên mọi phiên bản PostgreSQL).*

#### Cách 2: Chạy Migration & Seeder tự động bằng Prisma

Nếu không dùng `psql`, anh có thể để Prisma tự tạo bảng và nạp dữ liệu mẫu chỉ với 2 lệnh trong thư mục `backend/`:

```powershell
cd backend
npx prisma migrate deploy
npm run db:seed
```

Sau khi chạy xong (Cách 1 hoặc Cách 2), database `qlts` sẽ có sẵn:
- **4 tài khoản người dùng** (`manager`, `user1`, `user2`, `user3`) và **4 phòng ban**.
- **4 danh mục**, **3 nhóm tài sản**, **1 cơ sở**, **4 khu vực**.
- **60 tài sản mẫu** (`AST-001` → `AST-060`) với đầy đủ trạng thái (`AVAILABLE`, `IN_USE`, `INACTIVE`).
- **6 phiếu nghiệp vụ mẫu** (`HANDOVER`, `TRANSFER`, `RECALL` ở các trạng thái `DRAFT`, `CONFIRMED`, `CANCELLED`) và **lịch sử biến động**.

---

## 3. Khởi chạy Backend (Port 3000)

Mở Terminal 1 tại thư mục `backend/`:

```powershell
cd backend
npm install
npx prisma generate
npm run start:dev
```

- API Server chạy tại: **http://localhost:3000**
- Tài liệu Swagger API: **http://localhost:3000/api/docs**

---

## 4. Khởi chạy Frontend (Port 5173)

Mở Terminal 2 tại thư mục `frontend/`:

```powershell
cd frontend
npm install
npm run dev
```

- Mở trình duyệt truy cập: **http://localhost:5173**

---

## 5. Tài khoản Đăng nhập Demo

| Vai trò | Tên đăng nhập | Mật khẩu | Chức năng chính |
|---|---|---|---|
| **Quản lý (MANAGER)** | `manager` | `123456` | Dashboard tổng quan, Quản lý danh sách tài sản (thêm mới, lọc, đổi tình trạng, ngừng theo dõi, xuất CSV), Lập & duyệt phiếu nghiệp vụ (Bàn giao, Điều chuyển, Thu hồi), Truy vết lịch sử biến động, Quản lý nhân sự |
| **Nhân sự (USER)** | `user1` | `123456` | Xem danh sách **Tài sản của tôi** (các thiết bị đang được bàn giao cho `user1`), tìm kiếm thiết bị cá nhân |
| **Nhân sự (USER)** | `user2` | `123456` | Xem danh sách **Tài sản của tôi** của `user2` |
| **Nhân sự (USER)** | `user3` | `123456` | Xem danh sách **Tài sản của tôi** của `user3` |

---

## 6. Các điểm đã kiểm tra và khắc phục theo góp ý

1. **Quản lý tải danh sách tài sản (`GET /assets`)**:
   - Đã bật `ValidationPipe({ transform: true, whitelist: true })` tại `main.ts` và ép kiểu an toàn cho tham số phân trang `page`, `limit` trong `AssetsService.findFiltered`, khắc phục triệt để lỗi Prisma nhận kiểu chuỗi gây lỗi 500.
   - Tách riêng bộ lọc `managementStatus` và `condition` trên trang `AssetsPage.tsx`, bổ sung chức năng Thêm tài sản mới, Đổi tình trạng vật lý và Ngừng theo dõi tài sản.
2. **Trang "Tài sản của tôi" (`MyAssetsPage.tsx`)**:
   - Gọi đúng API `GET /assets/my` kèm JWT token để lấy đúng các tài sản đang bàn giao cho nhân sự đăng nhập.
   - Đã xóa bỏ hoàn toàn dữ liệu hardcode (`mockAssets`) trong khối `.catch()`. Khi API lỗi, giao diện hiển thị thông báo lỗi rõ ràng và nút "Thử tải lại".
3. **Luồng Phiếu Bàn giao / Điều chuyển / Thu hồi & Chống xung đột (`TicketsService`)**:
   - Khi xác nhận hoàn thành phiếu `HANDOVER` / `TRANSFER`: tự động cập nhật `managementStatus = IN_USE` và gán `assignedUserId = toUserId`.
   - Khi xác nhận hoàn thành phiếu `RECALL`: tự động cập nhật `managementStatus = AVAILABLE` và gỡ `assignedUserId = null`.
   - Kiểm tra chặt chẽ trạng thái phiếu: chỉ phiếu `DRAFT` mới được xác nhận hoặc hủy (phiếu đã hủy không thể xác nhận, phiếu đã xác nhận không thể hủy).
   - Chống bấm xác nhận cùng lúc (Race Condition / Concurrency): sử dụng atomic conditional update (`updateMany` kèm điều kiện `status: DRAFT` trên `Ticket` và khóa phiên bản Optimistic Locking `version` trên `Asset`) bên trong `$transaction`, đồng thời khóa nút bấm trên giao diện khi đang xử lý.
4. **Giao diện & Trải nghiệm người dùng (UI/UX)**:
   - Chuyển toàn bộ giao diện sang tông màu sáng (Light Theme) hiện đại, độ tương phản cao, dễ nhìn.
   - Khi lập phiếu mới (`TicketsPage.tsx`) hoặc tra cứu lịch sử (`AssetHistoryPage.tsx`), người dùng chọn trực tiếp **Tài sản** và **Người nhận** từ danh sách dropdown (có ô lọc nhanh theo mã/tên), không phải nhớ và nhập tay ID.
