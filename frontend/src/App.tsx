import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import MyAssetsPage from './pages/MyAssetsPage';
import ProtectedRoute from './components/ProtectedRoute'; // <-- Import component bảo vệ

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Trang đăng nhập (Ai cũng vào được) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* CÁC ROUTE ĐƯỢC BẢO VỆ YÊU CẦU PHẢI ĐĂNG NHẬP */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* Các trang chỉ dành riêng cho QUẢN LÝ (MANAGER) */}
            <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
              <Route path="/dashboard" element={<div className="text-white text-xl font-semibold">Trang Dashboard Tổng Quan (Dành cho Quản lý)</div>} />
              <Route path="/tickets" element={<div className="text-white text-xl font-semibold">Quản lý Phiếu Nghiệp Vụ (MANAGER)</div>} />
              <Route path="/history" element={<div className="text-white text-xl font-semibold">Lịch sử Biến động Tài sản (MANAGER)</div>} />
            </Route>

            {/* Trang Tài sản của tôi: Dành cho cả Quản lý và Người dùng bình thường */}
            <Route path="/my-assets" element={<MyAssetsPage />} />
            
          </Route>
        </Route>
        
        {/* Đường dẫn mặc định khi nhập sai URL */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}