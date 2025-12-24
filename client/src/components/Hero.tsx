import { useEffect, useRef } from "react";
import { Video, Monitor, Brain, MessageCircle, Play } from "lucide-react";
import gsap from "gsap";

const features = [
    { icon: Video, label: "Video Rooms" },
    { icon: Brain, label: "Whiteboard" },
    { icon: Monitor, label: "Screen Share" },
    { icon: MessageCircle, label: "Chat" },
];

const Hero = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-animate", {
                opacity: 0,
                y: 30,
                duration: 0.9,
                stagger: 0.15,
                ease: "power3.out",
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            className="relative flex flex-col pb-32 bg-[url(/bg.png)] h-screen bg-cover bg-center items-center justify-center px-4 md:px-16 lg:px-24 xl:px-32 overflow-hidden"
        >

            <div className="flex flex-col items-center text-center max-w-9xl">
                <h1 className="hero-animate text-6xl md:text-7xl lg:text-8xl font-medium text-slate-50 leading-tight">
                    Connect. Collaborate. Create <br /> all in one place.
                </h1>

                <p className="hero-animate text-sm md:text-base text-slate-300 max-w-xl mt-5">
                    Create rooms, join instantly, share screens, brainstorm
                    live, and work together without friction — UniConnect is
                    built for modern students.
                </p>

                <div className="hero-animate mt-10 flex flex-wrap justify-center gap-3 text-sm">
                    {features.map(({ icon: Icon, label }) => (
                        <span
                            key={label}
                            className="flex items-center gap-2 px-4 py-2 rounded-full border border-white text-white backdrop-blur hover:bg-white/5 transition"
                        >
                            <Icon size={16} className="text-accent" />
                            {label}
                        </span>
                    ))}
                </div>

                <div className="hero-animate flex gap-4 mt-10">
                    <button className="bg-accent text-white rounded-md px-8 h-11 active:scale-95 hover:shadow-[0_0_40px_rgba(79,57,246,0.5)] transition">
                        Get started
                    </button>

                    <button className="flex items-center gap-2 border border-accent rounded-md px-6 h-11 hover:bg-accent/20 text-white transition">
                        <Play size={16} />
                        Watch demo
                    </button>
                </div>

                <p className="hero-animate mt-6 text-xs text-slate-400">
                    No downloads • No credit card • Free forever
                </p>
            </div>
        </section>
    );
};

export default Hero;
