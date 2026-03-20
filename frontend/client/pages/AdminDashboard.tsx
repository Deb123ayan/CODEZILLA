import Sidebar from "@/components/Sidebar";
import { Users, AlertCircle, DollarSign, Activity, TrendingUp, ArrowUpRight, ArrowDownRight, Bell, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Workers", value: "24.8k", icon: Users, color: "text-blue-600", bg: "bg-blue-50/50", change: "+12%", isUp: true },
  { label: "Active Claims", value: "1,204", icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50/50", change: "+5%", isUp: true },
  { label: "Total Payouts", value: "₹45.2L", icon: DollarSign, color: "text-green-600", bg: "bg-green-50/50", change: "+18%", isUp: true },
  { label: "System Uptime", value: "99.9%", icon: Activity, color: "text-purple-600", bg: "bg-purple-50/50", change: "-0.1%", isUp: false },
];

const chartData = [
  { name: "Mon", claims: 45, payouts: 120 },
  { name: "Tue", claims: 52, payouts: 140 },
  { name: "Wed", claims: 68, payouts: 180 },
  { name: "Thu", claims: 58, payouts: 160 },
  { name: "Fri", claims: 84, payouts: 210 },
  { name: "Sat", claims: 92, payouts: 250 },
  { name: "Sun", claims: 75, payouts: 190 },
];

const platformData = [
  { name: "Zomato", value: 35, color: "#000" },
  { name: "Blinkit", value: 25, color: "#333" },
  { name: "Flipkart", value: 20, color: "#666" },
  { name: "Amazon", value: 15, color: "#999" },
  { name: "Zepto", value: 5, color: "#ccc" },
];

export default function AdminDashboard() {
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // History Middleware: Locked Navigation
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.info("Admin Session Active", {
        description: "Please use Logout for secure exit."
      });
    };
    window.addEventListener("popstate", handlePopState);

    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 20);
    };
    el.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      el.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar isAdmin={true} />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-20 md:pl-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Platform Overview</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Live Zafby ecosystem monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center px-4 py-2 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live Feed
              </div>
            </div>
          </div>
        </header>

        <div className="section-padding space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="bg-white p-5 md:p-8 rounded-[2.5rem] border border-gray-100 hover:bg-black group transition-all duration-500 transform hover:-translate-y-1 cursor-pointer reveal active shadow-sm hover:shadow-2xl"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn("p-4 rounded-2xl group-hover:bg-white/10 group-hover:text-white transition-colors", stat.bg, stat.color)}>
                      <Icon size={24} />
                    </div>
                    <div className={cn("flex items-center text-[10px] font-black uppercase tracking-wider", stat.isUp ? "text-green-600" : "text-red-600", "group-hover:text-white/80")}>
                      {stat.isUp ? <ArrowUpRight size={14} className="mr-0.5" /> : <ArrowDownRight size={14} className="mr-0.5" />}
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                    <h3 className="text-3xl font-black text-gray-900 mt-1 group-hover:text-white transition-colors">{stat.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Activity Chart */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-5 md:p-8 shadow-sm hover:shadow-xl transition-all duration-500 reveal active">
              <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Active Operations</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Real-time throughput</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Claims</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Payouts</span>
                  </div>
                </div>
              </div>
              <div className="h-[250px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9f9f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10, fontWeight: 800 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 10, fontWeight: 800 }} dx={-10} />
                    <Tooltip
                      cursor={{ fill: '#fbfbfb', radius: 10 }}
                      contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                    />
                    <Bar dataKey="claims" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                    <Bar dataKey="payouts" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Distribution */}
            <div className="bg-black rounded-[2.5rem] p-5 md:p-8 text-white shadow-2xl reveal active" style={{ transitionDelay: "300ms" }}>
              <h2 className="text-xl font-black tracking-tight mb-2">Platform Split</h2>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-10">Active distribution</p>

              <div className="relative h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      {platformData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color === "#000" ? "#fff" : entry.color} opacity={0.8 - (index * 0.15)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <p className="text-3xl font-black text-white">24k</p>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Gigs</p>
                </div>
              </div>

              <div className="mt-10 space-y-4">
                {platformData.map((p) => (
                  <div key={p.name} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">{p.name}</span>
                    </div>
                    <span className="text-xs font-black text-white">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Feed */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active">
            <div className="p-5 md:p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">System Events</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Audit Log</p>
              </div>
              <button className="text-xs font-black text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition-colors uppercase tracking-widest">Full Log</button>
            </div>
            <div className="divide-y divide-gray-50 px-2 pb-2">
              {[
                { time: "2m", msg: "AI model 'RiskPredictor-v4' updated", status: "success", type: "system" },
                { time: "15m", msg: "Traffic disruption Sector 21 alerts sent", status: "warning", type: "alert" },
                { time: "45m", msg: "Batch payout processing completed", status: "success", type: "ops" },
                { time: "2h", msg: "Weather API timeout - secondary engaged", status: "error", type: "infra" },
              ].map((log, i) => (
                <div key={i} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-all rounded-3xl group cursor-pointer">
                  <div className="flex items-start sm:items-center space-x-4 sm:space-x-6">
                    <div className={cn(
                      "w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-all shadow-sm",
                      log.status === "success" ? "bg-green-50 text-green-600" :
                        log.status === "warning" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
                    )}>
                      {log.status === "success" ? <Zap size={20} /> : <AlertCircle size={20} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 group-hover:translate-x-1 transition-transform leading-tight sm:leading-normal">{log.msg}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 sm:mt-1">{log.type}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 group-hover:text-black transition-colors self-start sm:self-auto ml-16 sm:ml-0">{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
