const toneClassNames = {
  neutral: 'border-cusens-border bg-white text-cusens-text-secondary shadow-sm',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

const actionToneClassNames = {
  neutral: 'border-cusens-border bg-white text-cusens-text-primary hover:bg-cusens-bg',
  danger: 'border-red-200 bg-white text-red-700 hover:bg-red-100',
};

const AsyncStateCard = ({
  tone = 'neutral',
  message,
  actionLabel,
  onAction,
  actionDisabled = false,
  className = '',
  children,
}) => {
  const resolvedTone = toneClassNames[tone] ? tone : 'neutral';

  return (
    <div className={`rounded-3xl border p-6 text-sm ${toneClassNames[resolvedTone]} ${className}`.trim()}>
      <p>{message}</p>

      {(actionLabel && onAction) || children ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {actionLabel && onAction ? (
            <button
              type="button"
              onClick={onAction}
              disabled={actionDisabled}
              className={`inline-flex items-center rounded-xl border px-3 py-2 text-sm font-semibold ${actionToneClassNames[resolvedTone]} disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {actionLabel}
            </button>
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  );
};

export default AsyncStateCard;
