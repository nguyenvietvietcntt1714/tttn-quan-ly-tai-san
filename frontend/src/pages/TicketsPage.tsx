import React, { useEffect, useState } from "react";
import { ticketApi } from "../services/api";

interface TicketItem {
  id: string;
  assetId: string;
  userId: string;
  type: string;
  status: string;
  note?: string;
  createdAt: string;
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State cho tạo phiếu mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [assetId, setAssetId] = useState("");
  const [userId, setUserId] = useState("");
  const [type, setType] = useState("HANDOVER");
  const [note, setNote] = useState("");

  // Modal State cho Xác nhận hành động (Hủy / Hoàn thành)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: (() => Promise<void>) | null;
  }>({
    isOpen: false,
    title: "",
    message: "",
    action: null,
  });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await ticketApi.getAll();
      setTickets(data);
    } catch (err) {
      console.error(err);
      // Dữ liệu giả lập nếu chưa có backend
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ticketApi.create({ assetId, userId, type, note });
      setIsCreateModalOpen(false);
      setAssetId("");
      setUserId("");
      setNote("");
      fetchTickets();
    } catch (err: unknown) {
      const errorObj = err as Error;
      alert(errorObj.message || "Lỗi khi tạo phiếu");
    }
  };

  const handleCompleteTicket = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác Nhận Hoàn Thành Phiếu",
      message: `Bạn có chắc chắn muốn hoàn thành phiếu [${id}]? Trạng thái thiết bị sẽ được cập nhật tự động trong hệ thống.`,
      action: async () => {
        try {
          await ticketApi.complete(id);
          fetchTickets();
        } catch (err) {
          alert("Lỗi hoàn thành phiếu");
        }
      },
    });
  };

  const handleCancelTicket = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác Nhận Hủy Phiếu",
      message: `Hành động này sẽ hủy bỏ quy trình của phiếu [${id}]. Bạn có chắc chắn muốn tiếp tục?`,
      action: async () => {
        try {
          await ticketApi.cancel(id);
          fetchTickets();
        } catch (err) {
          alert("Lỗi hủy phiếu");
        }
      },
    });
  };

  // Lọc dữ liệu theo từ khóa và trạng thái
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.assetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 text-slate-100">
      {/* Tiêu đề & Nút hành động nhanh */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Quản Lý Phiếu Nghiệp Vụ
            </h1>
            <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              Module Manager
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Theo dõi toàn bộ vòng đời phiếu bàn giao, điều chuyển và thu hồi
            thiết bị.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all text-sm flex items-center gap-2"
        >
          <span>+ Tạo Phiếu Mới</span>
        </button>
      </div>

      {/* 4 Thẻ thống kê mini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tổng Số Phiếu
          </p>
          <p className="text-2xl font-extrabold text-white mt-2">
            {tickets.length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Đang Chờ Xử Lý (Draft)
          </p>
          <p className="text-2xl font-extrabold text-amber-400 mt-2">
            {tickets.filter((t) => t.status === "DRAFT").length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Đã Xác Nhận (Confirmed)
          </p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">
            {tickets.filter((t) => t.status === "CONFIRMED").length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Đã Hủy (Cancelled)
          </p>
          <p className="text-2xl font-extrabold text-rose-400 mt-2">
            {tickets.filter((t) => t.status === "CANCELLED").length}
          </p>
        </div>
      </div>

      {/* Bộ lọc và Tìm kiếm */}
      <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã Phiếu hoặc Asset ID..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs text-slate-400 font-medium">
            Trạng thái:
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="DRAFT">Draft (Chờ)</option>
            <option value="CONFIRMED">Confirmed (Hoàn thành)</option>
            <option value="CANCELLED">Cancelled (Đã hủy)</option>
          </select>
        </div>
      </div>

      {/* Bảng danh sách phiếu */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
          <h3 className="font-semibold text-white text-sm">
            Danh Sách Phiếu Nghiệp Vụ
          </h3>
          <span className="text-xs text-slate-400">
            Hiển thị {filteredTickets.length} / {tickets.length} bản ghi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-800 text-left">
            <thead className="bg-slate-950/40 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Mã Phiếu</th>
                <th className="px-6 py-3.5 font-semibold">
                  Tài Sản (Asset ID)
                </th>
                <th className="px-6 py-3.5 font-semibold">Người Dùng</th>
                <th className="px-6 py-3.5 font-semibold">Loại Nghiệp Vụ</th>
                <th className="px-6 py-3.5 font-semibold">Trạng Thái</th>
                <th className="px-6 py-3.5 font-semibold text-right">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {filteredTickets.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-blue-400 font-semibold">
                    {t.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-slate-300">
                    {t.assetId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs">
                    {t.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        t.status === "DRAFT"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : t.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
                    {t.status === "DRAFT" && (
                      <>
                        <button
                          onClick={() => handleCompleteTicket(t.id)}
                          className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition-all"
                        >
                          Hoàn thành
                        </button>
                        <button
                          onClick={() => handleCancelTicket(t.id)}
                          className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-lg font-medium transition-all"
                        >
                          Hủy
                        </button>
                      </>
                    )}
                    {t.status !== "DRAFT" && (
                      <span className="text-slate-500 italic">Đã khóa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CẢI TIẾN TRẠNG THÁI RỖNG (EMPTY STATE) THEO GỢI Ý CANVA */}
        {filteredTickets.length === 0 && !loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/10 text-blue-400 flex items-center justify-center text-xl font-bold">
              📋
            </div>
            <p className="text-sm font-semibold text-white">
              Chưa có bản ghi phiếu nghiệp vụ nào
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Hệ thống chưa ghi nhận phiếu nào phù hợp với bộ lọc hoặc chưa có
              dữ liệu trong Database.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              + Tạo Phiếu Đầu Tiên
            </button>
          </div>
        )}
      </div>

      {/* Modal Tạo Phiếu Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                Lập Phiếu Nghiệp Vụ Mới
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Mã Tài Sản (Asset ID)
                </label>
                <input
                  type="text"
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  required
                  placeholder="Ví dụ: AST-001"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Mã Người Dùng (User ID)
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  placeholder="Ví dụ: user1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Loại Nghiệp Vụ
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="HANDOVER">Bàn giao thiết bị (HANDOVER)</option>
                  <option value="RECALL">Thu hồi thiết bị (RECALL)</option>
                  <option value="TRANSFER">
                    Điều chuyển thiết bị (TRANSFER)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">
                  Ghi Chú Nghiệp Vụ
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder="Nhập lý do hoặc chi tiết bàn giao..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-600/20 transition-all"
                >
                  Xác Nhận Tạo Phiếu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Hộp Thoại Xác Nhận (Confirm Dialog) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">
                {confirmModal.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {confirmModal.message}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() =>
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    action: null,
                  })
                }
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-all"
              >
                Đóng
              </button>
              <button
                onClick={async () => {
                  if (confirmModal.action) await confirmModal.action();
                  setConfirmModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    action: null,
                  });
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
