import React, { useState } from "react";
import { User, Phone, IdCard, MapPin, ChevronDown, CheckCircle2, Loader2, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardFooter from "@/components/DashboardFooter";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { platform: contextPlatform, username, phoneNumber, status, workerId } = useUserAuth();
  const isLoggedIn = status === "authenticated";
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: username || "",
    phoneNumber: phoneNumber || "",
    govtId: "",
    platform: contextPlatform ? contextPlatform.toLowerCase() : "",
    city: "",
    upiId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch existing worker data if they already have a partial profile in the DB
  React.useEffect(() => {
    if (!workerId) return;
    
    api.get<any>(`/workers/${workerId}/profile/`)
      .then((res) => {
        if (res) {
          setFormData((prev) => ({
            ...prev,
            fullName: res.name || prev.fullName,
            phoneNumber: res.phone || prev.phoneNumber,
            platform: res.platform ? res.platform.toLowerCase() : prev.platform,
            city: res.city || prev.city,
            govtId: res.aadhaar_number || prev.govtId,
          }));
        }
      })
      .catch((err) => {
        console.error("Failed to load existing profile data", err);
      });
  }, [workerId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName) newErrors.fullName = "Full name is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";
    if (!formData.govtId) newErrors.govtId = "Government ID is required";
    if (!formData.platform) newErrors.platform = "Platform selection is required";
    if (!formData.city) newErrors.city = "City/Zone is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const getLocationPromise = new Promise<{ city: string; lat: number; lng: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.state_district || "Remote Zone";
            
            if (phoneNumber) {
               await api.post("/workers/location/", { phone: phoneNumber, latitude, longitude });
            }
            
            resolve({ city, lat: latitude, lng: longitude });
          } catch (e) {
            if (phoneNumber) {
               await api.post("/workers/location/", { phone: phoneNumber, latitude, longitude });
            }
            resolve({ city: "GPS Detected Zone", lat: latitude, lng: longitude });
          }
        },
        (error) => {
          reject(new Error("Location permission denied. Please allow location access."));
        }
      );
    });

    toast.promise(getLocationPromise, {
      loading: "Detecting your location securely...",
      success: (data) => {
        setFormData(prev => ({ ...prev, city: data.city }));
        return `Location verified: ${data.city}`;
      },
      error: (err) => err.message
    });
  };

  React.useEffect(() => {
    if (!formData.city && navigator.geolocation) {
       handleDetectLocation();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post("/auth/update-details/", {
        phone: formData.phoneNumber,
        name: formData.fullName,
        aadhaar_number: formData.govtId,
        city: formData.city,
        platform: formData.platform,
        upi_id: formData.upiId,
      });
      toast.success("Profile details saved successfully!");
      navigate("/document-verification");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-inter selection:bg-[#0058be]/10 flex flex-col items-center pt-12 md:pt-20 pb-24 px-6 overflow-x-hidden">
      
      {/* Top Navbar — auth-aware */}
      {isLoggedIn ? <DashboardHeader /> : <Navbar />}

      {/* Main Content */}
      <div className="w-full max-w-2xl mt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header & Progress */}
        <div className="mb-12 text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-1.5 w-16 rounded-full bg-[#0058be]"></div>
            <div className="h-1.5 w-16 rounded-full bg-[#ebe7e7]"></div>
            <div className="h-1.5 w-16 rounded-full bg-[#ebe7e7]"></div>
            <span className="ml-2 text-xs font-bold uppercase tracking-widest text-[#0058be]/60">Step 1 of 3</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Complete Your Profile</h1>
          <p className="text-[#424754] text-lg max-w-lg leading-relaxed">
            Help us verify your details to start protecting your income.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#ffffff] rounded-[3rem] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,88,190,0.04)]">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Row 1: Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#424754] ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute right-6 top-1/2 -translate-y-1/2 text-[#c2c6d6]" size={20} />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={cn(
                      "w-full bg-[#f6f3f2] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all placeholder:text-[#c2c6d6]",
                      errors.fullName && "ring-2 ring-[#ba1a1a]/40 bg-[#ffdad6]/20"
                    )}
                  />
                  {errors.fullName && <p className="text-xs text-[#ba1a1a] font-medium ml-1 mt-1">{errors.fullName}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#424754] ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute right-6 top-1/2 -translate-y-1/2 text-[#c2c6d6]" size={20} />
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={cn(
                      "w-full bg-[#f6f3f2] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all placeholder:text-[#c2c6d6]",
                      errors.phoneNumber && "ring-2 ring-[#ba1a1a]/40 bg-[#ffdad6]/20"
                    )}
                  />
                  {errors.phoneNumber && <p className="text-xs text-[#ba1a1a] font-medium ml-1 mt-1">{errors.phoneNumber}</p>}
                </div>
              </div>
            </div>

            {/* Row 2: Govt ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#424754] ml-1">Aadhaar / Government ID</label>
              <div className="relative">
                <IdCard className="absolute right-6 top-1/2 -translate-y-1/2 text-[#c2c6d6]" size={20} />
                <input
                  type="text"
                  name="govtId"
                  value={formData.govtId}
                  onChange={handleChange}
                  placeholder="0000 0000 0000"
                  className={cn(
                    "w-full bg-[#f6f3f2] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all placeholder:text-[#c2c6d6]",
                    errors.govtId && "ring-2 ring-[#ba1a1a]/40 bg-[#ffdad6]/20"
                  )}
                />
                {errors.govtId && <p className="text-xs text-[#ba1a1a] font-medium ml-1 mt-1">{errors.govtId}</p>}
              </div>
            </div>

            {/* Row 3: Platform & City */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#424754] ml-1">Delivery Platform</label>
                <div className="relative">
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-[#c2c6d6] pointer-events-none" size={20} />
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className={cn(
                      "w-full bg-[#f6f3f2] border-none rounded-2xl px-6 py-4 appearance-none outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all text-[#424754]",
                      errors.platform && "ring-2 ring-[#ba1a1a]/40 bg-[#ffdad6]/20"
                    )}
                  >
                    <option disabled value="">Select Platform</option>
                    <option value="zomato">Zomato</option>
                    <option value="swiggy">Swiggy</option>
                    <option value="blinkit">Blinkit</option>
                    <option value="amazon">Amazon</option>
                    <option value="flipkart">Flipkart</option>
                    <option value="zepto">Zepto</option>
                  </select>
                  {errors.platform && <p className="text-xs text-[#ba1a1a] font-medium ml-1 mt-1">{errors.platform}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#424754] ml-1">Work City/Zone</label>
                <div className="relative">
                  <MapPin className="absolute right-6 top-1/2 -translate-y-1/2 text-[#c2c6d6]" size={20} />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore South"
                    className={cn(
                      "w-full bg-[#f6f3f2] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all placeholder:text-[#c2c6d6]",
                      errors.city && "ring-2 ring-[#ba1a1a]/40 bg-[#ffdad6]/20"
                    )}
                  />
                  {errors.city && <p className="text-xs text-[#ba1a1a] font-medium ml-1 mt-1">{errors.city}</p>}
                </div>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  className="mt-2 text-xs font-bold text-[#0058be] flex items-center gap-1.5 hover:underline ml-1"
                >
                  <MapPin size={12} /> Auto-detect my location
                </button>
              </div>
            </div>

            {/* Row 4: UPI ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#424754] ml-1">Payment Details (UPI ID)</label>
              <div className="relative">
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[#c2c6d6] font-bold text-xs uppercase tracking-tighter">UPI Verified</div>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleChange}
                  placeholder="yourname@upi"
                  className={cn(
                    "w-full bg-[#f6f3f2] border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#0058be]/20 focus:bg-[#ffffff] transition-all placeholder:text-[#c2c6d6]",
                    errors.upiId && "ring-2 ring-[#ba1a1a]/40 bg-[#ffdad6]/20"
                  )}
                />
              </div>
              <p className="text-[10px] text-[#424754]/60 font-medium ml-1">Payouts are settled instantly to this ID after claim approval.</p>
            </div>

            {/* Actions */}
            <div className="pt-8 flex flex-col md:flex-row items-center gap-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-12 py-5 bg-[#0058be] text-white rounded-full font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-[#0058be]/20 disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? <Loader2 className="animate-spin mr-2" size={24} /> : null}
                Save & Continue
              </button>
              <button
                type="button"
                onClick={() => navigate("/document-verification")}
                className="text-[#424754] font-semibold hover:text-[#0058be] transition-colors py-2 px-4"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>

        {/* Trust Banner */}
        {/* <div className="mt-20 flex items-start gap-8 bg-[#f6f3f2] rounded-3xl p-8 relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-md">
            <div className="w-12 h-12 bg-[#2170e4]/10 text-[#0058be] rounded-full flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-xl">Privacy First Architecture</h3>
            <p className="text-[#424754] text-sm leading-relaxed">
              Your personal data is encrypted and only used for verification purposes. We never share your details with platforms without your consent.
            </p>
          </div>
          <div className="hidden md:block absolute -right-12 -bottom-12 w-64 h-64 bg-[#0058be]/5 rounded-full blur-3xl"></div>
        </div> */}

        {/* Footer Badge */}
        {/* <footer className="mt-12 flex justify-center">
           <div className="inline-flex items-center gap-2 bg-[#f0edec] px-5 py-2.5 rounded-full">
               <CheckCircle2 size={14} className="text-[#424754]" />
               <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#424754]">Data Encrypted</span>
           </div>
        </footer> */}

        <DashboardFooter className="mt-12 bg-transparent border-t-0 shadow-none px-0" />
      </div>
    </div>
  );
}
