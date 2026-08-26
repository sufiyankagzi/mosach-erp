import React, { forwardRef } from "react";

const FormInput = forwardRef(({
  label,
  name,
  value,
  onChange,
  onBlur,
  onKeyDown,

  type = "text",
  placeholder = "",

  required = false,
  disabled = false,
  readOnly = false,

  error = "",
  maxLength,
  next,
  onLastEnter,
  className = "",
}, ref) => {

  const handleKeyDown = (e) => {

    if (e.key === "Enter") {

      e.preventDefault();

      // Agar next field diya hai
      if (next) {

        document
          .getElementsByName(next)[0]
          ?.focus();

      }

      // Agar last field hai
      else if (onLastEnter) {

        onLastEnter();

      }

    }

    // Parent se onKeyDown bhi diya ho to
    if (onKeyDown) {
      onKeyDown(e);
    }

  };

  return (
    <div className="w-full">

      {/* LABEL */}
      {label && (
        <label className="block mb-1 text-sm font-medium text-slate-700">

          {label}

          {required && (
            <span className="text-red-500">
              {" "}*
            </span>
          )}

        </label>
      )}

      {/* INPUT */}
      <input
        ref={ref}
        type={type}
        name={name}
        value={value}
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
      />

      {/* ERROR */}
      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}

    </div>
  );
});

export default FormInput;