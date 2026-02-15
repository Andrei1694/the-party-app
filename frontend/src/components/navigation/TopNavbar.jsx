const TopNavbar = ({ title, onMenuClick, userLabel }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-cusens-border bg-cusens-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cusens-primary active:bg-gray-100 md:hidden"
          aria-label="Open navigation menu"
        >
          <span className="material-icons">menu</span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cusens-text-secondary">CUSENS</p>
          <h1 className="truncate text-lg font-bold leading-tight text-gray-900">{title}</h1>
        </div>

        <div className="hidden max-w-[16rem] items-center gap-2 rounded-full border border-cusens-border bg-white px-3 py-2 md:flex">
          <span className="material-icons text-cusens-primary">account_circle</span>
          <span className="truncate text-sm font-semibold text-gray-700">{userLabel}</span>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
