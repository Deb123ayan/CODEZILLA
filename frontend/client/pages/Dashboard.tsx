import Sidebar from "@/components/Sidebar";
import DashboardFooter from "@/components/DashboardFooter";
import { AlertCircle, TrendingUp, Shield, Cloud, Bell, Phone, Activity } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useUserAuth } from "@/context/UserAuthContext";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { platform: userPlatform, username: userUsername, phoneNumber, gmail, platformId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // History Middleware: Prevent 'back' button from exiting the dashboard without explicitly logging out
    // This pushes a new state to the history stack so a 'back' click just returns here
    window.history.pushState(null, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      // If user tries to go back, we push them forward again
      window.history.pushState(null, "", window.location.href);
      toast.info("Please use the Logout button to exit securely", {
        description: "Back navigation is disabled for your security."
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

  const getPlatformColor = (id: string) => {
    switch (id) {
      case "zomato": return "text-red-600";
      case "blinkit": return "text-yellow-600";
      case "flipkart": return "text-blue-600";
      case "amazon": return "text-orange-600";
      case "zepto": return "text-purple-600";
      default: return "text-blue-600";
    }
  };

  const platformColor = getPlatformColor(platform);

  const chartData = [
    { week: "W1", earnings: 2000, protected: 1800 },
    { week: "W2", earnings: 2500, protected: 2000 },
    { week: "W3", earnings: 1800, protected: 1500 },
    { week: "W4", earnings: 3000, protected: 2500 },
    { week: "W5", earnings: 2800, protected: 2300 },
    { week: "W6", earnings: 3200, protected: 2800 },
    { week: "W7", earnings: 2900, protected: 2400 },
  ];

  const metrics = [
    { label: "Active Policy", value: "Premium", subtext: "Protection Active", icon: Shield, color: "bg-blue-50/50", iconColor: "text-blue-600" },
    { label: "Weekly Premium", value: "₹35", subtext: "Next billing Monday", icon: TrendingUp, color: "bg-green-50/50", iconColor: "text-green-600" },
    { label: "Coverage", value: "₹2000", subtext: "Per event limit", icon: Shield, color: "bg-purple-50/50", iconColor: "text-purple-600" },
    { label: "Risk Factor", value: "Medium", subtext: "7/10 score", icon: AlertCircle, color: "bg-orange-50/50", iconColor: "text-orange-600" },
  ];

  const notifications = [
    { title: "Heavy Rain Warning", description: "Expected in your zone tomorrow", time: "2h ago", icon: Cloud, color: "bg-blue-50" },
    { title: "Traffic Update", description: "Congestion in Sector 5", time: "1h ago", icon: AlertCircle, color: "bg-orange-50" },
    { title: "Payout Processed", description: "₹500 credited to wallet", time: "30m ago", icon: TrendingUp, color: "bg-green-50" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-20 sm:pl-0">
            <div>
              <h1 className={cn("text-2xl md:text-3xl font-black tracking-tighter transition-all", platformColor)}>
                {platformName} Platform
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Welcome back, {username}</p>
              {phoneNumber && (
                <div className="flex flex-wrap gap-4 mt-2">
                  <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <Phone size={12} className="text-blue-600" />
                    <span>{phoneNumber}</span>
                  </div>
                  {platformId && (
                    <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Shield size={12} className="text-blue-600" />
                      <span>ID: {platformId}</span>
                    </div>
                  )}
                  {gmail && (
                    <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Activity size={12} className="text-blue-600" />
                      <span>{gmail}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
            <button className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
              <Bell size={18} className="text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-sm font-bold text-gray-700">Alerts</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-10">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className={cn(
                    "p-6 rounded-[2rem] border border-gray-100 hover:bg-black group transition-all duration-500 cursor-pointer reveal active",
                    metric.color
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex flex-col h-full justify-between space-y-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors",
                      metric.color, metric.iconColor, "group-hover:text-white"
                    )}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-500 transition-colors">
                        {metric.label}
                      </p>
                      <h3 className="text-2xl font-black text-gray-900 group-hover:text-white transition-colors mt-1">
                        {metric.value}
                      </h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1 group-hover:text-gray-600">
                        {metric.subtext}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 p-4 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-500 reveal active">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-2 sm:px-0">
                <div>
                  <h2 className="text-xl font-black tracking-tight">Earnings Trend</h2>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Weekly Insight</p>
                </div>
                <div className="flex space-x-2">
                  <div className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase">Earnings</div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-full uppercase">Protected</div>
                </div>
              </div>
              <div className="h-[250px] sm:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f9f9f9" />
                    <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 8, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 8, fontWeight: 700 }} dx={-5} />
                    <Tooltip
                      contentStyle={{ borderRadius: '1.2rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 / 0.1)', padding: '0.8rem' }}
                      itemStyle={{ fontWeight: 800, fontSize: '10px' }}
                    />
                    <Line type="monotone" dataKey="earnings" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="protected" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Internal Footer for Chartboat Section */}
              <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Activity size={12} className="text-blue-500" />
                  <span>Real-time API Data Feed</span>
                </div>
                <div className="flex space-x-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">W1 – W7 Overview</span>
                </div>
              </div>
            </div>

            {/* Sidebar Cards */}
            <div className="space-y-6 reveal active" style={{ transitionDelay: "400ms" }}>
              <div className="bg-black rounded-[2.5rem] p-8 text-white shadow-xl h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black tracking-tight mb-2">Policy Health</h3>
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">All systems active</span>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">Risk Score</p>
                      <div className="flex items-center space-x-3">
                        <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 w-3/4" />
                        </div>
                        <span className="text-xs font-black">7.2</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full py-4 mt-8 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all text-sm tracking-tight">
                  Update Coverage
                </button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feed */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 reveal active">
              <h2 className="text-xl font-black tracking-tight mb-8">System Alerts</h2>
              <div className="space-y-4">
                {notifications.map((n, i) => (
                  <div key={i} className={cn("p-4 rounded-2xl flex items-center space-x-4 transition-all hover:translate-x-1 cursor-pointer", n.color)}>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <n.icon size={18} className="text-gray-900" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-gray-900 truncate">{n.title}</h4>
                      <p className="text-xs font-medium text-gray-500 truncate">{n.description}</p>
                    </div>
                    <span className="text-[10px] font-black text-gray-400 uppercase whitespace-nowrap">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden reveal active">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-black leading-tight mb-4">Protection simplified for your work.</h2>
                  <p className="text-blue-100/80 text-sm font-medium leading-relaxed">AI-powered disruption detection ensures you never lose a day's wage again.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <button className="px-6 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-white/90 transition-all text-xs uppercase tracking-widest">Buy Plan</button>
                  <button className="px-6 py-4 bg-white/10 border border-white/20 backdrop-blur-md text-white font-black rounded-2xl hover:bg-white/20 transition-all text-xs uppercase tracking-widest">Support</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <DashboardFooter />
      </main>
    </div>
  );
}
