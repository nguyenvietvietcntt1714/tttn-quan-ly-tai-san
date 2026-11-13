import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, KeyRound, Eye, EyeOff, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === 'manager' && password === '123456') {
        const userSession = {
          username: 'manager',
          fullName: 'Nguyễn Văn Quản Lý',
          role: 'MANAGER',
          token: 'mock-jwt-token-manager-123'
        };
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userSession));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userSession));
        }
        navigate('/dashboard');
      } else if (username === 'user1' && password === '123456') {
        const userSession = {
          username: 'user1',
          fullName: 'Trần Văn Sử Dụng',
          role: 'USER',
          token: 'mock-jwt-token-user-456'
        };
        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(userSession));
        } else {
          sessionStorage.setItem('user', JSON.stringify(userSession));
        }
        navigate('/my-assets');
      } else {
        setError('Sai tên đăng nhập hoặc mật khẩu! (Gợi ý: manager / 123456)');
        setLoading(false);
      }
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
      
      {/* ================= BÊN TRÁI: Khu vực giới thiệu & Nhận diện ================= */}
      <div className="lg:w-7/12 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80">
        
        {/* Họa tiết nền trang trí mờ */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Logo / Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Hệ Thống Nội Bộ</span>
            <h2 className="text-lg font-bold text-white">Asset Management</h2>
          </div>
        </div>

        {/* Center Content / Message */}
        <div className="relative z-10 my-12 lg:my-0 max-w-xl">
          <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 text-xs font-semibold mb-6 border border-blue-500/20">
            <Activity className="w-3.5 h-3.5" /> Quản lý thông minh & Đồng bộ
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Quản lý tài sản tập trung, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">minh bạch và hiệu quả.</span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg mb-8 leading-relaxed">
            Giải pháp tối ưu hóa vòng đời thiết bị, kiểm soát luồng bàn giao và điều chuyển tài sản cơ sở vật chất một cách chính xác nhất.
          </p>

          {/* 3 Lợi ích cốt lõi */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Theo dõi tài sản theo thời gian thực</h3>
                <p className="text-slate-400 text-xs mt-0.5">Nắm bắt chính xác tình trạng, vị trí và người chịu trách nhiệm.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Quản lý bàn giao và người sử dụng</h3>
                <p className="text-slate-400 text-xs mt-0.5">Quy trình lập phiếu minh bạch, chống ghi đè dữ liệu xung đột.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-1 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Báo cáo & Xuất dữ liệu nhanh chóng</h3>
                <p className="text-slate-400 text-xs mt-0.5">Trích xuất báo cáo thống kê trực quan và file CSV tiện lợi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/80">
          <p>© 2026 Đồ Án Tốt Nghiệp - Nhóm Khoa</p>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Hệ thống hoạt động bình thường
          </span>
        </div>
      </div>

      {/* ================= BÊN PHẢI: Khung đăng nhập ================= */}
      <div className="lg:w-5/12 bg-slate-900 p-8 sm:p-12 lg:p-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-slate-950/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800 p-8 sm:p-10">
          
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white tracking-wide">Đăng Nhập</h2>
            <p className="text-sm text-slate-400 mt-1">Nhập thông tin tài khoản của bạn</p>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <span className="mt-0.5">⚠️</span>
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form đăng nhập */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                  placeholder="Nhập tài khoản (vd: manager)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium"
                  placeholder="Nhập mật khẩu (vd: 123456)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Ghi nhớ & Quên mật khẩu */}
            <div className="flex items-center justify-between text-sm pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-950"
                />
                <span className="text-slate-300 text-xs font-medium">Ghi nhớ đăng nhập</span>
              </label>
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); alert('Vui lòng liên hệ quản trị viên hệ thống để cấp lại mật khẩu!'); }}
                className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                Quên mật khẩu?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 text-base group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Đăng Nhập Hệ Thống</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Gợi ý tài khoản demo */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-semibold text-slate-400 mb-2.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-400" /> Nhấp nhanh tài khoản test:
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div 
                onClick={() => { setUsername('manager'); setPassword('123456'); }}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-xl cursor-pointer transition-all group"
              >
                <p className="font-bold text-blue-400 group-hover:text-blue-300">Quản Lý</p>
                <p className="text-slate-500 mt-0.5">manager / 123456</p>
              </div>
              <div 
                onClick={() => { setUsername('user1'); setPassword('123456'); }}
                className="p-3 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl cursor-pointer transition-all group"
              >
                <p className="font-bold text-emerald-400 group-hover:text-emerald-300">Người Dùng</p>
                <p className="text-slate-500 mt-0.5">user1 / 123456</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}