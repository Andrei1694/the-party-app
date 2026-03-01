import BrandLogo from '../BrandLogo';
import { isPathActive } from '../../util';

const TopNavbar = ({
  title,
  onMenuClick,
  userLabel,
  userAvatarUrl,
  onProfileClick,
  navItems = [],
  currentPath,
  onNavigate,
}) => {
  const showDesktopNav = navItems.length > 0 && typeof onNavigate === 'function' && typeof currentPath === 'string';

  return (
    <header className="sticky top-0 z-30 border-b border-cusens-border bg-cusens-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-cusens-primary active:bg-cusens-surface-muted lg:hidden"
          aria-label="Open navigation menu"
        >
          <span className="material-icons">menu</span>
        </button>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-1 inline-flex items-center gap-2">
            <BrandLogo size="xs" showWordmark={false} />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-cusens-text-secondary">CUSENS</p>
          </div>
          <h1 className="truncate text-lg font-bold leading-tight text-cusens-text-primary">{title}</h1>
        </div>

        {showDesktopNav && (
          <nav className="hidden items-center gap-1 rounded-full border border-cusens-border bg-cusens-bg/70 p-1 lg:flex" aria-label="Primary navigation">
            {navItems.map((item) => {
              const active = isPathActive(currentPath, item.to);

              return (
                <button
                  key={item.key ?? `${item.to}-${item.label}`}
                  type="button"
                  onClick={() => onNavigate(item.to)}
                  className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                    active
                      ? 'bg-cusens-primary text-cusens-text-primary'
                      : 'text-cusens-text-secondary hover:bg-cusens-surface'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        <button
          type="button"
          onClick={onProfileClick}
          className="inline-flex max-w-[12rem] items-center gap-2 rounded-full border border-cusens-border bg-cusens-surface px-2 py-1 transition-colors hover:bg-cusens-surface-muted"
          aria-label="Open profile"
        >
          <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-cusens-border bg-cusens-bg">
            <img src={userAvatarUrl} alt={`${userLabel} avatar`} className="h-full w-full object-cover" />
          </span>
          <span className="hidden truncate text-sm font-semibold text-cusens-text-primary sm:inline">{userLabel}</span>
        </button>
      </div>
    </header>
  );
};

export default TopNavbar;
