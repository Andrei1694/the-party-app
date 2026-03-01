import { useCallback, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from '@tanstack/react-router';
import { useAuth } from './auth/AuthContext';
import MobileLayout from './components/layout/MobileLayout';
import NormalLayout from './components/layout/NormalLayout';
import useIsPhone from './hooks/useIsPhone';
import { NAV_ITEMS, ROUTE_TITLES, SHELL_ENABLED_PATHS } from './navigation/navConfig';
import { getRouteTitle, isShellRoute } from './util';

const DEFAULT_AVATAR_URL =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD7cbnwFcAoyOb5pOj744xfX7_cAy6Ugq1YRcDnUrEVaKSYqKlk4ZzDZw9sBVYTIHe_EBpEwhbBrT7l2rAcru-k3g_b8YkjAPWe_T42Hju-7OT_JINXzdE-jt0zyjKnnAIes_8YKHehNzLb-FExOKEGuhtu_gYOd2tjcvniKNxYzKjtTk9GWEessHgFR879XlRoXkoNIs0pzZMTSpRV7oIH5dogZfvbD8FEGA4CpkaLtBbAAyufOoeBrCe1-yxJfqJkycLR5BBaro8f';
const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.key !== 'profile');

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isPhone = useIsPhone();
  const pathname = location.pathname;
  const showShell = isShellRoute(pathname, SHELL_ENABLED_PATHS);
  const title = getRouteTitle(pathname, SHELL_ENABLED_PATHS, ROUTE_TITLES);

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

  const handleNavigate = useCallback((to) => {
    navigate({ to });
  }, [navigate]);

  const handleLogout = useCallback(async () => {
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

  const shellContent = <Outlet />;

  if (isPhone) {
    return (
      <MobileLayout
        title={title}
        userLabel={userLabel}
        userAvatarUrl={userAvatarUrl}
        navItems={NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        currentPath={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      >
        {shellContent}
      </MobileLayout>
    );
  }

  return (
    <NormalLayout
      title={title}
      userLabel={userLabel}
      userAvatarUrl={userAvatarUrl}
      navItems={NAV_ITEMS}
      currentPath={pathname}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      onProfileClick={handleProfileClick}
    >
      {shellContent}
    </NormalLayout>
  );
}

export default App;
