import { useState, useEffect } from 'react';
import { Package, Search, MapPin, Tag, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  site: string;
  status: string; // Trạng thái quản lý (Đang sử dụng, Sẵn sàng...)
  condition: string; // Tình trạng (Tốt, Cần kiểm tra, Hỏng...)
  assignedDate: string;
}

export default function MyAssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Lấy thông tin user hiện tại từ localStorage/sessionStorage
  const userSession = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  // Giả lập gọi API lấy danh sách tài sản của cá nhân user đang đăng nhập
  useEffect(() => {
    // Sau này khi Backend (Thành viên A/B) xong API, bạn thay thế đoạn setTimeout này bằng axios.get('/api/assets/my-assets')
    setTimeout(() => {
      const mockAssets: Asset[] = [
        {
          id: '1',
          code: 'AST-001',
          name: 'Laptop Dell Latitude 5420',
          category: 'Thiết bị IT',
          site: 'Cơ sở chính - Tầng 3 (Phòng Dev)',
          status: 'Đang sử dụng',
          condition: 'Tốt',
          assignedDate: '2026-01-15'
        },
        {
          id: '2',
          code: 'AST-014',
          name: 'Màn hình ViewSonic 27 inch',
          category: 'Thiết bị IT',
          site: 'Cơ sở chính - Tầng 3 (Phòng Dev)',
          status: 'Đang sử dụng',
          condition: 'Tốt',
          assignedDate: '2026-01-15'
        },
        {
          id: '3',
          code: 'AST-032',
          name: 'Ghế công thái học Ergonomic',
          category: 'Nội thất văn phòng',
          site: 'Cơ sở chính - Tầng 3 (Khu làm việc)',
          status: 'Đang sử dụng',
          condition: 'Cần kiểm tra',
          assignedDate: '2025-11-20'
        }
      ];
      setAssets(mockAssets);
      setLoading(false);
    }, 500);
  }, []);

  // Lọc tài sản theo từ khóa tìm kiếm
  const filteredAssets = assets.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 400); }}
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
                      <div className="text-xs text-blue-400 font-mono mt-0.5">{item.code}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700/60">
                        <Tag className="w-3.5 h-3.5 text-indigo-400" /> {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> 
                        <span>{item.site}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        item.condition === 'Tốt' 
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