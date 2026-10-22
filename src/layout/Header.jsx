
import React from "react";
import { HiOutlineMenu } from "react-icons/hi";

const Header = ({ setIsOpen }) => {
  // Get logged-in user from localStorage
  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  };

  const user = getUser();

  // Get username
  const username =
    user?.username ||
    user?.userName ||
    user?.name ||
    user?.user?.username ||
    user?.user?.name ||
    "User";

  // Get user role
  const role =
    user?.role ||
    user?.userType ||
    user?.user?.role ||
    user?.user?.userType ||
    "User";

  // First letter for profile icon
  const initial = username.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-4 sm:px-6">

      {/* Left Side */}
      <div className="flex items-center gap-3">

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="text-[#0A4B57]"
          onClick={() => setIsOpen(true)}
        >
          <HiOutlineMenu size={28} />
        </button>

        {/* MOSACH Logo */}
        <div className="relative flex items-center gap-3">

          <div className="w-12 h-12 rounded-2xl bg-[#EF8535] flex items-center justify-center shadow-lg">
            <span className="text-2xl font-black text-white">
              M
            </span>
          </div>

          <div>
            <h1 className="text-xl font-bold text-[#0A4B57]">
              MOSACH
              <span className="text-[#EF8535]"> ERP</span>
            </h1>

            <p className="text-[8px] text-black/80 uppercase tracking-[0.25em]">
              Enterprise Management
            </p>
          </div>

        </div>
      </div>

      {/* Right Side: Logged-in User */}
      <div className="flex items-center gap-2 sm:gap-3">

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FF7A1A] text-white flex items-center justify-center font-bold">
          {initial}
        </div>

        <div className="hidden sm:block">
          <p className="font-semibold text-gray-800">
            {username}
          </p>

          <p className="text-sm text-gray-500 capitalize">
            {role}
          </p>
        </div>

      </div>

    </header>
  );
};

export default Header;

