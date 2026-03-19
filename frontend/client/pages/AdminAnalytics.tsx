import Sidebar from "@/components/Sidebar";
import DashboardFooter from "@/components/DashboardFooter";
import { TrendingUp, Users, MapPin, Target, Calendar, Download, Zap, MousePointer2, ArrowUpRight, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

export default function AdminAnalytics() {
  const [scrolled, setScrolled] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

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
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Loading Intelligence...</h2>
      </div>
    );
  }

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
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">System Analytics</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Statistical insights into platform risk</p>
            </div>
          </div>
        </header>

        <div className="section-padding space-y-12">
          {/* Detailed Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden reveal active">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full -mr-10 -mt-10 blur-[80px] opacity-20" />
              <div className="relative z-10">
                <div className="p-4 bg-white/10 rounded-2xl w-14 h-14 flex items-center justify-center mb-8 border border-white/10">
                  <Target size={28} className="text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-2">Net Revenue</p>
                <h3 className="text-5xl font-black tracking-tighter">₹{(analytics?.revenue?.net_revenue / 100000).toFixed(1)}L</h3>
                <div className="mt-8 flex items-center space-x-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {analytics?.revenue?.loss_ratio_percent}% Loss Ratio
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer reveal active" style={{ transitionDelay: "100ms" }}>
              <div className="p-4 bg-green-50 text-green-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-colors">
                <TrendingUp size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-500 transition-colors mb-2">Active Policies</p>
              <h3 className="text-5xl font-black tracking-tighter text-gray-900 group-hover:text-black transition-colors">{analytics?.policies?.active}</h3>
              <div className="mt-8 flex items-center space-x-3">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[78%] group-hover:w-full transition-all duration-1000" />
                </div>
                <span className="text-xs font-black text-gray-400">{Math.round((analytics?.policies?.active / analytics?.policies?.total) * 100)}%</span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group cursor-pointer reveal active" style={{ transitionDelay: "200ms" }}>
              <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl w-14 h-14 flex items-center justify-center mb-8 group-hover:bg-black group-hover:text-white transition-colors">
                <Users size={28} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-500 transition-colors mb-2">Partner Network</p>
              <h3 className="text-5xl font-black tracking-tighter text-gray-900 group-hover:text-black transition-colors">{analytics?.workers?.total}</h3>
              <div className="mt-8 flex items-center space-x-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center">
                  <ArrowUpRight size={14} className="mr-1" />
                  +{analytics?.workers?.new_this_week} New This Week
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Trend Analysis */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-xl transition-all duration-500 reveal active" style={{ transitionDelay: "300ms" }}>
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Platform Breakdown</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Worker distribution by platform</p>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.platform_breakdown || []}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9f9f9" />
                    <XAxis dataKey="platform" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10, fontWeight: 800 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10, fontWeight: 800 }} dx={-10} />
                    <Tooltip
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1.5rem' }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" strokeWidth={4} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Zone Risk Score */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm hover:shadow-xl transition-all duration-500 reveal active" style={{ transitionDelay: "400ms" }}>
              <div className="mb-10">
                <h2 className="text-xl font-black tracking-tight">Geographic Risk Distribution</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Weighted risk index by sector</p>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={heatmap} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f9f9f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10, fontWeight: 800 }} dx={-10} />
                    <Tooltip
                      cursor={{ fill: '#fbfbfb', radius: 10 }}
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                    />
                    <Bar dataKey="risk" fill="#ef4444" radius={[0, 10, 10, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Banner */}
          <section className="bg-black rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden reveal active" style={{ transitionDelay: "500ms" }}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-500 rounded-full -mr-20 -mt-20 blur-[120px] opacity-10" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shrink-0">
                <Zap size={40} className="text-blue-500" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight mb-3">Predictive Engine v4.2</h2>
                <p className="text-gray-400 font-medium leading-relaxed max-w-xl">
                  Our latest LG (Loss Guard) model uses neural networks to predict platform outages before they occur, reducing claim verification time by 42%.
                </p>
              </div>
              <button className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl whitespace-nowrap">
                Review Model Logs
              </button>
            </div>
          </section>
        </div>
        <DashboardFooter />
      </main>
    </div>
  );
}
