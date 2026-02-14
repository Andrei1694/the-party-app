import { Link, Outlet } from '@tanstack/react-router';
import { useAuth } from './auth/AuthContext';

function App() {
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
  };

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default App;
