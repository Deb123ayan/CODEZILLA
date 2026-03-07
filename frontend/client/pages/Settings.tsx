import Sidebar from "@/components/Sidebar";
import { User, Bell, Shield, Smartphone, LogOut, ChevronRight, Globe, CreditCard, Edit3 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";

export default function Settings() {
  const { username, platform, phoneNumber } = useUserAuth();
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 20);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const getInitials = (num: string) => {
    return num.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        { label: "Profile Information", icon: User, value: username || "Guest User", description: "Personal details and display name" },
        { label: "Email Address", icon: Globe, value: `${(username || "guest").toLowerCase().replace(/\s+/g, ".")}@example.com`, description: "Primary contact and login email" },
        { label: "Phone Number", icon: Smartphone, value: phoneNumber || "+91 00000 00000", description: "Mobile number for SMS alerts" },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Notifications", icon: Bell, value: "Push, Email", description: "Manage what alerts you receive" },
        { label: "Connected Platforms", icon: Smartphone, value: platform ? platform.charAt(0).toUpperCase() + platform.slice(1) : "None", description: "Link your work platform accounts" },
        { label: "Payout Methods", icon: CreditCard, value: "HDFC, GPay", description: "Where your earnings are sent" },
      ],
    },
    {
      title: "Security",
      items: [
        { label: "Password", icon: Shield, value: "Updated 3mo ago", description: "Change your account password" },
        { label: "Two-Factor Auth", icon: Shield, value: "Active", description: "Secure your account with 2FA" },
      ],
    },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-16 sm:pl-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Profile Settings</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Manage your workspace preferences</p>
            </div>
          </div>
        </header>

        <div className="section-padding max-w-5xl mx-auto space-y-12">
          {/* User Profile Hook */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm flex flex-col md:flex-row items-center gap-10 reveal active">
            <div className="relative group overflow-hidden rounded-full p-1 bg-gradient-to-tr from-blue-600 to-indigo-600">
              <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-gray-900 text-3xl font-black shadow-2xl relative overflow-hidden">
                <span className="group-hover:opacity-0 transition-opacity">{getInitials(username || "GU")}</span>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Edit3 className="text-white" size={24} />
                </div>
              </div>
            </div>
            <div className="text-center md:text-left flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{username || "Guest User"}</h2>
                <div className="flex gap-2 justify-center md:justify-start">
                  <span className="px-3 py-1 bg-yellow-50 text-yellow-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-100">Gold Tier</span>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">Verified</span>
                </div>
              </div>
              <p className="text-gray-400 font-bold text-sm tracking-tight">Gig Leaderboard: #420 • Joined Oct 2023</p>
            </div>
            <button className="px-8 py-4 bg-black text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl">
              Save Changes
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "200ms" }}>
            {settingsSections.map((section, idx) => (
              <div key={section.title} className={idx !== 0 ? "border-t border-gray-50" : ""}>
                <div className="px-10 py-6 bg-gray-50/50">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{section.title}</h3>
                </div>
                <div className="divide-y divide-gray-50 px-2 lg:px-4 pb-2 lg:pb-4">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="p-6 md:p-8 flex items-center justify-between hover:bg-gray-50 rounded-[1.5rem] cursor-pointer transition-all duration-300 group">
                        <div className="flex items-center space-x-6">
                          <div className="p-4 bg-gray-50 group-hover:bg-black group-hover:text-white rounded-2xl text-gray-400 transition-all duration-300">
                            <Icon size={22} />
                          </div>
                          <div>
                            <p className="text-base font-black text-gray-900 tracking-tight">{item.label}</p>
                            <p className="text-xs font-bold text-gray-400 mt-0.5">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="hidden sm:block text-xs font-black text-gray-400 uppercase tracking-widest">{item.value}</span>
                          <ChevronRight size={20} className="text-gray-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/30 border border-red-100/50 rounded-[2.5rem] p-10 md:p-14 reveal active" style={{ transitionDelay: "400ms" }}>
            <h3 className="text-xl font-black text-red-900 mb-2">Danger Zone</h3>
            <p className="text-sm font-medium text-red-700 leading-relaxed mb-10 max-w-2xl">
              Deleting your account is permanent and will cancel all active policies without a refund. Your work history and eligibility for future platforms will be permanently lost.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center space-x-3 px-8 py-4 bg-white border border-red-100 text-red-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-50 transition-all active:scale-95 shadow-sm">
                <LogOut size={18} />
                <span>Sign Out Everywhere</span>
              </button>
              <button className="px-8 py-4 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-red-700 transition-all active:scale-95 shadow-lg">
                Delete My Profile
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
