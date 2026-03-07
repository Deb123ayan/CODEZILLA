import Sidebar from "@/components/Sidebar";
import { Bell, Cloud, AlertCircle, TrendingUp, Info, Trash2, CheckCircle2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const initialNotifications = [
  {
    id: 1,
    type: "weather",
    title: "Heavy Rain Warning",
    description: "Heavy rain expected in your zone (South Delhi) tomorrow between 8:00 AM and 11:00 AM. Higher coverage rates active.",
    time: "2h ago",
    icon: Cloud,
    color: "bg-blue-50/50",
    iconColor: "text-blue-600",
    isRead: false,
  },
  {
    id: 2,
    type: "payout",
    title: "Payout Disbursed",
    description: "₹500 for claim #CLM-98765 has been successfully credited to your HDFC bank account.",
    time: "5h ago",
    icon: TrendingUp,
    color: "bg-green-50/50",
    iconColor: "text-green-600",
    isRead: true,
  },
  {
    id: 3,
    type: "system",
    title: "Policy Renewal Reminder",
    description: "Your 'Premium Plan' is expiring in 3 days. Renew now to maintain continuous protection.",
    time: "1d ago",
    icon: Info,
    color: "bg-purple-50/50",
    iconColor: "text-purple-600",
    isRead: true,
  },
  {
    id: 4,
    type: "disruption",
    title: "Major Traffic Alert",
    description: "Accident reported on Highway 44. Expect significant delays. Stay safe and drive carefully.",
    time: "1d ago",
    icon: AlertCircle,
    color: "bg-orange-50/50",
    iconColor: "text-orange-600",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 20);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

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
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Notifications</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Stay updated with important alerts</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={markAllRead}
                className="flex items-center space-x-2 px-5 py-3 bg-white border border-gray-200 text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 transition-colors rounded-2xl shadow-sm"
              >
                <CheckCircle2 size={16} />
                <span>Mark All Read</span>
              </button>
              <button className="p-3.5 bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition-colors rounded-2xl shadow-sm">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </header>

        <div className="section-padding max-w-5xl mx-auto space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active">
            <div className="divide-y divide-gray-50 px-2 pb-2">
              {notifications.map((notification, i) => {
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
                      <div className="mt-6 flex items-center space-x-6">
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:underline">
                          View Details
                        </button>
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-600">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
