import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  User, Bell, Shield, Smartphone, LogOut, ChevronRight, Globe, 
  CreditCard, Edit3, LayoutGrid, Home
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { cn } from "@/lib/utils";

export default function Settings() {
  const { username, platform, phoneNumber } = useUserAuth();
  const navigate = useNavigate();

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
        { label: "Payout Methods", icon: CreditCard, value: "UPI, Bank", description: "Where your earnings are sent" },
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
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-[#e4e2e0]/50">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto md:px-8 md:py-6">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src="/logo.png" alt="Zafby Logo" className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform duration-500" />
            <span className="text-2xl font-extrabold tracking-tighter text-[#1b1c1b]">Zafby</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 font-inter text-[11px] font-bold tracking-[0.05em] uppercase">
              <Link to="/dashboard" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Home</Link>
              <Link to="/deliveries" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Tasks</Link>
              <Link to="/policies" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Protection</Link>
              <Link to="/payouts" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Earnings</Link>
            </nav>
            <div 
              className="w-10 h-10 rounded-full bg-[#1b1c1b] text-white flex items-center justify-center font-bold text-lg shadow-inner cursor-pointer ring-2 ring-offset-2 ring-offset-[#fcf9f8] ring-[#e4e2e0]"
              title={username || "User"}
            >
              {username ? username.charAt(0).toUpperCase() : "U"}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-40 px-6 max-w-5xl mx-auto w-full animate-in fade-in duration-700 space-y-12">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
            Profile Settings
          </h1>
          <p className="text-[#434751] mt-2 font-medium text-lg">Manage your workspace preferences.</p>
        </div>

        {/* User Card */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0f4ff] rounded-full -mr-32 -mt-32 blur-[60px] opacity-70" />
          
          <div className="relative z-10">
            <div className="w-32 h-32 bg-gradient-to-tr from-[#004191] to-[#0058be] rounded-[2rem] flex items-center justify-center text-white text-4xl font-extrabold shadow-[0_12px_24px_-8px_rgba(0,65,145,0.4)] relative group cursor-pointer transition-transform hover:scale-105">
              <span>{getInitials(username || "GU")}</span>
              <div className="absolute inset-0 bg-[#1b1c1b]/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center">
                <Edit3 className="text-white" size={28} />
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1 min-w-0 relative z-10">
             <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
               <h2 className="text-3xl font-extrabold text-[#1b1c1b] tracking-tight">{username || "Guest User"}</h2>
               <div className="flex gap-2 justify-center md:justify-start">
                 <span className="px-3 py-1 bg-[#fffbeb] text-[#d97706] text-[10px] font-inter font-bold uppercase tracking-widest rounded-full border border-[#fde68a]">Gold Tier</span>
                 <span className="px-3 py-1 bg-[#f0fdf4] text-[#166534] text-[10px] font-inter font-bold uppercase tracking-widest rounded-full border border-[#bbf7d0]">Verified</span>
               </div>
             </div>
             <p className="text-[#a8aebf] font-medium text-sm">Gig Leaderboard: #420 &bull; Joined Oct 2023</p>
          </div>
          
          <button className="relative z-10 px-8 py-5 w-full md:w-auto bg-[#1b1c1b] text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#434751] transition-all active:scale-[0.98] shadow-lg">
             Save Changes
          </button>
        </div>

        {/* Options Bento */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
          {settingsSections.map((section, idx) => (
            <div key={section.title} className={idx !== 0 ? "border-t border-[#e4e2e0]/50" : ""}>
              <div className="px-8 md:px-12 py-8 bg-[#fcf9f8]/50">
                <h3 className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em]">{section.title}</h3>
              </div>
              <div className="divide-y divide-[#e4e2e0]/50">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="px-8 md:px-12 py-8 flex items-center justify-between hover:bg-[#fcf9f8] transition-colors cursor-pointer group">
                      <div className="flex items-center space-x-6">
                        <div className="p-4 bg-[#f5f3f1] group-hover:bg-[#004191] group-hover:text-white rounded-2xl text-[#a8aebf] transition-all duration-300">
                          <Icon size={24} />
                        </div>
                        <div>
                          <p className="text-lg font-extrabold text-[#1b1c1b] mb-1">{item.label}</p>
                          <p className="text-sm font-medium text-[#434751]">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="hidden sm:block text-[11px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest">{item.value}</span>
                        <ChevronRight size={20} className="text-[#a8aebf] group-hover:text-[#1b1c1b] group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Danger Zone */}
        <div className="bg-[#ffdad6]/20 border border-[#ffdad6] rounded-[3rem] p-8 md:p-12">
          <h3 className="text-2xl font-extrabold text-[#ba1a1a] mb-4">Danger Zone</h3>
          <p className="text-[#ba1a1a]/80 font-medium text-sm leading-relaxed mb-8 max-w-2xl">
            Deleting your account is permanent and will cancel all active policies without a refund. Your work history and eligibility for future platforms will be permanently lost.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
             <button className="flex items-center justify-center space-x-3 px-8 py-5 bg-[#ffffff] border border-[#ffdad6]/50 text-[#ba1a1a] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#ffdad6]/30 transition-all active:scale-[0.98] shadow-sm">
               <LogOut size={16} />
               <span>Sign Out Everywhere</span>
             </button>
             <button className="px-8 py-5 bg-[#ba1a1a] text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#ba1a1a]/90 transition-all active:scale-[0.98] shadow-lg shadow-[#ba1a1a]/20">
               Delete My Profile
             </button>
          </div>
        </div>

      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#ffffff]/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(27,28,27,0.06)] rounded-t-[2.5rem] border-t border-[#e4e2e0]/40 px-6 py-6 pb-8">
        <div className="flex justify-between items-center max-w-sm mx-auto">
          <Link to="/dashboard" className="flex flex-col items-center justify-center text-[#434751] px-4 py-2 hover:text-[#004191] transition-all">
            <Home size={22} />
            <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1 text-[#434751]">Home</span>
          </Link>
          <Link to="/deliveries" className="flex flex-col items-center justify-center text-[#434751] px-4 py-2 hover:text-[#004191] transition-all">
            <LayoutGrid size={22} />
            <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1 text-[#434751]">Tasks</span>
          </Link>
          <Link to="/policies" className="flex flex-col items-center justify-center text-[#434751] px-4 py-2 hover:text-[#004191] transition-all">
            <Shield size={22} />
            <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1 text-[#434751]">Safety</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center justify-center bg-gradient-to-br from-[#004191] to-[#0058be] text-white rounded-full px-5 py-2.5 shadow-md">
            <User size={22} strokeWidth={2.5} />
            <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
