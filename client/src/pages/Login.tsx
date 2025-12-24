import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import axios from "axios";

interface LoginData {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [loginData, setLoginData] = useState<LoginData>({
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const formRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (formRef.current) {
            gsap.from(formRef.current, {
                opacity: 0,
                y: -50,
                duration: 1,
                ease: "power3.out",
            });
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_APIURL}/api/auth/login`,
                loginData
            );
            if (!res.data.success) throw new Error("Login failed");
            const data = await res.data;
            navigate("/my-rooms");
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div
                ref={formRef}
                className="w-full max-w-md p-8 bg-gray-900 border border-border rounded-sm shadow-lg"
            >
                <h2 className="text-3xl font-bold mb-6 text-white text-center">
                    Login
                </h2>
                {error && (
                    <p className="text-red-500 mb-4 text-center">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-sm border border-border bg-gray-800 text-white outline-none placeholder:text-gray-400"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                        className="p-3 rounded-sm border border-border bg-gray-800 text-white outline-none placeholder:text-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-accent text-white hover:bg-accent/80 font-semibold p-3 rounded-sm transition transform hover:scale-105 disabled:bg-gray-700 disabled:cursor-not-allowed"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
