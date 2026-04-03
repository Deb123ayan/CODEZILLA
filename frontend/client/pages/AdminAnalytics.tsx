import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  TrendingUp, Users, DollarSign, Target, Activity,
  ShieldCheck, ArrowUpRight, Loader2, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stats, zones] = await Promise.all([
        api.get<any>("/admin/analytics/"),
        api.get<any[]>("/admin/risk-zones/")
      ]);
      setAnalytics(stats);
      setHeatmap((zones || []).map(z => ({
        name: z.zone,
        risk: z.avg_severity || 0,
        events: z.event_count || 0
      })));
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const platformData = analytics?.platform_breakdown || [
    { platform: "Zomato",  count: 12400 },
    { platform: "Swiggy",  count: 8200 },
    { platform: "Blinkit", count: 3100 },
    { platform: "Zepto",   count: 1100 },
  ];

  const weeklyTrend = [
    { name: "Mon", claims: 8,  payouts: 12000 },
    { name: "Tue", claims: 15, payouts: 18500 },
    { name: "Wed", claims: 6,  payouts: 9200 },
    { name: "Thu", claims: 22, payouts: 28000 },
    { name: "Fri", claims: 18, payouts: 24000 },
    { name: "Sat", claims: 30, payouts: 42000 },
    { name: "Sun", claims: 12, payouts: 16500 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Pulling Global Telemetry...</h2>
      </div>
    );
  }

  return (
    <AdminLayout>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Quantitative Analytics</h2>
          <p className="text-[#434751] mt-1 font-medium">Statistical ecosystem deep dive and trajectory forecasts.</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-6 py-3 bg-[#004191] text-white rounded-full font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all self-start sm:self-auto">
          <Zap size={14} /> Refresh
        </button>
      </div>

      {/* ── Top Metric Cards ─────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">

          {/* Net Revenue — dark card (same as user's dark hero) */}
          <div className="bg-[#1b1c1b] text-white rounded-3xl p-6 md:p-10 flex flex-col justify-between min-h-[200px] shadow-[0_40px_80px_-20px_rgba(27,28,27,0.4)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#16a34a] rounded-full -mr-12 -mt-12 blur-[80px] opacity-20 transition-opacity duration-500 group-hover:opacity-40" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Target size={24} className="text-[#16a34a]" />
              </div>
              <p className="text-[9px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-1">Net Platform Yield</p>
              <p className="text-4xl font-extrabold tracking-tighter">
                ₹{analytics?.revenue?.net_revenue ? `${(analytics.revenue.net_revenue / 1000).toFixed(1)}k` : "452.1k"}
              </p>
              <span className="mt-4 inline-block px-3 py-1.5 bg-[#16a34a]/20 text-[#22c55e] border border-[#16a34a]/30 text-[9px] font-bold uppercase tracking-widest rounded-full">
                {analytics?.revenue?.loss_ratio_percent || 12.4}% Loss Ratio
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#e4e2e0]/30 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:translate-y-[-4px] transition-transform duration-300 flex flex-col justify-between min-h-[200px]">
            <div className="w-12 h-12 bg-[#dcfce7] text-green-600 rounded-2xl flex items-center justify-center mb-6">
              <TrendingUp size={24} />
            </div>
            <p className="text-[9px] font-inter font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Active Policies</p>
            <p className="text-4xl font-extrabold tracking-tighter">{analytics?.policies?.active || "18,491"}</p>
            <div className="mt-4 h-2 bg-[#f5f3f1] rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${analytics?.policies?.total ? Math.round((analytics.policies.active / analytics.policies.total) * 100) : 78}%` }} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 md:p-10 border border-[#e4e2e0]/30 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:translate-y-[-4px] transition-transform duration-300 flex flex-col justify-between min-h-[200px]">
            <div className="w-12 h-12 bg-[#f0f4ff] text-[#004191] rounded-2xl flex items-center justify-center mb-6">
              <Users size={24} />
            </div>
            <p className="text-[9px] font-inter font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Gig Network</p>
            <p className="text-4xl font-extrabold tracking-tighter">{analytics?.workers?.total || "24,812"}</p>
            <span className="mt-4 inline-flex items-center text-[9px] font-bold uppercase tracking-widest text-green-600 bg-[#dcfce7] px-3 py-1 rounded-full border border-green-100">
              <ArrowUpRight size={12} className="mr-1" />
              +{analytics?.workers?.new_this_week || 412} this week
            </span>
          </div>
        </div>
      </section>

      {/* ── Charts Row ───────────────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-2 gap-8 lg:gap-12">

        {/* Weekly Trend Area Chart */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/30 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-10 gap-4">
            <div>
              <h3 className="text-2xl font-extrabold tracking-tight mb-1">Weekly Payout Trend</h3>
              <p className="text-[#434751] font-medium text-sm">Claims processed vs compensation disbursed</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#004191]" /><span className="text-[9px] font-bold uppercase tracking-widest text-[#434751]">Payouts</span></div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#ba1a1a]/60" /><span className="text-[9px] font-bold uppercase tracking-widest text-[#434751]">Claims</span></div>
            </div>
          </div>
          <div className="h-64 sm:h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradPayouts" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#004191" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#004191" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradClaims" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e2e0" opacity={0.6} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#434751', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} dy={14} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#434751', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} dx={-10} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '1.5rem', border: '1px solid #e4e2e0', boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.25rem', background: 'rgba(255,255,255,0.95)' }} itemStyle={{ fontWeight: 800, fontSize: 12 }} labelStyle={{ color: '#434751', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="payouts" stroke="#004191" strokeWidth={3} fillOpacity={1} fill="url(#gradPayouts)" />
                <Area type="monotone" dataKey="claims" stroke="#ba1a1a" strokeWidth={3} fillOpacity={1} fill="url(#gradClaims)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution Bar Chart */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/30 flex flex-col">
          <div className="mb-10">
            <h3 className="text-2xl font-extrabold tracking-tight mb-1">Platform Distribution</h3>
            <p className="text-[#434751] font-medium text-sm">Partner network across gig platforms</p>
          </div>
          <div className="h-64 sm:h-72 flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical">
                <CartesianGrid strokeDasharray="4 4" horizontal={false} stroke="#e4e2e0" opacity={0.6} />
                <XAxis type="number" hide />
                <YAxis dataKey="platform" type="category" axisLine={false} tickLine={false} tick={{ fill: '#434751', fontSize: 12, fontFamily: 'Inter', fontWeight: 600 }} dx={-15} width={70} />
                <Tooltip
                  cursor={{ fill: '#fcf9f8' }}
                  contentStyle={{ borderRadius: '1.5rem', border: '1px solid #e4e2e0', boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.25rem', background: 'rgba(255,255,255,0.95)' }}
                  itemStyle={{ fontWeight: 800, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#004191" radius={[0, 8, 8, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── AI Banner (same dark style as protection cycle section) ──────── */}
      <section className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-12 text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center gap-10 group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#004191] rounded-full -mr-32 -mt-32 blur-[120px] opacity-20 mix-blend-screen pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />
        <div className="relative z-10 w-20 h-20 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] flex items-center justify-center shrink-0">
          <Zap size={36} className="text-white" />
        </div>
        <div className="relative z-10 flex-1">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Zafby Neural Predictor v4.2</h2>
          <p className="text-[#a8aebf] font-medium leading-relaxed max-w-2xl">
            Our cutting-edge parametric LLM automatically models macroscopic weather systems and traffic gridlocks across major vectors, mitigating claim escalation before localized events strike workers.
          </p>
        </div>
        <button className="relative z-10 px-8 py-4 bg-white text-[#004191] font-inter font-bold text-[10px] uppercase tracking-widest rounded-full hover:bg-[#f0f4ff] transition-colors active:scale-[0.98] shadow-xl whitespace-nowrap">
          Inspect Models
        </button>
      </section>

    </AdminLayout>
  );
}
