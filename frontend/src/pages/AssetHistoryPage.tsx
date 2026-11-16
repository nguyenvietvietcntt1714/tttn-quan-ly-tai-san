import React, { useState, useEffect, useCallback } from 'react';
import { History, Search, RefreshCw, AlertCircle } from 'lucide-react';
import { ticketApi, assetApi } from '../services/api';

interface HistoryItem {
  id: string;
  assetId: string;
  action: string;
  reason?: string | null;
  beforeState?: Record<string, any> | null;
  afterState?: Record<string, any> | null;
  createdAt: string;
  asset?: {
    id: string;
    assetCode: string;
    name: string;
  } | null;
  actor?: {
    id: string;
    username: string;
    fullName: string;
  } | null;
}

interface AssetOption {
  id: string;
  assetCode: string;
  name: string;
}

export default function AssetHistoryPage() {
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assetsList, setAssetsList] = useState<AssetOption[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(
    async (assetFilter?: string, from?: string, to?: string) => {
      setError('');
      setLoading(true);
      try {
        const queryTarget = assetFilter || '';
        const data = await ticketApi.getHistory(queryTarget, from, to);
        setHistory(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        const errorObj = err as Error;
        setError(errorObj.message || 'Không thể lấy dữ liệu lịch sử biến động');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Tải danh sách tài sản cho dropdown và tải ngay lịch sử gần nhất khi mở trang
  useEffect(() => {
    assetApi
      .getFiltered({ page: 1, limit: 500 })
      .then((res) => {
        if (Array.isArray(res?.items)) {
          setAssetsList(res.items);
        }
      })
      .catch(() => {});
    loadHistory('', '', '');
  }, [loadHistory]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const target = selectedAssetId || keyword.trim();
    loadHistory(target, startDate, endDate);
  };

  const handleReset = () => {
    setSelectedAssetId('');
    setKeyword('');
    setStartDate('');
    setEndDate('');
    loadHistory('', '', '');
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <History className="w-7 h-7 text-sky-600" /> Lịch Sử Biến Động Tài Sản
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Truy vết chi tiết mọi phiếu bàn giao, thu hồi, điều chuyển và thay đổi tình trạng thiết bị.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-600' : ''}`} />
          <span>Xem tất cả mới nhất</span>
        </button>
      </div>

      {/* Form lọc lịch sử: Chọn tài sản từ dropdown hoặc tìm theo mã/tên */}
      <form
        onSubmit={handleSearch}
        className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end"
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Chọn Tài Sản Cần Tra Cứu
          </label>
          <select
            value={selectedAssetId}
            onChange={(e) => {
              setSelectedAssetId(e.target.value);
              setKeyword('');
            }}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-sky-600"
          >
            <option value="">-- Tất cả tài sản ({assetsList.length} thiết bị) --</option>
            {assetsList.map((a) => (
              <option key={a.id} value={a.id}>
                [{a.assetCode}] {a.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-sky-600"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm inline-flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>Tra Cứu</span>
          </button>
        </div>
      </form>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-2xl text-sm flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Bảng hiển thị kết quả lịch sử */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm">
            Dòng Thời Gian Hoạt Động (Timeline)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {history.length} bản ghi lịch sử
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Thời Gian</th>
                <th className="px-6 py-3.5 font-semibold">Tài Sản</th>
                <th className="px-6 py-3.5 font-semibold">Hành Động</th>
                <th className="px-6 py-3.5 font-semibold">Người Thực Hiện</th>
                <th className="px-6 py-3.5 font-semibold">Lý Do & Chi Tiết Biến Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-mono">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {item.asset?.name ?? 'Thiết bị'}
                    </div>
                    <div className="text-xs text-sky-700 font-mono font-semibold mt-0.5">
                      {item.asset?.assetCode ?? item.assetId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                      {item.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-slate-700">
                    {item.actor?.fullName ?? item.actor?.username ?? 'Hệ thống'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">
                      {item.reason || 'Cập nhật trạng thái qua hệ thống'}
                    </p>
                    {item.beforeState && item.afterState && (
                      <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                        {item.beforeState.managementStatus && item.afterState.managementStatus
                          ? `Trạng thái: ${item.beforeState.managementStatus} → ${item.afterState.managementStatus}`
                          : item.beforeState.condition && item.afterState.condition
                            ? `Tình trạng: ${item.beforeState.condition} → ${item.afterState.condition}`
                            : item.afterState.ticketStatus
                              ? `Phiếu: ${item.beforeState.ticketCode || ''} (${item.afterState.ticketStatus})`
                              : ''}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
              {history.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Không có bản ghi lịch sử nào trong khoảng lọc hiện tại.
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
