import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from './auth/AuthContext';
import BottomNavbar from './components/navigation/BottomNavbar';
import Sidebar from './components/navigation/Sidebar';
import TopNavbar from './components/navigation/TopNavbar';
import { NAV_ITEMS, getRouteTitle, isShellRoute } from './navigation/navConfig';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = location.pathname;
  const showShell = isShellRoute(pathname);
  const title = getRouteTitle(pathname);

  const userLabel = useMemo(() => {
    const firstName = user?.userProfile?.firstName?.trim() || '';
    const lastName = user?.userProfile?.lastName?.trim() || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || user?.email || 'Citizen';
  }, [user]);

  const handleNavigate = useCallback(
    (to) => {
      setMobileSidebarOpen(false);
      navigate({ to });
    },
    [navigate],
  );

  const handleLogout = useCallback(async () => {
    setMobileSidebarOpen(false);
    await logout();
    navigate({ to: '/login' });
  }, [logout, navigate]);

  if (!showShell) {
    return (
      <div>
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cusens-bg md:flex">
      <Sidebar
        navItems={NAV_ITEMS}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        mobile={false}
      />

      <div className="flex min-h-screen flex-1 flex-col font-display">
        <TopNavbar title={title} onMenuClick={() => setMobileSidebarOpen(true)} userLabel={userLabel} />
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-8 md:pt-6">
          <Outlet />
        </main>
        <BottomNavbar navItems={NAV_ITEMS} currentPath={pathname} onNavigate={handleNavigate} />
      </div>

      <Sidebar
        navItems={NAV_ITEMS}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        mobile
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
    </div>
  );
}

export default App;
