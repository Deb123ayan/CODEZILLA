import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Timer, MapPin, ShieldCheck, DollarSign, Wallet, AlertTriangle, 
  CheckCircle2, Activity, ShoppingBag, Truck, Loader2
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const PLAN_DURATION_DAYS = 4;

export default function Dashboard() {
  const { platform: userPlatform, username: userUsername, phoneNumber, platformId, workerId, logout } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  const fetchDashboardData = async () => {
    if (!workerId && !phoneNumber) return; 
    
    // In demo mode without actual backend workerId we fallback to phone
    const pid = workerId || phoneNumber;
    setLoading(true);
    try {
      // 1. Fetch real worker profile to get actual user Zone and settings
      const profileRes = await api.get<any>(`/workers/${pid}/profile/`);
      const userZone = profileRes.zone || profileRes.city || "Bangalore";

      // 2. Fetch parallel metric systems using REAL identity attributes
      const [policyRes, claimsRes, riskRes, deliveriesRes] = await Promise.all([
        api.get<any>(`/policy/status/?worker_id=${pid}`),
        api.get<any>(`/claims/history/?worker_id=${pid}`),
        api.get<any>(`/risk/predict/?zone=${userZone}`),
        api.get<any>(`/deliveries/?worker_id=${pid}`)
      ]);

      setDashboardData({
        profile: profileRes,
        policy: policyRes,
        claims: claimsRes,
        risk: riskRes,
        deliveries: deliveriesRes
      });
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to sync dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [workerId, phoneNumber]);

  useEffect(() => {
    // History Middleware: Prevent 'back' button from exiting without explicitly logging out
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.info("Please use the Navigation bar to move around or Logout securely.");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const getChartData = () => {
    if (!dashboardData) return [];
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = days[d.getDay()];
      
      let earnings = 0;
      let disruption = 0;
      
      if (dashboardData.deliveries) {
        dashboardData.deliveries.forEach((delivery: any) => {
          if (delivery.status === 'COMPLETED' && delivery.updated_at) {
            const deliveryDate = new Date(delivery.updated_at).toISOString().split('T')[0];
            if (deliveryDate === dateString) {
              earnings += Number(delivery.amount || 0);
            }
          }
        });
      }
      
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
      
      result.push({ name: dayName, earnings, disruption });
    }
    return result;
  };

  const chartData = getChartData();

  const handleStartDelivery = async (id: string) => {
    try {
      await api.post(`/deliveries/${id}/start/`, {});
      toast.success("Task Started! Navigate safely.");
      fetchDashboardData();
    } catch (err) {
      toast.error("You can only have one active task at a time!");
    }
  };

  const handleCompleteDelivery = async (id: string) => {
    try {
      await api.post(`/deliveries/${id}/complete/`, {});
      toast.success("Delivery Completed!");
      fetchDashboardData();
    } catch (err) {
      toast.error("Process failed");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Syncing Atelier...</h2>
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

  const targetCat = platformToCategory[platform.toLowerCase()];
  const filteredDeliveries = (dashboardData?.deliveries || []).filter((d: any) => {
    return targetCat ? d.category === targetCat : true;
  });

  const ongoingDelivery = filteredDeliveries.find((d: any) => d.status === 'ONGOING');
  const pendingDeliveries = filteredDeliveries.filter((d: any) => d.status === 'PENDING' || d.status === 'ASSIGNED');

  const disruptionsLogged = dashboardData?.deliveries?.filter((d: any) => d.status === 'CANCELLED' || d.status === 'FAILED').length || 0;
  const completedTasks = dashboardData?.deliveries?.filter((d: any) => d.status === 'COMPLETED').length || 0;
  const riskProb = dashboardData?.risk?.ai_analysis?.disruption_probability || 0;

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      <DashboardHeader />

      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Welcome Text */}
        {/* <div className="mb-2">
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Welcome back, {username}
            </h2>
            <p className="text-[#434751] mt-2 font-medium">Here's your {platformName} coverage and task overview.</p>
        </div> */}

        {/* Hero Section: Ongoing Delivery */}
        {ongoingDelivery && (
          <section className="bg-[#ffffff] rounded-[3rem] shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] p-8 md:p-12 overflow-hidden relative min-h-[360px] flex flex-col justify-between border border-[#e4e2e0]/30 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center h-full">
              <div className="space-y-8">
                {/* <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#004191]/10 text-[#004191] rounded-full font-inter text-[10px] font-bold tracking-[0.15em] uppercase border border-[#004191]/20">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#004191] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#004191]"></span>
                  </span>
                  Active Transit
                </div> */}
                
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b] leading-tight">
                  {ongoingDelivery.products?.[0]?.name || "Ongoing Delivery"}
                </h1>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-[#f5f3f1] rounded-2xl">
                       <Timer className="text-[#004191]" size={28} />
                    </div>
                    <div>
                      <p className="text-[#434751]/80 font-inter text-[11px] font-bold uppercase tracking-widest pl-0.5">Time Elapsed</p>
                      <p className="text-xl font-bold mt-1 text-[#1b1c1b]">Calculated Live</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="p-3 bg-[#f5f3f1] rounded-2xl">
                       <MapPin className="text-[#004191]" size={28} />
                    </div>
                    <div>
                      <p className="text-[#434751]/80 font-inter text-[11px] font-bold uppercase tracking-widest pl-0.5">Destination</p>
                      <p className="text-xl font-bold mt-1 text-[#1b1c1b] tracking-tight">{ongoingDelivery.location}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                     onClick={() => handleCompleteDelivery(ongoingDelivery.id)}
                     className="px-8 py-4 bg-gradient-to-br from-[#004191] to-[#0058be] text-white rounded-full font-inter font-bold text-xs uppercase tracking-widest shadow-[0_12px_24px_-8px_rgba(0,65,145,0.4)] active:scale-95 transition-all w-full md:w-auto text-center"
                   >
                     Complete Duty
                   </button>
                   <button 
                     onClick={() => navigate("/claims")}
                     className="px-8 py-4 bg-[#fcf9f8] text-[#ba1a1a] rounded-full font-inter font-bold text-xs uppercase tracking-widest border border-[#e4e2e0] hover:bg-[#ffdad6]/20 active:scale-95 transition-all text-center"
                   >
                     Issue/Claim
                   </button>
                </div>
              </div>

              {/* Minimalist Map Illusion */}
              <div className="hidden lg:block h-full w-full rounded-[2rem] overflow-hidden bg-[#f5f3f1] shadow-inner relative group border border-[#e4e2e0]/50">
                <div className="absolute inset-0 bg-[#e4e2e0]/20 mix-blend-multiply"></div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300">
                  <path className="opacity-60" d="M50,250 Q150,50 350,150" fill="none" stroke="#004191" strokeDasharray="8 8" strokeWidth="4"></path>
                  <circle cx="50" cy="250" fill="#1b1c1b" r="6"></circle>
                  <circle cx="350" cy="150" fill="#0058be" r="8"></circle>
                  {/* Pulse effect on destination */}
                  <circle cx="350" cy="150" fill="#0058be" r="24" className="animate-ping opacity-20" />
                </svg>
                <div className="absolute top-6 right-6 px-4 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm text-xs font-inter font-bold uppercase tracking-widest text-[#004191]">
                   GPS Active
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Metrics Grid */}
        <section>
          <div className="flex justify-between items-end mb-8 px-2">
             <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Protection Overview</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            
            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <ShieldCheck className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Active Policy</p>
                <p className="text-lg font-bold leading-tight">{dashboardData?.policy?.active_policy?.plan_type || "None"}</p>
              </div>
            </div>

            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <DollarSign className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Weekly Premium</p>
                <p className="text-2xl font-extrabold">₹{dashboardData?.policy?.active_policy?.weekly_premium ? Math.round(dashboardData.policy.active_policy.weekly_premium) : "0"}</p>
              </div>
            </div>

            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <Wallet className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Coverage Amount</p>
                <p className="text-2xl font-extrabold">₹{dashboardData?.policy?.active_policy?.coverage_limit ? Math.round(dashboardData.policy.active_policy.coverage_limit) : "0"}</p>
              </div>
            </div>

            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <AlertTriangle className="text-[#ba1a1a] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Disruptions</p>
                <p className="text-2xl font-extrabold truncate">{disruptionsLogged} <span className="text-xs font-normal text-[#434751]/80">total</span></p>
              </div>
            </div>

            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <CheckCircle2 className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Completed</p>
                <p className="text-2xl font-extrabold">{completedTasks}</p>
              </div>
            </div>

            <div className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border-2 border-[#16a34a]/20 min-h-[160px]">
              <Activity className="text-[#16a34a] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Risk Factor</p>
                <p className="text-2xl font-extrabold text-[#16a34a]">{riskProb > 0.6 ? "High" : riskProb > 0.3 ? "Med" : "Low"}</p>
              </div>
            </div>

          </div>
        </section>

        {/* Protection Cycle Summary */}
        <section className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-12 text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#004191] rounded-full -mr-32 -mt-32 blur-[120px] opacity-20 mix-blend-screen pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />
          
          <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">30-Day Protection Cycle</h2>
              <p className="text-[#a8aebf] font-medium text-lg mt-2">Active continuity for parametric claim eligibility.</p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 py-4">
              <div className="space-y-1">
                <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em]">Current Day</p>
                <p className="text-3xl font-extrabold text-white">{dashboardData?.policy?.cycle_info?.day || 0}<span className="text-lg text-[#434751] font-medium ml-1">/ 30</span></p>
              </div>
              <div className="w-px h-12 bg-[#434751]/40 hidden md:block" />
              <div className="space-y-1">
                <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em]">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#16a34a] rounded-full animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.6)]" />
                  <p className="text-xl font-bold text-white tracking-tight">Protected</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-[#a8aebf] leading-relaxed max-w-md mx-auto md:mx-0">
               Maintain your cycle by renewing your active policy every {PLAN_DURATION_DAYS} days. Successful cycles unlock higher coverage limits and trust scores.
            </p>
          </div>

          <div className="relative shrink-0 w-64 h-64 flex items-center justify-center">
             {/* Progress Circle Graphic */}
             <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#434751]/30" />
                <circle 
                  cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 44}
                  strokeDashoffset={2 * Math.PI * 44 * (1 - (dashboardData?.policy?.cycle_info?.progress_percent || 0) / 100)}
                  strokeLinecap="round"
                  className="text-[#004191] transition-all duration-1000 ease-out"
                />
             </svg>
             <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold text-white tracking-tighter">{dashboardData?.policy?.cycle_info?.progress_percent || 0}%</span>
                <span className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em] mt-1">Cycle Maturity</span>
             </div>
          </div>
        </section>

        {/* 2-Col Layout: Chart + Side Tasks */}
        <section className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-[#ffffff] rounded-[3rem] p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/30 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight mb-2">Earnings Performance</h3>
                <p className="text-[#434751] font-medium text-sm">Reviewing earnings (blue) vs protection payouts (red)</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#004191]"></span>
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751]">Earnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ba1a1a]/60"></span>
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751]">Disruptions</span>
                </div>
              </div>
            </div>
            
            <div className="h-64 sm:h-80 relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#004191" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#004191" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDisruption" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e2e0" opacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#434751', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} 
                    dy={16} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#434751', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} 
                    dx={-10}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{ 
                      borderRadius: '1.5rem', border: '1px solid #e4e2e0', 
                      boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.25rem',
                      background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ fontWeight: 800, fontSize: '12px', fontFamily: 'Manrope' }}
                    labelStyle={{ color: '#434751', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="earnings" stroke="#004191" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                  <Area type="monotone" dataKey="disruption" stroke="#ba1a1a" strokeWidth={3} fillOpacity={1} fill="url(#colorDisruption)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assigned Tasks Module */}
          <div className="space-y-6 flex flex-col">
            <div className="flex justify-between items-end px-2 mb-2">
              <h3 className="text-2xl font-extrabold tracking-tight">Assigned Tasks</h3>
              <span className="text-[10px] font-inter text-[#004191] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-[#d8e2ff] rounded-full">
                {pendingDeliveries.length} New
              </span>
            </div>
            
            <div className="space-y-6 flex-1 max-h-[500px] overflow-y-auto no-scrollbar">
              {pendingDeliveries.length === 0 ? (
                <div className="bg-[#f5f3f1] rounded-[2rem] p-12 text-center h-full flex flex-col items-center justify-center border border-dashed border-[#c3c6d3]">
                   <ShoppingBag size={40} className="text-[#a8aebf] mb-4" />
                   <h4 className="font-bold text-[#1b1c1b] text-lg">No pending routes</h4>
                   <p className="text-sm text-[#434751] mt-2">Waiting for new assignments.</p>
                </div>
              ) : (
                pendingDeliveries.map((delivery: any) => (
                  <div key={delivery.id} className="bg-[#ffffff] rounded-3xl p-8 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/50 hover:border-[#004191]/20 transition-all group">
                    <div className="flex justify-between items-center mb-6">
                      <div className="bg-[#f5f3f1] p-3 rounded-2xl">
                         {delivery.category === "PARCEL" ? <Truck className="text-[#004191]" size={24}/> : <ShoppingBag className="text-[#004191]" size={24}/>}
                      </div>
                      <span className="text-sm font-inter font-extrabold text-[#1b1c1b]">₹{delivery.amount ? Math.round(delivery.amount) : "0"}</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2 text-[#1b1c1b] leading-tight line-clamp-1">{delivery.products?.[0]?.name || "Package Delivery"}</h4>
                    <p className="text-sm text-[#434751] mb-8 line-clamp-2 leading-relaxed h-10">
                      Zone: {delivery.location} <br/> 
                      Category: <span className="uppercase text-[10px] tracking-widest bg-[#f5f3f1] px-1 rounded">{delivery.category}</span>
                    </p>
                    <button 
                      onClick={() => handleStartDelivery(delivery.id)}
                      className="w-full py-4 bg-gradient-to-tr from-[#004191] to-[#0058be] text-white rounded-full font-inter font-bold text-xs uppercase tracking-[0.15em] active:scale-[0.98] transition-all shadow-[0_8px_16px_-4px_rgba(0,65,145,0.3)] hover:shadow-[0_12px_24px_-4px_rgba(0,65,145,0.4)]"
                    >
                      Accept Route
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
}
