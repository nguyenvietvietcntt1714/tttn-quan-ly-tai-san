import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../services/api";

interface RecentActivity {
  id: string;
  action: string;
  reason: string | null;
  createdAt: string;
  assetCode: string | null;
  assetName: string | null;
  actorName: string | null;
}

interface DashboardData {
  assets: {
    total: number;
    byManagementStatus: Record<string, number>;
    byCondition: Record<string, number>;
  };
  tickets: {
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
  };
  recentActivity: RecentActivity[];
}

const actionLabel: Record<string, string> = {
  CHANGE_CONDITION: "Đổi tình trạng",
  DEACTIVATE: "Ngừng theo dõi",
  CREATE: "Tiếp nhận",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setData)
      .catch(() => setError("Không thể tải số liệu tổng quan"));
  }, []);

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-rose-400 text-sm">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-slate-500 text-sm">
        Đang tải số liệu…
      </div>
    );
  }

  const assets = data.assets;
  const tickets = data.tickets;
  const inUse = assets.byManagementStatus.IN_USE ?? 0;
  const available = assets.byManagementStatus.AVAILABLE ?? 0;
  const inactive = assets.byManagementStatus.INACTIVE ?? 0;
  const draftTickets = tickets.byStatus.DRAFT ?? 0;
  const doneTickets = tickets.byStatus.CONFIRMED ?? 0;
  const cancelledTickets = tickets.byStatus.CANCELLED ?? 0;
  const needInspection = assets.byCondition.NEEDS_INSPECTION ?? 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Header & Hành động nhanh (Quick Actions) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tổng Quan Hệ Thống Quản Lý Tài Sản
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Chào mừng bạn trở lại, theo dõi toàn bộ trạng thái thiết bị và phiếu
            nghiệp vụ nội bộ.
          </p>
        </div>

        {/* Nhóm nút hành động nhanh theo góp ý Canva */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => navigate("/tickets")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all text-xs sm:text-sm flex items-center gap-2"
          >
            <span>+ Tạo Phiếu Cấp Phát</span>
          </button>
          <button
            onClick={() => navigate("/tickets")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-medium transition-all text-xs sm:text-sm flex items-center gap-2"
          >
            <span>+ Tạo Phiếu Thu Hồi</span>
          </button>
          <button
            onClick={() => navigate("/assets")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2.5 rounded-xl font-medium transition-all text-xs sm:text-sm"
            title="Xuất báo cáo"
          >
            📊 Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* 4 Thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl backdrop-blur-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Tổng Tài Sản
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">
            {assets.total}
          </div>
          <div className="text-xs text-blue-400 mt-2 font-medium">
            {inUse} đang sử dụng • {available} sẵn sàng
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl backdrop-blur-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Phiếu Đang Chờ (Draft)
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3">
            {draftTickets}
          </div>
          <div className="text-xs text-amber-400/90 mt-2 font-medium">
            Cần xử lý phê duyệt nghiệp vụ
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl backdrop-blur-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Đã Hoàn Thành
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-3">
            {doneTickets}
          </div>
          <div className="text-xs text-emerald-400/90 mt-2 font-medium">
            Tổng {tickets.total} phiếu • {cancelledTickets} đã hủy
          </div>
        </div>
        <div className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl backdrop-blur-sm">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider">
            Cần Kiểm Tra / Ngừng Theo Dõi
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-3">
            {needInspection + inactive}
          </div>
          <div className="text-xs text-rose-400/90 mt-2 font-medium">
            {needInspection} cần kiểm tra • {inactive} ngừng theo dõi
          </div>
        </div>
      </div>

      {/* Khu vực giữa & Hoạt động gần đây (Lấp khoảng trống theo Canva) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Cột trái: Hoạt động gần đây */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold text-white">
              Hoạt Động Tài Sản Gần Đây
            </h3>
            <button
              onClick={() => navigate("/tickets")}
              className="text-xs text-blue-400 hover:underline"
            >
              Xem tất cả &rarr;
            </button>
          </div>

          <div className="divide-y divide-slate-800 text-sm">
            {data.recentActivity.map((h) => (
              <div
                key={h.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-blue-400 font-medium truncate">
                    {h.assetCode ?? "—"} • {h.assetName ?? ""}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 truncate">
                    {actionLabel[h.action] ?? h.action}
                    {h.reason ? ` • ${h.reason}` : ""}
                    {h.actorName ? ` • ${h.actorName}` : ""}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(h.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <p className="py-8 text-center text-slate-500 text-xs">
                Chưa có hoạt động nào gần đây.
              </p>
            )}
          </div>
        </div>

        {/* Cột phải: Trạng thái hệ thống */}
        <div className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-semibold text-white">
            Trạng Thái Hệ Thống
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1">
              <p className="font-semibold text-blue-400">
                Kết nối Database Backend
              </p>
              <p className="text-slate-300">
                Số liệu đồng bộ trực tiếp qua NestJS API (Port 3000).
              </p>
            </div>
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
              <p className="font-semibold text-emerald-400">
                Bảo mật phân quyền
              </p>
              <p className="text-slate-300">
                Đã kích hoạt phân tách rõ ràng giữa Manager và User.
              </p>
            </div>
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <p className="font-semibold text-amber-400">
                Báo cáo &amp; Xuất dữ liệu
              </p>
              <p className="text-slate-300">
                {tickets.byType.HANDOVER ?? 0} phiếu cấp phát,{" "}
                {tickets.byType.RECALL ?? 0} thu hồi,{" "}
                {tickets.byType.TRANSFER ?? 0} điều chuyển.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
