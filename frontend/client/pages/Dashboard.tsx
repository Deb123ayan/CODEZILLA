import Sidebar from "@/components/Sidebar";
import DashboardFooter from "@/components/DashboardFooter";
import { AlertCircle, TrendingUp, Shield, Cloud, Bell, Phone, Activity, Loader2, LayoutDashboard, Package, DollarSign, MapPin, Navigation, ChevronRight, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useUserAuth } from "@/context/UserAuthContext";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";

export default function Dashboard() {
  const { platform: userPlatform, username: userUsername, phoneNumber, gmail, platformId, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

  const fetchDashboardData = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const [policyRes, claimsRes, riskRes, deliveriesRes] = await Promise.all([
        api.get<any>(`/policy/status/?worker_id=${workerId}`),
        api.get<any>(`/claims/history/?worker_id=${workerId}`),
        api.get<any>(`/risk/predict/?city=${platformId || "Delhi"}`),
        api.get<any>(`/deliveries/?worker_id=${workerId}`)
      ]);

      setDashboardData({
        policy: policyRes,
        claims: claimsRes,
        risk: riskRes,
        deliveries: deliveriesRes
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to sync dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [workerId]);

  useEffect(() => {
    // Request geolocation in browser to sync real worker location for fraud checks
    if (!phoneNumber) return;
    
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post("/workers/location/", {
              phone: phoneNumber,
              latitude,
              longitude
            });
            console.log("GPS Location verified:", { latitude, longitude });
          } catch (err) {
            console.error("Location sync failed:", err);
          }
        },
        (error) => {
          console.warn("Geolocation access denied:", error.message);
        }
      );
    }
  }, [phoneNumber]);

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
    switch (id?.toLowerCase()) {
      case "zomato": return "text-red-600";
      case "blinkit": return "text-yellow-600";
      case "flipkart": return "text-blue-600";
      case "amazon": return "text-orange-600";
      case "zepto": return "text-purple-600";
      default: return "text-blue-600";
    }
  };

  const platformColor = getPlatformColor(platform);

  // Derive metrics from backend data
  const metrics = [
    { 
      label: "Active Policy", 
      value: dashboardData?.policy?.active_policy?.plan_type || (dashboardData?.policy?.has_active_policy ? "Active" : "None"), 
      subtext: dashboardData?.policy?.has_active_policy ? "Protection Active" : "No Coverage", 
      icon: Shield, color: "bg-blue-50/50", iconColor: "text-blue-600" 
    },
    { 
      label: "Weekly Premium", 
      value: dashboardData?.policy?.active_policy ? `₹${dashboardData.policy.active_policy.weekly_premium}` : "₹0", 
      subtext: dashboardData?.policy?.active_policy ? `Valid until ${new Date(dashboardData.policy.active_policy.valid_until).toLocaleDateString()}` : "Not subscribed", 
      icon: TrendingUp, color: "bg-green-50/50", iconColor: "text-green-600" 
    },
    { 
      label: "Coverage", 
      value: dashboardData?.policy?.active_policy ? `₹${dashboardData.policy.active_policy.coverage_limit}` : "₹0", 
      subtext: "Per event limit", icon: Shield, color: "bg-purple-50/50", iconColor: "text-purple-600" 
    },
    { 
      label: "Disruptions Logged", 
      value: dashboardData?.deliveries?.filter((d: any) => d.status === 'CANCELLED' || d.status === 'FAILED').length || "0", 
      subtext: "Cancelled tasks", 
      icon: AlertCircle, color: "bg-red-50/50", iconColor: "text-red-600" 
    },
    { 
      label: "Completed Tasks", 
      value: dashboardData?.deliveries?.filter((d: any) => d.status === 'COMPLETED').length || "0", 
      subtext: "Successfully delivered", 
      icon: CheckCircle, color: "bg-green-50/50", iconColor: "text-green-600" 
    },
    { 
      label: "Risk Factor", 
      value: dashboardData?.risk?.ai_analysis?.disruption_probability > 0.7 ? "High" : 
             dashboardData?.risk?.ai_analysis?.disruption_probability > 0.3 ? "Medium" : "Low", 
      subtext: `${Math.round((dashboardData?.risk?.ai_analysis?.disruption_probability || 0) * 10)}/10 score`, 
      icon: AlertCircle, color: "bg-orange-50/50", iconColor: "text-orange-600" 
    },
  ];

  const notifications = [
    { 
      title: dashboardData?.risk?.forecast_data?.description || "Weather Monitoring", 
      description: `Zone AQI: ${dashboardData?.risk?.forecast_data?.aqi || '---'} | Temp: ${dashboardData?.risk?.forecast_data?.temperature_c || '---'}°C`, 
      time: "Live", icon: Cloud, color: "bg-blue-50" 
    },
    { 
      title: "Latest Claim", 
      description: dashboardData?.claims?.claims?.length > 0 ? 
        `${dashboardData.claims.claims[0].claim_reason} - ${dashboardData.claims.claims[0].status}` : 
        "No recent claims", 
      time: dashboardData?.claims?.claims?.length > 0 ? 
        new Date(dashboardData.claims.claims[0].created_at).toLocaleDateString() : 
        "N/A", icon: Activity, color: "bg-green-50" 
    },
  ];

  const getChartData = () => {
    if (!dashboardData) return [];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    // Generate the last 7 days dynamically
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      let earnings = 0;
      let disruption = 0;
      
      // Calculate earnings from completed deliveries for this specific date
      if (dashboardData.deliveries) {
        dashboardData.deliveries.forEach((delivery: any) => {
          if (delivery.status === 'COMPLETED' && delivery.updated_at) {
            // Compare the local date of the delivery update
            const deliveryDate = new Date(delivery.updated_at).toISOString().split('T')[0];
            if (deliveryDate === dateString) {
              earnings += Number(delivery.amount || 0);
            }
          }
        });
      }
      
      // Calculate disruption compensation from approved/paid claims for this date
      if (dashboardData.claims?.claims) {
        dashboardData.claims.claims.forEach((claim: any) => {
          if ((claim.status === 'AUTO_APPROVED' || claim.status === 'PAID') && claim.created_at) {
            const claimDate = new Date(claim.created_at).toISOString().split('T')[0];
            if (claimDate === dateString) {
              disruption += Number(claim.compensation || 0);
            }
          }
        });
      }
      
      result.push({
        name: dayName,
        fullDate: dateString,
        earnings,
        disruption,
        total: earnings + disruption
      });
    }
    
    return result;
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400 font-mono">Syncing Partner Hub...</h2>
      </div>
    );
  }

  const platformToCategory: Record<string, string> = {
    zomato: 'QUICK_COMMERCE',
    swiggy: 'QUICK_COMMERCE',
    blinkit: 'GROCERY',
    zepto: 'GROCERY',
    amazon: 'PARCEL',
    flipkart: 'PARCEL'
  };

  const filteredDeliveries = (dashboardData?.deliveries || []).filter((d: any) => {
    const targetCat = platformToCategory[platform.toLowerCase()];
    return d.category === targetCat;
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white relative overflow-hidden">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30 pb-24 md:pb-0">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-20 sm:pl-0">
            <div className="flex-1">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <h1 className={cn("text-2xl md:text-4xl font-black tracking-tighter transition-all", platformColor)}>
                  {platformName} Platform
                </h1>
                <div className="px-2 py-1 bg-green-100 text-green-700 text-[8px] font-black rounded-md uppercase tracking-widest animate-pulse">
                  System Live
                </div>
              </motion.div>
              <p className="text-gray-500 text-sm md:text-base font-medium mt-1">
                {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening"}, {username}
              </p>
              <div className="flex flex-wrap gap-4 mt-3">
                <div className="flex items-center space-x-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest shadow-sm">
                  <Phone size={12} className="text-blue-600" />
                  <span>{phoneNumber}</span>
                </div>
                {platformId && (
                  <div className="flex items-center space-x-2 px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest shadow-sm">
                    <Shield size={12} className="text-blue-600" />
                    <span>ID: {platformId}</span>
                  </div>
                )}
              </div>
            </div>
            <button className="flex items-center justify-center space-x-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all shadow-sm group">
              <Bell size={18} className="text-gray-400 group-hover:text-black transition-colors" />
              <span className="text-sm font-bold text-gray-700">Alerts</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-10">
          {/* Ongoing Task Banner */}
          {dashboardData?.deliveries?.find((d: any) => d.status === 'ONGOING') && (
            <div className="bg-gradient-to-r from-yellow-500 to-orange-600 rounded-[2.5rem] p-8 text-white shadow-xl reveal active animate-in slide-in-from-top duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                    <Activity size={32} className="animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">Task in Progress</span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight leading-none">
                      {dashboardData.deliveries.find((d: any) => d.status === 'ONGOING').products?.[0]?.name || "Package Delivery"}
                    </h2>
                    <p className="text-white/70 text-sm font-bold mt-1 uppercase tracking-tight">
                      Destination: {dashboardData.deliveries.find((d: any) => d.status === 'ONGOING').location}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 w-full md:w-auto">
                    <button 
                      onClick={() => {
                        const ongoing = dashboardData.deliveries.find((d: any) => d.status === 'ONGOING');
                        // Redirect or open modal (simplifying: just direct to deliveries page for detail)
                        window.location.href = "/deliveries";
                      }}
                      className="flex-1 md:flex-none px-8 py-4 bg-white text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black hover:text-white transition-all shadow-lg active:scale-95"
                    >
                      Manage Duty
                    </button>
                    <div className="hidden md:block h-12 w-px bg-white/20" />
                    <div className="flex-1 md:flex-none text-center md:text-right hidden sm:block">
                       <p className="text-[10px] font-black uppercase text-white/60 mb-1">Fee</p>
                       <p className="text-xl font-black leading-none">₹{dashboardData.deliveries.find((d: any) => d.status === 'ONGOING').amount}</p>
                    </div>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {metrics.map((metric, i) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={cn(
                    "p-8 rounded-[2.5rem] border border-gray-100/50 hover:bg-black group transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl relative overflow-hidden",
                    metric.color
                  )}
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />
                  <div className="flex flex-col h-full justify-between space-y-6 relative z-10">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:bg-white/10 transition-colors border border-transparent group-hover:border-white/20 shadow-inner",
                      metric.color, metric.iconColor, "group-hover:text-white"
                    )}>
                      <Icon size={28} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-gray-500 transition-colors mb-1">
                        {metric.label}
                      </p>
                      <h3 className="text-3xl font-black text-gray-900 group-hover:text-white transition-colors tracking-tighter">
                        {metric.value}
                      </h3>
                      <p className="text-[11px] font-bold text-gray-400 mt-2 group-hover:text-gray-600 line-clamp-1">
                        {metric.subtext}
                      </p>
                    </div>
                  </div>
                </motion.div>
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
              <div className="h-[300px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDisruption" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 800 }} 
                      dy={10} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#666', fontSize: 10, fontWeight: 800 }} 
                    />
                    <Tooltip
                      contentStyle={{ 
                        borderRadius: '1.5rem', 
                        border: 'none', 
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
                        padding: '1.2rem',
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)'
                      }}
                      itemStyle={{ fontWeight: 900, fontSize: '11px', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#3b82f6" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorEarnings)" 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="disruption" 
                      stroke="#10b981" 
                      strokeWidth={4} 
                      fillOpacity={1} 
                      fill="url(#colorDisruption)" 
                      animationDuration={2500}
                    />
                  </AreaChart>
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
                 {/* Deliveries Section: Restructured for "Start/Choice" workflow */}
          <div className="grid md:grid-cols-1 gap-8 mb-8">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 reveal active">
              {filteredDeliveries.some((d: any) => d.status === 'ONGOING') ? (
                // ONGOING TASK VIEW
                <div>
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-3xl font-black tracking-tighter">Current Ongoing Task</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Active Delivery in Progress</p>
                    </div>
                    <div className="flex space-x-3">
                      <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase shadow-lg shadow-blue-200 animate-pulse">
                        In Transit
                      </span>
                    </div>
                  </div>

                  {filteredDeliveries.filter((d: any) => d.status === 'ONGOING').map((delivery: any) => (
                    <div key={delivery.id} className="bg-gray-50 rounded-[2rem] p-10 border-2 border-blue-500 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8">
                         <MapPin size={40} className="text-blue-500/20 group-hover:scale-110 transition-transform" />
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                        <div className="flex items-center space-x-6">
                          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md text-blue-600 border border-blue-100">
                             <Package size={32} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="text-2xl font-black text-gray-900 leading-tight">
                                {delivery.products?.[0]?.name || "Active Delivery"}
                              </h4>
                              <span className="text-[10px] font-black bg-blue-100 px-3 py-1 rounded-full uppercase text-blue-700">
                                 {delivery.category}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
                              <Navigation size={12} className="mr-2" />
                              {delivery.location} • {platformName} ID: {delivery.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end justify-center space-y-4">
                           <div className="text-right">
                              <p className="text-4xl font-black text-gray-900 tracking-tighter">₹{delivery.amount}</p>
                              <p className="text-[10px] font-black text-blue-500 uppercase mt-1">Insured Value: ₹{Math.round(Number(delivery.amount) * 0.8)}</p>
                           </div>
                           <div className="flex space-x-3 w-full md:w-auto">
                              <button 
                                onClick={async () => {
                                  try {
                                    await api.post(`/deliveries/${delivery.id}/complete/`, {});
                                    toast.success("Delivery Completed!");
                                    fetchDashboardData();
                                  } catch (err) {
                                    toast.error("Process failed");
                                  }
                                }}
                                className="px-8 py-3 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all text-xs uppercase tracking-widest shadow-lg shadow-green-200"
                              >
                                Complete Order
                              </button>
                              <button 
                                onClick={() => {
                                  // Navigate to claims or show modal
                                  toast.info("Claim module activated. Stay in location.");
                                }}
                                className="px-8 py-3 bg-white border-2 border-red-500 text-red-500 font-black rounded-2xl hover:bg-red-50 transition-all text-xs uppercase tracking-widest"
                              >
                                Request Help/Claim
                              </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // AVAILABLE / ASSIGNED TASKS VIEW
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight">Assigned {platformName} Tasks</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Choose a delivery to begin working</p>
                    </div>
                    <span className="px-5 py-2 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full uppercase border border-blue-100">
                      {filteredDeliveries.filter((d: any) => d.status === 'PENDING' || d.status === 'ASSIGNED').length} Available
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredDeliveries.filter((d: any) => d.status === 'PENDING' || d.status === 'ASSIGNED').length === 0 ? (
                      <div className="col-span-2 py-20 text-center bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Package size={24} className="text-gray-300" />
                         </div>
                         <h4 className="text-lg font-black text-gray-400">Rest Time! No units assigned yet.</h4>
                         <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mt-2 font-mono">Refresh API to poll for new tasks</p>
                      </div>
                    ) : (
                      filteredDeliveries.filter((d: any) => d.status === 'PENDING' || d.status === 'ASSIGNED').map((delivery: any) => (
                        <div key={delivery.id} className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col justify-between group hover:border-blue-400 hover:bg-white hover:shadow-2xl transition-all h-full">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-md text-blue-600 group-hover:scale-110 transition-transform">
                                  <Package size={24} />
                               </div>
                               <div className="text-right">
                                  <p className="text-2xl font-black text-gray-900">₹{delivery.amount}</p>
                                  <span className="text-[10px] font-black bg-gray-200 px-2.5 py-1 rounded uppercase tracking-tighter text-gray-600">
                                     {delivery.category}
                                  </span>
                               </div>
                            </div>
                            <h4 className="text-lg font-black text-gray-900 mb-1 leading-tight">
                              {delivery.products?.[0]?.name || "Package Delivery"}
                            </h4>
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-8 line-clamp-1">
                              📍 {delivery.location}
                            </p>
                          </div>
                          <button 
                             onClick={async () => {
                               try {
                                 await api.post(`/deliveries/${delivery.id}/start/`, {});
                                 toast.success("Task Started! Stay safe.");
                                 fetchDashboardData();
                               } catch (err) {
                                  toast.error("You can only have one active task at a time!");
                               }
                             }}
                             className="w-full py-4 bg-black text-white font-black rounded-2xl hover:bg-blue-600 transition-all text-xs uppercase tracking-widest shadow-lg shadow-black/5 flex items-center justify-center"
                          >
                             Start Delivery <ChevronRight size={14} className="ml-2" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
       </div>
        </div>
        <DashboardFooter />
        
        {/* Mobile Float Navigation */}
        <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-[400px]">
          <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 flex items-center justify-around shadow-2xl overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none" />
             {[
               { icon: LayoutDashboard, path: '/dashboard', label: 'Home' },
               { icon: Package, path: '/deliveries', label: 'Tasks' },
               { icon: Shield, path: '/policies', label: 'Policy' },
               { icon: DollarSign, path: '/payouts', label: 'Earning' },
             ].map((nav, i) => (
                <button 
                  key={i}
                  onClick={() => window.location.href = nav.path}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-2xl relative z-10",
                    window.location.pathname === nav.path ? "text-white bg-white/10" : "text-gray-500 hover:text-white"
                  )}
                >
                  <nav.icon size={20} />
                  <span className="text-[8px] font-black uppercase mt-1 tracking-widest">{nav.label}</span>
                </button>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
}
