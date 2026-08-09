
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaShieldAlt,
    FaChartLine,
    FaBoxes,
    FaClipboardList,
    FaCheckCircle,
    FaIndustry,
    FaUsers,
} from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

function Login() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        if (!username.trim()) {

            Swal.fire({
                html: `
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 12px;margin-bottom: 22px;">
                        <div style="width: 48px; height: 48px; border-radius: 16px; background: #EF8535; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(239,133,53,0.25);">
                            <span style="color: white; font-size: 22px; font-weight: 900;">M</span>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 18px;font-weight: 700;color: #0A4B57;line-height: 1.2;">
                                MOSACH<span style="color: #EF8535;">ERP</span>
                            </div>
                            <div style="margin-top: 4px;font-size: 8px;color: #9CA3AF;text-transform: uppercase;letter-spacing: 2px;">
                                Enterprise Management
                            </div>
                        </div>
                    </div>
                    <!-- SUCCESS ICON -->
                    <div style="width: 58px;height: 58px;border-radius: 50%;background: rgba(239,133,53,0.10);color: #EF8535;display: flex;align-items: center;justify-content: center;font-size: 30px;font-weight: 700;margin-bottom: 14px;">
                        !
                    </div>
                    <div style="font-size: 22px;font-weight: 700;color: #0A4B57;">
                        Username Required
                    </div>
                    <div style="margin-top: 7px;font-size: 13px;color: #9CA3AF;">
                        Please enter your username.
                    </div>
                </div>
                `,
                // icon: "warning",
                // title: "Username Required",
                // text: "Please enter your username.",
                confirmButtonColor: "#EF8535",
            });

            return;
        }


        if (!password) {

            Swal.fire({
                html: `
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 12px;margin-bottom: 22px;">
                        <div style="width: 48px; height: 48px; border-radius: 16px; background: #EF8535; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(239,133,53,0.25);">
                            <span style="color: white; font-size: 22px; font-weight: 900;">M</span>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 18px;font-weight: 700;color: #0A4B57;line-height: 1.2;">
                                MOSACH<span style="color: #EF8535;">ERP</span>
                            </div>
                            <div style="margin-top: 4px;font-size: 8px;color: #9CA3AF;text-transform: uppercase;letter-spacing: 2px;">
                                Enterprise Management
                            </div>
                        </div>
                    </div>
                    <!-- SUCCESS ICON -->
                    <div style="width: 58px;height: 58px;border-radius: 50%;background: rgba(239,133,53,0.10);color: #EF8535;display: flex;align-items: center;justify-content: center;font-size: 30px;font-weight: 700;margin-bottom: 14px;">
                        !
                    </div>
                    <div style="font-size: 22px;font-weight: 700;color: #0A4B57;">
                        Password Required
                    </div>
                    <div style="margin-top: 7px;font-size: 13px;color: #9CA3AF;">
                        Please enter your password.
                    </div>
                </div>
                `,
                // icon: "warning",
                // title: "Password Required",
                // text: "Please enter your password.",
                confirmButtonColor: "#EF8535",


            });

            return;
        }


        try {

            setLoading(true);


            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        username: username.trim(),
                        password: password,
                    }),
                }
            );


            const data = await response.json();


            if (!response.ok) {

                Swal.fire({
                    html: `
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 12px;margin-bottom: 22px;">
                        <div style="width: 48px; height: 48px; border-radius: 16px; background: #EF8535; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(239,133,53,0.25);">
                            <span style="color: white; font-size: 22px; font-weight: 900;">M</span>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 18px;font-weight: 700;color: #0A4B57;line-height: 1.2;">
                                MOSACH<span style="color: #EF8535;">ERP</span>
                            </div>
                            <div style="margin-top: 4px;font-size: 8px;color: #9CA3AF;text-transform: uppercase;letter-spacing: 2px;">
                                Enterprise Management
                            </div>
                        </div>
                    </div>
                    <!-- SUCCESS ICON -->
                    <div style="width: 58px;height: 58px;border-radius: 50%;background: rgba(239,133,53,0.10);color: #EF8535;display: flex;align-items: center;justify-content: center;font-size: 30px;font-weight: 700;margin-bottom: 14px;">
                        X
                    </div>
                    <div style="font-size: 22px;font-weight: 700;color: #0A4B57;">
                        Login Failed
                    </div>
                    <div style="margin-top: 7px;font-size: 13px;color: #9CA3AF;">
                        ${data.message || "Invalid username or password."}
                    </div>
                </div>
                `,
                    // icon: "error",
                    // title: "Login Failed",
                    // text:
                    //     data.message ||
                    //     "Invalid username or password.",
                    confirmButtonColor: "#EF8535",
                });

                return;
            }


            // SAVE TOKEN

            localStorage.setItem(
                "token",
                data.token
            );


            // SAVE USER

            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }


            // SUCCESS MESSAGE
            await Swal.fire({
                html: `
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 12px;margin-bottom: 22px;">
                        <div style="width: 48px; height: 48px; border-radius: 16px; background: #EF8535; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(239,133,53,0.25);">
                            <span style="color: white; font-size: 22px; font-weight: 900;">M</span>
                        </div>
                        <div style="text-align: left;">
                            <div style="font-size: 18px;font-weight: 700;color: #0A4B57;line-height: 1.2;">
                                MOSACH<span style="color: #EF8535;">ERP</span>
                            </div>
                            <div style="margin-top: 4px;font-size: 8px;color: #9CA3AF;text-transform: uppercase;letter-spacing: 2px;">
                                Enterprise Management
                            </div>
                        </div>
                    </div>
                    <!-- SUCCESS ICON -->
                    <div style="width: 58px;height: 58px;border-radius: 50%;background: rgba(239,133,53,0.10);color: #EF8535;display: flex;align-items: center;justify-content: center;font-size: 30px;font-weight: 700;margin-bottom: 14px;">
                        ✓
                    </div>
                    <div style="font-size: 22px;font-weight: 700;color: #0A4B57;">
                        Login Successful
                    </div>
                    <div style="margin-top: 7px;font-size: 13px;color: #9CA3AF;">
                        Welcome to MOSACH ERP
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



            navigate("/dashboard", {
                replace: true,
            });

        }
        catch (error) {

            console.error(
                "Login Error:",
                error
            );

            Swal.fire({
                icon: "error",
                title: "Connection Error",
                text: "Unable to connect to server.",
                confirmButtonColor: "#EF8535",
            });

        }
        finally {

            setLoading(false);

        }
    };


    return (

        <div className="
            min-h-screen
            bg-[#EF8535]/10
            flex
            items-center
            justify-center
            p-4
            relative
            overflow-hidden
        ">


            {/* =====================================================
                BACKGROUND DECORATION
            ===================================================== */}

            <div className="
                absolute
                w-[420px]
                h-[420px]
                rounded-full
                bg-[#0A4B57]/5
                blur-3xl
                -top-40
                -left-40
            " />

            <div className="
                absolute
                w-[420px]
                h-[420px]
                rounded-full
                bg-[#EF8535]/5
                blur-3xl
                -bottom-40
                -right-40
            " />


            {/* Decorative circles */}

            <div className="
                absolute
                top-10
                right-10
                w-24
                h-24
                rounded-full
                border
                border-[#0A4B57]/10
            " />

            <div className="
                absolute
                bottom-10
                left-10
                w-32
                h-32
                rounded-full
                border
                border-[#EF8535]/10
            " />



            {/* =====================================================
                MAIN CARD
            ===================================================== */}

            <div className="
                relative
                z-10
                w-full
                max-w-[1100px]
                min-h-[650px]
                bg-white
                rounded-[32px]
                shadow-[0_30px_80px_rgba(10,75,87,0.13)]
                overflow-hidden
                grid
                lg:grid-cols-2
            ">


                {/* =================================================
                    LEFT SIDE
                ================================================= */}

                <div className="
                    hidden
                    lg:flex
                    relative
                    flex-col
                    justify-between
                    p-12
                    bg-[#0A4B57]
                    text-white
                    overflow-hidden
                ">


                    {/* Decorative circle */}

                    <div className="
                        absolute
                        -top-32
                        -right-32
                        w-80
                        h-80
                        rounded-full
                        bg-white/5
                    " />

                    <div className="
                        absolute
                        -bottom-40
                        -left-32
                        w-96
                        h-96
                        rounded-full
                        bg-[#EF8535]/10
                    " />



                    {/* BRAND */}

                    <div className="
                        relative
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            w-12
                            h-12
                            rounded-2xl
                            bg-[#EF8535]
                            flex
                            items-center
                            justify-center
                            shadow-lg
                        ">

                            <span className="
                                text-2xl
                                font-black
                            ">
                                M
                            </span>

                        </div>


                        <div>

                            <h1 className="
                                text-xl
                                font-bold
                            ">
                                MOSACH
                                <span className="text-[#EF8535]">
                                    ERP
                                </span>
                            </h1>


                            <p className="
                                text-[8px]
                                text-white/40
                                uppercase
                                tracking-[0.25em]
                            ">
                                Enterprise Management
                            </p>

                        </div>

                    </div>



                    {/* HERO */}

                    <div className="
                        relative
                        max-w-[470px]
                    ">

                        <div className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            bg-white/5
                            border
                            border-white/10
                            text-white/60
                            text-[9px]
                            uppercase
                            tracking-widest
                        ">

                            <FaIndustry
                                className="text-[#EF8535]"
                                size={10}
                            />

                            Smart ERP Platform

                        </div>


                        <h2 className="
                            mt-6
                            text-5xl
                            font-bold
                            leading-tight
                            tracking-tight
                        ">

                            Your business.
                            <br />

                            One powerful
                            <br />

                            <span className="text-[#EF8535]">
                                system.
                            </span>

                        </h2>


                        <p className="
                            mt-6
                            text-sm
                            leading-7
                            text-white/45
                        ">
                            Manage production, inventory,
                            customers, suppliers and daily
                            business operations from one
                            centralized platform.
                        </p>



                        {/* FEATURE CARDS */}

                        <div className="
                            mt-9
                            grid
                            grid-cols-3
                            gap-3
                        ">


                            {/* CARD 1 */}

                            <div className="
                                p-4
                                rounded-2xl
                                bg-white/5
                                border
                                border-white/10
                            ">

                                <div className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#EF8535]/10
                                    flex
                                    items-center
                                    justify-center
                                    text-[#EF8535]
                                ">

                                    <FaChartLine size={14} />

                                </div>


                                <p className="
                                    mt-3
                                    text-xs
                                    font-semibold
                                    
                                ">
                                    Analytics
                                </p>


                                <p className="
                                    mt-1
                                    text-[9px]
                                    text-white/30
                                ">
                                    Smart insights
                                </p>

                            </div>



                            {/* CARD 2 */}

                            <div className="
                                p-4
                                rounded-2xl
                                bg-white/5
                                border
                                border-white/10
                            ">

                                <div className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#EF8535]/10
                                    flex
                                    items-center
                                    justify-center
                                    text-[#EF8535]
                                ">

                                    <FaBoxes size={14} />

                                </div>


                                <p className="
                                    mt-3
                                    text-xs
                                    font-semibold
                                ">
                                    Inventory
                                </p>


                                <p className="
                                    mt-1
                                    text-[9px]
                                    text-white/30
                                ">
                                    Full control
                                </p>

                            </div>



                            {/* CARD 3 */}

                            <div className="
                                p-4
                                rounded-2xl
                                bg-white/5
                                border
                                border-white/10
                            ">

                                <div className="
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#EF8535]/10
                                    flex
                                    items-center
                                    justify-center
                                    text-[#EF8535]
                                ">

                                    <FaUsers size={14} />

                                </div>


                                <p className="
                                    mt-3
                                    text-xs
                                    font-semibold
                                ">
                                    Customers
                                </p>


                                <p className="
                                    mt-1
                                    text-[9px]
                                    text-white/30
                                ">
                                    Easy management
                                </p>

                            </div>

                        </div>

                    </div>



                    {/* FOOTER */}

                    <div className="
                        relative
                        flex
                        items-center
                        justify-between
                        text-[9px]
                        text-white/30
                    ">

                        <span>
                            © {new Date().getFullYear()} MOSACH International Pvt. Ltd.
                        </span>


                        <div className="
                            flex
                            items-center
                            gap-2
                        ">

                            <FaShieldAlt
                                className="text-[#EF8535]"
                                size={10}
                            />

                            Secure System

                        </div>

                    </div>

                </div>



                {/* =================================================
                    RIGHT SIDE
                ================================================= */}

                <div className="
                    flex
                    flex-col
                    justify-center
                    p-7
                    sm:p-10
                    lg:p-14
                ">


                    {/* MOBILE BRAND */}

                    <div className="
                        lg:hidden
                        flex
                        items-center
                        gap-3
                        mb-10
                    ">

                        <div className="
                            w-11
                            h-11
                            rounded-xl
                            bg-[#0A4B57]
                            flex
                            items-center
                            justify-center
                        ">

                            <span className="
                                text-[#EF8535]
                                text-xl
                                font-black
                            ">
                                M
                            </span>

                        </div>


                        <div>

                            <h1 className="
                                text-lg
                                font-bold
                                text-[#0A4B57]
                            ">
                                MOSACH
                                <span className="text-[#EF8535]">
                                    ERP
                                </span>
                            </h1>


                            <p className="
                                text-[8px]
                                uppercase
                                tracking-widest
                                text-gray-400
                            ">
                                Enterprise Management
                            </p>

                        </div>

                    </div>



                    {/* LOGIN TITLE */}

                    <div className="mb-8">

                        <div className="
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            bg-[#EF8535]/10
                            text-[#EF8535]
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-widest
                        ">

                            <FaShieldAlt size={9} />

                            Secure Login

                        </div>


                        <h2 className="
                            mt-5
                            text-4xl
                            font-bold
                            text-[#0A4B57]
                            tracking-tight
                        ">
                            Welcome back
                        </h2>


                        <p className="
                            mt-2
                            text-sm
                            text-gray-400
                        ">
                            Sign in to access your MOSACH ERP.
                        </p>

                    </div>



                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form onSubmit={handleLogin}>


                        {/* USERNAME */}

                        <div className="mb-5">

                            <label className="
                                block
                                mb-2
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-widest
                                text-[#0A4B57]
                            ">
                                Username
                            </label>


                            <div className="relative group">

                                <div className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#F1F5F6]
                                    flex
                                    items-center
                                    justify-center
                                    group-focus-within:bg-[#EF8535]/10
                                    transition
                                ">

                                    <FaUser
                                        size={12}
                                        className="
                                            text-gray-400
                                            group-focus-within:text-[#EF8535]
                                        "
                                    />

                                </div>


                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) =>
                                        setUsername(e.target.value)
                                    }
                                    placeholder="Enter username"
                                    autoComplete="username"

                                    className="
                                        w-full
                                        h-14
                                        pl-14
                                        pr-4
                                        rounded-2xl
                                        bg-[#F7F9FA]
                                        border
                                        border-[#E4EAEC]
                                        outline-none
                                        text-sm
                                        text-[#0A4B57]
                                        placeholder:text-gray-400
                                        focus:bg-white
                                        focus:border-[#EF8535]
                                        focus:ring-4
                                        focus:ring-[#EF8535]/10
                                        transition
                                    "
                                />

                            </div>

                        </div>



                        {/* PASSWORD */}

                        <div className="mb-5">

                            <label className="
                                block
                                mb-2
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-widest
                                text-[#0A4B57]
                            ">
                                Password
                            </label>


                            <div className="relative group">

                                <div className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    w-9
                                    h-9
                                    rounded-xl
                                    bg-[#F1F5F6]
                                    flex
                                    items-center
                                    justify-center
                                    group-focus-within:bg-[#EF8535]/10
                                    transition
                                ">

                                    <FaLock
                                        size={12}
                                        className="
                                            text-gray-400
                                            group-focus-within:text-[#EF8535]
                                        "
                                    />

                                </div>


                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter password"
                                    autoComplete="current-password"

                                    className="
                                        w-full
                                        h-14
                                        pl-14
                                        pr-14
                                        rounded-2xl
                                        bg-[#F7F9FA]
                                        border
                                        border-[#E4EAEC]
                                        outline-none
                                        text-sm
                                        text-[#0A4B57]
                                        placeholder:text-gray-400
                                        focus:bg-white
                                        focus:border-[#EF8535]
                                        focus:ring-4
                                        focus:ring-[#EF8535]/10
                                        transition
                                    "
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }

                                    className="
                                        absolute
                                        right-2
                                        top-1/2
                                        -translate-y-1/2
                                        w-10
                                        h-10
                                        rounded-xl
                                        flex
                                        items-center
                                        justify-center
                                        text-gray-400
                                        hover:text-[#EF8535]
                                        hover:bg-[#EF8535]/10
                                        transition
                                    "
                                >

                                    {showPassword ? (
                                        <FaEyeSlash size={14} />
                                    ) : (
                                        <FaEye size={14} />
                                    )}

                                </button>

                            </div>

                        </div>



                        {/* SECURITY INFO */}

                        <div className="
                            flex
                            items-center
                            justify-between
                            mb-6
                        ">

                            <div className="
                                flex
                                items-center
                                gap-2
                                text-[10px]
                                text-gray-400
                            ">

                                <FaCheckCircle
                                    className="text-[#EF8535]"
                                    size={11}
                                />

                                Secure authentication

                            </div>


                            <div className="
                                flex
                                items-center
                                gap-1.5
                                text-[9px]
                                text-green-500
                            ">

                                <span className="
                                    w-1.5
                                    h-1.5
                                    rounded-full
                                    bg-green-500
                                " />

                                System Online

                            </div>

                        </div>



                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}

                            className="
                                w-full
                                h-14
                                rounded-2xl
                                bg-[#0A4B57]
                                hover:bg-[#083E48]
                                text-white
                                font-bold
                                text-sm
                                flex
                                items-center
                                justify-center
                                gap-3
                                shadow-lg
                                disabled:opacity-60
                                disabled:cursor-not-allowed
                                active:scale-[0.98]
                                transition
                                group
                            "
                        >

                            {loading ? (

                                <>

                                    <span className="
                                        w-5
                                        h-5
                                        rounded-full
                                        border-2
                                        border-white/30
                                        border-t-white
                                        animate-spin
                                    " />

                                    Signing In...

                                </>

                            ) : (

                                <>

                                    Sign In to MOSACH ERP

                                    <span className="
                                        w-8
                                        h-8
                                        rounded-xl
                                        bg-[#EF8535]
                                        flex
                                        items-center
                                        justify-center
                                        group-hover:translate-x-1
                                        transition
                                    ">

                                        <FaArrowRight size={11} />

                                    </span>

                                </>

                            )}

                        </button>

                    </form>



                    {/* =================================================
                        SECURITY CARD
                    ================================================= */}

                    <div className="
                        mt-7
                        p-4
                        rounded-2xl
                        bg-[#F7F9FA]
                        border
                        border-[#E7EDEE]
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            w-10
                            h-10
                            rounded-xl
                            bg-[#0A4B57]
                            flex
                            items-center
                            justify-center
                            shrink-0
                        ">

                            <FaShieldAlt
                                className="text-[#EF8535]"
                                size={14}
                            />

                        </div>


                        <div>

                            <p className="
                                text-xs
                                font-bold
                                text-[#0A4B57]
                            ">
                                Protected Access
                            </p>


                            <p className="
                                text-[9px]
                                text-gray-400
                                mt-1
                            ">
                                Your session is protected by
                                secure authentication.
                            </p>

                        </div>

                    </div>



                    {/* COPYRIGHT */}

                    <p className="
                        text-center
                        mt-6
                        text-[9px]
                        text-gray-300
                    ">
                        © {new Date().getFullYear()}
                        {" "}
                        MOSACH International Pvt. Ltd.
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;

