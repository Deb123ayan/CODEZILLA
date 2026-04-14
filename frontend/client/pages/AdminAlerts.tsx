import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, Shield, Send, Info, Target, Loader2, ShieldAlert, Zap
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

export default function AdminAlerts() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any[]>([]);
  const [dispatching, setDispatching] = useState(false);
  const [formData, setFormData] = useState({
    type: "STRIKE",
    zone: "North Delhi",
    severity: "7",
    description: ""
  });

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [evs, rks] = await Promise.all([
        api.get<any[]>("/events/"),
        api.get<any[]>("/admin/risk-zones/")
      ]);
      setEvents(evs);
      setHeatmap(rks);
    } catch (error) {
      toast.error("Failed to sync Risk Sonar");
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return toast.error("Write a message first!");
    setDispatching(true);
    try {
      await api.post("/events/report/", {
        type: formData.type,
        zone: formData.zone,
        severity: parseInt(formData.severity),
        description: formData.description
      });
      toast.success("Broadcast Dispatched!");
      setFormData(f => ({ ...f, description: "" }));
      fetchAlerts();
    } catch (error) {
      toast.error("Dispatch failed");
    } finally {
      setDispatching(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const criticalEvents = events.filter(e => e.severity >= 8).length;
  const warnings = events.filter(e => e.severity < 8 && e.severity >= 5).length;

  return (
    <AdminLayout>
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1b1c1b]">Risk Sonar & Events</h1>
          <p className="text-[#434751] mt-1 font-medium text-lg">Real-time systemic risk detection and manual overrides.</p>
        </div>
      </div>

      <div className="space-y-12">
        {/* Severity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: "Critical Risk", value: criticalEvents, icon: AlertTriangle, color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]/40", desc: "Severity 8+ Infrastructure Issues" },
            { label: "Active Warnings", value: warnings, icon: Info, color: "text-[#d97706]", bg: "bg-[#fffbeb]", desc: "Parametric Algorithmic Alerts" },
            { label: "Tracked Zones", value: heatmap.length, icon: Target, color: "text-[#004191]", bg: "bg-[#f0f4ff]", desc: "Sectors under live surveillance" },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-[#ffffff] p-8 md:p-10 rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500 hover:-translate-y-1"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className={cn("p-4 w-16 h-16 rounded-[1.5rem] flex items-center justify-center border border-[#e4e2e0]/30 transition-colors", stat.bg, stat.color)}>
                    <Icon size={28} />
                  </div>
                  <span className={cn("text-[10px] font-inter font-bold uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-[#fcf9f8] border border-[#e4e2e0]/50", stat.color)}>{stat.label}</span>
                </div>
                <h3 className="text-5xl font-extrabold text-[#1b1c1b] tracking-tighter mb-2">{stat.value}</h3>
                <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em]">{stat.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          
          {/* Active Notifications List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-[#1b1c1b]">System Radar Feed</h2>
              <button className="text-[10px] font-inter font-bold text-[#ba1a1a] uppercase tracking-[0.15em] hover:text-[#1b1c1b] transition-colors bg-[#f5f3f1] px-4 py-2 rounded-full border border-[#e4e2e0]">Clear Diagnostics</button>
            </div>
            
            <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden min-h-[400px]">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-6 py-32">
                  <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
                  <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">Engaging Sonar...</p>
                </div>
              ) : (
                <div className="divide-y divide-[#e4e2e0]/40">
                  {events.length === 0 ? (
                    <div className="p-32 text-center">
                      <Shield size={48} className="mx-auto text-[#e4e2e0] mb-4" />
                      <p className="text-sm font-inter font-bold text-[#a8aebf] uppercase tracking-widest">Radar clear. No active events.</p>
                    </div>
                  ) : (
                    events.map((alert) => (
                      <div key={alert.event_id} className="p-8 md:p-10 flex flex-col md:flex-row gap-8 hover:bg-[#fcf9f8] transition-colors cursor-pointer group">
                        <div className={cn(
                          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-[#e4e2e0]/30 shadow-sm transition-transform transform group-hover:scale-105",
                          alert.severity >= 8 ? "bg-[#ffdad6]/40 text-[#ba1a1a]" :
                            alert.severity >= 5 ? "bg-[#fffbeb] text-[#d97706]" :
                              "bg-[#f0f4ff] text-[#004191]"
                        )}>
                          {alert.type === "CURFEW" || alert.type === "STRIKE" ? <ShieldAlert size={28} /> : <Zap size={28} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                            <h3 className="text-xl font-extrabold tracking-tight text-[#1b1c1b] group-hover:text-[#004191] transition-colors">{alert.type.replace(/_/g, " ")} &bull; {alert.zone}</h3>
                            <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] bg-[#f5f3f1] px-3 py-1.5 rounded-full border border-[#e4e2e0]">
                              {new Date(alert.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-[#434751] leading-relaxed mb-6">
                            {alert.description || "Systemic disruption automatically flagged by parametric boundary triggers."}
                          </p>
                          <div className="flex items-center space-x-4">
                            <button className="px-6 py-3 bg-[#f5f3f1] text-[#1b1c1b] hover:bg-[#1b1c1b] hover:text-white rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.15em] transition-all shadow-sm">
                              Investigate Data
                            </button>
                            <button className="px-6 py-3 bg-[#fcf9f8] border border-[#e4e2e0] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.15em] transition-all shadow-sm">
                              Archive Flag
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Manual Controls & Logic */}
          <div className="space-y-10">
            
            {/* Broadcast Form */}
            <div className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-10 text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.4)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#ba1a1a] rounded-full -mr-16 -mt-16 blur-[100px] opacity-20 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-2xl font-extrabold tracking-tight mb-2">Zone Override</h3>
                <p className="text-[#a8aebf] font-medium text-[13px] leading-relaxed mb-8">
                  Deploy manual parametric dispatches to workers in a specific radius.
                </p>
                <form onSubmit={handleDispatch} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <select 
                      value={formData.type}
                      onChange={e => setFormData(f => ({...f, type: e.target.value}))}
                      className="w-full bg-[#30343f]/20 border border-[#434751]/50 rounded-[1.5rem] px-5 py-4 text-[11px] font-inter font-bold text-white uppercase tracking-[0.1em] focus:ring-2 focus:ring-[#ba1a1a] focus:border-transparent outline-none appearance-none shadow-sm cursor-pointer">
                      <option value="STRIKE" className="bg-[#1b1c1b]">STRIKE</option>
                      <option value="CURFEW" className="bg-[#1b1c1b]">CURFEW</option>
                      <option value="ZONE_CLOSURE" className="bg-[#1b1c1b]">CLOSURE</option>
                      <option value="WEATHER" className="bg-[#1b1c1b]">WEATHER</option>
                    </select>
                    <select 
                      value={formData.severity}
                      onChange={e => setFormData(f => ({...f, severity: e.target.value}))}
                      className="w-full bg-[#30343f]/20 border border-[#434751]/50 rounded-[1.5rem] px-5 py-4 text-[11px] font-inter font-bold text-white uppercase tracking-[0.1em] focus:ring-2 focus:ring-[#ba1a1a] focus:border-transparent outline-none appearance-none shadow-sm cursor-pointer">
                      {[5,6,7,8,9,10].map(s => <option key={s} value={s} className="bg-[#1b1c1b]">SEV {s}</option>)}
                    </select>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter target zone location ID..."
                    value={formData.zone}
                    onChange={e => setFormData(f => ({...f, zone: e.target.value}))}
                    className="w-full bg-[#30343f]/20 border border-[#434751]/50 rounded-[1.5rem] px-6 py-4 text-sm font-bold text-white focus:ring-2 focus:ring-[#ba1a1a] focus:border-transparent outline-none placeholder:text-[#a8aebf] shadow-sm"
                  />
                  <textarea
                    placeholder="Broadcast contextual details..."
                    value={formData.description}
                    onChange={e => setFormData(f => ({...f, description: e.target.value}))}
                    className="w-full bg-[#30343f]/20 border border-[#434751]/50 rounded-[1.5rem] px-6 py-5 text-sm font-medium text-white h-32 focus:ring-2 focus:ring-[#ba1a1a] focus:border-transparent outline-none resize-none placeholder:text-[#a8aebf] shadow-sm leading-relaxed"
                  />
                  <button 
                    type="submit"
                    disabled={dispatching}
                    className="w-full h-16 bg-[#ba1a1a] text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#d82222] transition-colors active:scale-[0.98] shadow-[0_12px_24px_-8px_rgba(186,26,26,0.5)] flex items-center justify-center space-x-3 disabled:bg-[#434751] disabled:cursor-not-allowed mt-2">
                    {dispatching ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                    <span>Dispatch Alert Override</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Automation Logic Switches */}
            <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-8 md:p-10 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)]">
              <h3 className="text-xl font-extrabold text-[#1b1c1b] mb-8 tracking-tight">System Autopilot</h3>
              <div className="space-y-8">
                {[
                  { label: "Fraud Detection Shield", desc: "Instantly algorithm-block abusive IDs", active: true },
                  { label: "Matrix Multipliers", desc: "Dynamic pricing on weather APIs", active: true },
                  { label: "Asynchronous Settlement", desc: "Nightly automated banking batch", active: false },
                ].map((rule) => (
                  <div key={rule.label} className="flex flex-col sm:flex-row sm:items-center justify-between group cursor-pointer border-b border-[#e4e2e0]/30 pb-6 last:pb-0 last:border-0 gap-4">
                    <div>
                      <p className="text-[15px] font-extrabold text-[#1b1c1b] tracking-tight group-hover:text-[#004191] transition-colors">{rule.label}</p>
                      <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-1.5">{rule.desc}</p>
                    </div>
                    <div className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-300 flex items-center px-1 shrink-0",
                      rule.active ? "bg-[#16a34a]" : "bg-[#e4e2e0]"
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
    </AdminLayout>
  );
}
