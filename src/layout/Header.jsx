import React from "react";
import { HiOutlineMenu } from "react-icons/hi";

const Header = ({ setIsOpen }) => {
  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6">

      {/* Left Side */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-[#0A4B57]"
          onClick={() => setIsOpen(true)}
        >
          <HiOutlineMenu size={28} />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold text-[#0A4B57]">
          Dashboard
        </h2>

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 sm:gap-3">

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF7A1A] text-white flex items-center justify-center font-bold">
          S
        </div>

        <div className="hidden sm:block">
          <p className="font-semibold">Sufiyan</p>
          <p className="text-sm text-gray-500">Administrator</p>
        </div>

      </div>

    </header>
  );
};

export default Header;