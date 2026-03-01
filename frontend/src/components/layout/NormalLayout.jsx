import TopNavbar from '../navigation/TopNavbar';

const NormalLayout = ({
  title,
  userLabel,
  userAvatarUrl,
  navItems,
  currentPath,
  onNavigate,
  onProfileClick,
  children,
}) => {
  return (
    <div className="min-h-screen bg-cusens-bg">
      <div className="flex min-h-screen flex-1 flex-col font-display">
        <TopNavbar
          title={title}
          userLabel={userLabel}
          userAvatarUrl={userAvatarUrl}
          navItems={navItems}
          currentPath={currentPath}
          onNavigate={onNavigate}
          onProfileClick={onProfileClick}
        />
        <main className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-6 md:px-8 md:pb-8 md:pt-6">{children}</main>
      </div>
    </div>
  );
};

export default NormalLayout;
