import { Navigate } from '@tanstack/react-router';
import { useAuth } from './AuthContext';

const RootRedirectRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  return <Navigate to={isAuthenticated ? '/news' : '/login'} replace />;
};

export default RootRedirectRoute;
