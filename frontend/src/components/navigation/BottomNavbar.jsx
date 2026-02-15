const isPathActive = (currentPath, targetPath) =>
  currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

const BottomNavbar = ({ navItems, currentPath, onNavigate }) => {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-cusens-border bg-cusens-surface/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
      aria-label="Primary navigation"
    >
      <div className="mx-auto grid max-w-md grid-cols-2 px-3 pt-2">
        {navItems.map((item) => {
          const active = isPathActive(currentPath, item.to);

          return (
            <button
              key={item.to}
              type="button"
              onClick={() => onNavigate(item.to)}
              className={`flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                active ? 'text-cusens-primary' : 'text-cusens-text-secondary'
              }`}
            >
              <span className="material-icons text-[22px]">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
