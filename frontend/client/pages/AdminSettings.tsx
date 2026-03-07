import Sidebar from "@/components/Sidebar";
import { Key, Shield, Globe, Database, Save, RotateCcw, AlertCircle, Settings as SettingsIcon, ChevronRight, Smartphone, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
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

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar isAdmin={true} />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-16 sm:pl-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">System Configuration</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Global parameters and security protocols</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black rounded-2xl transition-all shadow-sm">
                <RotateCcw size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Reset</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                <Save size={18} />
                <span className="text-sm font-bold">Save Changes</span>
              </button>
            </div>
          </div>
        </header>

        <div className="section-padding space-y-12">
          {/* General Platform Rules */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active">
            <div className="p-8 border-b border-gray-50 flex items-center space-x-4 bg-gray-50/30">
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <Globe className="text-blue-600" size={20} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Platform Payout Rules</h3>
            </div>
            <div className="p-10 grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-base font-black text-gray-900 tracking-tight">Daily Payout Limit</label>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Global Cap</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg group-focus-within:text-black transition-colors">₹</span>
                  <input
                    type="number"
                    defaultValue="5000"
                    className="w-full pl-12 pr-6 py-5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black outline-none font-black text-xl transition-all appearance-none"
                  />
                </div>
                <p className="text-xs font-bold text-gray-400 leading-relaxed italic">Verification is triggered automatically if a worker exceeds this threshold.</p>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="text-base font-black text-gray-900 tracking-tight">Risk Sensitivity</label>
                  <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">AI Profile</span>
                </div>
                <div className="pt-4">
                  <input type="range" className="w-full h-1.5 bg-gray-100 rounded-full appearance-none cursor-pointer accent-black" />
                  <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mt-6">
                    <span className="text-blue-600">Passive</span>
                    <span className="text-black">Balanced</span>
                    <span className="text-red-600">Aggressive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Security & Access */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "200ms" }}>
              <div className="p-8 border-b border-gray-50 flex items-center space-x-4 bg-gray-50/30">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Shield className="text-green-600" size={20} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Security Protocols</h3>
              </div>
              <div className="p-10 space-y-10 px-6 sm:px-10">
                {[
                  { label: "Admin Multi-Factor Auth", desc: "Mandatory for all root accounts", active: true },
                  { label: "IP Pinning & Geo-lock", desc: "Force sign-out on suspicious shifts", active: false },
                  { label: "Biometric Approval", desc: "Require touch ID for high payouts", active: true },
                ].map((rule) => (
                  <div key={rule.label} className="flex items-center justify-between group">
                    <div className="flex-1 pr-6">
                      <p className="text-base font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{rule.label}</p>
                      <p className="text-xs font-bold text-gray-400 mt-0.5">{rule.desc}</p>
                    </div>
                    <div className={cn(
                      "w-14 h-7 rounded-full relative transition-all duration-500 cursor-pointer flex items-center px-1.5 shrink-0",
                      rule.active ? "bg-black" : "bg-gray-100"
                    )}>
                      <div className={cn(
                        "w-4 h-4 rounded-full transition-transform duration-500 shadow-md",
                        rule.active ? "bg-white translate-x-7" : "bg-gray-400 translate-x-0"
                      )} />
                    </div>
                  </div>
                ))}
                <button className="w-full h-14 bg-gray-50 text-gray-400 hover:text-black hover:bg-white border-2 border-transparent hover:border-gray-100 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 flex items-center justify-center space-x-3">
                  <SettingsIcon size={16} />
                  <span>Manage Permissions</span>
                </button>
              </div>
            </div>

            {/* API Integrations */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "300ms" }}>
              <div className="p-8 border-b border-gray-50 flex items-center space-x-4 bg-gray-50/30">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                  <Key className="text-orange-600" size={20} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Cloud Integrations</h3>
              </div>
              <div className="p-10 space-y-8">
                {[
                  { label: "WeatherStack (Enterprise)", color: "text-blue-600" },
                  { label: "Google Maps SDK", color: "text-red-600" },
                  { label: "UPI Settlement v3", color: "text-green-600" }
                ].map((service) => (
                  <div key={service.label} className="space-y-3 group">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">{service.label}</p>
                      <span className="text-[10px] font-black text-green-600 uppercase">Linked</span>
                    </div>
                    <div className="relative">
                      <input type="password" value="••••••••••••••••••••" readOnly className="w-full bg-gray-50 px-5 py-4 rounded-2xl border-none font-bold text-gray-400 text-sm focus:ring-0 outline-none" />
                      <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:bg-white px-3 py-1.5 rounded-lg transition-all shadow-sm">
                        Refresh
                      </button>
                    </div>
                  </div>
                ))}
                <button className="w-full h-14 bg-blue-50/50 text-blue-600 hover:bg-blue-600 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95 flex items-center justify-center space-x-3">
                  <Zap size={16} />
                  <span>Connect New SDK</span>
                </button>
              </div>
            </div>
          </div>

          {/* Critical Maintenance */}
          <section className="bg-red-50/30 border border-red-100/50 rounded-[2.5rem] p-10 md:p-14 reveal active" style={{ transitionDelay: "400ms" }}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                  <AlertCircle size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-red-900 tracking-tight">System Freeze Mode</h3>
                  <p className="text-sm font-medium text-red-700/70 mt-1 max-w-sm">Emergency shutdown for all public traffic and payout processing.</p>
                </div>
              </div>
              <button className="px-10 py-5 bg-red-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-red-700 transition-all active:scale-95 shadow-xl shadow-red-200">
                Activate Shutdown
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
