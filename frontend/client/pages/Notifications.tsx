import Sidebar from "@/components/Sidebar";
import { Bell, Cloud, AlertCircle, TrendingUp, Info, Trash2, CheckCircle2, Phone, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function NotificationsPage() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId, platformId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const mainRef = useRef<HTMLElement>(null);

  const fetchNotifications = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const [weather, claims, policy] = await Promise.all([
        api.get<any>(`/risk/predict/?city=${platformId || "Delhi"}`),
        api.get<any>(`/claims/history/?worker_id=${workerId}`),
        api.get<any>(`/policy/status/?worker_id=${workerId}`)
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
          color: "bg-blue-50/50",
          iconColor: "text-blue-600",
          isRead: false,
        });
      }

      // Claim Alerts
      claims.claims?.slice(0, 2).forEach((c: any, i: number) => {
        alerts.push({
          id: `cl-${i}`,
          type: "payout",
          title: `Claim ${c.status}`,
          description: `Your claim for ${c.claim_reason} (₹${c.compensation}) is now ${c.status.toLowerCase()}.`,
          time: new Date(c.created_at).toLocaleDateString(),
          icon: TrendingUp,
          color: "bg-green-50/50",
          iconColor: "text-green-600",
          isRead: true,
        });
      });

      // Policy Alert
      if (policy?.has_active_policy) {
        alerts.push({
          id: 'p1',
          type: "system",
          title: "Safety Net Active",
          description: `Your ${policy.active_policy.plan_type} plan is active until ${new Date(policy.active_policy.valid_until).toLocaleDateString()}.`,
          time: "Now",
          icon: Info,
          color: "bg-purple-50/50",
          iconColor: "text-purple-600",
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
  }, [workerId]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
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

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Syncing Alerts...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-16 sm:pl-0">
            <div>
              <h1 className={cn("text-2xl md:text-3xl font-black tracking-tighter transition-all", platformColor)}>
                {platformName} Notifications
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">{username}'s alerts</p>
              {phoneNumber && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  <Phone size={12} className="text-blue-600" />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="section-padding max-w-5xl mx-auto space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active">
            <div className="divide-y divide-gray-50 px-2 pb-2">
              {notifications.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-gray-400 font-bold uppercase tracking-widest">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification, i) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-8 flex flex-col md:flex-row md:items-center gap-6 hover:bg-gray-50/50 transition-all duration-500 rounded-[2rem] group cursor-pointer relative",
                        !notification.isRead ? "bg-blue-50/20" : ""
                      )}
                      style={{ transitionDelay: `${i * 100}ms` }}
                    >
                      {!notification.isRead && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-glow shadow-blue-500/50" />
                      )}
                      <div className={cn(
                        "p-4 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 duration-300",
                        notification.color, notification.iconColor
                      )}>
                        <Icon size={26} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 className={cn(
                            "text-lg font-black tracking-tight",
                            notification.isRead ? "text-gray-900" : "text-blue-900"
                          )}>
                            {notification.title}
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{notification.time}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed max-w-3xl">
                          {notification.description}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Enable Notifications Callout */}
          <div className="bg-black rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden reveal active" style={{ transitionDelay: "400ms" }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full -mr-20 -mt-20 blur-[100px] opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-2xl">
                <Bell size={32} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-black mb-2">Real-Time Alerts</h4>
                <p className="text-gray-400 font-medium leading-relaxed max-w-md">
                  Enable push notifications to get traffic and weather alerts as they happen.
                </p>
              </div>
              <button className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl whitespace-nowrap">
                Enable Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
