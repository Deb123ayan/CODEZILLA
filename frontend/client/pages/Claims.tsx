import Sidebar from "@/components/Sidebar";
import { Plus, Clock, CheckCircle, AlertCircle, ExternalLink, Filter, Search, Phone } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";

const claims = [
  { id: "CLM-12345", type: "Weather Impact", date: "May 12, 2024", amount: "₹800", status: "Processed", platform: "Zomato" },
  { id: "CLM-12346", type: "Traffic Delay", date: "May 14, 2024", amount: "₹1,200", status: "Pending", platform: "Blinkit" },
  { id: "CLM-12347", type: "Platform Outage", date: "May 15, 2024", amount: "₹500", status: "Processing", platform: "Zomato" },
];

export default function Claims() {
  const { platform: userPlatform, username: userUsername, phoneNumber } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
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
                {platformName} Claims
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">{username}'s portal</p>
              {phoneNumber && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  <Phone size={12} className="text-blue-600" />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95">
              <Plus size={20} />
              <span className="text-sm font-bold">File New Claim</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-12">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Total Claims", value: "₹2,500", icon: CheckCircle, color: "bg-blue-50/50", iconColor: "text-blue-600" },
              { label: "Pending Approval", value: "₹1,200", icon: Clock, color: "bg-orange-50/50", iconColor: "text-orange-600" },
              { label: "Total Payout", value: "₹15,400", icon: ExternalLink, color: "bg-green-50/50", iconColor: "text-green-600" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn("p-8 rounded-[2.5rem] border border-gray-100 hover:bg-black group transition-all duration-500 transform hover:-translate-y-1 cursor-pointer reveal active shadow-sm shadow-black/5", stat.color)}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={cn("p-4 w-14 h-14 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors", stat.color, stat.iconColor)}>
                  <stat.icon size={26} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1 group-hover:text-white transition-colors">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "300ms" }}>
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-5 py-3 bg-gray-50 text-gray-400 hover:text-black rounded-2xl text-xs font-black uppercase tracking-widest transition-colors">
                  <Filter size={16} />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar pt-2">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                    <th className="px-8 py-5">Claim ID</th>
                    <th className="px-8 py-5">Issue Type</th>
                    <th className="px-8 py-5">Platform</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="group hover:bg-gray-50/80 transition-all cursor-pointer">
                      <td className="px-8 py-6 font-black text-gray-900 group-hover:translate-x-1 transition-transform">{claim.id}</td>
                      <td className="px-8 py-6 font-bold text-gray-500">{claim.type}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg">{claim.platform}</span>
                      </td>
                      <td className="px-8 py-6 text-gray-400 text-xs font-bold">{claim.date}</td>
                      <td className="px-8 py-6 font-black text-gray-900">{claim.amount}</td>
                      <td className="px-8 py-6 text-right">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          claim.status === "Processed" ? "bg-green-100 text-green-700" :
                            claim.status === "Pending" ? "bg-orange-100 text-orange-700" :
                              "bg-blue-100 text-blue-700"
                        )}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Banner */}
          <section className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden reveal active" style={{ transitionDelay: "400ms" }}>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl">
                <AlertCircle size={40} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight mb-3">AI Verification Engine</h2>
                <p className="text-blue-100/70 font-medium leading-relaxed max-w-xl">
                  Our system verifies 92% of claims automatically using traffic and weather data, ensuring payouts reach your wallet in under 4 hours.
                </p>
              </div>
              <button className="px-8 py-4 bg-white text-blue-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 whitespace-nowrap">
                How it works
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
