import { useState, useEffect, useCallback } from 'react';
import { Package, Search, MapPin, Tag, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { assetApi } from '../services/api';

interface Asset {
  id: string;
  assetCode: string;
  name: string;
  brand?: string | null;
  model?: string | null;
  serial?: string | null;
  groupName: string;
  categoryName: string;
  areaName: string;
  facilityName: string;
  status: string;
  condition: string;
  assignedDate?: string | null;
}

const statusLabel: Record<string, string> = {
  AVAILABLE: 'Sẵn sàng',
  IN_USE: 'Đang sử dụng',
  INACTIVE: 'Ngừng theo dõi',
};

const conditionLabel: Record<string, string> = {
  GOOD: 'Tốt',
  NEEDS_INSPECTION: 'Cần kiểm tra',
  BROKEN: 'Hỏng',
};

// Map dữ liệu backend (Prisma) sang dạng hiển thị của trang
function mapAsset(raw: any): Asset {
  return {
    id: raw.id,
    assetCode: raw.assetCode,
    name: raw.name,
    brand: raw.brand,
    model: raw.model,
    serial: raw.serial,
    groupName: raw.group?.name ?? '—',
    categoryName: raw.category?.name ?? '—',
    areaName: raw.area?.name ?? '—',
    facilityName: raw.area?.facility?.name ?? '—',
    status: raw.managementStatus ?? raw.status ?? 'IN_USE',
    condition: raw.condition ?? 'GOOD',
    assignedDate: raw.updatedAt ? new Date(raw.updatedAt).toLocaleDateString('vi-VN') : '—',
  };
}

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy thông tin user hiện tại từ localStorage/sessionStorage
  const userSession = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  const fetchMyAssets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await assetApi.getMyAssets();
      const rawList = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : null;
      if (!rawList) {
        throw new Error('Dữ liệu phản hồi từ máy chủ không hợp lệ');
      }
      setAssets(rawList.map(mapAsset));
    } catch (err: unknown) {
      // Tuyệt đối KHÔNG gán dữ liệu hardcode khi API lỗi — báo lỗi rõ ràng cho người dùng
      setAssets([]);
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể kết nối máy chủ để tải danh sách tài sản của bạn.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyAssets();
  }, [fetchMyAssets]);

  // Lọc tài sản theo từ khóa tìm kiếm
  const filteredAssets = assets.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Tiêu đề trang & Thông tin nhân viên */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Package className="w-7 h-7 text-sky-600" /> Tài Sản Của Tôi
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Danh sách thiết bị và cơ sở vật chất đang được bàn giao trực tiếp cho bạn ({userSession.fullName || 'Nhân viên'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-sky-50 border border-sky-200 text-sky-700 rounded-xl text-xs font-semibold">
            Đang giữ: {assets.length} thiết bị
          </span>
          <button
            onClick={fetchMyAssets}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium transition-all border border-slate-200 shadow-sm disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-600' : ''}`} />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên thiết bị, mã tài sản hoặc danh mục..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 text-sm transition-all"
          />
        </div>
      </div>

      {/* Thông báo lỗi nếu gọi API thất bại */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-700 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">Lỗi tải dữ liệu tài sản</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchMyAssets}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shrink-0"
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* Danh sách dạng Bảng */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Đang tải danh sách tài sản từ hệ thống...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Không thể hiển thị dữ liệu do lỗi kết nối API</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng kiểm tra kết nối máy chủ hoặc đăng nhập lại.</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-800">Không có tài sản nào</p>
            <p className="text-xs text-slate-500 mt-1">
              {searchTerm
                ? 'Không tìm thấy thiết bị nào khớp với từ khóa tìm kiếm.'
                : 'Hiện tại bạn chưa được bàn giao thiết bị nào.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3.5 px-6">Mã & Tên Tài Sản</th>
                  <th className="py-3.5 px-6">Danh Mục / Nhóm</th>
                  <th className="py-3.5 px-6">Vị Trí / Cơ Sở</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6">Tình Trạng</th>
                  <th className="py-3.5 px-6">Cập Nhật Gần Nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredAssets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-sky-700 font-mono font-semibold mt-0.5">
                        {item.assetCode}
                        {item.serial ? ` • SN: ${item.serial}` : ''}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 font-medium">
                        <Tag className="w-3.5 h-3.5 text-sky-600" /> {item.groupName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600 text-xs font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{item.areaName} — {item.facilityName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold border ${
                          item.status === 'IN_USE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" /> {statusLabel[item.status] ?? item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          item.condition === 'GOOD'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : item.condition === 'NEEDS_INSPECTION'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {conditionLabel[item.condition] ?? item.condition}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs font-medium">
                      {item.assignedDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
