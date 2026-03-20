import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Shield, Zap, ArrowRight, ShieldCheck, Lock, Search, Cpu, CheckCircle2, Eye, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FraudProtection() {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-50/40 blur-[150px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 reveal active">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
              <Shield size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">PLATFORM INTEGRITY</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-gray-900 italic">
              Advanced <br /><span className="text-blue-600 not-italic">Fraud Protection.</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-400 leading-relaxed max-w-lg italic">
              Secure payouts with AI-powered verification. Zafby uses advanced AI models and location verification to prevent fraudulent claims.
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
            <div className="bg-white rounded-[3rem] border border-gray-100 p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] relative z-10 overflow-hidden transform group-hover:rotate-1 transition-all duration-700">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Fingerprint size={28} className="text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black italic uppercase italic">Biometry AI</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Verifying Identity...</p>
                  </div>
                </div>
                <Lock size={20} className="text-blue-400" />
              </div>

              <div className="space-y-4">
                {[
                  { label: "IP ADDRESS", value: "192.168.1.XX", icon: Cpu, status: "Verified" },
                  { label: "GPS COORDS", value: "28.6139° N, 77.2090° E", icon: Search, status: "Matching" },
                  { label: "IMAGE FORENSICS", value: "Metadata Match", icon: Eye, status: "Passed" }
                ].map((scan, i) => (
                  <div key={i} className="flex items-center justify-between p-5 bg-gray-50/50 rounded-2xl border border-gray-50 transition-colors hover:bg-white hover:shadow-lg">
                    <div className="flex items-center gap-4">
                      <scan.icon size={18} className="text-blue-600" />
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{scan.label}</p>
                        <p className="text-xs font-black">{scan.value}</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-full">{scan.status}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-10 border-t border-gray-50 flex items-center justify-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 text-blue-600 rounded-full">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest tracking-tighter">Secure Session #1283-F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="section-padding py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic">Security <span className="text-blue-600 not-italic">Infrastructure.</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">How we protect the platform from misuse</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "AI claim validation", desc: "Proprietary models cross-calculate telemetry data with disruption reports to validate legality.", icon: Cpu, color: "bg-blue-50 text-blue-600" },
              { title: "Location verification", desc: "Geo-fencing tech ensures workers are physically present in the zones where disruptions occur.", icon: Search, color: "bg-blue-50 text-blue-600" },
              { title: "Fraud detection models", desc: "Advanced behavioral analysis identifies anomalous claiming patterns before they escalate.", icon: ShieldCheck, color: "bg-blue-50 text-blue-600" },
              { title: "Secure payout processing", desc: "Dual-layer encryption for all wallet transfers ensures funds reach the right partner every time.", icon: Lock, color: "bg-blue-50 text-blue-600" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-12 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:bg-black transition-all duration-500 group text-center flex flex-col items-center">
                <div className={cn("inline-flex p-6 rounded-[2rem] mb-8 group-hover:scale-110 transition-transform", f.color)}>
                  <f.icon size={32} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4 uppercase italic leading-none group-hover:text-white">{f.title}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed italic group-hover:text-gray-300">"{f.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Callout */}
      <section className="section-padding py-32 bg-white relative overflow-hidden group">
        <div className="absolute inset-0 bg-blue-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
        <div className="max-w-3xl mx-auto text-center space-y-12">
          <h2 className="text-4xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">Military-Grade <br /><span className="text-blue-600 not-italic">Assurance.</span></h2>
          <p className="text-lg md:text-xl font-bold text-gray-400 max-w-lg mx-auto italic leading-relaxed">
            "Join the most secure protection network for gig workers. We protect the system, so the system can protect you."
          </p>
          <div className="flex items-center justify-center gap-6">
            <Link
              to="/buy-plan"
              className="px-10 py-6 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all duration-500 hover:scale-[1.05] shadow-2xl"
            >
              Start Protection
            </Link>
            <Link
              to="/"
              className="px-10 py-6 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] hover:text-black transition-all"
            >
              Go Back
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
