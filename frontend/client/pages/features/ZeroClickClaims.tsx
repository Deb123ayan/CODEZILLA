import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Wallet, Zap, ArrowRight, ShieldCheck, CheckCircle2, Search, FileCheck, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ZeroClickClaims() {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 reveal active">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
              <Wallet size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Zero Friction Payouts</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-gray-900 italic">
              Zero-Click <br /><span className="text-blue-600 not-italic">Claims System.</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-400 leading-relaxed max-w-lg italic">
              "No forms. No paperwork. Claims are triggered automatically." EarnLock automatically detects eligible disruptions and triggers payouts without manual claim submission.
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
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-8 relative overflow-hidden transition-all duration-700 hover:shadow-blue-500/10 hover:border-blue-500/20">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
                       <ShieldCheck size={28} className="text-blue-600" />
                    </div>
                    <div>
                       <h4 className="text-sm font-black italic">Claim Ledger AI</h4>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 tracking-tighter">Automatic Event Detection</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 leading-none mb-1">Status</p>
                     <h5 className="text-sm font-black italic">Active</h5>
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="flex items-center group/item hover:translate-x-1 transition-transform cursor-default">
                     <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-4 group-hover/item:bg-blue-600 transition-colors">
                        <CheckCircle2 size={18} className="text-blue-500 group-hover/item:text-white" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover/item:text-gray-900 transition-colors underline decoration-dotted underline-offset-4">Event #TXN-982 Validated</p>
                  </div>
                  <div className="flex items-center group/item hover:translate-x-1 transition-transform cursor-default">
                     <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center mr-4 group-hover/item:bg-blue-600 transition-colors">
                        <CheckCircle2 size={18} className="text-blue-500 group-hover/item:text-white" />
                     </div>
                     <p className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover/item:text-gray-900 transition-colors underline decoration-dotted underline-offset-4">Payout Initiated: ₹750.00</p>
                  </div>
               </div>
               
               <div className="mt-10 p-6 bg-blue-600 rounded-[2rem] text-white flex items-center justify-between group-hover:scale-[1.02] transition-transform duration-500 shadow-xl">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                        <Zap size={20} className="fill-current" />
                     </div>
                     <div>
                        <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Payout Frequency</p>
                        <p className="text-sm font-bold tracking-tight">Instant / 60s</p>
                     </div>
                  </div>
                  <CheckCircle2 size={24} className="text-blue-300" />
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic">Zero Paperwork <span className="text-blue-500 not-italic">Reality.</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">The journey from disruption to payout in seconds</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Disruption detected", desc: "Our AI systems identify route delays, weather anomalies, or app outages in real-time.", icon: Search },
              { step: "02", title: "Eligibility verified by AI", desc: "Instantly cross-references the event with your active protection plan rules.", icon: FileCheck },
              { step: "03", title: "Instant payout initiated", desc: "Funds are transferred to your linked wallet immediately upon verification.", icon: Send }
            ].map((s, i) => (
              <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:bg-black transition-all duration-500 group">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <s.icon size={32} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 tracking-[0.3em] group-hover:text-gray-300">Phase {s.step}</p>
                <h3 className="text-2xl font-black tracking-tighter mb-4 uppercase italic leading-none group-hover:text-white">{s.title}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed italic group-hover:text-gray-300">"{s.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="section-padding py-24 bg-white border-t border-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="bg-black rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 left-0 w-full h-full bg-blue-500/5 blur-[120px] pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
             <div className="relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                <div className="space-y-10">
                   <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">Seamless <br /><span className="text-blue-500 not-italic">Benefits.</span></h2>
                   <div className="grid space-y-6">
                      {[
                        "No claim forms",
                        "Automatic payout",
                        "Faster compensation",
                        "Hassle-free protection"
                      ].map((b, i) => (
                        <div key={i} className="flex items-center space-x-6">
                           <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
                              <CheckCircle2 size={24} className="text-blue-500" />
                           </div>
                           <span className="text-lg font-black italic tracking-tight opacity-80 uppercase">{b}</span>
                        </div>
                      ))}
                   </div>
                </div>
                
                <div className="space-y-8 flex flex-col items-center lg:items-end text-center lg:text-right">
                   <p className="text-xl md:text-2xl font-bold text-gray-400 max-w-md leading-relaxed italic">
                      "Why waste hours filling forms when our AI can handle it in 60 seconds?"
                   </p>
                   <Link 
                     to="/buy-plan"
                     className="px-14 py-7 bg-white text-black rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all duration-500 hover:scale-[1.1] active:scale-95 shadow-2xl"
                   >
                     Protect My Income
                   </Link>
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
