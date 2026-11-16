import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  BarChart3,
  ArrowRight,
  Database,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";
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
  CREATE: "Tiếp nhận mới",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardApi
      .getStats()
      .then(setData)
      .catch(() => setError("Không thể tải số liệu tổng quan từ máy chủ."));
  }, []);

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-sm font-medium">
          {error}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-slate-500 text-sm font-medium">
        Đang tải số liệu tổng quan…
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
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header & Hành động nhanh (Quick Actions) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Tổng Quan Hệ Thống Quản Lý Tài Sản
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Theo dõi toàn bộ trạng thái thiết bị, phiếu nghiệp vụ và lịch sử luân chuyển nội bộ.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate("/tickets?create=HANDOVER")}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-xs sm:text-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Cấp Phát</span>
          </button>
          <button
            onClick={() => navigate("/tickets?create=RECALL")}
            className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-4 py-2.5 rounded-xl font-semibold transition-all text-xs sm:text-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Phiếu Thu Hồi</span>
          </button>
          <button
            onClick={() => navigate("/assets")}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2.5 rounded-xl font-semibold transition-all text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-xs"
            title="Danh sách & Xuất báo cáo"
          >
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <span>Danh Sách & Báo Cáo</span>
          </button>
        </div>
      </div>

      {/* 4 Thẻ chỉ số tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Tổng Tài Sản
            </span>
            <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-3">
            {assets.total}
          </div>
          <div className="text-xs text-sky-700 mt-2 font-semibold">
            {inUse} đang sử dụng • {available} sẵn sàng
          </div>
        </div>

        <div className="bg-white border border-amber-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">
              Phiếu Chờ Duyệt (Draft)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-3">
            {draftTickets}
          </div>
          <div className="text-xs text-amber-700 mt-2 font-medium">
            Cần xác nhận hoàn thành hoặc hủy
          </div>
        </div>

        <div className="bg-white border border-emerald-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
              Phiếu Đã Hoàn Thành
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-3">
            {doneTickets}
          </div>
          <div className="text-xs text-emerald-700 mt-2 font-medium">
            Tổng {tickets.total} phiếu • {cancelledTickets} đã hủy
          </div>
        </div>

        <div className="bg-white border border-rose-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-rose-700 text-xs font-bold uppercase tracking-wider">
              Cần Kiểm Tra / Ngừng TD
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-3">
            {needInspection + inactive}
          </div>
          <div className="text-xs text-rose-700 mt-2 font-medium">
            {needInspection} cần kiểm tra • {inactive} ngừng theo dõi
          </div>
        </div>
      </div>

      {/* Khu vực giữa & Hoạt động gần đây */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Hoạt động gần đây */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Hoạt Động Tài Sản Gần Đây
            </h3>
            <button
              onClick={() => navigate("/history")}
              className="text-xs text-sky-600 hover:text-sky-700 font-semibold inline-flex items-center gap-1"
            >
              <span>Xem lịch sử chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 text-sm">
            {data.recentActivity.map((h) => (
              <div
                key={h.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="font-mono text-xs text-sky-700 font-bold truncate">
                    {h.assetCode ?? "—"} •{" "}
                    <span className="font-sans text-slate-900 font-semibold">
                      {h.assetName ?? ""}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    <span className="font-medium text-slate-700">
                      {actionLabel[h.action] ?? h.action}
                    </span>
                    {h.reason ? ` • ${h.reason}` : ""}
                    {h.actorName ? ` • Thực hiện: ${h.actorName}` : ""}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                  {new Date(h.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <p className="py-8 text-center text-slate-400 text-xs">
                Chưa có hoạt động nào gần đây.
              </p>
            )}
          </div>
        </div>

        {/* Cột phải: Thống kê nhanh theo nghiệp vụ */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Tóm Tắt Hệ Thống
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-sky-800">
                <Database className="w-4 h-4 text-sky-600" />
                <span>Đồng bộ cơ sở dữ liệu</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Đang quản lý <strong>{assets.total}</strong> thiết bị ({inUse} đang cấp phát, {available} sẵn sàng tại kho).
              </p>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Kiểm soát xung đột & Phân quyền</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Khóa phiên bản (Optimistic Locking) và kiểm soát trạng thái phiếu chống bấm trùng.
              </p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Thống kê loại phiếu nghiệp vụ</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                <strong>{tickets.byType.HANDOVER ?? 0}</strong> bàn giao •{" "}
                <strong>{tickets.byType.TRANSFER ?? 0}</strong> điều chuyển •{" "}
                <strong>{tickets.byType.RECALL ?? 0}</strong> thu hồi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
