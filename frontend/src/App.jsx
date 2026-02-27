import { useCallback, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from './auth/AuthContext';
import BottomNavbar from './components/navigation/BottomNavbar';
import Sidebar from './components/navigation/Sidebar';
import TopNavbar from './components/navigation/TopNavbar';
import { NAV_ITEMS, getRouteTitle, isShellRoute } from './navigation/navConfig';

const DEFAULT_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD7cbnwFcAoyOb5pOj744xfX7_cAy6Ugq1YRcDnUrEVaKSYqKlk4ZzDZw9sBVYTIHe_EBpEwhbBrT7l2rAcru-k3g_b8YkjAPWe_T42Hju-7OT_JINXzdE-jt0zyjKnnAIes_8YKHehNzLb-FExOKEGuhtu_gYOd2tjcvniKNxYzKjtTk9GWEessHgFR879XlRoXkoNIs0pzZMTSpRV7oIH5dogZfvbD8FEGA4CpkaLtBbAAyufOoeBrCe1-yxJfqJkycLR5BBaro8f';
const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.key !== 'profile');

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

  const userAvatarUrl = useMemo(() => {
    const profilePictureUrl = user?.userProfile?.profilePictureUrl?.trim() || '';
    return profilePictureUrl || DEFAULT_AVATAR_URL;
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

  const handleProfileClick = useCallback(() => {
    handleNavigate('/profile');
  }, [handleNavigate]);

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
        <TopNavbar
          title={title}
          onMenuClick={() => setMobileSidebarOpen(true)}
          userLabel={userLabel}
          userAvatarUrl={userAvatarUrl}
          onProfileClick={handleProfileClick}
        />
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-8 md:pt-6">
          <Outlet />
        </main>
        <BottomNavbar navItems={BOTTOM_NAV_ITEMS} currentPath={pathname} onNavigate={handleNavigate} />
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
