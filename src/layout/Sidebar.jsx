import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import menuData from "../utils/menuData";

function Sidebar({ isOpen, setIsOpen }) {
  const [openMenu, setOpenMenu] = useState("");

  const toggleMenu = (menu) => {
    setOpenMenu((prev) => (prev === menu ? "" : menu));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          w-72 lg:w-64 h-screen overflow-y-auto
          bg-[#0A4B57] text-white
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          <h1 className="text-2xl font-bold">
            MOSACH ERP
          </h1>

          <button
            className="lg:hidden"
            onClick={() => setIsOpen(false)}
          >
            <IoClose size={28} />
          </button>
        </div>

        <nav className="p-4">
          {menuData.map((item) => {
            const Icon = item.icon;

            if (!item.submenu) {
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-3 rounded-lg mb-2 transition ${
                      isActive
                        ? "bg-[#FF7A1A]"
                        : "hover:bg-[#0E6674]"
                    }`
                  }
                >
                  <Icon size={22} />
                  {item.name}
                </NavLink>
              );
            }

            return (
              <div key={item.name} className="mb-2">
                <button
                  onClick={() => toggleMenu(item.name)}
                  className="w-full flex justify-between items-center p-3 rounded-lg hover:bg-[#0E6674]"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={22} />
                    {item.name}
                  </div>

                  {openMenu === item.name ? (
                    <MdKeyboardArrowDown size={22} />
                  ) : (
                    <MdKeyboardArrowRight size={22} />
                  )}
                </button>

                {openMenu === item.name && (
                  <div className="ml-7 mt-2 space-y-1">
                    {item.submenu.map((sub) => {
                      const SubIcon = sub.icon;

                      return (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setIsOpen(false)}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                              isActive
                                ? "bg-[#FF7A1A]"
                                : "hover:bg-[#0E6674]"
                            }`
                          }
                        >
                          <SubIcon size={16} />
                          {sub.name}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;