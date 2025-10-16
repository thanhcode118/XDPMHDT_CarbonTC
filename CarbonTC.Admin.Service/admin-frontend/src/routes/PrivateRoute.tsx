import { Navigate } from 'react-router-dom';

// import { useAuthStore } from '../store';
interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // const user = useAuthStore((state) => state.user);
  const isAuthenticated = true;
  const user = {
    id: '1',
    email: 'admin@test.com',
    fullName: 'Admin',
    role: 'ADMIN' as const,
    status: 'ACTIVE' as const,
  };

  if (!isAuthenticated || !user) {
    // Redirect về Auth Service login page
    // window.location.href = 'http://localhost:3000/login'; // Auth Service URL
    return <Navigate to="/" replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default PrivateRoute;
