import { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="h-19 flex items-center justify-center">
            <nav className="flex items-center border backdrop-blur-2xl w-[90%] mx-auto justify-between border-border px-6 py-4 rounded-full text-white text-sm top-5 fixed z-50">
                <Link className="text-3xl" to="/">
                    UniConnect
                </Link>

                <div className="hidden md:flex items-center gap-6 ml-7">
                    {["Create Room", "Join Room"].map((item) => (
                        <Link
                            key={item}
                            to={`/${item.toLowerCase().split(" ").join("/")}`}
                            className="relative text-lg overflow-hidden h-6 group"
                        >
                            <span className="block group-hover:-translate-y-full transition-transform duration-300">
                                {item}
                            </span>
                            <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">
                                {item}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="hidden ml-14 md:flex items-center gap-4">
                    <Link to="/auth/login" className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition">
                        Login
                    </Link>
                    <Link to="/auth/register" className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
                        Create Account
                    </Link>
                </div>

                {/* Mobile menu toggle button */}
                <button
                    id="menuToggle"
                    className="md:hidden text-gray-600"
                    onClick={toggleMobileMenu}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Mobile menu */}
                <div
                    id="mobileMenu"
                    className={`absolute p-8 rounded border border-border top-48 left-0 bg-black w-full flex-col items-center gap-4 text-base transition-all duration-300 ${
                        isMobileMenuOpen ? "flex" : "hidden"
                    }`}
                >
                    {["Create Room", "Join Room"].map((item) => (
                        <Link
                            key={item}
                            className="hover:text-indigo-600"
                            to={`/${item.toLowerCase().split(" ").join("/")}`}
                        >
                            {item}
                        </Link>
                    ))}
                    <button className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition">
                        Contact
                    </button>
                    <button className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
                        Get Started
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
