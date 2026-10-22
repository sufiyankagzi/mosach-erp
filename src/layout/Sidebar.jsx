
import Swal from "sweetalert2";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
    MdKeyboardArrowDown,
    MdKeyboardArrowRight,
} from "react-icons/md";

import { IoClose } from "react-icons/io5";

import menuData from "../utils/menuData";

function Sidebar({ isOpen, setIsOpen }) {

    const [openMenu, setOpenMenu] = useState("");
    const [openSubMenu, setOpenSubMenu] = useState("");

    const navigate = useNavigate();

    // =====================================================
    // GET CURRENT USER ROLE
    // =====================================================

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
    ).trim().toUpperCase();

    const isAdmin = userRole === "ADMIN";

    // =====================================================
    // FILTER MENU
    // Uploads menu only visible to ADMIN
    // =====================================================

    const filteredMenuData = menuData.filter((item) => 
        { // Masters and Uploads only visible to Admin 
        const adminOnlyMenus = ["Masters", "Uploads"]; 
        
        if (adminOnlyMenus.includes(item.name) && !isAdmin) { 
                return false; 
            } 
                return true; });

    // =====================================================
    // MAIN MENU TOGGLE
    // =====================================================

    const toggleMenu = (menu) => {
        setOpenMenu((prev) => prev === menu ? "" : menu);
        setOpenSubMenu("");
    };

    // =====================================================
    // SUBMENU TOGGLE
    // =====================================================

    const toggleSubMenu = (menu) => {
        setOpenSubMenu((prev) => prev === menu ? "" : menu);
    };

    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = async () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setIsOpen(false);

        await Swal.fire({
            title: "Logout Successful",
            text: "You have been logged out successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        });

        navigate("/login", { replace: true });
    };

    // =====================================================
    // MENU CLICK
    // =====================================================

    const handleMenuClick = (item) => {

        if (item.action === "logout") {
            handleLogout();
            return;
        }

        setIsOpen(false);
    };

    // =====================================================
    // RECURSIVE SUBMENU
    // =====================================================

    const renderSubMenu = (sub) => {

        const SubIcon = sub.icon;

        // Nested submenu
        if (sub.submenu?.length > 0) {

            const isOpenSub = openSubMenu === sub.name;

            return (
                <div key={sub.name} className="w-full">

                    <button
                        type="button"
                        onClick={() => toggleSubMenu(sub.name)}
                        className="
                            w-full flex items-center justify-between
                            px-3 py-2 rounded-lg text-sm text-left
                            hover:bg-[#0E6674] transition
                        "
                    >

                        <div className="flex items-center gap-3">
                            {SubIcon && <SubIcon size={16} />}
                            <span>{sub.name}</span>
                        </div>

                        {isOpenSub
                            ? <MdKeyboardArrowDown size={20} />
                            : <MdKeyboardArrowRight size={20} />
                        }

                    </button>

                    {isOpenSub && (
                        <div className="ml-5 mt-1 space-y-1">
                            {sub.submenu.map((child) =>
                                renderSubMenu(child)
                            )}
                        </div>
                    )}

                </div>
            );
        }

        // Logout submenu
        if (sub.action === "logout") {
            return (
                <button
                    key={sub.name}
                    type="button"
                    onClick={handleLogout}
                    className="
                        w-full flex items-center gap-3
                        px-3 py-2 rounded-lg text-sm text-left
                        hover:bg-red-500/20 transition
                    "
                >
                    {SubIcon && <SubIcon size={16} />}
                    <span>{sub.name}</span>
                </button>
            );
        }

        // Normal link
        return (
            <NavLink
                key={sub.name}
                to={sub.path}
                onClick={() => handleMenuClick(sub)}
                className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2
                    rounded-lg text-sm transition
                    ${
                        isActive
                            ? "bg-[#FF7A1A]"
                            : "hover:bg-[#0E6674]"
                    }
                `}
            >
                {SubIcon && <SubIcon size={16} />}
                <span>{sub.name}</span>
            </NavLink>
        );
    };

    // =====================================================
    // SIDEBAR UI
    // =====================================================

    return (
        <>
            {/* Mobile overlay */}

            {isOpen && (
                <div
                    className="
                        fixed inset-0 bg-black/40
                        z-40 lg:hidden
                    "
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}

            <aside
                className={`
                    fixed top-0 left-0 z-50
                    w-72 lg:w-64 h-screen
                    overflow-y-auto bg-[#0A4B57]
                    text-white transform transition-transform
                    duration-300
                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }
                    lg:translate-x-0
                `}
            >

                {/* Header */}

                <div
                    className="
                        h-16 flex items-center justify-between
                        px-4 border-b border-white/10
                    "
                >

                    <h1 className="text-2xl font-bold">
                        MOSACH ERP
                    </h1>

                    <button
                        type="button"
                        className="lg:hidden"
                        onClick={() => setIsOpen(false)}
                    >
                        <IoClose size={28} />
                    </button>

                </div>

                {/* Navigation */}

                <nav className="p-4">

                    {filteredMenuData.map((item) => {

                        const Icon = item.icon;

                        // Menu without submenu
                        if (!item.submenu?.length) {

                            if (item.action === "logout") {
                                return (
                                    <button
                                        key={item.name}
                                        type="button"
                                        onClick={handleLogout}
                                        className="
                                            w-full flex items-center gap-3
                                            p-3 rounded-lg mb-2 text-left
                                            hover:bg-red-500/20 transition
                                        "
                                    >
                                        <Icon size={22} />
                                        <span>{item.name}</span>
                                    </button>
                                );
                            }

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => handleMenuClick(item)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 p-3
                                        rounded-lg mb-2 transition
                                        ${
                                            isActive
                                                ? "bg-[#FF7A1A]"
                                                : "hover:bg-[#0E6674]"
                                        }
                                    `}
                                >
                                    <Icon size={22} />
                                    <span>{item.name}</span>
                                </NavLink>
                            );
                        }

                        // Main menu with submenu
                        const isOpenMain = openMenu === item.name;

                        return (
                            <div key={item.name} className="mb-2">

                                <button
                                    type="button"
                                    onClick={() => toggleMenu(item.name)}
                                    className="
                                        w-full flex justify-between
                                        items-center p-3 rounded-lg
                                        hover:bg-[#0E6674] transition
                                    "
                                >

                                    <div className="flex items-center gap-3">
                                        <Icon size={22} />
                                        <span>{item.name}</span>
                                    </div>

                                    {isOpenMain
                                        ? <MdKeyboardArrowDown size={22} />
                                        : <MdKeyboardArrowRight size={22} />
                                    }

                                </button>

                                {isOpenMain && (
                                    <div className="ml-7 mt-2 space-y-1">
                                        {item.submenu.map((sub) =>
                                            renderSubMenu(sub)
                                        )}
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

