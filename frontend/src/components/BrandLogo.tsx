import cusensMark from '../assets/logos/cusens-mark.svg';

const sizeMap = {
  xs: {
    mark: 'h-6 w-6',
    word: 'text-xs',
    tracking: 'tracking-[0.16em]',
    tagline: 'text-[10px]',
  },
  sm: {
    mark: 'h-8 w-8',
    word: 'text-sm',
    tracking: 'tracking-[0.18em]',
    tagline: 'text-[11px]',
  },
  md: {
    mark: 'h-10 w-10',
    word: 'text-base',
    tracking: 'tracking-[0.2em]',
    tagline: 'text-xs',
  },
  lg: {
    mark: 'h-12 w-12',
    word: 'text-2xl',
    tracking: 'tracking-[0.2em]',
    tagline: 'text-xs',
  },
  xl: {
    mark: 'h-20 w-20',
    word: 'text-3xl',
    tracking: 'tracking-[0.24em]',
    tagline: 'text-sm',
  },
};

const BrandLogo = ({
  size = 'md',
  showWordmark = true,
  tagline,
  className = '',
  wordmarkClassName = '',
  taglineClassName = '',
}) => {
  const token = sizeMap[size] ?? sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <img src={cusensMark} alt="CUSENS logo mark" className={`${token.mark} shrink-0`} />
      {showWordmark ? (
        <div className="flex flex-col">
          <p
            className={`font-display font-bold uppercase leading-none text-cusens-text-primary ${token.word} ${token.tracking} ${wordmarkClassName}`.trim()}
          >
            CUSENS
          </p>
          {tagline ? (
            <p className={`mt-1 leading-none text-cusens-text-secondary ${token.tagline} ${taglineClassName}`.trim()}>
              {tagline}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default BrandLogo;
