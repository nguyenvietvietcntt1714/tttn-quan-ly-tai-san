# Backend — Hệ Quản Lý Tài Sản (NestJS + Prisma + PostgreSQL)

API backend của hệ thống quản lý tài sản, bảo vệ bằng JWT, viết bằng NestJS 12 và Prisma ORM.

## Công nghệ

- NestJS 12 + TypeScript
- Prisma 5 (PostgreSQL — dùng Neon serverless)
- JWT (passport-jwt), bcrypt
- Swagger (thư viện @nestjs/swagger)
- Jest (unit test)

## Yêu cầu trước khi chạy

- Node.js >= 18 (khuyến nghị 20)
- npm
- (Không cần cài PostgreSQL: `.env` đã trỏ tới database Neon)

## Các bước chạy

```bash
# 1. Cài thư viện
npm install

# 2. Kiểm tra file .env (đã có sẵn trong repo)
#    DATABASE_URL="postgresql://...@ep-autumn-truth...neon.tech/quanlytaisan?sslmode=require"
#    JWT_SECRET=...
#    PORT=3000

# 3. Sinh Prisma Client (nếu lần đầu hoặc schema đổi)
npx prisma generate

# 4. Áp dụng schema lên database + tạo dữ liệu mẫu
npm run db:migrate     # prisma migrate dev
npm run db:seed        # tạo tài khoản + danh mục + khu vực + tài sản mẫu

# 5. Chạy server ở chế độ dev
npm run start:dev
```

Server chạy tại `http://localhost:3000` (cổng lấy từ biến `PORT`).

## Tài khoản thử nghiệm (từ seed)

| Tài khoản | Mật khẩu | Vai trò |
|---|---|---|
| `manager` | `123456` | MANAGER (Quản lý) |
| `user1` | `123456` | USER (Nhân sự) |
| `user2` | `123456` | USER (Nhân sự) |
| `user3` | `123456` | USER (Nhân sự) |

## Danh sách API chính

- `POST /auth/login` — đăng nhập, trả `{ accessToken, user }`
- `GET /users` / `POST /users` — quản lý người dùng (MANAGER)
- `GET /assets` — danh sách tài sản, hỗ trợ `?page=&limit=&search=&managementStatus=&condition=`
- `GET /assets/export` — xuất CSV (UTF-8 BOM) theo bộ lọc hiện tại
- `GET /dashboard/stats` — số liệu tổng quan dashboard
- `POST /tickets` / `PATCH /tickets/:id/cancel` / `PATCH /tickets/:id/complete` — luồng phiếu B3→B5
- `GET /tickets/asset-history?assetId=...&startDate=&endDate=` — lịch sử biến động tài sản (B6)

Gần như toàn bộ API yêu cầu header `Authorization: Bearer <token>` (trừ đăng nhập).

## Chạy test

```bash
npm run test         # unit test (Jest)
npm run test:cov     # kèm báo cáo độ phủ
npm run test:e2e     # test end-to-end (cần server không bắt buộc; supertest)
```

## Cấu trúc chính

```
src/
  auth/        Đăng nhập, JWT strategy
  assets/      Quản lý tài sản (lọc, phân trang, xuất CSV)
  tickets/     Phiếu điều chuyển / thu hồi / mượn trả / lịch sử
  users/       Quản lý người dùng
  dashboard/   Thống kê tổng quan
  prisma/      PrismaService
prisma/
  schema.prisma    Mô hình dữ liệu (User, Asset, Ticket, ...)
  seed.ts          Dữ liệu mẫu
  migrations/      Lịch sử migration
```
