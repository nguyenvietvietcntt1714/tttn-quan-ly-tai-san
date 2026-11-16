import React, { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  Download,
  MapPin,
  Tag,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Wrench,
  Ban,
} from 'lucide-react';
import { assetApi } from '../services/api';

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
  group?: { id: string; name: string } | null;
  category?: { id: number; name: string } | null;
  area?: {
    id: string;
    name: string;
    facility?: { id: string; name: string } | null;
  } | null;
  assignedUser?: { id: string; fullName: string; username: string } | null;
  assignedDept?: { id: string; name: string } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface CatalogData {
  categories: { id: number; name: string }[];
  groups: { id: string; code: string; name: string }[];
  facilities: { id: string; name: string }[];
  areas: { id: string; name: string; facilityId: string; facility?: { name: string } }[];
}

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
  AVAILABLE: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  IN_USE: 'bg-sky-50 text-sky-700 border border-sky-200',
  INACTIVE: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const conditionStyle: Record<AssetCondition, string> = {
  GOOD: 'bg-sky-50 text-sky-700 border border-sky-200',
  NEEDS_INSPECTION: 'bg-amber-50 text-amber-700 border border-amber-200',
  BROKEN: 'bg-rose-50 text-rose-700 border border-rose-200',
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ManagementStatus>('');
  const [conditionFilter, setConditionFilter] = useState<'' | AssetCondition>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  // Catalogs cho form tạo mới
  const [catalogs, setCatalogs] = useState<CatalogData>({
    categories: [],
    groups: [],
    facilities: [],
    areas: [],
  });

  // Modal Tạo tài sản mới
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(0);
  const [newFacilityId, setNewFacilityId] = useState('');
  const [newAreaId, setNewAreaId] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newSerial, setNewSerial] = useState('');
  const [newPurchaseValue, setNewPurchaseValue] = useState('15000000');
  const [createLoading, setCreateLoading] = useState(false);

  // Modal Đổi tình trạng / Ngừng theo dõi
  const [conditionModalAsset, setConditionModalAsset] = useState<Asset | null>(null);
  const [targetCondition, setTargetCondition] = useState<AssetCondition>('GOOD');
  const [conditionReason, setConditionReason] = useState('');
  const [deactivateModalAsset, setDeactivateModalAsset] = useState<Asset | null>(null);
  const [deactivateReason, setDeactivateReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const currentUser = savedUser ? JSON.parse(savedUser) : null;

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

  useEffect(() => {
    assetApi
      .getCatalogs()
      .then((data: CatalogData) => {
        setCatalogs(data);
        if (data.groups?.[0]) setNewGroupId(data.groups[0].id);
        if (data.categories?.[0]) setNewCategoryId(data.categories[0].id);
        if (data.facilities?.[0]) {
          const facId = data.facilities[0].id;
          setNewFacilityId(facId);
          const firstArea = data.areas?.find((a) => a.facilityId === facId);
          if (firstArea) setNewAreaId(firstArea.id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleStatusChange = (value: string) => {
    setPage(1);
    setStatusFilter(value as '' | ManagementStatus);
  };

  const handleConditionChange = (value: string) => {
    setPage(1);
    setConditionFilter(value as '' | AssetCondition);
  };

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

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await assetApi.create({
        assetCode: newAssetCode.trim(),
        name: newName.trim(),
        groupId: newGroupId,
        categoryId: Number(newCategoryId),
        facilityId: newFacilityId,
        areaId: newAreaId,
        brand: newBrand.trim() || undefined,
        model: newModel.trim() || undefined,
        serial: newSerial.trim() || undefined,
        purchaseValue: Number(newPurchaseValue) || 0,
      });
      setIsCreateOpen(false);
      setNewAssetCode('');
      setNewName('');
      setNewBrand('');
      setNewModel('');
      setNewSerial('');
      fetchAssets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi tạo tài sản');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleConfirmChangeCondition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conditionModalAsset || !currentUser?.id) return;
    setActionSubmitting(true);
    try {
      await assetApi.changeCondition(conditionModalAsset.id, {
        condition: targetCondition,
        reason: conditionReason,
        actorId: currentUser.id,
      });
      setConditionModalAsset(null);
      setConditionReason('');
      fetchAssets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi cập nhật tình trạng');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleConfirmDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivateModalAsset || !currentUser?.id) return;
    setActionSubmitting(true);
    try {
      await assetApi.deactivate(deactivateModalAsset.id, {
        reason: deactivateReason,
        actorId: currentUser.id,
      });
      setDeactivateModalAsset(null);
      setDeactivateReason('');
      fetchAssets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi ngừng theo dõi tài sản');
    } finally {
      setActionSubmitting(false);
    }
  };

  const filteredAreasForCreate = catalogs.areas.filter(
    (a) => !newFacilityId || a.facilityId === newFacilityId,
  );

  return (
    <div className="space-y-6 p-6 sm:p-8 max-w-7xl mx-auto text-slate-800">
      {/* Tiêu đề trang */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
              <Package className="w-7 h-7 text-sky-600" /> Danh Sách Tài Sản
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Quản lý hồ sơ thiết bị, tìm kiếm, lọc và xuất báo cáo toàn bộ tài sản ({pagination.total} tài sản)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Tài Sản Mới</span>
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-sky-600" />
              {exporting ? 'Đang xuất...' : 'Xuất CSV'}
            </button>
          </div>
        </div>
      </div>

      {/* Thanh tìm kiếm + lọc */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo mã tài sản, tên thiết bị, hãng, serial..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-sky-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium outline-none focus:bg-white focus:border-sky-600"
          >
            <option value="">Tất cả trạng thái quản lý</option>
            <option value="AVAILABLE">Sẵn sàng (AVAILABLE)</option>
            <option value="IN_USE">Đang sử dụng (IN_USE)</option>
            <option value="INACTIVE">Ngừng theo dõi (INACTIVE)</option>
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => handleConditionChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-700 font-medium outline-none focus:bg-white focus:border-sky-600"
          >
            <option value="">Tất cả tình trạng vật lý</option>
            <option value="GOOD">Tốt (GOOD)</option>
            <option value="NEEDS_INSPECTION">Cần kiểm tra (NEEDS_INSPECTION)</option>
            <option value="BROKEN">Hỏng (BROKEN)</option>
          </select>
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Tìm kiếm
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={fetchAssets}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-rose-200 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-100"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Thử lại
          </button>
        </div>
      )}

      {/* Bảng tài sản */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            Đang tải dữ liệu danh sách tài sản...
          </div>
        ) : assets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            Không có tài sản nào khớp bộ lọc hiện tại.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã / Tên Tài Sản</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Danh mục</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vị trí</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tình trạng</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người giữ</th>
                    <th className="py-3.5 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {assets.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                        <div className="text-xs text-sky-700 font-mono font-semibold mt-0.5">
                          {item.assetCode}
                          {item.brand ? ` • ${item.brand}` : ''}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                          <Tag className="w-3.5 h-3.5 text-sky-600" />
                          {item.group?.name ?? item.category?.name ?? '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {item.area
                              ? `${item.area.name}${item.area.facility ? ` - ${item.area.facility.name}` : ''}`
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${statusStyle[item.managementStatus]}`}
                        >
                          {statusLabel[item.managementStatus]}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${conditionStyle[item.condition]}`}
                        >
                          {conditionLabel[item.condition]}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-slate-700 text-xs font-medium">
                        {item.assignedUser?.fullName ?? item.assignedDept?.name ?? (
                          <span className="text-slate-400">Tại kho</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => {
                            setConditionModalAsset(item);
                            setTargetCondition(
                              item.condition === 'GOOD' ? 'NEEDS_INSPECTION' : 'GOOD',
                            );
                            setConditionReason('');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 transition-all"
                          title="Cập nhật tình trạng vật lý"
                        >
                          <Wrench className="w-3.5 h-3.5" /> Đổi TT
                        </button>
                        {item.managementStatus !== 'INACTIVE' && (
                          <button
                            onClick={() => {
                              setDeactivateModalAsset(item);
                              setDeactivateReason('');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all"
                            title="Ngừng theo dõi tài sản"
                          >
                            <Ban className="w-3.5 h-3.5" /> Ngừng TD
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-600 font-medium">
                Trang {pagination.page} / {pagination.totalPages} — Tổng {pagination.total} tài sản
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Thêm Tài Sản Mới */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Tiếp Nhận Tài Sản Mới</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Mã Tài Sản *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssetCode}
                    onChange={(e) => setNewAssetCode(e.target.value)}
                    placeholder="VD: AST-061"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:bg-white focus:border-sky-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Tên Thiết Bị *
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="VD: Laptop Dell Latitude 5440"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Nhóm Tài Sản *
                  </label>
                  <select
                    required
                    value={newGroupId}
                    onChange={(e) => setNewGroupId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  >
                    {catalogs.groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Danh Mục *
                  </label>
                  <select
                    required
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  >
                    {catalogs.categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Cơ Sở *
                  </label>
                  <select
                    required
                    value={newFacilityId}
                    onChange={(e) => {
                      const facId = e.target.value;
                      setNewFacilityId(facId);
                      const firstArea = catalogs.areas.find((a) => a.facilityId === facId);
                      if (firstArea) setNewAreaId(firstArea.id);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  >
                    {catalogs.facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Khu Vực Lưu Trữ *
                  </label>
                  <select
                    required
                    value={newAreaId}
                    onChange={(e) => setNewAreaId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  >
                    {filteredAreasForCreate.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Hãng</label>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    placeholder="Dell, Apple..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Model</label>
                  <input
                    type="text"
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="Latitude 5440"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Serial</label>
                  <input
                    type="text"
                    value={newSerial}
                    onChange={(e) => setNewSerial(e.target.value)}
                    placeholder="SN-2026-..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Giá Trị Mua (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newPurchaseValue}
                  onChange={(e) => setNewPurchaseValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold shadow-sm disabled:opacity-50"
                >
                  {createLoading ? 'Đang lưu...' : 'Tạo Tài Sản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi Tình Trạng Vật Lý */}
      {conditionModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Đổi Tình Trạng: {conditionModalAsset.assetCode}
              </h3>
              <button
                onClick={() => setConditionModalAsset(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmChangeCondition} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Thiết bị: <strong className="text-slate-900">{conditionModalAsset.name}</strong> (Hiện tại:{' '}
                <span className="font-semibold">{conditionLabel[conditionModalAsset.condition]}</span>)
              </p>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tình trạng mới *
                </label>
                <select
                  value={targetCondition}
                  onChange={(e) => setTargetCondition(e.target.value as AssetCondition)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none"
                >
                  <option value="GOOD">Tốt (GOOD)</option>
                  <option value="NEEDS_INSPECTION">Cần kiểm tra (NEEDS_INSPECTION)</option>
                  <option value="BROKEN">Hỏng (BROKEN)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Lý do thay đổi *
                </label>
                <textarea
                  required
                  rows={3}
                  value={conditionReason}
                  onChange={(e) => setConditionReason(e.target.value)}
                  placeholder="Nhập lý do kiểm tra / ghi nhận hỏng hóc..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-sky-600 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setConditionModalAsset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {actionSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ngừng Theo Dõi Tài Sản */}
      {deactivateModalAsset && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-rose-700">
                Ngừng Theo Dõi: {deactivateModalAsset.assetCode}
              </h3>
              <button
                onClick={() => setDeactivateModalAsset(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleConfirmDeactivate} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Bạn đang chuyển tài sản <strong className="text-slate-900">{deactivateModalAsset.name}</strong> sang trạng thái{' '}
                <strong className="text-rose-700">Ngừng theo dõi (INACTIVE)</strong>. Dữ liệu và lịch sử vẫn được giữ lại.
              </p>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Lý do ngừng theo dõi *
                </label>
                <textarea
                  required
                  rows={3}
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="VD: Thanh lý thiết bị hết khấu hao..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-rose-600 outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeactivateModalAsset(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {actionSubmitting ? 'Đang xử lý...' : 'Xác Nhận Ngừng Theo Dõi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
