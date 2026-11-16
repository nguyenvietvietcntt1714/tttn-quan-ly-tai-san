import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { ShieldCheck, User, Lock, KeyRound, Eye, EyeOff, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess?: (role: string) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      const userSession = {
        id: res.user.id,
        username: res.user.username,
        fullName: res.user.fullName,
        role: res.user.role,
        token: res.accessToken,
      };
      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(userSession));
      } else {
        sessionStorage.setItem('user', JSON.stringify(userSession));
      }
      if (onLoginSuccess) onLoginSuccess(res.user.role);
      navigate(res.user.role === 'USER' ? '/my-assets' : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800">
      {/* BÊN TRÁI: Khu vực giới thiệu - Sáng màu, rõ ràng */}
      <div className="lg:w-7/12 bg-gradient-to-br from-sky-50 via-white to-blue-50 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-sky-600 text-white rounded-2xl shadow-md shadow-sky-600/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-sky-700">Hệ Thống Nội Bộ</span>
            <h2 className="text-lg font-bold text-slate-900">Quản Lý Tài Sản Doanh Nghiệp</h2>
          </div>
        </div>

        <div className="relative z-10 my-10 lg:my-0 max-w-xl">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-sky-100 text-sky-800 text-xs font-semibold mb-6 border border-sky-200">
            <Activity className="w-3.5 h-3.5" /> Quản lý tập trung & Đồng bộ thời gian thực
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Kiểm soát vòng đời tài sản <span className="text-sky-600">minh bạch, chính xác.</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">
            Hệ thống quản lý danh mục thiết bị, lập phiếu bàn giao, điều chuyển, thu hồi và truy vết lịch sử biến động cơ sở vật chất nội bộ.
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-3 bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold text-sm">Theo dõi trạng thái & tình trạng thực tế</h3>
                <p className="text-slate-600 text-xs mt-0.5">Phân định rõ trạng thái Sẵn sàng, Đang sử dụng, Ngừng theo dõi và đơn vị chịu trách nhiệm.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white/80 p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-slate-900 font-semibold text-sm">Quy trình phiếu nghiệp vụ chống ghi đè</h3>
                <p className="text-slate-600 text-xs mt-0.5">Kiểm soát chặt chẽ trạng thái phiếu (Nháp / Đã xác nhận / Đã hủy) và khóa phiên bản Optimistic Locking.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-200">
          <p>© 2026 Thực Tập Tốt Nghiệp — Hệ Thống Quản Lý Tài Sản</p>
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Hệ thống sẵn sàng
          </span>
        </div>
      </div>

      {/* BÊN PHẢI: Khung đăng nhập */}
      <div className="lg:w-5/12 bg-slate-50 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-200 p-8 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Đăng Nhập Hệ Thống</h2>
            <p className="text-sm text-slate-500 mt-1">Nhập thông tin tài khoản được cấp</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all text-sm font-medium"
                  placeholder="Nhập tài khoản (vd: manager)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-sky-600 focus:ring-2 focus:ring-sky-500/20 transition-all text-sm font-medium"
                  placeholder="Nhập mật khẩu (vd: 123456)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-600 text-xs font-medium">Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl shadow-md shadow-sky-600/20 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-sm group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Đăng Nhập</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-sky-600" /> Chọn nhanh tài khoản demo:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => { setUsername('manager'); setPassword('123456'); }}
                className="text-left p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer transition-all"
              >
                <p className="font-bold text-sky-700">Quản Lý (Manager)</p>
                <p className="text-slate-500 mt-0.5 font-mono">manager / 123456</p>
              </button>
              <button
                type="button"
                onClick={() => { setUsername('user1'); setPassword('123456'); }}
                className="text-left p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl cursor-pointer transition-all"
              >
                <p className="font-bold text-emerald-700">Nhân Sự (User)</p>
                <p className="text-slate-500 mt-0.5 font-mono">user1 / 123456</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
