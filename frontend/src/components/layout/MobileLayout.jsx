import { useCallback, useState } from 'react';
import BottomNavbar from '../navigation/BottomNavbar';
import Sidebar from '../navigation/Sidebar';
import TopNavbar from '../navigation/TopNavbar';

const MobileLayout = ({
  title,
  userLabel,
  userAvatarUrl,
  navItems,
  bottomNavItems,
  currentPath,
  onNavigate,
  onLogout,
  onProfileClick,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleNavigate = useCallback(
    (to) => {
      setMobileSidebarOpen(false);
      onNavigate(to);
    },
    [onNavigate],
  );

  const handleLogout = useCallback(async () => {
    setMobileSidebarOpen(false);
    await onLogout();
  }, [onLogout]);

  return (
    <div className="min-h-screen bg-cusens-bg">
      <div className="flex min-h-screen flex-1 flex-col font-display">
        <TopNavbar
          title={title}
          onMenuClick={() => setMobileSidebarOpen(true)}
          userLabel={userLabel}
          userAvatarUrl={userAvatarUrl}
          onProfileClick={onProfileClick}
        />
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6">{children}</main>
        <BottomNavbar navItems={bottomNavItems} currentPath={currentPath} onNavigate={handleNavigate} />
      </div>

      <Sidebar
        navItems={navItems}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        mobile
        open={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
    </div>
  );
};

export default MobileLayout;
