import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Package,
  History,
  Users,
  LogOut,
  ShieldCheck,
  Briefcase,
} from "lucide-react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import TicketsPage from "./pages/TicketsPage";
import AssetHistoryPage from "./pages/AssetHistoryPage";
import MyAssetsPage from "./pages/MyAssetsPage";
import UsersPage from "./pages/UsersPage";

interface UserSession {
  id?: string;
  username: string;
  fullName: string;
  role: "MANAGER" | "USER" | "INVENTORY_CHECKER";
  token: string;
}

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const savedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  const user: UserSession | null = savedUser ? JSON.parse(savedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      {/* Sidebar Navigation - Light Theme */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex shadow-sm">
        <div>
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-slate-900 font-bold text-base tracking-tight">
                  Quản Lý Tài Sản
                </h2>
                <span className="inline-block mt-1 text-[11px] text-sky-700 font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200">
                  {user.role === "MANAGER"
                    ? "Quản lý (Manager)"
                    : "Nhân sự (User)"}
                </span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-6">
            {user.role === "MANAGER" ? (
              <>
                {/* Nhóm Tổng quan */}
                <div>
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Tổng quan
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate("/dashboard")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === "/dashboard"
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard Tổng Quan</span>
                    </button>
                  </div>
                </div>

                {/* Nhóm Nghiệp vụ */}
                <div>
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Nghiệp Vụ
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate("/tickets")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === "/tickets"
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Quản Lý Phiếu Nghiệp Vụ</span>
                    </button>
                    <button
                      onClick={() => navigate("/assets")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === "/assets"
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Danh Sách Tài Sản</span>
                    </button>
                  </div>
                </div>

                {/* Nhóm Báo cáo & Lịch sử */}
                <div>
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Báo Cáo & Truy Vết
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate("/history")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === "/history"
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <History className="w-4 h-4" />
                      <span>Lịch Sử Biến Động</span>
                    </button>
                  </div>
                </div>

                {/* Nhóm Quản Trị */}
                <div>
                  <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Quản Trị
                  </p>
                  <div className="space-y-1">
                    <button
                      onClick={() => navigate("/users")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === "/users"
                          ? "bg-sky-600 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>Quản Lý Nhân Sự</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Cá Nhân
                </p>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate("/my-assets")}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      location.pathname === "/my-assets"
                        ? "bg-sky-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Tài Sản Của Tôi</span>
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Account Bar & Logout */}
        <div className="p-4 border-t border-slate-200 space-y-3 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 font-bold text-sm shrink-0">
              {user.fullName ? user.fullName.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-900 truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-500 truncate">
                @{user.username}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng Xuất Hệ Thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
          <Route path="/assets" element={<AssetsPage />} />
          <Route path="/history" element={<AssetHistoryPage />} />
          <Route path="/my-assets" element={<MyAssetsPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
