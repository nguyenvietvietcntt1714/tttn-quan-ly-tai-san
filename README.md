# Hệ thống Quản lý Tài Sản — Nhánh A (Backend)

Nhánh này giữ phần **backend** (NestJS + Prisma + PostgreSQL). Frontend tương ứng nằm ở nhánh C (`D:\hancom\tttn-quan-ly-tai-san - Nhánh C\frontend`).

## Chạy thử toàn hệ thống (2 cửa sổ terminal)

```bash
# Cửa sổ 1 — Backend (nhánh A)
cd "D:\hancom\tttn-quan-ly-tai-san - Nhánh A\backend"
npm install
npm run db:migrate && npm run db:seed   # lần đầu chạy
npm run start:dev                       # → http://localhost:3000

# Cửa sổ 2 — Frontend (nhánh C)
cd "D:\hancom\tttn-quan-ly-tai-san - Nhánh C\frontend"
npm install
npm run dev                             # → http://localhost:5173
```

Đăng nhập thử: `manager / 123456` (MANAGER) hoặc `user1 / 123456` (USER).

Hướng dẫn chi tiết từng phía:

- Backend: `backend/README.md` (nhánh A)
- Frontend: `frontend/README.md` (nhánh C)
