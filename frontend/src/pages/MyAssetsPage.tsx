import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, MapPin, Tag, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface Asset {
  id: string;
  assetCode: string;
  name: string;
  groupName: string;
  areaName: string;
  facilityName: string;
  status: string;
  condition: string;
  assignedDate?: string | null;
}

// Map dữ liệu backend (Prisma) sang dạng hiển thị của trang
function mapAsset(raw: any): Asset {
  return {
    id: raw.id,
    assetCode: raw.assetCode,
    name: raw.name,
    groupName: raw.group?.name ?? '—',
    areaName: raw.area?.name ?? '—',
    facilityName: raw.area?.facility?.name ?? '—',
    status: raw.managementStatus ?? raw.status ?? 'AVAILABLE',
    condition: raw.condition ?? 'GOOD',
    assignedDate: raw.assignedUserId ? raw.updatedAt : null,
  };
}

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy thông tin user hiện tại từ localStorage/sessionStorage
  const userSession = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  // Gọi API backend lấy danh sách tài sản (fallback mock khi backend chưa chạy)
  useEffect(() => {
    let cancelled = false;
    axios
      .get('http://localhost:3000/assets')
      .then((res) => {
        if (!cancelled) {
          setAssets((res.data as any[]).map(mapAsset));
          setLoading(false);
        }
      })
      .catch(() => {
        // Backend chưa chạy hoặc lỗi: dùng dữ liệu giả để trang vẫn hiển thị
        if (!cancelled) {
          const mockAssets: Asset[] = [
            {
              id: '1',
              assetCode: 'AST-001',
              name: 'Laptop Dell Latitude 5420',
              groupName: 'Thiết bị IT',
              areaName: 'Tầng 3 (Phòng Dev)',
              facilityName: 'Cơ sở chính',
              status: 'IN_USE',
              condition: 'GOOD',
              assignedDate: '2026-01-15',
            },
            {
              id: '2',
              assetCode: 'AST-014',
              name: 'Màn hình ViewSonic 27 inch',
              groupName: 'Thiết bị IT',
              areaName: 'Tầng 3 (Phòng Dev)',
              facilityName: 'Cơ sở chính',
              status: 'IN_USE',
              condition: 'GOOD',
              assignedDate: '2026-01-15',
            },
          ];
          setAssets(mockAssets);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Lọc tài sản theo từ khóa tìm kiếm
  const filteredAssets = assets.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.groupName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Làm mới: gọi lại API backend
  const refresh = () => {
    setLoading(true);
    axios
      .get('http://localhost:3000/assets')
      .then((res) => {
        setAssets((res.data as any[]).map(mapAsset));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang & Thông tin nhân viên */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Package className="w-7 h-7 text-blue-400" /> Tài Sản Của Tôi
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Danh sách thiết bị và cơ sở vật chất đang được bàn giao trực tiếp cho bạn ({userSession.fullName || 'Nhân viên'})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-xl text-xs font-semibold">
            Tổng số: {assets.length} thiết bị
          </span>
          <button 
            onClick={refresh}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all border border-slate-700"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Thanh tìm kiếm */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm theo tên thiết bị, mã tài sản hoặc danh mục..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition-all"
          />
        </div>
      </div>

      {/* Danh sách dạng Bảng / Thẻ */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm">Đang tải danh sách tài sản...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">Không tìm thấy tài sản nào</p>
            <p className="text-xs text-slate-500 mt-1">Bạn chưa được bàn giao thiết bị nào khớp với từ khóa tìm kiếm.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-4 px-6">Mã & Tên Tài Sản</th>
                  <th className="py-4 px-6">Danh Mục</th>
                  <th className="py-4 px-6">Vị Trí / Cơ Sở</th>
                  <th className="py-4 px-6">Trạng Thái</th>
                  <th className="py-4 px-6">Tình Trạng</th>
                  <th className="py-4 px-6">Ngày Tiếp Nhận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-sm">
                {filteredAssets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-xs text-blue-400 font-mono mt-0.5">{item.assetCode}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" /> {item.groupName}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{item.facilityName} - {item.areaName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium border ${
                        item.status === 'IN_USE'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.condition === 'GOOD'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-xs font-medium">
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
