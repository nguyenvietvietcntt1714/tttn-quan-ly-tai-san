import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AssetsPage from "./pages/AssetsPage";
import TicketsPage from "./pages/TicketsPage";
import AssetHistoryPage from "./pages/AssetHistoryPage";
import MyAssetsPage from "./pages/MyAssetsPage";
import UsersPage from "./pages/UsersPage";

interface UserSession {
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
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800">
            <h2 className="text-white font-bold text-base tracking-wide">
              Quản Lý Tài Sản
            </h2>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-blue-400 font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                {user.role === "MANAGER"
                  ? "Quản lý (Manager)"
                  : "Nhân sự (User)"}
              </span>
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
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
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
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
                      <span>Quản Lý Phiếu Nghiệp Vụ</span>
                    </button>
                    <button
                      onClick={() => navigate("/assets")}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === "/assets"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
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
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
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
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                      }`}
                    >
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
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span>Tài Sản Của Tôi</span>
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* User Account Bar & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
              {user.fullName ? user.fullName.charAt(0) : "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-medium transition-all"
          >
            <span>Đăng Xuất Hệ Thống</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 min-h-screen">
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
