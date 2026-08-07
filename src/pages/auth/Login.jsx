import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const API_URL = import.meta.env.VITE_API_URL;
import {
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaArrowRight,
    FaShieldAlt
} from "react-icons/fa";

const Login = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);


    // INPUT CHANGE
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };


    // LOGIN
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.username.trim()) {

            Swal.fire({
                icon: "warning",
                title: "Username Required",
                text: "Please enter your username.",
                confirmButtonColor: "#EF8535"
            });

            return;
        }


        if (!formData.password) {

            Swal.fire({
                icon: "warning",
                title: "Password Required",
                text: "Please enter your password.",
                confirmButtonColor: "#EF8535"
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
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: formData.username.trim(),
            password: formData.password
        })
    }
);
            // const response = await fetch(
            //     "http://localhost:5000/api/auth/login",
            //     {
            //         method: "POST",

            //         headers: {
            //             "Content-Type": "application/json"
            //         },

            //         body: JSON.stringify({
            //             username: formData.username.trim(),
            //             password: formData.password
            //         })
            //     }
            // );


            const data = await response.json();


            // INVALID LOGIN
            if (!response.ok) {

                Swal.fire({
                    icon: "error",
                    title: "Login Failed",
                    text:
                        data.message ||
                        "Invalid username or password.",
                    confirmButtonColor: "#EF8535",
                    confirmButtonText: "Try Again"
                });

                return;
            }


            // TOKEN SAVE
            localStorage.setItem("token", data.token);

console.log("LOGIN RESPONSE:", data);
console.log("JWT TOKEN:", data.token);
console.log("SAVED TOKEN:", localStorage.getItem("token"));


            // USER SAVE
            if (data.user) {

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );
            }


            // SUCCESS
            await Swal.fire({
                icon: "success",
                title: "Login Successful",
                text: "Welcome to MOSACH ERP.",
                timer: 1200,
                showConfirmButton: false,
                iconColor: "#EF8535"
            });


            // DASHBOARD
            navigate("/dashboard");


        } catch (error) {

            console.error("Login Error:", error);


            Swal.fire({
                icon: "error",
                title: "Server Error",
                text: "Unable to connect to server.",
                confirmButtonColor: "#EF8535"
            });

        } finally {

            setLoading(false);
        }
    };


return (
    <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center p-4 sm:p-6 overflow-hidden">

        {/* BACKGROUND DECORATION */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">

            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#0B4654]/10 blur-3xl" />

            <div className="absolute -bottom-40 -right-40 w-[550px] h-[550px] rounded-full bg-[#EF8535]/10 blur-3xl" />

            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#0B4654]/5" />

        </div>


        {/* MAIN CARD */}
        <div
            className="
                relative z-10
                w-full max-w-[1100px]
                min-h-[650px]
                bg-white
                rounded-[32px]
                overflow-hidden
                shadow-[0_30px_100px_rgba(15,45,55,0.16)]
                border border-white
                grid lg:grid-cols-[1fr_0.85fr]
            "
        >


            {/* =====================================================
                LEFT BRANDING PANEL
            ===================================================== */}

            <div
                className="
                    relative
                    hidden lg:flex
                    flex-col
                    justify-between
                    overflow-hidden
                    p-12
                    bg-[#083F4D]
                "
            >

                {/* Decorative circles */}

                <div className="
                    absolute
                    -top-32
                    -right-32
                    w-[420px]
                    h-[420px]
                    rounded-full
                    border-[70px]
                    border-white/[0.035]
                " />

                <div className="
                    absolute
                    -bottom-40
                    -left-40
                    w-[500px]
                    h-[500px]
                    rounded-full
                    bg-[#EF8535]/[0.06]
                " />

                <div className="
                    absolute
                    top-[40%]
                    right-[-80px]
                    w-52
                    h-52
                    rounded-full
                    border
                    border-[#EF8535]/10
                " />


                {/* TOP */}

                <div className="relative z-10">

                    {/* LOGO */}

                    <div className="flex items-center gap-4">

                        <div
                            className="
                                w-14 h-14
                                rounded-2xl
                                bg-gradient-to-br
                                from-[#EF8535]
                                to-[#D9681D]
                                flex items-center justify-center
                                shadow-[0_12px_30px_rgba(239,133,53,0.25)]
                            "
                        >
                            <span className="text-white text-2xl font-black">
                                M
                            </span>
                        </div>

                        <div>

                            <h1 className="text-white text-2xl font-bold tracking-tight">
                                MOSACH
                            </h1>

                            <p className="text-white/45 text-[11px] tracking-[0.25em] uppercase">
                                Enterprise ERP
                            </p>

                        </div>

                    </div>


                    {/* HERO */}

                    <div className="mt-24 max-w-[460px]">

                        <div
                            className="
                                inline-flex items-center gap-2
                                px-3 py-1.5
                                rounded-full
                                bg-white/[0.06]
                                border border-white/10
                                text-white/60
                                text-xs
                            "
                        >

                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF8535]" />

                            Secure Business Management

                        </div>


                        <h2
                            className="
                                mt-6
                                text-4xl
                                xl:text-5xl
                                font-bold
                                leading-[1.08]
                                text-white
                            "
                        >
                            Confidence begins
                            <br />

                            <span className="text-[#EF8535]">
                                with MOSACH.
                            </span>
                        </h2>


                        <p className="
                            mt-6
                            text-white/50
                            text-sm
                            leading-7
                            max-w-[410px]
                        ">
                            A powerful enterprise platform designed to
                            simplify operations, manage resources and
                            keep your business connected.
                        </p>

                    </div>


                    {/* FEATURES */}

                    <div className="mt-10 grid grid-cols-3 gap-3 max-w-[460px]">

                        <div className="
                            rounded-2xl
                            bg-white/[0.045]
                            border border-white/[0.07]
                            p-4
                        ">

                            <div className="text-[#EF8535] text-lg font-bold">
                                24/7
                            </div>

                            <div className="text-white/40 text-[10px] mt-1">
                                ACCESS
                            </div>

                        </div>


                        <div className="
                            rounded-2xl
                            bg-white/[0.045]
                            border border-white/[0.07]
                            p-4
                        ">

                            <div className="text-[#EF8535] text-lg font-bold">
                                100%
                            </div>

                            <div className="text-white/40 text-[10px] mt-1">
                                SECURE
                            </div>

                        </div>


                        <div className="
                            rounded-2xl
                            bg-white/[0.045]
                            border border-white/[0.07]
                            p-4
                        ">

                            <div className="text-[#EF8535] text-lg font-bold">
                                ERP
                            </div>

                            <div className="text-white/40 text-[10px] mt-1">
                                PLATFORM
                            </div>

                        </div>

                    </div>

                </div>


                {/* BOTTOM */}

                <div className="relative z-10 flex items-center justify-between">

                    <div>

                        <p className="text-white/35 text-[10px] uppercase tracking-[0.2em]">
                            Powered by
                        </p>

                        <p className="text-white/70 text-xs mt-1 font-medium">
                            MOSACH International Pvt. Ltd.
                        </p>

                    </div>


                    <div className="
                        flex items-center gap-2
                        text-white/40
                        text-[10px]
                    ">

                        <span className="
                            w-2 h-2
                            rounded-full
                            bg-green-400
                            shadow-[0_0_8px_rgba(74,222,128,0.8)]
                        " />

                        System Online

                    </div>

                </div>

            </div>


            {/* =====================================================
                RIGHT LOGIN PANEL
            ===================================================== */}

            <div className="
                relative
                flex
                flex-col
                justify-center
                px-6
                py-10
                sm:px-12
                lg:px-14
                xl:px-20
            ">


                {/* MOBILE BRAND */}

                <div className="lg:hidden text-center mb-9">

                    <div
                        className="
                            mx-auto
                            w-14 h-14
                            rounded-2xl
                            bg-gradient-to-br
                            from-[#EF8535]
                            to-[#D9681D]
                            flex items-center justify-center
                            shadow-lg
                        "
                    >

                        <span className="text-white text-2xl font-black">
                            M
                        </span>

                    </div>


                    <h1 className="
                        mt-3
                        text-xl
                        font-bold
                        text-[#083F4D]
                    ">
                        MOSACH ERP
                    </h1>

                    <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em]">
                        Enterprise Resource Planning
                    </p>

                </div>


                {/* LOGIN HEADER */}

                <div className="max-w-[420px] w-full mx-auto">

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
                            text-[11px]
                            font-semibold
                        ">

                            <span className="
                                w-1.5 h-1.5
                                rounded-full
                                bg-[#EF8535]"
                            />

                            ADMIN PORTAL

                        </div>


                        <h2 className="
                            mt-5
                            text-3xl
                            font-bold
                            text-[#123F4B]
                            tracking-tight
                        ">
                            Welcome back
                         </h2>


                        <p className="
                            mt-2
                            text-sm
                            text-gray-400
                        ">
                            Sign in to continue to your MOSACH ERP account.
                        </p>

                    </div>


                    {/* LOGIN FORM */}

                    <form onSubmit={handleSubmit}>

                        {/* USERNAME */}

                        <div className="mb-5">

                            <label className="
                                block
                                text-[12px]
                                font-bold
                                text-[#123F4B]
                                uppercase
                                tracking-wide
                                mb-2
                            ">
                                Username
                            </label>


                            <div className="relative group">

                                <div className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    w-8 h-8
                                    rounded-lg
                                    bg-[#F3F6F8]
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                    group-focus-within:bg-[#EF8535]/10
                                ">

                                    <FaUser
                                        size={13}
                                        className="
                                            text-gray-400
                                            group-focus-within:text-[#EF8535]
                                        "
                                    />

                                </div>


                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    className="
                                        w-full
                                        h-[58px]
                                        pl-14
                                        pr-4
                                        rounded-2xl
                                        bg-[#F7F9FA]
                                        border
                                        border-[#E8EDF0]
                                        outline-none
                                        text-[#123F4B]
                                        text-sm
                                        placeholder:text-gray-400
                                        transition-all
                                        focus:bg-white
                                        focus:border-[#EF8535]
                                        focus:ring-4
                                        focus:ring-[#EF8535]/10
                                    "
                                />

                            </div>

                        </div>


                        {/* PASSWORD */}

                        <div className="mb-6">

                            <label className="
                                block
                                text-[12px]
                                font-bold
                                text-[#123F4B]
                                uppercase
                                tracking-wide
                                mb-2
                            ">
                                Password
                            </label>


                            <div className="relative group">

                                <div className="
                                    absolute
                                    left-4
                                    top-1/2
                                    -translate-y-1/2
                                    w-8 h-8
                                    rounded-lg
                                    bg-[#F3F6F8]
                                    flex
                                    items-center
                                    justify-center
                                    transition
                                    group-focus-within:bg-[#EF8535]/10
                                ">

                                    <FaLock
                                        size={13}
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
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    className="
                                        w-full
                                        h-[58px]
                                        pl-14
                                        pr-14
                                        rounded-2xl
                                        bg-[#F7F9FA]
                                        border
                                        border-[#E8EDF0]
                                        outline-none
                                        text-[#123F4B]
                                        text-sm
                                        placeholder:text-gray-400
                                        transition-all
                                        focus:bg-white
                                        focus:border-[#EF8535]
                                        focus:ring-4
                                        focus:ring-[#EF8535]/10
                                    "
                                />


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="
                                        absolute
                                        right-4
                                        top-1/2
                                        -translate-y-1/2
                                        w-8 h-8
                                        rounded-lg
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
                                        <FaEyeSlash size={15} />
                                    ) : (
                                        <FaEye size={15} />
                                    )}

                                </button>

                            </div>

                        </div>


                        {/* SECURITY ROW */}

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
                                text-[11px]
                                text-gray-400
                            ">

                                <FaShieldAlt
                                    className="text-[#EF8535]"
                                    size={12}
                                />

                                Secure login

                            </div>


                            <span className="
                                text-[10px]
                                text-gray-300
                                uppercase
                                tracking-wider
                            ">
                                Protected access
                            </span>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                relative
                                overflow-hidden
                                w-full
                                h-[58px]
                                rounded-2xl
                                bg-gradient-to-r
                                from-[#EF8535]
                                to-[#D96B20]
                                hover:from-[#E57B2B]
                                hover:to-[#C85E18]
                                active:scale-[0.985]
                                disabled:opacity-70
                                text-white
                                font-bold
                                text-sm
                                flex
                                items-center
                                justify-center
                                gap-3
                                shadow-[0_12px_28px_rgba(239,133,53,0.25)]
                                transition-all
                            "
                        >

                            {/* Shine */}

                            <span className="
                                absolute
                                inset-y-0
                                -left-20
                                w-16
                                bg-white/20
                                skew-x-[-20deg]
                                transition-all
                                duration-700
                                group-hover:left-[120%]
                            " />


                            {loading ? (

                                <>
                                    <span className="
                                        w-5 h-5
                                        border-2
                                        border-white/30
                                        border-t-white
                                        rounded-full
                                        animate-spin
                                    " />

                                    Signing In...

                                </>

                            ) : (

                                <>
                                    Sign In

                                    <span className="
                                        w-7 h-7
                                        rounded-lg
                                        bg-white/15
                                        flex
                                        items-center
                                        justify-center
                                    ">

                                        <FaArrowRight size={12} />

                                    </span>

                                </>

                            )}

                        </button>

                    </form>


                    {/* BOTTOM SECURITY CARD */}

                    <div className="
                        mt-7
                        p-4
                        rounded-2xl
                        bg-[#F7F9FA]
                        border border-[#EDF1F3]
                        flex
                        items-center
                        gap-3
                    ">

                        <div className="
                            w-10 h-10
                            rounded-xl
                            bg-[#083F4D]
                            flex
                            items-center
                            justify-center
                            shrink-0
                        ">

                            <FaShieldAlt
                                className="text-[#EF8535]"
                                size={15}
                            />

                        </div>


                        <div>

                            <p className="
                                text-xs
                                font-bold
                                text-[#123F4B]
                            ">
                                Enterprise Security
                            </p>

                            <p className="
                                text-[10px]
                                text-gray-400
                                mt-1
                            ">
                                Your credentials are protected with
                                secure authentication.
                            </p>

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="
                        text-center
                        mt-7
                    ">

                        <p className="
                            text-[10px]
                            text-gray-400
                        ">
                            © {new Date().getFullYear()} MOSACH International Pvt. Ltd.
                        </p>

                        <p className="
                            text-[9px]
                            text-gray-300
                            mt-1
                        ">
                            Authorized access only
                        </p>

                    </div>

                </div>

            </div>

        </div>

    </div>
);
};

export default Login;