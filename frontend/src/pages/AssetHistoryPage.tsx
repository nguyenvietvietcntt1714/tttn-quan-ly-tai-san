import React, { useState } from "react";
import { ticketApi } from "../services/api";

interface HistoryItem {
  id: string;
  assetId: string;
  action: string;
  description?: string;
  createdAt: string;
}

export default function AssetHistoryPage() {
  const [assetId, setAssetId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId.trim()) {
      setError("Vui lòng nhập Asset ID cần tra cứu lịch sử.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const data = await ticketApi.getHistory(assetId, startDate, endDate);
      setHistory(data);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Không thể lấy dữ liệu lịch sử");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Lịch Sử Vòng Đời Tài Sản
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Truy vết chi tiết mọi tác động, sự thay đổi trạng thái và lịch sử luân
          chuyển thiết bị.
        </p>
      </div>

      {/* Form tìm kiếm lịch sử */}
      <form
        onSubmit={handleSearch}
        className="bg-slate-800/40 border border-slate-700/60 p-6 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div className="md:col-span-1">
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">
            Mã Tài Sản (Asset ID)
          </label>
          <input
            type="text"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            placeholder="Nhập Asset ID..."
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">
            Từ ngày (Tùy chọn)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 uppercase mb-1">
            Đến ngày (Tùy chọn)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-blue-600/20"
          >
            Tra Cứu Lịch Sử
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Bảng hiển thị kết quả lịch sử */}
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-700/60 bg-slate-800/60 flex justify-between items-center">
          <h3 className="font-semibold text-white">
            Dòng Thời Gian Hoạt Động (Timeline)
          </h3>
          <span className="text-xs text-slate-400">
            {history.length} bản ghi tìm thấy
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700/60 text-left">
            <thead className="bg-slate-900/40 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Thời Gian</th>
                <th className="px-6 py-3 font-semibold">Asset ID</th>
                <th className="px-6 py-3 font-semibold">Hành Động (Action)</th>
                <th className="px-6 py-3 font-semibold">Mô Tả Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm text-slate-300">
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400 font-mono">
                    {new Date(item.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-blue-400 font-mono">
                    {item.assetId}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    <span className="px-2.5 py-1 rounded-lg text-xs bg-slate-700/50 border border-slate-600/50">
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    {item.description || "Không có mô tả thêm"}
                  </td>
                </tr>
              ))}
              {history.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    Nhập Asset ID và bấm Tra Cứu để xem lịch sử hoạt động của
                    tài sản.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
