import { Navigate } from '@tanstack/react-router';
import { useAuth } from './AuthContext';

const PublicOnlyRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Checking session...</div>;
  }

  if (user) {
    return <Navigate to="/news" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
