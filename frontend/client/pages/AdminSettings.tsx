import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Key, Shield, Globe, Save, RotateCcw, AlertCircle, Settings as SettingsIcon, Zap, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminSettings() {
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const handleSave = () => {
    toast.success("System configurations updated securely.");
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a] min-h-screen flex flex-col pb-10">
      
      {/* Admin Top Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#1b1c1b] text-white backdrop-blur-xl border-b border-[#434751]/30">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
            <ShieldAlert className="text-[#ba1a1a]" size={28} />
            <span className="text-2xl font-extrabold tracking-tighter hidden sm:block">Zafby<span className="text-[#a8aebf] font-medium ml-1">Admin</span></span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 font-inter text-[11px] font-bold tracking-[0.1em] uppercase">
            <Link to="/admin/dashboard" className="text-[#a8aebf] hover:text-white transition-colors">Overview</Link>
            <Link to="/admin/workers" className="text-[#a8aebf] hover:text-white transition-colors">Workers</Link>
            <Link to="/admin/claims" className="text-[#a8aebf] hover:text-white transition-colors">Claims</Link>
            <Link to="/admin/alerts" className="text-[#a8aebf] hover:text-white transition-colors">Risk Sonar</Link>
          </nav>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center px-4 py-2 bg-[#ba1a1a]/20 text-[#ffb4ab] text-[10px] font-inter font-bold uppercase tracking-[0.15em] rounded-full border border-[#ba1a1a]/30">
              <span className="w-2 h-2 bg-[#ffb4ab] rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.8)]" />
              Live Feed
            </div>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-[#ffffff] text-[#1b1c1b] font-inter font-bold text-[10px] uppercase tracking-[0.15em] rounded-full hover:bg-[#e4e2e0] transition-colors">
              Secure Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 px-6 max-w-[1400px] mx-auto w-full animate-in fade-in duration-700 space-y-12">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1b1c1b]">System Configuration</h1>
            <p className="text-[#434751] mt-1 font-medium text-lg">Manage global platform parameters and infrastructure protocols.</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#ffffff] border border-[#e4e2e0] text-[#1b1c1b] hover:bg-[#f5f3f1] rounded-full transition-colors shadow-sm font-inter font-bold text-[11px] uppercase tracking-[0.1em]">
              <RotateCcw size={18} />
              <span>Reset</span>
            </button>
            <button onClick={handleSave} className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#1b1c1b] text-white rounded-full hover:bg-[#ba1a1a] transition-colors shadow-[0_12px_24px_-8px_rgba(27,28,27,0.3)] active:scale-[0.98] font-inter font-bold text-[11px] uppercase tracking-[0.1em]">
              <Save size={18} />
              <span>Commit Changes</span>
            </button>
          </div>
        </div>

        {/* Global Finance Rules */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
          <div className="p-8 md:p-10 border-b border-[#e4e2e0]/50 flex items-center space-x-5 bg-[#fcf9f8]/30">
            <div className="w-14 h-14 bg-[#ffffff] rounded-[1.5rem] shadow-sm border border-[#e4e2e0]/80 flex items-center justify-center">
              <Globe className="text-[#004191]" size={24} />
            </div>
            <div>
               <h3 className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-1">Global Parameters</h3>
               <p className="text-xl font-extrabold text-[#1b1c1b] tracking-tight">Platform Payout Rules</p>
            </div>
          </div>
          <div className="p-8 md:p-12 grid md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-lg font-extrabold text-[#1b1c1b] tracking-tight">Maximum Daily Sub-Limit</label>
                <span className="text-[10px] font-inter font-bold text-[#ba1a1a] uppercase tracking-[0.15em] bg-[#ffdad6]/40 px-3 py-1.5 rounded-full">Global Cap</span>
              </div>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a8aebf] font-extrabold text-xl group-focus-within:text-[#1b1c1b] transition-colors">$</span>
                <input
                  type="number"
                  defaultValue="250"
                  className="w-full pl-12 pr-6 py-5 bg-[#f5f3f1] border border-[#e4e2e0] rounded-full focus:ring-2 focus:ring-[#004191] focus:border-transparent outline-none font-extrabold text-xl text-[#1b1c1b] transition-all appearance-none shadow-sm"
                />
              </div>
              <p className="text-xs font-inter font-medium text-[#434751] leading-relaxed">System-wide verification freeze is triggered automatically if any individual claim exceeds this threshold in a 24-hour bracket.</p>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="text-lg font-extrabold text-[#1b1c1b] tracking-tight">AI Matrix Sensitivity</label>
                <span className="text-[10px] font-inter font-bold text-[#004191] uppercase tracking-[0.15em] bg-[#f0f4ff] px-3 py-1.5 rounded-full">Model Weights</span>
              </div>
              <div className="pt-6">
                <input type="range" className="w-full h-2 bg-[#e4e2e0] rounded-full appearance-none cursor-pointer accent-[#1b1c1b]" defaultValue={50} />
                <div className="flex justify-between text-[11px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-6">
                  <span className="text-[#16a34a]">Conservative</span>
                  <span className="text-[#1b1c1b]">Balanced</span>
                  <span className="text-[#ba1a1a]">Aggressive</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">
          
          {/* Security Protocols */}
          <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
            <div className="p-8 md:p-10 border-b border-[#e4e2e0]/50 flex items-center space-x-5 bg-[#fcf9f8]/30">
              <div className="w-14 h-14 bg-[#ffffff] rounded-[1.5rem] shadow-sm border border-[#e4e2e0]/80 flex items-center justify-center">
                <Shield className="text-[#16a34a]" size={24} />
              </div>
              <div>
                 <h3 className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-1">Access Control</h3>
                 <p className="text-xl font-extrabold text-[#1b1c1b] tracking-tight">Security Protocols</p>
              </div>
            </div>
            <div className="p-8 md:p-10 space-y-10">
              {[
                { label: "Admin Multi-Factor Auth", desc: "Mandatory requirement for root tier", active: true },
                { label: "IP Pinning & Geo-lock", desc: "Auto-kill session on foreign nodes", active: false },
                { label: "Biometric Withdrawal API", desc: "Enforce web-authn for bulk payouts", active: true },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center justify-between group cursor-pointer border-b border-[#e4e2e0]/30 pb-6 last:pb-0 last:border-0">
                  <div className="flex-1 pr-6">
                    <p className="text-[15px] font-extrabold text-[#1b1c1b] tracking-tight group-hover:text-[#004191] transition-colors">{rule.label}</p>
                    <p className="text-[11px] font-medium text-[#434751] mt-1.5">{rule.desc}</p>
                  </div>
                  <div className={cn(
                    "w-14 h-7 rounded-full relative transition-colors duration-500 cursor-pointer flex items-center px-1.5 shrink-0",
                    rule.active ? "bg-[#1b1c1b]" : "bg-[#e4e2e0]"
                  )}>
                    <div className={cn(
                      "w-4 h-4 rounded-full transition-transform duration-500 shadow-md",
                      rule.active ? "bg-[#ffffff] translate-x-7" : "bg-[#ffffff] translate-x-0"
                    )} />
                  </div>
                </div>
              ))}
              <button className="w-full h-16 bg-[#f5f3f1] text-[#1b1c1b] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#e4e2e0] transition-colors active:scale-[0.98] flex items-center justify-center space-x-3 mt-4">
                <SettingsIcon size={18} />
                <span>Identity Access Matrix</span>
              </button>
            </div>
          </div>

          {/* Cloud API Connectors */}
          <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
            <div className="p-8 md:p-10 border-b border-[#e4e2e0]/50 flex items-center space-x-5 bg-[#fcf9f8]/30">
              <div className="w-14 h-14 bg-[#ffffff] rounded-[1.5rem] shadow-sm border border-[#e4e2e0]/80 flex items-center justify-center">
                <Key className="text-[#d97706]" size={24} />
              </div>
              <div>
                 <h3 className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-1">External Data Links</h3>
                 <p className="text-xl font-extrabold text-[#1b1c1b] tracking-tight">Cloud Integrations</p>
              </div>
            </div>
            <div className="p-8 md:p-10 space-y-8">
              {[
                { label: "WeatherStack Parametric Core", status: "Operational" },
                { label: "Google Places Neural Routing", status: "Operational" },
                { label: "Stripe Connect v4 Treasury", status: "Operational" }
              ].map((service) => (
                <div key={service.label} className="space-y-3 group border-b border-[#e4e2e0]/30 pb-6 last:pb-0 last:border-0 border-dashed">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] group-hover:text-[#1b1c1b] transition-colors">{service.label}</p>
                    <span className="text-[10px] font-inter font-bold text-[#16a34a] uppercase bg-[#e2f5e9] px-2 py-1 rounded-full">{service.status}</span>
                  </div>
                  <div className="relative">
                    <input type="password" value="••••••••••••••••••••••••••••••••" readOnly className="w-full bg-[#fcf9f8] px-5 py-4 rounded-xl border border-[#e4e2e0]/50 font-bold text-[#a8aebf] text-sm focus:ring-0 outline-none" />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-inter font-bold text-[#004191] uppercase tracking-[0.15em] hover:bg-[#f0f4ff] px-4 py-2 rounded-lg transition-colors shadow-sm bg-[#ffffff] border border-[#e4e2e0]">
                      Rotate Key
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full h-16 bg-[#f0f4ff] text-[#004191] hover:bg-[#004191] hover:text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full transition-colors active:scale-[0.98] flex items-center justify-center space-x-3 mt-4">
                <Zap size={18} />
                <span>Inject New Provider</span>
              </button>
            </div>
          </div>
        </div>

        {/* Deep Emergency Red Sector */}
        <section className="bg-[#ba1a1a] rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(186,26,26,0.3)]">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#ffffff] rounded-full -ml-32 -mt-32 blur-[150px] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-24 h-24 bg-[#ffffff]/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-[#ffffff] shadow-inner border border-white/20">
                <AlertCircle size={44} />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-extrabold tracking-tight mb-2">Global System Freeze</h3>
                <p className="text-[#ffdad6] font-medium text-[15px] max-w-lg leading-relaxed">Engaging freeze will immediately halt all public telemetry collection, automated payouts, and worker application onboarding system-wide.</p>
              </div>
            </div>
            <button className="px-10 py-5 bg-[#ffffff] text-[#ba1a1a] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#fcf9f8] transition-colors active:scale-[0.98] shadow-2xl whitespace-nowrap">
              Execute Total Override
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
