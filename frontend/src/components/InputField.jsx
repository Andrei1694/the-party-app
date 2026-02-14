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
      <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="material-icons text-gray-400 text-xl group-focus-within:text-cusens-primary transition-colors">
            {icon}
          </span>
        </div>
        <input
          className="block w-full pl-10 pr-3 py-3 border border-cusens-border rounded-xl leading-5 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cusens-primary focus:border-cusens-primary sm:text-sm transition duration-200 ease-in-out"
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
            <span className="material-icons text-gray-400 hover:text-gray-600 text-xl transition-colors">
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
