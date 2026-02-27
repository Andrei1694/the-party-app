import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...buttonProps
}) => {
  const baseStyle =
    'w-full flex justify-center py-3.5 px-4 border rounded-xl shadow-md text-sm font-bold font-display transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0';

  const primaryStyle =
    'border-cusens-primary text-cusens-text-primary bg-cusens-primary hover:bg-cusens-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-primary transform hover:-translate-y-0.5';
  const secondaryStyle =
    'border-cusens-border text-cusens-text-primary bg-cusens-surface hover:bg-cusens-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-border';

  const buttonStyle = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button type={type} className={`${baseStyle} ${buttonStyle} ${className}`} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;
