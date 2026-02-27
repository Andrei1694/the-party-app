const TopNavbar = ({ title, onMenuClick, userLabel, userAvatarUrl, onProfileClick }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-cusens-border bg-cusens-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cusens-primary active:bg-cusens-surface-muted md:hidden"
          aria-label="Open navigation menu"
        >
          <span className="material-icons">menu</span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cusens-text-secondary">CUSENS</p>
          <h1 className="truncate text-lg font-bold leading-tight text-cusens-text-primary">{title}</h1>
        </div>

        <button
          type="button"
          onClick={onProfileClick}
          className="inline-flex max-w-[12rem] items-center gap-2 rounded-full border border-cusens-border bg-cusens-surface px-2 py-1 transition-colors hover:bg-cusens-surface-muted"
          aria-label="Open profile"
        >
          <img
            src={userAvatarUrl}
            alt={`${userLabel} avatar`}
            className="h-8 w-8 rounded-full border border-cusens-border object-cover"
          />
          <span className="hidden truncate text-sm font-semibold text-cusens-text-primary sm:inline">{userLabel}</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
