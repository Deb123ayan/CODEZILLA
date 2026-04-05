import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import { Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { status, login, generateOTP, verifyOTP } = useUserAuth();

  if (status === "authenticated") {
    const destination = (location.state as any)?.from?.pathname ?? "/dashboard";
    return <Navigate to={destination} replace />;
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
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

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoading(true);
    const res = await verifyOTP(phoneNumber, otp);
    setLoading(false);
    if (res.success) {
      if (res.data?.is_new_user) {
        toast.info("Please select a platform to complete your registration.");
        navigate("/register", { replace: true });
        return;
      }

      // Use workerId from backend if available, else derive a fallback
      const wId = res.data?.worker?.id || `EMP-${phoneNumber.slice(-4)}`;
      const pName = res.data?.worker?.platform || "Zomato";
      const uName = res.data?.worker?.name || "Delivery Partner";
      
      login(pName, uName, "", phoneNumber, wId, wId);
      toast.success(`Welcome back!`);
      
      if (res.data?.onboarding_completed === false) {
        navigate("/profile-setup", { replace: true });
      } else {
        const destination = (location.state as any)?.from?.pathname ?? "/dashboard";
        navigate(destination, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex flex-col font-['Inter'] text-[#1c1b1b] selection:bg-[#d8e2ff] selection:text-[#004395]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 sm:p-12 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full max-w-6xl gap-12 items-center">
          
          {/* Left Side: Editorial Content (Asymmetric Layout) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col space-y-8 pr-12">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#0058be] font-['Inter']">
                The Digital Atelier
              </span>
              <h1 className="text-6xl font-extrabold font-['Manrope'] leading-[1.1] text-[#1c1b1b] tracking-tight">
                Crafting your <br/> <span className="text-[#2170e4]">professional</span> journey.
              </h1>
            </div>
            <p className="text-[#424754] text-lg max-w-md leading-relaxed">
              Join Zafby’s curated marketplace where every task is a masterpiece and every worker is an artisan.
            </p>
            <div className="relative w-full aspect-[4/3] rounded-[3rem] overflow-hidden bg-[#f6f3f2]">
              <img 
                className="w-full h-full object-cover" 
                alt="minimalist modern office interior" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBZ04TkY-6SU-62Mr6pf7-usp7JKWUM98RfwA_PRramqgyWh9wN0T0tSbSh4_ShFt94Ifo7Y-sSP9RuAkMA8xpQCjEi-acm74eJ8EjyxPKoXxyoHeWmveeRpQxWi-rGsJ_rUFPFb5kbG3tKFXrDfyGEJpCTcpw5mKMllbfyheu_VoXmo81NcZhl9Vas8a0wowvYBRFTjahDAUgARog15YhMURrwzuMsQVMIt6i-DsMmK23cG1q121p00UUQB7m2doQeuQ11V2YLOc"
              />
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#ffffff] rounded-[3rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,88,190,0.04)] border border-[#c2c6d6]/10">
              
              {/* Brand Anchor */}
              <div className="flex justify-center mb-10">
                <span className="font-['Manrope'] font-bold tracking-[0.2em] text-2xl text-[#1c1b1b]">ZAFBY</span>
              </div>
              
              <div className="space-y-2 mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-bold font-['Manrope'] text-[#1c1b1b] tracking-tight">Welcome Back</h2>
                <p className="text-[#424754] text-sm">{step === 1 ? "Enter your phone number to sign in" : "Verify your identity"}</p>
              </div>

              <form className="space-y-6" onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP}>
                {step === 1 ? (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-wider text-[#424754] uppercase ml-1">Phone Number</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-4 text-[#424754] font-medium border-r border-[#c2c6d6] pr-3 text-sm">+91</span>
                        <input 
                          className="w-full pl-16 pr-4 py-4 bg-[#f6f3f2] border-none rounded-2xl focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all text-[#1c1b1b] outline-none placeholder:text-[#c2c6d6]" 
                          placeholder="9876543210" 
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold tracking-wider text-[#424754] uppercase ml-1 text-center">Enter 6-Digit OTP</label>
                      <input 
                        className="w-full px-4 py-6 bg-[#f6f3f2] border-none rounded-2xl focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all text-[#1c1b1b] outline-none text-center text-3xl font-bold tracking-[0.5em] placeholder:text-[#c2c6d6]" 
                        placeholder="******" 
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <p className="text-sm font-medium text-[#424754] mt-4 text-center">
                        We've sent a code to <br />+91 {phoneNumber}
                      </p>
                    </div>
                  </div>
                )}

                <button 
                  className="w-full py-5 mt-4 bg-[#0058be] hover:bg-[#2170e4] text-[#ffffff] font-bold font-['Manrope'] rounded-full transition-all active:scale-[0.98] shadow-[0_20px_40px_rgba(0,88,190,0.1)] flex items-center justify-center disabled:opacity-70 disabled:pointer-events-none" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 size={24} className="animate-spin text-white" />
                  ) : (
                     step === 1 ? "Send OTP" : "Verify & Login"
                  )}
                </button>

                {step === 2 && (
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-sm font-medium text-[#424754] hover:text-[#1c1b1b] transition-colors"
                  >
                    Back to Details
                  </button>
                )}
              </form>

              {step === 1 && (
                <div className="mt-10 flex flex-col items-center justify-center gap-[15px]">
                  <p className="text-sm text-[#424754]">
                    Don't have an account? 
                    <Link to="/register" className="text-[#0058be] font-bold hover:underline underline-offset-4 ml-1">Register</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <DashboardFooter className="mt-20 mx-0 rounded-none bg-[#fcf9f8] backdrop-blur-none" />
    </div>
  );
}
