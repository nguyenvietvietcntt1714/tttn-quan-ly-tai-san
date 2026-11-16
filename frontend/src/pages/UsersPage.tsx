import React, { useEffect, useState } from "react";
import { Users, Plus, AlertCircle } from "lucide-react";
import { userApi } from "../services/api";

interface UserItem {
  id: string;
  username: string;
  fullName: string;
  role: string;
  email?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("USER");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Không tải được danh sách người dùng. Kiểm tra backend đã chạy chưa.");
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await userApi.create({ username, fullName, role, email });
      setIsModalOpen(false);
      setUsername("");
      setFullName("");
      setRole("USER");
      setEmail("");
      fetchUsers();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header trang */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-sky-600" /> Quản Lý Nhân Sự & Tài Khoản
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Cấp phát tài khoản nội bộ và phân quyền cho nhân sự nhận bàn giao tài sản trong tổ chức.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setIsModalOpen(true);
          }}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Người Dùng Mới</span>
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bảng danh sách người dùng */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">
            Danh Sách Tài Khoản Trong Hệ Thống
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            Tổng số: {users.length} tài khoản
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Họ Tên & Username</th>
                <th className="px-6 py-3.5 font-semibold">Email Nội Bộ</th>
                <th className="px-6 py-3.5 font-semibold">Phân Quyền (Role)</th>
                <th className="px-6 py-3.5 font-semibold">Mật Khẩu Mặc Định</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-semibold text-slate-900">{u.fullName}</div>
                    <div className="text-xs text-sky-700 font-mono font-semibold">
                      @{u.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 text-xs font-medium">
                    {u.email || "Chưa cập nhật"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                        u.role === "MANAGER"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {u.role === "MANAGER" ? "MANAGER (Quản lý)" : "USER (Nhân sự)"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                    123456
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Thêm Người Dùng Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Cấp Tài Khoản Nhân Sự Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Họ và Tên *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tên Đăng Nhập (Username) *
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Ví dụ: nguyenvana"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Email Nội Bộ
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.vn"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Phân Quyền Hệ Thống
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
                >
                  <option value="USER">Nhân sự / Người dùng (User)</option>
                  <option value="MANAGER">Quản lý cơ sở vật chất (Manager)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
