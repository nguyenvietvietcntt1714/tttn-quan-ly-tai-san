import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, History, LogOut, ShieldAlert } from 'lucide-react';

export default function MainLayout() {
  const navigate = useNavigate();
  const userSession = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar bên trái */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="font-bold text-white text-base">Quản Lý Tài Sản</span>
          </div>
          <nav className="p-4 space-y-1.5">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <LayoutDashboard className="w-5 h-5 text-blue-400" /> Dashboard Tổng Quan
            </a>
            <a href="/tickets" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <FileText className="w-5 h-5 text-emerald-400" /> Quản Lý Phiếu
            </a>
            <a href="/history" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              <History className="w-5 h-5 text-amber-400" /> Lịch Sử Tài Sản
            </a>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" /> Đăng Xuất
          </button>
        </div>
      </aside>

      {/* Main Content bên phải */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 flex items-center justify-between">
          <h1 className="text-white font-semibold text-lg">Hệ thống Quản lý Thiết bị & Tài sản</h1>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-white">{userSession.fullName || 'Người dùng'}</p>
              <p className="text-[10px] text-blue-400 font-semibold">{userSession.role === 'MANAGER' ? 'Quản lý tài sản' : 'Người sử dụng'}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
              {userSession.fullName ? userSession.fullName.charAt(0) : 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}