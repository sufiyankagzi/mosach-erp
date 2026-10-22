
import { useState } from "react";
import Swal from "sweetalert2";
import { NavLink, useNavigate } from "react-router-dom";

import {
    MdKeyboardArrowDown,
    MdKeyboardArrowRight,
} from "react-icons/md";

import { IoClose } from "react-icons/io5";

import menuData from "../utils/menuData";

function Sidebar({ isOpen, setIsOpen }) {
    const [openMenu, setOpenMenu] = useState("");
    const navigate = useNavigate();

    // ==========================================
    // GET USER
    // ==========================================

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    };

    const user = getUser();

    const userRole = String(
        user?.role ??
        user?.userType ??
        user?.user?.role ??
        user?.user?.userType ??
        ""
    )
        .trim()
        .toUpperCase();

    const isAdmin = userRole === "ADMIN";

    // ==========================================
    // FILTER MENU
    // Masters and Uploads: ADMIN ONLY
    // Reports: ALL USERS
    // ==========================================

    const filteredMenuData = menuData.filter((item) => {
        const adminOnlyMenus = ["Masters", "Uploads"];

        if (adminOnlyMenus.includes(item.name) && !isAdmin) {
            return false;
        }

        return true;
    });

    // ==========================================
    // MENU TOGGLE
    // ==========================================

    const toggleMenu = (menuName) => {
        setOpenMenu((previous) =>
            previous === menuName ? "" : menuName
        );
    };

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to logout from MOSACH ERP?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#0A4B57",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, Logout",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        sessionStorage.clear();

        setIsOpen(false);

        await Swal.fire({
            title: "Logout Successful",
            text: "You have been logged out successfully.",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
        });

        navigate("/login", { replace: true });
    };

    // ==========================================
    // MENU CLICK
    // ==========================================

    const handleMenuClick = () => {
        setIsOpen(false);
        setOpenMenu("");
    };

    // ==========================================
    // SIDEBAR UI
    // ==========================================

    return (
        <>
            {/* MOBILE OVERLAY */}

            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* SIDEBAR */}

            <aside
                className={`
                    fixed top-0 left-0 z-50
                    w-72 lg:w-64 h-screen
                    overflow-y-auto
                    bg-[#0A4B57] text-white
                    shadow-xl
                    transform transition-transform duration-300
                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                    lg:translate-x-0
                `}
            >
                {/* HEADER */}

                <div
                    className="
                        h-16 flex items-center justify-between
                        px-4 border-b border-white/10
                        sticky top-0 bg-[#0A4B57] z-10
                    "
                >
                    <h1 className="text-xl font-bold tracking-wide">
                        MOSACH ERP
                    </h1>

                    <button
                        type="button"
                        className="lg:hidden hover:text-orange-400"
                        onClick={() => setIsOpen(false)}
                        aria-label="Close sidebar"
                    >
                        <IoClose size={28} />
                    </button>
                </div>

                {/* NAVIGATION */}

                <nav className="p-3 space-y-1">

                    {filteredMenuData.map((item) => {
                        const Icon = item.icon;

                        const hasSubmenu =
                            Array.isArray(item.submenu) &&
                            item.submenu.length > 0;

                        // ==================================
                        // LOGOUT
                        // ==================================

                        if (item.action === "logout") {
                            return (
                                <button
                                    key={item.name}
                                    type="button"
                                    onClick={handleLogout}
                                    className="
                                        w-full flex items-center gap-3
                                        p-3 rounded-lg text-left
                                        text-white
                                        hover:bg-red-500/20
                                        transition duration-200
                                    "
                                >
                                    {Icon && <Icon size={22} />}

                                    <span>{item.name}</span>
                                </button>
                            );
                        }

                        // ==================================
                        // NORMAL MENU WITHOUT SUBMENU
                        // ==================================

                        if (!hasSubmenu) {
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={handleMenuClick}
                                    className={({ isActive }) => `
                                        flex items-center gap-3
                                        p-3 rounded-lg
                                        transition duration-200
                                        ${
                                            isActive
                                                ? "bg-[#FF7A1A] text-white shadow-md"
                                                : "text-white hover:bg-[#0E6674]"
                                        }
                                    `}
                                >
                                    {Icon && <Icon size={22} />}

                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        }

                        // ==================================
                        // MENU WITH SUBMENU
                        // ==================================

                        const isOpenMain = openMenu === item.name;

                        return (
                            <div key={item.name} className="w-full">

                                <button
                                    type="button"
                                    onClick={() => toggleMenu(item.name)}
                                    className={`
                                        w-full flex items-center
                                        justify-between p-3
                                        rounded-lg transition duration-200
                                        ${
                                            isOpenMain
                                                ? "bg-[#0E6674]"
                                                : "hover:bg-[#0E6674]"
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        {Icon && <Icon size={22} />}

                                        <span>{item.name}</span>
                                    </div>

                                    {isOpenMain ? (
                                        <MdKeyboardArrowDown size={22} />
                                    ) : (
                                        <MdKeyboardArrowRight size={22} />
                                    )}
                                </button>

                                {/* SUBMENU ITEMS */}

                                {isOpenMain && (
                                    <div
                                        className="
                                            ml-4 mt-2 mb-2 pl-3
                                            border-l-2 border-white/20
                                            space-y-1
                                        "
                                    >
                                        {item.submenu.map((sub) => {
                                            const SubIcon = sub.icon;

                                            return (
                                                <NavLink
                                                    key={sub.path || sub.name}
                                                    to={sub.path}
                                                    onClick={handleMenuClick}
                                                    className={({ isActive }) => `
                                                        flex items-center gap-3
                                                        px-3 py-2.5
                                                        rounded-lg text-sm
                                                        transition duration-200
                                                        ${
                                                            isActive
                                                                ? "bg-[#FF7A1A] text-white shadow"
                                                                : "text-white/90 hover:bg-[#0E6674]"
                                                        }
                                                    `}
                                                >
                                                    {SubIcon && (
                                                        <SubIcon size={18} />
                                                    )}

                                                    <span>{sub.name}</span>
                                                </NavLink>
                                            );
                                        })}
                                    </div>
                                )}

                            </div>
                        );
                    })}

                </nav>

                {/* FOOTER */}

                <div className="px-4 py-4 mt-4 border-t border-white/10">
                    <p className="text-xs text-white/50">
                        MOSACH ERP System
                    </p>
                </div>

            </aside>
        </>
    );
}

export default Sidebar;

