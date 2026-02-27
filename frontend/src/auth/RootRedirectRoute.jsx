import { Navigate } from '@tanstack/react-router';
import { useAuth } from './AuthContext';

const RootRedirectRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  return <Navigate to={user ? '/news' : '/login'} replace />;
};

export default RootRedirectRoute;
