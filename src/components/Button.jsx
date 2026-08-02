import React from 'react'

const Button = ({
  children,
  type = "button",
  variant = "primary",
  onClick,
  icon,
  disabled = false,
  className = "",
}) => {

  const variants = {
    primary: "bg-[#0A4B57] hover:bg-[#083C45] text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-[#FF7A1A] hover:bg-orange-600 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2
        px-5 py-2.5
        rounded-xl
        font-medium
        transition-all
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;