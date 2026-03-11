import Navbar from "@/components/Navbar";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Mail, Lock, Globe, ArrowRight, ShieldCheck, Zap, Phone, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserAuth } from "@/context/UserAuthContext";

export default function Login() {
  const [userName, setUserName] = useState("");
  const [platform, setPlatform] = useState("");
  const [platformId, setPlatformId] = useState("");
  const [gmail, setGmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { status, login } = useUserAuth();

  if (status === "authenticated") {
    const destination = (location.state as any)?.from?.pathname ?? "/dashboard";
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platform) {
      toast.error("Please select a platform to continue");
      return;
    }
    if (!userName || !platformId || !gmail || !phoneNumber || !securityKey) {
      toast.error("Please fill in all details");
      return;
    }

    try {
      await login(platform, userName, gmail, phoneNumber, platformId);
      const destination = (location.state as any)?.from?.pathname ?? "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      // Error handled by context toast
    }
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
              <Zap size={32} className="fill-current text-blue-400" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter leading-none">Safe access to your <span className="text-blue-600">Earnings.</span></h1>
            <p className="text-xl font-bold text-gray-400 max-w-md leading-relaxed">
              Manage your policies, track claims and withdraw your payouts with military-grade security.
            </p>
            <div className="space-y-6">
              {[
                { t: "Verified Identity", icon: ShieldCheck },
                { t: "Instant Web3 Payouts", icon: Zap },
                { t: "24/7 Priority Support", icon: Globe }
              ].map(f => (
                <div key={f.t} className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-blue-600">
                    <f.icon size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-gray-900">{f.t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full max-w-xl mx-auto reveal active" style={{ transitionDelay: "200ms" }}>
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
              <div className="mb-12">
                <h2 className="text-3xl font-black tracking-tighter mb-2">Member Login</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Your platform security portal</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">User Name</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Your full name"
                      className="w-full bg-gray-50 border-none rounded-2xl h-14 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Work Platform</label>
                  <Select onValueChange={setPlatform} value={platform}>
                    <SelectTrigger className="w-full h-14 bg-gray-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all">
                      <SelectValue placeholder="Select active platform" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-100 p-2">
                      {["Amazon", "Flipkart", "Zomato", "Blinkit", "Zepto", "Swiggy"].map(p => (
                        <SelectItem key={p} value={p.toLowerCase()} className="rounded-xl font-bold py-3 text-sm">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Platform ID</label>
                  <div className="relative group">
                    <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="Worker ID / Driver ID"
                      className="w-full bg-gray-50 border-none rounded-2xl h-14 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setPlatformId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Gmail Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="email"
                      placeholder="example@gmail.com"
                      className="w-full bg-gray-50 border-none rounded-2xl h-14 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setGmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="tel"
                      placeholder="+91 00000 00000"
                      className="w-full bg-gray-50 border-none rounded-2xl h-14 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Security Key</label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="password"
                      placeholder="••••••"
                      className="w-full bg-gray-50 border-none rounded-2xl h-14 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setSecurityKey(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full h-16 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all duration-500 active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{status === "loading" ? "Entering Vault..." : "Enter Dashboard"}</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
