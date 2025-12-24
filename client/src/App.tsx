import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import Navbar from "./components/Navbar";
import JoinRoom from "./pages/JoinRoom";
import RoomPage from "./pages/Room";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOTP";
import RoomsPage from "./pages/Rooms";
import { useEffect } from "react";
import { socket } from "./socket/index";

const App = () => {
    const location = useLocation();
    const showNavbar = !location.pathname.startsWith("/rooms/");


useEffect(() => {
    if (!socket.connected) {
        socket.connect();
    }
}, []);


    return (
        <div className="bg-black min-h-screen">
            <Toaster />
            {showNavbar && <Navbar />}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/create/room" element={<CreateRoom />} />
                <Route path="/join/room" element={<JoinRoom />} />
                <Route path="/rooms/:id" element={<RoomPage />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/auth/verify-otp" element={<VerifyOtp />} />
                <Route path="/my-rooms" element={<RoomsPage />} />
            </Routes>
        </div>
    );
};

export default App;
