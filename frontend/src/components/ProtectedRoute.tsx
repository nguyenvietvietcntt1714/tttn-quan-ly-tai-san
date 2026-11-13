import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[]; // Danh sách các vai trò được phép truy cập
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // Lấy thông tin user từ localStorage (hoặc sessionStorage nếu chọn ghi nhớ)
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

  // 1. Kiểm tra xem đã đăng nhập chưa
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);

  // 2. Kiểm tra quyền hạn (Role-based access control) nếu có danh sách quy định
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Nếu sai quyền, tự động điều hướng về trang phù hợp với role của họ
    const fallbackPath = user.role === 'MANAGER' ? '/dashboard' : '/my-assets';
    return <Navigate to={fallbackPath} replace />;
  }

  // 3. Đã thỏa mãn điều kiện -> Cho phép hiển thị nội dung bên trong
  return <Outlet />;
}