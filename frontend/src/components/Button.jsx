import React from 'react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  ...buttonProps
}) => {
  const baseStyle =
    'w-full flex justify-center py-3.5 px-4 border rounded-xl shadow-md text-sm font-bold transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0';

  const primaryStyle =
    'border-transparent text-white bg-cusens-primary hover:bg-cusens-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cusens-primary transform hover:-translate-y-0.5';
  const secondaryStyle =
    'border-cusens-border text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200';

  const buttonStyle = variant === 'primary' ? primaryStyle : secondaryStyle;

  return (
    <button type={type} className={`${baseStyle} ${buttonStyle} ${className}`} {...buttonProps}>
      {children}
    </button>
  );
};

export default Button;
