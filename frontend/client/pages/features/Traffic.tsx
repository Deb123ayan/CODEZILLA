import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { AlertTriangle, Zap, ArrowRight, ShieldCheck, MapPin, Activity, Navigation, Timer, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Traffic() {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-gray-100 overflow-hidden relative">
        {/* Glow behind content */}
        <div className="absolute top-1/2 left-0 w-full h-full -z-10 bg-red-50/20 blur-[150px] rounded-full" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="lg:w-1/2 space-y-8 reveal active">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-red-50 text-red-600 rounded-2xl border border-red-100/30">
              <AlertTriangle size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Anti-Disruption AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight text-gray-900">
              Traffic Disruption <br /><span className="text-red-600">Protection.</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-400 leading-relaxed max-w-lg">
              Get compensated when traffic delays affect delivery performance. EarnLock analyzes traffic congestion and road disruptions to trigger compensation automatically.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
              <Link
                to="/buy-plan"
                className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all duration-500 hover:scale-105 active:scale-95 flex items-center justify-center space-x-3"
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

          <div className="lg:w-1/2 relative">
             <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                      <Navigation size={24} className="text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic">Traffic Sentinel</h4>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Route Monitoring Active</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase tracking-[0.2em] rounded">Alert</span>
                </div>
                
                <div className="space-y-4">
                  <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Timer className="text-red-600" size={20} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Delay Detected</p>
                        <h5 className="text-xl font-black text-red-900">+18 Mins</h5>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Estimated Payout</p>
                       <h5 className="text-xl font-black text-emerald-600">₹85.00</h5>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <Activity size={16} className="text-gray-400 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Avg Speed</p>
                      <p className="text-sm font-black">12 km/h</p>
                    </div>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                      <MapPin size={16} className="text-gray-400 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Disruption</p>
                      <p className="text-sm font-black">Heavy</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                   <div className="flex items-center -space-x-3">
                      {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100" />)}
                   </div>
                   <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">Watching 124 routes nearby</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">Traffic Compensation <span className="text-red-600 not-italic">Flow.</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Automated detection systems in action</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "AI tracks traffic conditions", desc: "Live GPS analysis across your delivery route determines local traffic density.", icon: Activity },
              { step: "02", title: "Delivery slowdown detected", desc: "Our models identify significant delays that fall outside normal shift expectations.", icon: Timer },
              { step: "03", title: "Compensation triggered", desc: "Once the disruption limit is breached, protection payouts are initiated automatically.", icon: Zap }
            ].map((s, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
                  <s.icon size={36} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 italic">Step {s.step}</p>
                <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase">{s.title}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed italic">"{s.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="section-padding py-24 bg-white border-t border-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none mb-8 italic">Protect your <br /><span className="text-red-600 not-italic">Time & Money.</span></h2>
                <div className="space-y-6">
                   {[
                     "Traffic surge alerts",
                     "Delivery delay protection",
                     "Automated compensation",
                     "Real-time congestion tracking"
                   ].map((b, i) => (
                     <div key={i} className="flex items-center space-x-6 group">
                        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-red-600 transition-all">
                           <CheckCircle2 size={20} className="text-red-600 group-hover:text-white" />
                        </div>
                        <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{b}</span>
                     </div>
                   ))}
                </div>
             </div>
             
             <div className="bg-black rounded-[3rem] p-12 text-white shadow-2xl space-y-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-[100px] -mr-20 -mt-20" />
                <h3 className="text-2xl font-black italic tracking-tight">Stay ahead of the gridlock.</h3>
                <p className="text-gray-400 font-bold leading-relaxed tracking-tight italic">
                   Don't let road conditions dictate your daily wage. Activate traffic disruption protection and earn with absolute confidence.
                </p>
                <Link 
                  to="/buy-plan"
                  className="w-full h-16 bg-white text-black rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all duration-300"
                >
                  Start Protection
                </Link>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
