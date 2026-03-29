import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Users, AlertCircle, DollarSign, Activity, TrendingUp, 
  ArrowUpRight, ArrowDownRight, Bell, Zap, LayoutGrid, 
  ShieldAlert, Shield, FileText, Settings, Loader2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useAdminAuth } from "@/context/AdminAuthContext";

const chartData = [
  { name: "Mon", claims: 45, payouts: 120 },
  { name: "Tue", claims: 52, payouts: 140 },
  { name: "Wed", claims: 68, payouts: 180 },
  { name: "Thu", claims: 58, payouts: 160 },
  { name: "Fri", claims: 84, payouts: 210 },
  { name: "Sat", claims: 92, payouts: 250 },
  { name: "Sun", claims: 75, payouts: 190 },
];

const platformDataMock = [
  { name: "Zomato", value: 35, color: "#e42728" },
  { name: "Blinkit", value: 25, color: "#fcdc00" },
  { name: "Flipkart", value: 20, color: "#0456c8" },
  { name: "Amazon", value: 15, color: "#ff9900" },
  { name: "Zepto", value: 5, color: "#320b55" },
];

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get<any>("/admin/analytics/");
      setAnalytics(res);
    } catch (error) {
      console.error("Analytics fetch failed, using fallback:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    
    // History Middleware: Locked Navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.info("Admin Session Active", {
        description: "Please use the Secure Logout button to exit."
      });
    };
    window.addEventListener("popstate", handlePopState);
    
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const getStats = () => [
    { 
      label: "Total Workers", 
      value: analytics?.active_workers ?? "24.8k", 
      icon: Users, color: "text-[#004191]", bg: "bg-[#f0f4ff]", 
      change: "+12%", isUp: true 
    },
    { 
      label: "Active Claims", 
      value: analytics?.total_claims ?? "1,204", 
      icon: AlertCircle, color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]/40", 
      change: "+5%", isUp: true 
    },
    { 
      label: "Total Payouts", 
      value: analytics?.total_payouts ? `$${analytics.total_payouts}` : "$452.2k", 
      icon: DollarSign, color: "text-[#166534]", bg: "bg-[#f0fdf4]", 
      change: "+18%", isUp: true 
    },
    { 
      label: "Risk Incidents", 
      value: analytics?.risk_incidents ?? "14", 
      icon: Activity, color: "text-[#d97706]", bg: "bg-[#fffbeb]", 
      change: "-5.1%", isUp: false 
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#ba1a1a] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Syncing Platform Intel...</h2>
      </div>
    );
  }

  const statsList = getStats();
  const platformData = platformDataMock; // In real app, build this from API if available

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a] min-h-screen flex flex-col pb-10">
      
      {/* Admin Top Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#1b1c1b] text-white backdrop-blur-xl border-b border-[#434751]/30">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 cursor-pointer">
            <ShieldAlert className="text-[#ba1a1a]" size={28} />
            <span className="text-2xl font-extrabold tracking-tighter hidden sm:block">Zafby<span className="text-[#a8aebf] font-medium ml-1">Admin</span></span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 font-inter text-[11px] font-bold tracking-[0.1em] uppercase">
            <Link to="/admin/dashboard" className="text-white relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-1 after:bg-[#ba1a1a]">Overview</Link>
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

      {/* Main Admin Content */}
      <main className="flex-1 pt-32 px-6 max-w-[1400px] mx-auto w-full animate-in fade-in duration-700 space-y-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1b1c1b]">Platform Overview</h1>
            <p className="text-[#434751] font-medium text-lg mt-1">Live organizational metrics and infrastructure throughput.</p>
          </div>
          <button className="flex items-center space-x-2 text-[11px] font-inter font-bold text-[#ba1a1a] uppercase tracking-[0.15em] hover:bg-[#ffdad6]/40 px-5 py-3 rounded-full transition-colors border border-[#ffdad6]/60">
            <TrendingUp size={16} />
            <span>Generate Report</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsList.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-[#ffffff] p-8 md:p-10 rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500 hover:-translate-y-1 cursor-pointer group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={cn("p-4 w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-colors border border-[#e4e2e0]/30", stat.bg, stat.color)}>
                    <Icon size={28} />
                  </div>
                  <div className={cn("flex items-center text-[11px] font-inter font-bold uppercase tracking-[0.1em] px-3 py-1.5 rounded-full", stat.isUp ? "bg-[#e2f5e9] text-[#16a34a]" : "bg-[#fffbeb] text-[#d97706]")}>
                    {stat.isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-1">{stat.label}</p>
                  <h3 className="text-4xl font-extrabold text-[#1b1c1b] tracking-tight group-hover:text-[#004191] transition-colors">{stat.value}</h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Activity BarChart */}
          <div className="lg:col-span-2 bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-8 md:p-10 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)]">
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#1b1c1b]">Operational Throughput</h2>
                <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mt-1">7-Day Trailing Moving Average</p>
              </div>
              <div className="flex items-center space-x-8 bg-[#f5f3f1] px-6 py-3 rounded-full border border-[#e4e2e0]/80">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-[#1b1c1b] rounded-full" />
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] text-[#434751]">Claims</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 bg-[#e4e2e0] rounded-full" />
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] text-[#434751]">Payouts</span>
                </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e2e0" opacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a8aebf', fontSize: 11, fontWeight: 700 }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8aebf', fontSize: 11, fontWeight: 700 }} dx={-15} />
                  <Tooltip
                    cursor={{ fill: '#fcf9f8' }}
                    contentStyle={{ borderRadius: '1.5rem', border: '1px solid #e4e2e0', boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.5rem', fontWeight: "bold", fontFamily: "inherit", color: "#1b1c1b" }}
                  />
                  <Bar dataKey="claims" fill="#1b1c1b" radius={[8, 8, 4, 4]} barSize={28} />
                  <Bar dataKey="payouts" fill="#e4e2e0" radius={[8, 8, 4, 4]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Distribution PieChart */}
          <div className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-10 text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.4)] relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#004191] rounded-full -mr-20 -mt-20 blur-[100px] opacity-30 mix-blend-screen pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-extrabold tracking-tight mb-1">Platform Split</h2>
              <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mb-12">Active Market Distribution</p>

              <div className="relative h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {platformData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', background: '#333', color: '#fff' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                  <p className="text-4xl font-extrabold text-white tracking-tighter">24k</p>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em] mt-1">Live Gigs</p>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                {platformData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                      <span className="text-sm font-bold text-[#a8aebf] group-hover:text-white transition-colors">{p.name}</span>
                    </div>
                    <span className="text-sm font-extrabold text-white">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* System Feeds */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] overflow-hidden">
          <div className="p-8 md:p-10 border-b border-[#e4e2e0]/50 flex items-center justify-between bg-[#fcf9f8]/30">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-[#1b1c1b]">System Events</h2>
              <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-1">Global Audit Log</p>
            </div>
            <button className="text-[10px] font-inter font-bold text-[#ba1a1a] hover:bg-[#ffdad6]/40 px-5 py-2.5 rounded-full transition-colors uppercase tracking-[0.1em] border border-[#ffdad6]">
              View Full Log
            </button>
          </div>
          <div className="divide-y divide-[#e4e2e0]/50">
            {[
              { time: "2m", msg: "AI model 'RiskPredictor-v4' updated and deployed", status: "success", type: "system" },
              { time: "15m", msg: "Traffic disruption Sector 21 alerts sent to 450 workers", status: "warning", type: "alert" },
              { time: "45m", msg: "Batch payout processing completed for Zepto cohort", status: "success", type: "ops" },
              { time: "2h", msg: "Weather API timeout - secondary fallback engaged", status: "error", type: "infra" },
            ].map((log, i) => (
              <div key={i} className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-[#fcf9f8] transition-colors cursor-pointer group">
                <div className="flex items-start md:items-center space-x-6">
                  <div className={cn(
                    "w-14 h-14 shrink-0 rounded-[1.5rem] flex items-center justify-center transform group-hover:scale-105 transition-transform border border-[#e4e2e0]/50 shadow-sm",
                    log.status === "success" ? "bg-[#f0fdf4] text-[#16a34a]" :
                      log.status === "warning" ? "bg-[#fffbeb] text-[#d97706]" : "bg-[#ffdad6] text-[#ba1a1a]"
                  )}>
                    {log.status === "success" ? <Zap size={24} /> : <AlertCircle size={24} />}
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[#1b1c1b] leading-tight mb-1">{log.msg}</p>
                    <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em]">{log.type}</p>
                  </div>
                </div>
                <span className="text-[11px] font-inter font-bold text-[#434751] bg-[#f5f3f1] px-4 py-2 rounded-full self-start md:self-auto border border-[#e4e2e0]">
                  {log.time} ago
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

    </div>
  );
}
