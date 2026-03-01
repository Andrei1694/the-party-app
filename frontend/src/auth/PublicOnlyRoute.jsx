import { Navigate } from '@tanstack/react-router';
import { useAuth } from './AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/news" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
