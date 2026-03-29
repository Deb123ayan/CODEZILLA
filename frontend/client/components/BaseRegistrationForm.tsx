import Navbar from "@/components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { User, Lock, Hash, CheckCircle2, ArrowRight, Zap, ShieldCheck, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";

interface Props {
  platformName: string;
  platformId: string;
}

export default function BaseRegistrationForm({ platformName, platformId }: Props) {
  const [isManual, setIsManual] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { platformLogin, generateOTP, verifyOTP } = useUserAuth();

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (isManual && (!name || !employeeId)) {
      toast.error("Please fill in all details");
      return;
    }
    
    setLoading(true);
    const res = await generateOTP(phoneNumber);
    setLoading(false);
    
    if (res.success) {
      setStep(2);
      toast.success("OTP sent to your phone!");
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    const verifyRes = await verifyOTP(phoneNumber, otp);
    
    if (!verifyRes.success) {
      setLoading(false);
      return;
    }

    // OTP verified, now proceed with registration
    if (!isManual) {
      const toastId = toast.loading(`Connecting to ${platformName}...`);
      try {
        const res = await api.post<{message: string; data: any}>("/auth/platform/connect/", {
          phone: phoneNumber,
          platform: platformName
        });
        
        const mockData = res.data;
        const result = await platformLogin(platformId, mockData.partner_id, mockData.name, phoneNumber, `worker_${phoneNumber}@gigshield.local`);
        
        setLoading(false);
        if (result.success) {
          toast.success(`Successfully connected to ${platformName}!`, { id: toastId });
          if (result.onboarding_completed) {
            navigate("/dashboard");
          } else {
            navigate("/profile-setup");
          }
        } else {
          toast.error('Platform synchronization failed', { id: toastId });
        }
      } catch (error: any) {
        setLoading(false);
        toast.error(error.message || `No data found on ${platformName}. Please enter details manually.`, { id: toastId });
        setIsManual(true);
        setStep(1);
      }
    } else {
      const promise = platformLogin(platformId, employeeId, name, phoneNumber, `worker_${phoneNumber}@gigshield.local`);
      toast.promise(promise, {
        loading: 'Registering account...',
        success: (result) => {
          setLoading(false);
          if (result.success) {
            if (result.onboarding_completed) {
              navigate("/dashboard");
            } else {
              navigate("/profile-setup");
            }
            return 'Registration successful!';
          }
          throw new Error('Sync failed');
        },
        error: () => {
          setLoading(false);
          return 'Registration failed';
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col selection:bg-black selection:text-white">
      <Navbar />

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center section-padding pt-32 pb-20 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="hidden lg:block w-1/2 p-24 relative overflow-hidden flex flex-col justify-center text-white">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-50/50 blur-[120px] rounded-full" />

          <div className="relative z-10 space-y-12">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-3xl rounded-[2rem] flex items-center justify-center border border-white/20">
              <ShieldCheck size={48} className="text-blue-400" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter leading-none">Become a <span className="text-blue-500">Protected</span> Partner.</h1>
            <p className="text-xl font-bold text-gray-400 leading-relaxed max-w-md italic">
              "Join 10,000+ gig workers who have already secured their daily earnings with Zafby."
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
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center">
          {/* Right Form */}
          <div className="w-full max-w-xl mx-auto reveal active" style={{ transitionDelay: "200ms" }}>
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
              <div className="mb-12">
                <h2 className="text-3xl font-black tracking-tighter mb-2">{platformName} Onboarding</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Partner verification & setup</p>
              </div>

              <form className="space-y-6" onSubmit={step === 1 ? handleInitialSubmit : handleVerifySubmit}>
                
                {step === 1 ? (
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Mobile Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                        <input
                          type="tel"
                          placeholder="+91 9876543210"
                          value={phoneNumber}
                          className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {isManual && (
                      <div className="space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Legal Name</label>
                          <div className="relative group">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                            <input
                              type="text"
                              placeholder="Rahul Sharma"
                              value={name}
                              className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                              onChange={(e) => setName(e.target.value)}
                              required
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
                              value={employeeId}
                              className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all placeholder:text-gray-300"
                              onChange={(e) => setEmployeeId(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6 animate-in zoom-in-[0.98] duration-300">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1 text-center block">Enter 6-Digit OTP</label>
                      <input 
                        className="w-full px-4 py-6 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all text-black outline-none text-center text-3xl font-bold tracking-[0.5em] placeholder:text-gray-300" 
                        placeholder="******" 
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-16 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all duration-500 active:scale-95 flex items-center justify-center space-x-3 disabled:opacity-70"
                  >
                    <span>{loading ? "Please wait..." : (step === 1 ? (isManual ? "Register Account" : `Connect ${platformName}`) : "Verify & Complete")}</span>
                    {!loading && <Zap size={16} />}
                  </button>
                </div>
                
                {!isManual && (
                  <div className="text-center mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsManual(true)}
                      className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-black transition-colors"
                    >
                      Enter details manually instead
                    </button>
                  </div>
                )}
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
