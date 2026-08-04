import React from "react";

const FormTextarea = ({
  label,
  name,
  value,
  onChange,
  onBlur,

  placeholder = "",
  rows = 3,

  required = false,
  disabled = false,
  readOnly = false,

  error = "",
  maxLength,

  next,
  onLastEnter,

  className = "",
}) => {

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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

      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <textarea
        name={name}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={maxLength}
        autoComplete="off"
        className={`
          w-full
          p-3
          border
          rounded-lg
          resize-none
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
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
};

export default FormTextarea;