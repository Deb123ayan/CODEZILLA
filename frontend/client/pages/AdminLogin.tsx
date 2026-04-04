import React, { useState } from "react";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Lock, ShieldAlert, ArrowRight, ShieldCheck, Zap, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { status, login } = useAdminAuth();

    // Already authenticated → skip login page
    if (status === "authenticated") {
        const destination = (location.state as any)?.from?.pathname ?? "/admin/dashboard";
        return <Navigate to={destination} replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please enter both administrator credentials");
            return;
        }

        setLoading(true);
        const success = await login(email, password);
        setLoading(false);

        if (success) {
            toast.success("Administrator access granted");
            const destination = (location.state as any)?.from?.pathname ?? "/admin/dashboard";
            navigate(destination);
        }
    };

    return (
        <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a] min-h-screen flex flex-col">
            
            <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-[#e4e2e0]/50">
                <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto md:px-8 md:py-6">
                    <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => navigate("/")}>
                        <img src="/client/assets/logo/logo.png" alt="Zafby Logo" className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform duration-500" />
                        <span className="text-2xl font-extrabold tracking-tighter text-[#1b1c1b]">Zafby</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row items-center justify-center pt-32 pb-20 px-6 max-w-7xl mx-auto w-full relative">
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#ffdad6] blur-[150px] rounded-full opacity-30 mix-blend-multiply pointer-events-none" />

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center w-full relative z-10">
                    
                    {/* Left Info */}
                    <div className="hidden lg:flex flex-col space-y-12">
                        <div className="w-20 h-20 bg-[#ba1a1a] text-white rounded-[2rem] flex items-center justify-center shadow-[0_24px_48px_-12px_rgba(186,26,26,0.4)]">
                            <ShieldAlert size={40} />
                        </div>
                        <div>
                            <h1 className="text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.1] text-[#1b1c1b] mb-6">
                                Central <br/><span className="text-[#ba1a1a]">Oversight</span> Control.
                            </h1>
                            <p className="text-xl font-medium text-[#434751] max-w-md leading-relaxed">
                                Restricted portal for system administrators. Monitor the Zafby ecosystem in real-time.
                            </p>
                        </div>
                        
                        <div className="space-y-6 pt-6 border-t border-[#e4e2e0]/50">
                            {[
                                { t: "Global Audit Logs", icon: ShieldCheck },
                                { t: "Platform Orchestration", icon: Zap },
                            ].map(f => (
                                <div key={f.t} className="flex items-center space-x-5">
                                    <div className="w-12 h-12 bg-[#ffffff] border border-[#e4e2e0]/50 shadow-sm rounded-2xl flex items-center justify-center text-[#ba1a1a]">
                                        <f.icon size={24} />
                                    </div>
                                    <span className="text-sm font-inter font-bold uppercase tracking-[0.1em] text-[#1b1c1b]">{f.t}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Form */}
                    <div className="w-full max-w-md mx-auto lg:mr-0">
                        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-10 md:p-14 shadow-[0_40px_80px_-20px_rgba(27,28,27,0.08)]">
                            <div className="mb-12 text-center md:text-left">
                                <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b] mb-2">Admin Identity</h2>
                                <p className="text-[#a8aebf] font-inter font-bold uppercase tracking-[0.15em] text-[10px]">Secure Gateway Authentication</p>
                            </div>

                            <form className="space-y-8" onSubmit={handleSubmit}>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] ml-2">Administrator Email</label>
                                    <div className="relative group">
                                        <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a8aebf] group-focus-within:text-[#ba1a1a] transition-colors" size={20} />
                                        <input
                                            type="email"
                                            placeholder="admin@zafby.com"
                                            className="w-full bg-[#fcf9f8] border border-[#e4e2e0]/50 rounded-[1.5rem] h-16 pl-16 pr-6 text-sm font-bold text-[#1b1c1b] focus:ring-2 focus:ring-[#ba1a1a] focus:border-transparent transition-all outline-none placeholder:text-[#a8aebf]"
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] ml-2">Authentication Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a8aebf] group-focus-within:text-[#ba1a1a] transition-colors" size={20} />
                                        <input
                                            type="password"
                                            placeholder="Enter master key"
                                            className="w-full bg-[#fcf9f8] border border-[#e4e2e0]/50 rounded-[1.5rem] h-16 pl-16 pr-6 text-sm font-bold text-[#1b1c1b] focus:ring-2 focus:ring-[#ba1a1a] focus:border-transparent transition-all outline-none placeholder:text-[#a8aebf]"
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-[#1b1c1b] text-white rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] shadow-[0_12px_24px_-8px_rgba(27,28,27,0.3)] hover:bg-[#ba1a1a] disabled:bg-[#a8aebf] disabled:cursor-not-allowed transition-all duration-300 active:scale-[0.98] flex items-center justify-center space-x-3 mt-4"
                                >
                                    {loading ? (
                                        <Zap className="animate-spin text-white" size={18} />
                                    ) : (
                                        <>
                                            <span>Authorize Access</span>
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-10 text-center">
                                <Link to="/login" className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] hover:text-[#004191] transition-colors">
                                    &larr; Return to Worker Portal
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
