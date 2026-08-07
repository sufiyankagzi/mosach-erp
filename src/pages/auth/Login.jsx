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
    <div className="min-h-screen bg-[#F4F6F9] relative overflow-hidden">

        {/* TOP TEAL AREA */}
        <div className="absolute top-0 left-0 right-0 h-[360px] bg-[#0A4B57] rounded-b-[45px]">

            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border-[35px] border-white/5" />

            <div className="absolute top-20 -left-24 w-48 h-48 rounded-full bg-[#EF8535]/10" />

        </div>


        {/* CONTENT */}
        <div className="relative z-10 min-h-screen flex flex-col items-center px-5 pt-12">


            {/* LOGO */}

            <div className="text-center text-white">

                <div className="mx-auto w-16 h-16 rounded-2xl bg-[#EF8535] flex items-center justify-center shadow-xl shadow-black/20">

                    <span className="text-2xl font-bold">
                        M
                    </span>

                </div>


                <h1 className="mt-4 text-2xl font-bold tracking-wide">
                    MOSACH ERP
                </h1>

                <p className="text-white/60 text-xs mt-1">
                    Enterprise Resource Planning
                </p>

            </div>



            {/* SMALL DESCRIPTION */}

            <div className="text-center text-white mt-7 max-w-[320px]">

                <h2 className="text-xl font-semibold">
                    Manage Your Business
                </h2>

                <p className="text-white/60 text-sm mt-2">
                    Everything you need to manage your
                    business in one powerful platform.
                </p>

            </div>



            {/* LOGIN CARD */}

            <div className="w-full max-w-[430px] bg-white rounded-[28px] shadow-[0_20px_60px_rgba(41,79,91,0.18)] mt-9 p-6 sm:p-8">


                {/* CARD TITLE */}

                <div className="mb-7">

                    <p className="text-[#EF8535] text-sm font-semibold">
                        Welcome Back
                    </p>

                    <h2 className="text-2xl font-bold text-[#294F5B] mt-1">
                        Sign In
                    </h2>

                    <p className="text-gray-400 text-xs mt-2">
                        Enter your credentials to continue
                    </p>

                </div>



                <form onSubmit={handleSubmit}>


                    {/* USERNAME */}

                    <div className="mb-5">

                        <label className="text-sm font-semibold text-[#294F5B]">
                            Username
                        </label>

                        <div className="relative mt-2">

                            <FaUser
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                size={14}
                            />

                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter username"
                                autoComplete="username"
                                className="w-full h-[52px] pl-11 pr-4 rounded-xl bg-[#F7F8FA] border border-gray-200 outline-none text-[#294F5B] placeholder-gray-400 focus:bg-white focus:border-[#EF8535] focus:ring-4 focus:ring-[#EF8535]/10 transition"
                            />

                        </div>

                    </div>



                    {/* PASSWORD */}

                    <div className="mb-6">

                        <label className="text-sm font-semibold text-[#294F5B]">
                            Password
                        </label>

                        <div className="relative mt-2">

                            <FaLock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                size={14}
                            />

                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter password"
                                autoComplete="current-password"
                                className="w-full h-[52px] pl-11 pr-12 rounded-xl bg-[#F7F8FA] border border-gray-200 outline-none text-[#294F5B] placeholder-gray-400 focus:bg-white focus:border-[#EF8535] focus:ring-4 focus:ring-[#EF8535]/10 transition"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                            >

                                {showPassword ? (
                                    <FaEyeSlash size={16} />
                                ) : (
                                    <FaEye size={16} />
                                )}

                            </button>

                        </div>

                    </div>



                    {/* LOGIN */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-[53px] rounded-xl bg-[#EF8535] hover:bg-[#DE7628] active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-3 shadow-lg shadow-[#EF8535]/20 transition-all"
                    >

                        {loading ? (

                            <>
                                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />

                                Signing In...
                            </>

                        ) : (

                            <>
                                Sign In
                                <FaArrowRight size={14} />
                            </>

                        )}

                    </button>

                </form>



                {/* SECURITY */}

                <div className="mt-6 flex items-center justify-center gap-2">

                    <FaShieldAlt
                        className="text-[#EF8535]"
                        size={12}
                    />

                    <span className="text-[11px] text-gray-400">
                        Secure Enterprise ERP System
                    </span>

                </div>

            </div>



            {/* FOOTER */}

            <div className="text-center mt-6 pb-6">

                <p className="text-xs text-gray-400">
                    © {new Date().getFullYear()} MOSACH International Pvt. Ltd.
                </p>

                <p className="text-[10px] text-gray-300 mt-1">
                    Authorized access only
                </p>

            </div>

        </div>

    </div>
);
};

export default Login;