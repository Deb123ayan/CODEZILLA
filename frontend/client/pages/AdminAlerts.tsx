import Sidebar from "@/components/Sidebar";
import { AlertTriangle, Shield, Bell, Send, Trash2, CheckCircle, Info, Filter, ArrowRight, Zap, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const activeAlerts = [
  { id: 1, type: "fraud", severity: "high", title: "Suspicious Payout Pattern", msg: "Multiple claims detected from Sector 5 with identical evidence images.", time: "10m ago" },
  { id: 2, type: "system", severity: "medium", title: "API Latency", msg: "Weather data provider 'SkyCast' responding slowly (>2s).", time: "25m ago" },
  { id: 3, type: "operation", severity: "low", title: "Heavy Rain Broadcast", msg: "Rain alert sent to 4,200 workers in North Delhi.", time: "1h ago" },
];

export default function AdminAlerts() {
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
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Command Center</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Real-time system health and broadcasts</p>
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95 group">
              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              <span className="text-sm font-bold">New Broadcast</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-12">
          {/* Severity Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: "Critical", value: "1", icon: AlertTriangle, color: "bg-red-50/50", textColor: "text-red-900", iconColor: "text-red-600", desc: "Immediate action required" },
              { label: "Warnings", value: "4", icon: Info, color: "bg-orange-50/50", textColor: "text-orange-900", iconColor: "text-orange-600", desc: "Non-critical optimizations" },
              { label: "Active Broadcasts", value: "12", icon: Bell, color: "bg-blue-50/50", textColor: "text-blue-900", iconColor: "text-blue-600", desc: "Live zone notifications" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={cn("p-8 rounded-[2.5rem] border border-gray-100/50 reveal active shadow-sm", stat.color)}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn("p-3 rounded-xl", stat.color, stat.iconColor)}>
                      <Icon size={24} />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", stat.textColor)}>{stat.label}</span>
                  </div>
                  <h3 className={cn("text-5xl font-black tracking-tighter mb-2", stat.textColor)}>{stat.value}</h3>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-60", stat.textColor)}>{stat.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Active Notifications List */}
            <div className="lg:col-span-2 space-y-6 reveal active" style={{ transitionDelay: "300ms" }}>
              <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-black tracking-tight">System Event Log</h2>
                <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors">Clear All</button>
              </div>
              <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-50 px-2 pb-2">
                  {activeAlerts.map((alert, i) => (
                    <div key={alert.id} className="p-8 flex flex-col md:flex-row gap-6 hover:bg-gray-50/80 transition-all duration-300 rounded-[2rem] group cursor-pointer relative">
                      <div className={cn(
                        "p-4 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:bg-black group-hover:text-white",
                        alert.severity === "high" ? "bg-red-50 text-red-600" :
                          alert.severity === "medium" ? "bg-orange-50 text-orange-600" :
                            "bg-blue-50 text-blue-600"
                      )}>
                        {alert.type === "fraud" ? <Shield size={26} /> : <Zap size={26} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <h3 className="text-lg font-black tracking-tight text-gray-900 group-hover:translate-x-1 transition-transform">{alert.title}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{alert.time}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                          {alert.msg}
                        </p>
                        <div className="flex items-center space-x-4">
                          <button className="px-5 py-2.5 bg-gray-50 text-gray-400 hover:bg-black hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Investigate
                          </button>
                          <button className="px-5 py-2.5 bg-gray-50 text-gray-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Manual Controls */}
            <div className="space-y-8 reveal active" style={{ transitionDelay: "400ms" }}>
              <div className="bg-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full -mr-10 -mt-10 blur-[80px] opacity-20" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-6 tracking-tight">Zone Broadcast</h3>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed mb-10">
                    Deploy manual notifications to all active workers in a specific radius.
                  </p>
                  <div className="space-y-4">
                    <div className="relative">
                      <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-gray-300 focus:ring-2 focus:ring-blue-500 transition-all appearance-none outline-none">
                        <option className="bg-gray-900">Select Target Zone...</option>
                        <option className="bg-gray-900">North Delhi (Central)</option>
                        <option className="bg-gray-900">Gurgaon Sector 21</option>
                      </select>
                    </div>
                    <textarea
                      placeholder="Type message here..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold text-gray-300 h-32 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none placeholder:text-gray-600"
                    />
                    <button className="w-full h-14 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl flex items-center justify-center space-x-3">
                      <Send size={16} />
                      <span>Dispatch Alert</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm">
                <h3 className="text-xl font-black text-gray-900 mb-8 tracking-tight">Automation Rules</h3>
                <div className="space-y-8">
                  {[
                    { label: "Fraud Guard", desc: "Auto-block high-risk IDs", active: true },
                    { label: "Dynamic Payouts", desc: "Multiplier on severe weather", active: true },
                    { label: "Batch Settlements", desc: "Nightly auto-payouts", active: false },
                  ].map((rule) => (
                    <div key={rule.label} className="flex items-center justify-between group cursor-pointer">
                      <div>
                        <p className="text-sm font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors">{rule.label}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{rule.desc}</p>
                      </div>
                      <div className={cn(
                        "w-12 h-6 rounded-full relative transition-all duration-300 flex items-center px-1",
                        rule.active ? "bg-green-500" : "bg-gray-200"
                      )}>
                        <div className={cn(
                          "w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm",
                          rule.active ? "translate-x-6" : "translate-x-0"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
