const defaultWrapperClassName = 'overflow-hidden rounded-3xl border border-cusens-border bg-white shadow-sm';
const defaultBodyClassName = 'bg-gradient-to-r from-cusens-primary/10 via-cusens-primary/5 to-transparent px-6 py-6';

const PageFeedHeader = ({
  kicker,
  title,
  description,
  isRefreshing,
  onRefresh,
  refreshLabel = 'Refresh',
  refreshingLabel = 'Refreshing...',
  className = '',
  bodyClassName = defaultBodyClassName,
  children,
}) => (
  <header className={`${defaultWrapperClassName} ${className}`.trim()}>
    <div className={bodyClassName}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {kicker ? <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cusens-primary">{kicker}</p> : null}
          <h2 className="mt-2 text-2xl font-bold text-cusens-text-primary sm:text-3xl">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm text-cusens-text-secondary">{description}</p> : null}
          {children}
        </div>

        {onRefresh ? (
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-cusens-border bg-white px-3 py-2 text-sm font-semibold text-cusens-text-primary hover:bg-cusens-bg"
            disabled={isRefreshing}
          >
            <span className="material-icons text-[18px]">refresh</span>
            {isRefreshing ? refreshingLabel : refreshLabel}
          </button>
        ) : null}
      </div>
    </div>
  </header>
);

export default PageFeedHeader;
