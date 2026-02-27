import { Navigate, useLocation } from '@tanstack/react-router';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" search={{ redirect: location.href }} replace />;
  }

  return children;
};

export default ProtectedRoute;
