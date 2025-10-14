import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  // TODO: Lấy JWT token từ localStorage hoặc Zustand store
  const token = localStorage.getItem('accessToken');

  // TODO: Verify JWT token bằng cách:
  // 1. Check xem token có tồn tại không
  // 2. Check xem token có expired chưa (decode JWT và check exp)
  // 3. Check role từ JWT payload (phải là admin)

  // Tạm thời để test - sau này sẽ implement logic thực tế
  // const isAuthenticated = !!token;
  const isAuthenticated = true; // Giả sử đã login thành công
  const isAdmin = true;

  if (!isAuthenticated || !isAdmin) {
    // Redirect về Auth Service login page
    // window.location.href = 'http://localhost:3000/login'; // Auth Service URL
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
