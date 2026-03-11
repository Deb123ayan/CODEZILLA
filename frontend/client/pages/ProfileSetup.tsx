import React, { useState, useEffect } from "react";
import { User, Phone, IdCard, MapPin, Truck, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { authApi } from "@/lib/api";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { platform, username, phoneNumber, updateUserInfo } = useUserAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: username || "",
    phoneNumber: phoneNumber || "",
    govtId: "",
    platform: platform ? platform.toLowerCase() : "",
    city: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePlatformChange = (value: string) => {
    setFormData((prev) => ({ ...prev, platform: value }));
    if (errors.platform) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.platform;
        return updated;
      });
    }
  };

  useEffect(() => {
    const prefillData = async () => {
      if (!phoneNumber) return;
      try {
        const data = await authApi.getMe(phoneNumber);
        setFormData({
          fullName: data.name || username || "",
          phoneNumber: data.phone || phoneNumber || "",
          govtId: data.govt_id || "",
          platform: data.platform ? data.platform.toLowerCase() : (platform ? platform.toLowerCase() : ""),
          city: data.city || "",
        });
      } catch (err) {
        console.error("Failed to prefill data", err);
      }
    };
    prefillData();
  }, [phoneNumber, username, platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const apiData = {
        name: formData.fullName,
        govt_id: formData.govtId,
        city: formData.city,
        // Add defaults or more fields if needed by backend
        weekly_earnings: 5000, 
        working_hours: 8,
        working_days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      };

      await authApi.updateProfile(phoneNumber, apiData);
      
      // Update local context to reflect the new name
      updateUserInfo({ username: formData.fullName });

      toast.success("Profile details saved successfully!");
      navigate("/document-verification");
    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Subtle Background Gradient */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#2563eb]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#10b981]/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-[500px] animate-in fade-in zoom-in duration-500">
        {/* Progress Indicator */}
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#2563eb] text-white flex items-center justify-center text-xs font-bold">1</div>
            <span className="text-sm font-semibold text-gray-900">Step 1 of 3</span>
          </div>
          <div className="flex space-x-1">
            <div className="w-12 h-1.5 rounded-full bg-[#2563eb]" />
            <div className="w-12 h-1.5 rounded-full bg-gray-200" />
            <div className="w-12 h-1.5 rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 transition-all">
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Complete Your Profile</h1>
            <p className="text-gray-500 text-sm font-medium">Verify your details to activate income protection</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.fullName ? "text-red-400" : "text-gray-300 group-focus-within:text-[#2563eb]")} size={18} />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full legal name"
                  className={cn(
                    "w-full bg-white border border-gray-200 rounded-xl h-14 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 placeholder:text-gray-300",
                    errors.fullName ? "border-red-500 focus:ring-red-100" : "focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                  )}
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.fullName}</p>}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
              <div className="relative group">
                <Phone className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.phoneNumber ? "text-red-400" : "text-gray-300 group-focus-within:text-[#2563eb]")} size={18} />
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+91 00000 00000"
                  className={cn(
                    "w-full bg-white border border-gray-200 rounded-xl h-14 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 placeholder:text-gray-300",
                    errors.phoneNumber ? "border-red-500 focus:ring-red-100" : "focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                  )}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                />
                {errors.phoneNumber && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.phoneNumber}</p>}
              </div>
            </div>

            {/* Govt ID */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Aadhaar / Government ID</label>
              <div className="relative group">
                <IdCard className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.govtId ? "text-red-400" : "text-gray-300 group-focus-within:text-[#2563eb]")} size={18} />
                <input
                  type="text"
                  name="govtId"
                  placeholder="XXXX XXXX XXXX"
                  className={cn(
                    "w-full bg-white border border-gray-200 rounded-xl h-14 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 placeholder:text-gray-300",
                    errors.govtId ? "border-red-500 focus:ring-red-100" : "focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                  )}
                  value={formData.govtId}
                  onChange={handleChange}
                />
                {errors.govtId && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.govtId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Platform */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Delivery Platform</label>
                <div className="relative group">
                  <Select onValueChange={handlePlatformChange} value={formData.platform} disabled>
                    <SelectTrigger className={cn(
                      "w-full h-14 bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 text-sm font-medium focus:ring-2 transition-all opacity-70 cursor-not-allowed",
                      errors.platform ? "border-red-500 focus:ring-red-100" : "focus:ring-[#2563eb]/10"
                    )}>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 transition-colors">
                        <Truck size={18} />
                      </div>
                      <SelectValue placeholder={platform ? platform : "Select Platform"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-gray-100">
                      {["Zomato", "Blinkit", "Flipkart", "Amazon", "Zepto", "Swiggy"].map(p => (
                        <SelectItem key={p} value={p.toLowerCase()} className="rounded-lg font-medium py-3 cursor-pointer">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.platform && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.platform}</p>}
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Work City / Zone</label>
                <div className="relative group">
                  <MapPin className={cn("absolute left-4 top-1/2 -translate-y-1/2 transition-colors", errors.city ? "text-red-400" : "text-gray-300 group-focus-within:text-[#2563eb]")} size={18} />
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai South"
                    className={cn(
                      "w-full bg-white border border-gray-200 rounded-xl h-14 pl-12 pr-4 text-sm font-medium transition-all focus:outline-none focus:ring-2 placeholder:text-gray-300",
                      errors.city ? "border-red-500 focus:ring-red-100" : "focus:border-[#2563eb] focus:ring-[#2563eb]/10"
                    )}
                    value={formData.city}
                    onChange={handleChange}
                  />
                  {errors.city && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{errors.city}</p>}
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-[#2563eb] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Save & Continue</span>
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/document-verification")}
                className="w-full h-12 bg-transparent text-gray-400 hover:text-gray-900 font-bold text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                Skip for now
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-center space-x-3 text-gray-400">
          <CheckCircle2 size={16} className="text-[#10b981]" />
          <p className="text-[10px] font-bold uppercase tracking-widest leading-none">Your data is encrypted with 256-bit security</p>
        </div>
      </div>
    </div>
  );
}
