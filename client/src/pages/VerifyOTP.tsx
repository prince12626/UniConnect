import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const OTP_LENGTH = 6;
const OTP_TIME = 15 * 60;

const VerifyOtp = () => {
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [timeLeft, setTimeLeft] = useState<number>(OTP_TIME);
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
    const navigate = useNavigate();

    // ⏱️ countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft]);

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedOtp = e.clipboardData.getData("text").slice(0, OTP_LENGTH);

        if (!/^\d+$/.test(pastedOtp)) return;

        setOtp(pastedOtp.split(""));
        inputsRef.current[pastedOtp.length - 1]?.focus();
    };

    const verifyOtp = () => {
        if (timeLeft <= 0) return;

        const enteredOtp = otp.join("");
        if (enteredOtp.length !== OTP_LENGTH) {
            alert("Incomplete OTP (One Time Password)");
            return;
        }
        axios
            .post(`${import.meta.env.VITE_APIURL}/api/auth/verify-otp`, {
                otp: enteredOtp,
                email: JSON.parse(localStorage.getItem("user") || "{}")?.email,
            })
            .then((res) => {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/");
            })
            .catch((err) => {
                console.error(err);
            });
    };

    const formatTime = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="w-[360px] border border-zinc-800 rounded-xl p-6">
                <h1 className="text-2xl font-semibold text-center">
                    OTP Verification
                </h1>

                <p className="text-sm text-zinc-400 text-center mt-2">
                    Enter the 6-digit OTP sent to you
                </p>

                {/* Timer */}
                <div className="text-center mt-3 text-sm">
                    {timeLeft > 0 ? (
                        <span className="text-zinc-400">
                            OTP expires in{" "}
                            <span className="text-white font-medium">
                                {formatTime()}
                            </span>
                        </span>
                    ) : (
                        <span className="text-red-500 font-medium">
                            OTP expired
                        </span>
                    )}
                </div>

                {/* OTP Inputs */}
                <div className="flex justify-between mt-6">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => {
                                inputsRef.current[index] = el;
                            }}
                            type="text"
                            maxLength={1}
                            value={digit}
                            disabled={timeLeft <= 0}
                            onChange={(e) =>
                                handleChange(e.target.value, index)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onPaste={handlePaste}
                            className="w-12 h-14 text-center text-xl rounded-lg
                         bg-zinc-900 border border-zinc-700
                         focus:outline-none
                         disabled:opacity-40"
                        />
                    ))}
                </div>

                {/* Verify Button */}
                <button
                    onClick={verifyOtp}
                    disabled={timeLeft <= 0}
                    className="w-full mt-6 py-3 rounded-lg font-semibold
                     bg-white text-black
                     hover:bg-zinc-200 transition
                     disabled:bg-zinc-600 disabled:cursor-not-allowed"
                >
                    Verify OTP
                </button>
            </div>
        </div>
    );
};

export default VerifyOtp;
