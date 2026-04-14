import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Bell, Cloud, TrendingUp, Info, LayoutGrid, Home, Shield, User, Loader2
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/BrandLogo";

export default function NotificationsPage() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId, platformId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchNotifications = async () => {
    if (!workerId && !phoneNumber) return;
    const pid = workerId || phoneNumber;
    setLoading(true);
    try {
      const [weather, claims, policy] = await Promise.all([
        api.get<any>(`/risk/predict/?city=${platformId || "Delhi"}`),
        api.get<any>(`/claims/history/?worker_id=${pid}`),
        api.get<any>(`/policy/status/?worker_id=${pid}`)
      ]);

      const alerts: any[] = [];

      // Weather Alert
      if (weather?.forecast_data) {
        alerts.push({
          id: 'w1',
          type: "weather",
          title: weather.forecast_data.description,
          description: `AQI: ${weather.forecast_data.aqi}. High risk of disruption. Pre-approved claims active.`,
          time: "Live",
          icon: Cloud,
          color: "bg-[#f0f4ff]",
          iconColor: "text-[#004191]",
          isRead: false,
        });
      }

      // Claim Alerts
      if (claims?.claims) {
        claims.claims.slice(0, 2).forEach((c: any, i: number) => {
          alerts.push({
            id: `cl-${i}`,
            type: "payout",
            title: `Claim ${c.status}`,
            description: `Your claim for ${c.claim_reason} (₹${c.compensation}) is now ${c.status.toLowerCase()}.`,
            time: new Date(c.created_at).toLocaleDateString(),
            icon: TrendingUp,
            color: "bg-[#e2f5e9]",
            iconColor: "text-[#16a34a]",
            isRead: true,
          });
        });
      }

      // Policy Alert
      if (policy?.has_active_policy) {
        alerts.push({
          id: 'p1',
          type: "system",
          title: "Safety Net Active",
          description: `Your ${policy.active_policy.plan_type} plan is active until ${new Date(policy.active_policy.valid_until).toLocaleDateString()}.`,
          time: "Now",
          icon: Info,
          color: "bg-[#f5f3f1]",
          iconColor: "text-[#434751]",
          isRead: true,
        });
      }

      setNotifications(alerts);
    } catch (error) {
      toast.error("Failed to sync notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [workerId, phoneNumber]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Syncing Alerts...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-[#e4e2e0]/50">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto md:px-8 md:py-6">
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <BrandLogo />
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 font-inter text-[11px] font-bold tracking-[0.05em] uppercase">
              <Link to="/dashboard" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Home</Link>
              <Link to="/deliveries" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Tasks</Link>
              <Link to="/policies" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Protection</Link>
              <Link to="/payouts" className="text-[#1b1c1b]/60 hover:text-[#004191] transition-colors">Earnings</Link>
            </nav>
            <div 
              className="relative w-10 h-10 rounded-full bg-[#f5f3f1] flex items-center justify-center text-[#434751] font-bold text-lg shadow-inner cursor-pointer hover:bg-[#e4e2e0] transition-colors"
              title={username}
              onClick={() => navigate('/settings')}
            >
              {username.charAt(0).toUpperCase()}
              {notifications.some(n => !n.isRead) && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-[#004191] rounded-full ring-2 ring-[#fcf9f8]" />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-40 px-6 max-w-4xl mx-auto w-full animate-in fade-in duration-700 space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
            Alerts & Activity
          </h1>
          <p className="text-[#434751] mt-2 font-medium text-lg">System notifications for {username}.</p>
        </div>

        {/* Notifications List */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
          <div className="divide-y divide-[#e4e2e0]/50">
            {notifications.length === 0 ? (
              <div className="py-24 text-center">
                <Bell size={48} className="mx-auto text-[#e4e2e0] mb-4" />
                <p className="text-[#a8aebf] font-inter font-bold uppercase tracking-[0.15em] text-xs">You're all caught up</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6 hover:bg-[#fcf9f8] transition-colors duration-300 cursor-pointer relative",
                      !notification.isRead ? "bg-[#fcf9f8]" : ""
                    )}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#004191] rounded-full animate-pulse shadow-[0_0_10px_rgba(0,65,145,0.5)] hidden md:block" />
                    )}
                    
                    <div className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0",
                      notification.color, notification.iconColor
                    )}>
                      <Icon size={32} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <h3 className={cn(
                          "text-xl font-extrabold tracking-tight",
                          !notification.isRead ? "text-[#1b1c1b]" : "text-[#434751]"
                        )}>
                          {notification.title}
                        </h3>
                        <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf]">{notification.time}</span>
                      </div>
                      <p className="text-[15px] font-medium text-[#434751] leading-relaxed">
                        {notification.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Callout */}
        <div className="bg-gradient-to-tr from-[#004191] to-[#0058be] rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,65,145,0.3)] flex flex-col md:flex-row items-center gap-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-20 -mt-20 blur-[80px] opacity-40 mix-blend-overlay" />
          
          <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center shrink-0 border border-white/20">
            <Bell size={36} className="text-white" />
          </div>
          
          <div className="flex-1 text-center md:text-left relative z-10">
            <h4 className="text-2xl font-extrabold mb-2 tracking-tight">Real-Time Radar Alerts</h4>
            <p className="text-blue-100 font-medium leading-relaxed max-w-md text-sm">
              Enable push notifications to receive predictive alerts regarding traffic delays and zone closures.
            </p>
          </div>
          
          <button className="relative z-10 w-full md:w-auto px-10 py-5 bg-white text-[#004191] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-all active:scale-[0.98] shadow-xl whitespace-nowrap">
            Enable Push
          </button>
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
          <Link to="/settings" className="flex flex-col items-center justify-center text-[#434751] px-4 py-2 hover:text-[#004191] transition-all">
            <User size={22} />
            <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1 text-[#434751]">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}