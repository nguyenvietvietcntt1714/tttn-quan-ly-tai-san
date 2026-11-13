import { useState, useEffect, useCallback } from 'react';
import { Package, Search, Download, MapPin, Tag, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { assetApi } from '../services/api';

// Khớp enum backend Prisma
type ManagementStatus = 'AVAILABLE' | 'IN_USE' | 'INACTIVE';
type AssetCondition = 'GOOD' | 'NEEDS_INSPECTION' | 'BROKEN';

interface Asset {
  id: string;
  assetCode: string;
  name: string;
  model?: string | null;
  serial?: string | null;
  brand?: string | null;
  managementStatus: ManagementStatus;
  condition: AssetCondition;
  group?: { name: string } | null;
  category?: { name: string } | null;
  area?: {
    name: string;
    facility?: { name: string } | null;
  } | null;
  assignedUser?: { fullName: string } | null;
  assignedDept?: { name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Nhãn hiển thị tiếng Việt cho enum backend
const statusLabel: Record<ManagementStatus, string> = {
  AVAILABLE: 'Sẵn sàng',
  IN_USE: 'Đang sử dụng',
  INACTIVE: 'Ngừng theo dõi',
};

const conditionLabel: Record<AssetCondition, string> = {
  GOOD: 'Tốt',
  NEEDS_INSPECTION: 'Cần kiểm tra',
  BROKEN: 'Hỏng',
};

const statusStyle: Record<ManagementStatus, string> = {
  AVAILABLE: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  IN_USE: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  INACTIVE: 'bg-slate-500/10 text-slate-400 border border-slate-500/20',
};

const conditionStyle: Record<AssetCondition, string> = {
  GOOD: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  NEEDS_INSPECTION: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  BROKEN: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ManagementStatus>('');
  const [conditionFilter, setConditionFilter] = useState<'' | AssetCondition>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await assetApi.getFiltered({
        page,
        limit: 10,
        search: appliedSearch,
        managementStatus: statusFilter,
        condition: conditionFilter,
      });
      setAssets(res.items ?? []);
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách tài sản');
    } finally {
      setLoading(false);
    }
  }, [page, appliedSearch, statusFilter, conditionFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleFilter = (value: string) => {
    setPage(1);
    if (value === 'AVAILABLE' || value === 'IN_USE' || value === 'INACTIVE') {
      setStatusFilter(value as ManagementStatus);
    } else if (
      value === 'GOOD' ||
      value === 'NEEDS_INSPECTION' ||
      value === 'BROKEN'
    ) {
      setConditionFilter(value as AssetCondition);
    } else {
      setStatusFilter('');
      setConditionFilter('');
    }
  };

  // Tải file CSV từ backend GET /assets/export (kèm token, lọc hiện tại)
  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await assetApi.exportCsv({
        search: appliedSearch,
        managementStatus: statusFilter,
        condition: conditionFilter,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tai-san-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xuất CSV');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Tiêu đề trang */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Package className="w-7 h-7 text-blue-400" /> Danh Sách Tài Sản
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Tìm kiếm, lọc và xuất báo cáo toàn bộ tài sản đang theo dõi ({pagination.total} tài sản)
            </p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Đang xuất...' : 'Xuất Báo Cáo CSV'}
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm + lọc */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã, tên, hãng, serial..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="IN_USE">Đang sử dụng</option>
            <option value="AVAILABLE">Sẵn sàng</option>
            <option value="INACTIVE">Ngừng theo dõi</option>
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => handleFilter(e.target.value)}
            className="bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="">Tất cả tình trạng</option>
            <option value="GOOD">Tốt</option>
            <option value="NEEDS_INSPECTION">Cần kiểm tra</option>
            <option value="BROKEN">Hỏng</option>
          </select>
        </form>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={fetchAssets} className="ml-auto text-rose-300 hover:text-rose-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bảng tài sản */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Đang tải dữ liệu...</div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không có tài sản nào khớp bộ lọc hiện tại
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Mã / Tên</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh mục</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vị trí</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tình trạng</th>
                    <th className="py-4 px-6 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bên chịu trách nhiệm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {assets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-medium text-white">{item.name}</div>
                        <div className="text-xs text-blue-400 font-mono mt-0.5">{item.assetCode}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60">
                          <Tag className="w-3.5 h-3.5 text-indigo-400" />
                          {item.group?.name ?? item.category?.name ?? '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{item.area ? `${item.area.name}${item.area.facility ? ` - ${item.area.facility.name}` : ''}` : '—'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${statusStyle[item.managementStatus]}`}>
                          {statusLabel[item.managementStatus]}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${conditionStyle[item.condition]}`}>
                          {conditionLabel[item.condition]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-400 text-xs font-medium">
                        {item.assignedUser?.fullName ?? item.assignedDept?.name ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/50">
              <p className="text-xs text-slate-400">
                Trang {pagination.page} / {pagination.totalPages} — {pagination.total} tài sản
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
