const isPathActive = (currentPath, targetPath) =>
  currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);

const Sidebar = ({ navItems, currentPath, onNavigate, onLogout, mobile, open, onClose }) => {
  const wrapperClassName = mobile
    ? `fixed inset-0 z-40 md:hidden ${open ? '' : 'pointer-events-none'}`
    : 'hidden w-72 shrink-0 border-r border-cusens-border bg-cusens-surface md:flex md:flex-col';

  const panelClassName = mobile
    ? `relative flex h-full w-72 flex-col border-r border-cusens-border bg-cusens-surface shadow-xl transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`
    : 'flex h-screen w-full flex-col';

  return (
    <div className={wrapperClassName} aria-hidden={mobile ? !open : undefined}>
      {mobile && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className={`absolute inset-0 bg-black/45 transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      <aside className={panelClassName} role={mobile ? 'dialog' : undefined} aria-modal={mobile ? true : undefined}>
        <div className="flex items-center justify-between border-b border-cusens-border px-5 py-5">
          <div>
            <p className="text-sm font-bold tracking-[0.2em] text-cusens-primary">CUSENS</p>
            <p className="text-xs text-cusens-text-secondary">Navigation</p>
          </div>
          {mobile && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-cusens-primary active:bg-gray-100"
              aria-label="Close sidebar"
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isPathActive(currentPath, item.to);

            return (
              <button
                key={item.key ?? `${item.to}-${item.label}`}
                type="button"
                onClick={() => onNavigate(item.to)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-cusens-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                <span className="material-icons text-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-cusens-border p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50 active:bg-red-100"
          >
            <span className="material-icons text-[20px]">logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
