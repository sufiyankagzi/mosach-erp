import React, { useRef } from "react";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";

const FormUpload = ({
  label,
  name,
  file,
  preview,
  onChange,
  onRemove,
  accept = "image/*",
  error = "",
  next,
  onLastEnter,
}) => {
  const inputRef = useRef();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (next) {
        document.getElementsByName(next)?.[0]?.focus();
      } else if (onLastEnter) {
        onLastEnter();
      }
    }
  };

  return (
    <div className="w-full">

      {label && (
        <label className="block mb-2 text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div
        className="border-2 border-dashed border-gray-300 rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition relative"
        onClick={() => inputRef.current.click()}
      >

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-36 object-contain"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
            >
              <FaTrash size={12} />
            </button>
          </>
        ) : (
          <>
            <FaCloudUploadAlt
              size={45}
              className="text-gray-400"
            />

            <p className="mt-3 text-gray-500">
              Click to Upload
            </p>

            <p className="text-xs text-gray-400">
              PNG, JPG, JPEG
            </p>
          </>
        )}

        <input
          ref={inputRef}
          hidden
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          onKeyDown={handleKeyDown}
        />

      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">
          {error}
        </p>
      )}

    </div>
  );
};

export default FormUpload;