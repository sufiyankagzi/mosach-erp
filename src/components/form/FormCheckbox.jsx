import React from 'react'
const FormCheckbox = ({
  label,
  name,
  checked,
  onChange,
  onLastEnter,
}) => {

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onLastEnter?.();
    }
  };

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        className="w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
};

export default FormCheckbox;