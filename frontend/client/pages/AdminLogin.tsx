import Navbar from "@/components/Navbar";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Lock, ShieldAlert, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const location = useLocation();
    const { status, login } = useAdminAuth();

    // Already authenticated → skip login page
    if (status === "authenticated") {
        const destination = (location.state as any)?.from?.pathname ?? "/admin";
        return <Navigate to={destination} replace />;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both administrator credentials");
            return;
        }

        // Simple validation for demo
        if (password.length < 6) {
            toast.error("Invalid security key format");
            return;
        }

        // Update auth context (also stamps sessionStorage)
        login();
        toast.success("Administrator access granted");

        // Redirect to originally-requested page, or /admin by default
        const destination = (location.state as any)?.from?.pathname ?? "/admin";
        navigate(destination);
    };

    return (
        <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
            <Navbar />

            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center section-padding pt-32 pb-20 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-50/50 blur-[120px] rounded-full" />
                </div>

                <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
                    {/* Left Info */}
                    <div className="hidden lg:block space-y-12 reveal active">
                        <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl">
                            <ShieldAlert size={32} className="text-red-500" />
                        </div>
                        <h1 className="text-7xl font-black tracking-tighter leading-none">High-level <span className="text-red-600">Oversight</span> Control.</h1>
                        <p className="text-xl font-bold text-gray-400 max-w-md leading-relaxed">
                            Restricted access for system administrators and platform managers. Monitor the entire EarnLock ecosystem in real-time.
                        </p>
                        <div className="space-y-6 text-gray-900">
                            {[
                                { t: "Admin Audit Logs", icon: ShieldCheck },
                                { t: "Platform Management", icon: Zap },
                            ].map(f => (
                                <div key={f.t} className="flex items-center space-x-4">
                                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-900">
                                        <f.icon size={18} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest leading-none">{f.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="w-full max-w-xl mx-auto reveal active" style={{ transitionDelay: "200ms" }}>
                        <div className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
                            <div className="mb-12">
                                <h2 className="text-3xl font-black tracking-tighter mb-2">Admin Portal</h2>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Secure administrative gateway</p>
                            </div>

                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Admin Identity</label>
                                    <div className="relative group">
                                        < ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                                        <input
                                            type="email"
                                            placeholder="admin@earnolock.com"
                                            className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Master Secret</label>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Enter administrator key"
                                            className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 md:h-16 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all duration-500 active:scale-95 flex items-center justify-center space-x-3"
                                >
                                    <span>Authorize Access</span>
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            <div className="mt-12 text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                    Not an admin?{" "}
                                    <Link to="/login" className="text-blue-600 hover:text-black transition-colors">Go to Member Portal</Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
