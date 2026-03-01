import React from 'react';

const InputField = ({
  label,
  id,
  name,
  type,
  placeholder,
  icon,
  value,
  onChange,
  onBlur,
  showVisibilityToggle,
  error,
  ...inputProps
}) => {
  return (
    <div className="group">
      <label className="mb-1.5 ml-1 block text-sm font-medium text-cusens-text-primary" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-icons text-cusens-text-secondary text-xl group-focus-within:text-cusens-primary transition-colors">
            {icon}
          </span>
        </div>
        <input
          className="block w-full rounded-xl border border-cusens-border bg-cusens-surface py-3 pl-10 pr-3 leading-5 text-cusens-text-primary placeholder-cusens-text-secondary/70 transition duration-200 ease-in-out focus:border-cusens-primary focus:outline-none focus:ring-2 focus:ring-cusens-primary sm:text-sm"
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          {...inputProps}
        />
        {showVisibilityToggle && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer">
            <span className="material-icons text-cusens-text-secondary hover:text-cusens-text-primary text-xl transition-colors">
              visibility_off
            </span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 ml-1">{error}</p>}
    </div>
  );
};

export default InputField;
