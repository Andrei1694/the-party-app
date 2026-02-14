import { Link, Outlet } from '@tanstack/react-router';
import { useAuth } from './auth/AuthContext';

function App() {
  const { user, logout } = useAuth();

  const onLogout = async () => {
    await logout();
  };

  return (
    <div>
      {/* <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          {user && (
            <li>
              <Link to="/users">Users</Link>
            </li>
          )}
          {!user && (
            <li>
              <Link to="/login">Login</Link>
            </li>
          )}
          {!user && (
            <li>
              <Link to="/register">Register</Link>
            </li>
          )}
          {user && (
            <li>
              <button type="button" onClick={onLogout}>
                Logout
              </button>
            </li>
          )}
        </ul>
      </nav> */}

      <Outlet />
    </div>
  );
}

export default App;
