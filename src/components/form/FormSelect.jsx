import React from "react";

const FormSelect = ({
  label,
  name,
  value,
  onChange,
  onBlur,

  options = [],
  placeholder = "Select",

  required = false,
  disabled = false,
  error = "",

  next,
  onLastEnter,

  className = "",
}) => {

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      if (next) {
        document.getElementsByName(next)[0]?.focus();
      } else if (onLastEnter) {
        onLastEnter();
      }

    }

  };

  return (
    <div className="w-full">

      {/* Label */}
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700">
          {label}
          {required && (
            <span className="text-red-500"> *</span>
          )}
        </label>
      )}

      {/* Select */}
      <select
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full
          h-11
          px-3
          rounded-lg
          border
          outline-none
          transition-all
          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-300"
              : "border-gray-300 focus:border-[#0A4B57] focus:ring-2 focus:ring-[#0A4B57]/20"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          ${className}
        `}
      >

        <option value="">
          {placeholder}
        </option>

        {options.map((item) => (
          <option
            key={item.value}
            value={item.value}
          >
            {item.label}
          </option>
        ))}

      </select>

      {/* Error */}
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
};

export default FormSelect;