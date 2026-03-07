import Navbar from "@/components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Hash, CheckCircle2, ArrowRight, Zap, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  platformName: string;
  platformId: string;
}

export default function BaseRegistrationForm({ platformName, platformId }: Props) {
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !employeeId || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Password validation: max 6 charts, 1 capital, 1 special, 1 number
    const hasCapital = /[A-Z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const isValidLength = password.length <= 6;

    if (!hasCapital) {
      toast.error("Password must include at least one capital letter");
      return;
    }
    if (!hasSpecial) {
      toast.error("Password must include at least one special character");
      return;
    }
    if (!hasNumber) {
      toast.error("Password must include at least one number");
      return;
    }
    if (!isValidLength) {
      toast.error("Password must be maximum 6 characters long");
      return;
    }

    toast.success(`Registration for ${platformName} successful!`);

    // Extract first name for dashboard
    const firstName = name.split(" ")[0];
    const formattedUsername = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    navigate("/dashboard", {
      state: {
        selectedPlatform: platformId,
        username: formattedUsername
      }
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center section-padding pt-32 pb-20 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-emerald-50/50 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Info */}
          <div className="hidden lg:block space-y-12 reveal active">
            <div className="w-24 h-24 bg-black text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl overflow-hidden mb-12">
              <ShieldCheck size={48} className="text-emerald-400" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter leading-none">Become a <span className="text-emerald-500">Protected</span> Partner.</h1>
            <p className="text-xl font-bold text-gray-400 max-w-md leading-relaxed">
              Fast-track your registration for {platformName} and activate your automatic income protection today.
            </p>
            <div className="flex items-center space-x-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center text-[10px] font-black uppercase">P{i}</div>
                ))}
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Join 4k+ members</p>
            </div>
          </div>

          {/* Right Form */}
          <div className="w-full max-w-xl mx-auto reveal active" style={{ transitionDelay: "200ms" }}>
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
              <div className="mb-12">
                <h2 className="text-3xl font-black tracking-tighter mb-2">{platformName} Onboarding</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Partner verification & setup</p>
              </div>

              <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Legal Name</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Platform Partner ID</label>
                  <div className="relative group">
                    <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="text"
                      placeholder="EMP123456"
                      className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                      onChange={(e) => setEmployeeId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Security Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                      <input
                        type="password"
                        placeholder="••••••"
                        maxLength={6}
                        className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Confirm Key</label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                      <input
                        type="password"
                        placeholder="••••••"
                        className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Max 6 Chars • 1 Capital • 1 Special • 1 Number</p>

                <button
                  type="submit"
                  className="w-full h-16 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 transition-all duration-500 active:scale-95 flex items-center justify-center space-x-3"
                >
                  <span>Activate Member Account</span>
                  <Zap size={16} />
                </button>
              </form>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                  Already protected?{" "}
                  <Link to="/login" className="text-blue-600 hover:text-black transition-colors">Sign in here</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
