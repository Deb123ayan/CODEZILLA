import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Zap, ArrowRight, LayoutDashboard, Database, Smartphone, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Tracking() {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 reveal active">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl">
              <Activity size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Real-time Technology</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-gray-900">
              Real-time Earnings <span className="text-blue-600">Tracking.</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-400 leading-relaxed max-w-lg">
              Track your deliveries, earnings and disruptions in real time. EarnLock integrates with delivery platforms to monitor activity and detect disruption risks instantly.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link
                to="/buy-plan"
                className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Start Protection</span>
                <Zap size={16} className="fill-current" />
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto px-10 py-5 bg-white border border-gray-100 text-gray-400 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:border-black flex items-center justify-center"
              >
                Back to Home
              </Link>
            </div>
          </div>

          <div className="lg:w-1/2 relative group">
            <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full group-hover:scale-110 transition-transform duration-1000" />
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative z-10 overflow-hidden transform group-hover:rotate-1 transition-all duration-700">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg">
                      <LayoutDashboard size={24} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black">Worker Telemetry</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Syncing...</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-500">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">Healthy</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Active Dash", value: "Sector 14, Gurgaon", icon: Activity },
                    { label: "Current Pace", value: "3.2 Orders / Hr", icon: Zap },
                    { label: "Disruption Risk", value: "Low (12%)", icon: ShieldCheck }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-50">
                      <div className="flex items-center space-x-4">
                        <item.icon size={18} className="text-blue-600" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section-padding py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">How It Works.</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Simple integration, absolute visibility</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Delivery Platform", desc: "Link your partner accounts securely with one-click OAuth integration.", icon: Database },
              { step: "02", title: "EarnLock monitors data", desc: "Our AI background system tracks your GPS and earnings telemetry live.", icon: Activity },
              { step: "03", title: "AI detects disruptions", desc: "Automatically triggers protection if slowdowns or weather risks occur.", icon: ShieldCheck }
            ].map((s, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:bg-black transition-all duration-500 group">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <s.icon size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 group-hover:text-gray-300">Step {s.step}</p>
                <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-white">{s.title}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed group-hover:text-gray-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section-padding py-24 bg-white border-t border-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-black rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-20 -mt-20" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black mb-12 tracking-tight">Core Benefits.</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  "Track live delivery activity",
                  "Instant disruption detection",
                  "Accurate payout calculation",
                  "Reliable earnings monitoring"
                ].map((b, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <CheckCircle2 size={24} className="text-blue-400" />
                    <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">{b}</span>
                  </div>
                ))}
              </div>
              <div className="mt-16 flex justify-center">
                <Link to="/buy-plan" className="px-10 py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-xl">
                  Get Started Flow
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
