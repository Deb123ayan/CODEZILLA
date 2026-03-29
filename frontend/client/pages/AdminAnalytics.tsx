import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  TrendingUp, Users, Target, Zap, ArrowUpRight, Loader2, ShieldAlert
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stats, zones] = await Promise.all([
        api.get<any>("/admin/analytics/"),
        api.get<any[]>("/admin/risk-zones/")
      ]);
      setAnalytics(stats);
      setHeatmap(zones.map(z => ({
        name: z.zone,
        risk: z.avg_severity || 0,
        events: z.event_count || 0
      })));
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
            <Link to="/admin/analytics" className="text-white relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-1 after:bg-[#ba1a1a]">Analytics</Link>
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
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1b1c1b]">Quantitative Analytics</h1>
            <p className="text-[#434751] mt-1 font-medium text-lg">Statistical ecosystem deep dive and trajectory forecasts.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-64 mt-16 flex flex-col items-center justify-center space-y-6">
            <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
            <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">Pulling Global Telemetry...</p>
          </div>
        ) : (
          <>
            {/* Detailed Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-10 text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.4)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#16a34a] rounded-full -mr-16 -mt-16 blur-[100px] opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-40" />
                <div className="relative z-10">
                  <div className="p-4 bg-[#30343f]/30 border border-[#434751]/50 rounded-[1.5rem] w-16 h-16 flex items-center justify-center mb-10 shadow-sm">
                    <Target size={28} className="text-[#16a34a]" />
                  </div>
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-2">Net Platform Yield</p>
                  <h3 className="text-5xl font-extrabold tracking-tighter text-white">${analytics?.revenue?.net_revenue ? (analytics.revenue.net_revenue / 1000).toFixed(1) + 'k' : '452.1k'}</h3>
                  <div className="mt-8 flex items-center">
                    <span className="px-4 py-1.5 bg-[#16a34a]/20 text-[#22c55e] border border-[#16a34a]/30 text-[10px] font-inter font-bold uppercase tracking-[0.15em] rounded-full shadow-sm">
                      {analytics?.revenue?.loss_ratio_percent || 12.4}% Loss Tolerance
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-[3rem] p-8 md:p-10 border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500 group cursor-pointer">
                <div className="p-4 bg-[#f0fdf4] text-[#16a34a] border border-[#dcfce7] rounded-[1.5rem] w-16 h-16 flex items-center justify-center mb-10 group-hover:bg-[#16a34a] group-hover:text-white transition-colors shadow-sm">
                  <TrendingUp size={28} />
                </div>
                <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] group-hover:text-[#434751] transition-colors mb-2">Total Retained Policies</p>
                <h3 className="text-5xl font-extrabold tracking-tighter text-[#1b1c1b] group-hover:text-[#004191] transition-colors">{analytics?.policies?.active || '18,491'}</h3>
                <div className="mt-8 flex items-center space-x-4">
                  <div className="flex-1 h-2 bg-[#f5f3f1] rounded-full overflow-hidden border border-[#e4e2e0]/50">
                    <div className="h-full bg-[#16a34a] w-[78%] group-hover:w-full transition-all duration-1000 ease-out" />
                  </div>
                  <span className="text-[11px] font-inter font-bold text-[#434751]">{analytics?.policies?.active ? Math.round((analytics.policies.active / analytics.policies.total) * 100) : 88}%</span>
                </div>
              </div>

              <div className="bg-[#ffffff] rounded-[3rem] p-8 md:p-10 border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500 group cursor-pointer">
                <div className="p-4 bg-[#f0f4ff] text-[#004191] border border-[#dbeafe] rounded-[1.5rem] w-16 h-16 flex items-center justify-center mb-10 group-hover:bg-[#004191] group-hover:text-white transition-colors shadow-sm">
                  <Users size={28} />
                </div>
                <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] group-hover:text-[#434751] transition-colors mb-2">Gig Contributor Network</p>
                <h3 className="text-5xl font-extrabold tracking-tighter text-[#1b1c1b] group-hover:text-[#004191] transition-colors">{analytics?.workers?.total || '24,812'}</h3>
                <div className="mt-8 flex items-center space-x-3">
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#16a34a] bg-[#e2f5e9] px-3 py-1.5 rounded-full flex items-center border border-[#16a34a]/20">
                    <ArrowUpRight size={14} className="mr-1.5" />
                    +{analytics?.workers?.new_this_week || 412} Pipeline
                  </span>
                </div>
              </div>
              
            </div>

            <div className="grid lg:grid-cols-2 gap-10">
              
              {/* Trend Analysis */}
              <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-8 md:p-10 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-extrabold tracking-tight text-[#1b1c1b]">Logistics Allocation</h2>
                    <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-1.5">Ecosystem load across applications</p>
                  </div>
                </div>
                <div className="h-[350px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics?.platform_breakdown || [{platform: 'Zomato', count: 12}, {platform: 'A', count: 20}]}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#004191" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#004191" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e2e0" opacity={0.6} />
                      <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: '#a8aebf', fontSize: 11, fontWeight: 700 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#a8aebf', fontSize: 11, fontWeight: 700 }} dx={-15} />
                      <Tooltip
                        contentStyle={{ borderRadius: '1.5rem', border: '1px solid #e4e2e0', boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.5rem', fontWeight: "bold", fontFamily: "inherit", color: "#1b1c1b" }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#004191" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Zone Risk Score */}
              <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-8 md:p-10 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500">
                <div className="mb-10">
                  <h2 className="text-2xl font-extrabold tracking-tight text-[#1b1c1b]">Geospatial Hotspots</h2>
                  <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-1.5">Velocity and severity grouping</p>
                </div>
                <div className="h-[350px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heatmap.length ? heatmap : [{name: 'Delhi', risk: 8}, {name: 'Mumbai', risk: 6}]} layout="vertical">
                      <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e4e2e0" opacity={0.6} />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#a8aebf', fontSize: 11, fontWeight: 700 }} dx={-15} />
                      <Tooltip
                        cursor={{ fill: '#fcf9f8' }}
                        contentStyle={{ borderRadius: '1.5rem', border: '1px solid #e4e2e0', boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.5rem', fontWeight: "bold", fontFamily: "inherit", color: "#1b1c1b" }}
                      />
                      <Bar dataKey="risk" fill="#ba1a1a" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI Banner */}
            <section className="bg-[#004191] rounded-[3.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,65,145,0.4)]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ffffff] rounded-full -mr-32 -mt-32 blur-[150px] opacity-10 pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg">
                  <Zap size={44} className="text-white drop-shadow-md" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-extrabold tracking-tight mb-4 leading-tight">Zafby Neural Predictor v4.2</h2>
                  <p className="text-blue-100 font-medium text-[15px] leading-relaxed max-w-2xl">
                    Our cutting edge parametric LLM automatically models macroscopic weather systems and traffic gridlocks across major vectors, mitigating claim escalation before the localized events strike workers.
                  </p>
                </div>
                <button className="px-10 py-5 bg-white text-[#004191] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-blue-50 transition-colors active:scale-[0.98] shadow-xl whitespace-nowrap mt-4 md:mt-0">
                  Inspect Models
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
