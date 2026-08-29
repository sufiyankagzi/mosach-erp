
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

    // =====================================================
    // OPEN MENU STATES
    // =====================================================

    // Main menu
    const [openMenu, setOpenMenu] = useState("");

    // Nested submenu
    const [openSubMenu, setOpenSubMenu] = useState("");

    const navigate = useNavigate();


    // =====================================================
    // MAIN MENU TOGGLE
    // =====================================================

    const toggleMenu = (menu) => {

        setOpenMenu((prev) =>
            prev === menu ? "" : menu
        );

        // Agar doosra main menu open kare
        // to nested menu close kar do
        setOpenSubMenu("");
    };


    // =====================================================
    // NESTED SUBMENU TOGGLE
    // =====================================================

    const toggleSubMenu = (menu) => {

        setOpenSubMenu((prev) =>
            prev === menu ? "" : menu
        );
    };


    // =====================================================
    // MENU CLICK
    // =====================================================

    const handleMenuClick = async (item) => {

        // =========================
        // LOGOUT
        // =========================

        if (item.action === "logout") {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setIsOpen(false);

            await Swal.fire({

                html: `
                    <div style="
                        display:flex;
                        flex-direction:column;
                        align-items:center;
                        text-align:center;
                    ">

                        <div style="
                            display:flex;
                            align-items:center;
                            gap:12px;
                            margin-bottom:22px;
                        ">

                            <div style="
                                width:48px;
                                height:48px;
                                border-radius:16px;
                                background:#EF8535;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                box-shadow:0 8px 20px rgba(239,133,53,0.25);
                            ">
                                <span style="
                                    color:white;
                                    font-size:22px;
                                    font-weight:900;
                                ">
                                    M
                                </span>
                            </div>

                            <div style="text-align:left;">

                                <div style="
                                    font-size:18px;
                                    font-weight:700;
                                    color:#0A4B57;
                                    line-height:1.2;
                                ">
                                    MOSACH<span style="color:#EF8535;">ERP</span>
                                </div>

                                <div style="
                                    margin-top:4px;
                                    font-size:8px;
                                    color:#9CA3AF;
                                    text-transform:uppercase;
                                    letter-spacing:2px;
                                ">
                                    Enterprise Management
                                </div>

                            </div>

                        </div>


                        <div style="
                            width:58px;
                            height:58px;
                            border-radius:50%;
                            background:rgba(239,133,53,0.10);
                            color:#EF8535;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            font-size:30px;
                            font-weight:700;
                            margin-bottom:14px;
                        ">
                            ✓
                        </div>


                        <div style="
                            font-size:22px;
                            font-weight:700;
                            color:#0A4B57;
                        ">
                            Logout Successful
                        </div>


                        <div style="
                            margin-top:7px;
                            font-size:13px;
                            color:#9CA3AF;
                        ">
                            You have been logged out successfully.
                        </div>

                    </div>
                `,

                timer: 2000,
                showConfirmButton: false,
                background: "#ffffff",
                width: "400px",
                padding: "28px",

                customClass: {
                    popup: "rounded-[28px] shadow-2xl",
                },
            });

            navigate("/login", {
                replace: true,
            });

            return;
        }

        // Mobile par menu click hone par sidebar close
        setIsOpen(false);
    };


    // =====================================================
    // RECURSIVE MENU ITEM
    // =====================================================

    const renderSubMenu = (sub, level = 0) => {

        const SubIcon = sub.icon;

        // =================================================
        // NESTED SUBMENU
        // =================================================

        if (sub.submenu) {

            const isOpenSub =
                openSubMenu === sub.name;

            return (
                <div
                    key={sub.name}
                    className="w-full"
                >

                    {/* ================================
                        NESTED MENU BUTTON
                    ================================= */}

                    <button
                        type="button"

                        onClick={() =>
                            toggleSubMenu(sub.name)
                        }

                        className="
                            w-full
                            flex
                            items-center
                            justify-between
                            px-3
                            py-2
                            rounded-lg
                            text-sm
                            text-left
                            hover:bg-[#0E6674]
                            transition
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            {SubIcon && (
                                <SubIcon size={16} />
                            )}

                            <span>
                                {sub.name}
                            </span>

                        </div>


                        {isOpenSub ? (

                            <MdKeyboardArrowDown
                                size={20}
                            />

                        ) : (

                            <MdKeyboardArrowRight
                                size={20}
                            />

                        )}

                    </button>


                    {/* =================================
                        NESTED CHILDREN
                    ================================== */}

                    {isOpenSub && (

                        <div
                            className="
                                ml-5
                                mt-1
                                space-y-1
                            "
                        >

                            {sub.submenu.map((child) =>
                                renderSubMenu(
                                    child,
                                    level + 1
                                )
                            )}

                        </div>

                    )}

                </div>
            );
        }


        // =================================================
        // LOGOUT SUBMENU
        // =================================================

        if (sub.action === "logout") {

            return (
                <button
                    key={sub.name}
                    type="button"

                    onClick={() =>
                        handleMenuClick(sub)
                    }

                    className="
                        w-full
                        flex
                        items-center
                        gap-3
                        px-3
                        py-2
                        rounded-lg
                        text-sm
                        text-left
                        hover:bg-red-500/20
                        transition
                    "
                >

                    {SubIcon && (
                        <SubIcon size={16} />
                    )}

                    {sub.name}

                </button>
            );
        }


        // =================================================
        // NORMAL LINK
        // =================================================

        return (
            <NavLink
                key={sub.name}
                to={sub.path}

                onClick={() =>
                    handleMenuClick(sub)
                }

                className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    px-3
                    py-2
                    rounded-lg
                    text-sm
                    transition

                    ${
                        isActive
                            ? "bg-[#FF7A1A]"
                            : "hover:bg-[#0E6674]"
                    }
                    `
                }
            >

                {SubIcon && (
                    <SubIcon size={16} />
                )}

                <span>
                    {sub.name}
                </span>

            </NavLink>
        );
    };


    // =====================================================
    // RETURN
    // =====================================================

    return (
        <>
            {/* =================================================
                OVERLAY
            ================================================= */}

            {isOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        bg-black/40
                        z-40
                        lg:hidden
                    "

                    onClick={() =>
                        setIsOpen(false)
                    }
                />

            )}


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside
                className={`
                    fixed
                    top-0
                    left-0
                    z-50
                    w-72
                    lg:w-64
                    h-screen
                    overflow-y-auto
                    bg-[#0A4B57]
                    text-white

                    transform
                    transition-transform
                    duration-300

                    ${
                        isOpen
                            ? "translate-x-0"
                            : "-translate-x-full"
                    }

                    lg:translate-x-0
                `}
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <div
                    className="
                        h-16
                        flex
                        items-center
                        justify-between
                        px-4
                        border-b
                        border-white/10
                    "
                >

                    <h1 className="text-2xl font-bold">
                        MOSACH ERP
                    </h1>


                    <button
                        type="button"

                        className="lg:hidden"

                        onClick={() =>
                            setIsOpen(false)
                        }
                    >
                        <IoClose size={28} />
                    </button>

                </div>


                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <nav className="p-4">

                    {menuData.map((item) => {

                        const Icon = item.icon;


                        // =============================================
                        // NO SUBMENU
                        // =============================================

                        if (!item.submenu) {

                            // =========================
                            // LOGOUT
                            // =========================

                            if (
                                item.action === "logout"
                            ) {

                                return (
                                    <button
                                        key={item.name}
                                        type="button"

                                        onClick={() =>
                                            handleMenuClick(item)
                                        }

                                        className="
                                            w-full
                                            flex
                                            items-center
                                            gap-3
                                            p-3
                                            rounded-lg
                                            mb-2
                                            text-left
                                            transition
                                            hover:bg-red-500/20
                                        "
                                    >

                                        <Icon size={22} />

                                        <span>
                                            {item.name}
                                        </span>

                                    </button>
                                );
                            }


                            // =========================
                            // NORMAL MENU
                            // =========================

                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}

                                    onClick={() =>
                                        handleMenuClick(item)
                                    }

                                    className={({ isActive }) =>
                                        `
                                        flex
                                        items-center
                                        gap-3
                                        p-3
                                        rounded-lg
                                        mb-2
                                        transition

                                        ${
                                            isActive
                                                ? "bg-[#FF7A1A]"
                                                : "hover:bg-[#0E6674]"
                                        }
                                        `
                                    }
                                >

                                    <Icon size={22} />

                                    <span>
                                        {item.name}
                                    </span>

                                </NavLink>
                            );
                        }


                        // =============================================
                        // MAIN MENU WITH SUBMENU
                        // =============================================

                        const isOpenMain =
                            openMenu === item.name;


                        return (
                            <div
                                key={item.name}
                                className="mb-2"
                            >

                                {/* =====================================
                                    MAIN MENU BUTTON
                                ====================================== */}

                                <button
                                    type="button"

                                    onClick={() =>
                                        toggleMenu(item.name)
                                    }

                                    className="
                                        w-full
                                        flex
                                        justify-between
                                        items-center
                                        p-3
                                        rounded-lg
                                        hover:bg-[#0E6674]
                                        transition
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                        "
                                    >

                                        <Icon size={22} />

                                        <span>
                                            {item.name}
                                        </span>

                                    </div>


                                    {isOpenMain ? (

                                        <MdKeyboardArrowDown
                                            size={22}
                                        />

                                    ) : (

                                        <MdKeyboardArrowRight
                                            size={22}
                                        />

                                    )}

                                </button>


                                {/* =====================================
                                    MAIN SUBMENU
                                ====================================== */}

                                {isOpenMain && (

                                    <div
                                        className="
                                            ml-7
                                            mt-2
                                            space-y-1
                                        "
                                    >

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

