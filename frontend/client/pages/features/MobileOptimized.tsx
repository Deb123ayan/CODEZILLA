import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Smartphone, Zap, ArrowRight, ShieldCheck, CheckCircle2, MessageSquare, Bell, Navigation, Touchpad } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileOptimized() {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-gray-100 relative overflow-hidden">
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 reveal active">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-gray-100 text-gray-900 rounded-2xl border border-gray-200">
              <Smartphone size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Always On-The-Go</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-gray-900 italic">
              Built for Workers <br /><span className="text-blue-600 not-italic">on Mobile.</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-400 leading-relaxed max-w-lg italic">
              "A fast and simple mobile experience designed for workers on the move." Zafby's interface is optimized for mobile devices, ensuring easy navigation while working.
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

          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-[320px] aspect-[9/19] bg-black rounded-[3rem] border-[8px] border-gray-900 shadow-2xl relative overflow-hidden group">
              {/* Mobile Notification Mockup */}
              <div className="absolute top-0 w-full h-8 bg-black flex justify-center items-end pb-2">
                <div className="w-20 h-4 bg-gray-900 rounded-full" />
              </div>

              <div className="p-6 pt-12 space-y-6">
                <div className="bg-white rounded-[1.5rem] p-4 shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Zap size={16} className="text-white" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-gray-400">Zafby Protection</p>
                  </div>
                  <h5 className="text-sm font-black italic">Payout Complete!</h5>
                  <p className="text-[8px] font-bold text-gray-400 mt-1">₹500 has been added to your Zafby Wallet.</p>
                </div>

                <div className="bg-blue-600 rounded-[1.5rem] p-6 text-white space-y-4">
                  <div className="flex justify-between items-start">
                    <p className="text-[8px] font-black uppercase tracking-widest opacity-60">Status</p>
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-none mb-1">Protection Active</p>
                    <h4 className="text-2xl font-black tracking-tighter">PREMIUM</h4>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
                    <Navigation size={16} className="text-blue-400 mb-2" />
                    <span className="text-[8px] font-black text-gray-500 uppercase">Track</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center">
                    <Bell size={16} className="text-blue-400 mb-2" />
                    <span className="text-[8px] font-black text-gray-500 uppercase">Alerts</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-gray-800 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Features */}
      <section className="section-padding py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <h2 className="text-3xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">The Mobile-First <br /><span className="text-blue-600 not-italic">Edge.</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Optimized for the speed of your workday</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "One-tap protection activation", desc: "No complex configuration. One tap and you're protected for the day.", icon: Touchpad, color: "bg-blue-50 text-blue-600" },
              { title: "Quick payout alerts", desc: "Push notifications for every payout, ensuring you're always in the loop.", icon: Bell, color: "bg-blue-50 text-blue-600" },
              { title: "Real-time notifications", desc: "Get warned about weather risks and traffic surges before they reach you.", icon: MessageSquare, color: "bg-blue-50 text-blue-600" },
              { title: "Smooth mobile navigation", desc: "Designed with large touch targets for easy usage while wearing gloves or on the move.", icon: Smartphone, color: "bg-black text-white shadow-xl" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:bg-black transition-all duration-500 group flex flex-col h-full transform hover:-translate-y-2">
                <div className={cn("inline-flex w-16 h-16 items-center justify-center rounded-2xl mb-8 group-hover:scale-110 transition-transform shadow-sm", f.color)}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-black tracking-tighter mb-4 italic leading-none group-hover:text-white">{f.title}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed italic group-hover:text-gray-300">"{f.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-padding py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto bg-black rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[120px] -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]">Start Earning <br /><span className="text-blue-600 not-italic">Without Fear.</span></h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/buy-plan"
                className="w-full sm:w-auto px-14 py-7 bg-white text-black rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl"
              >
                Become a Member
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto px-14 py-7 bg-white/5 border border-white/10 rounded-3xl font-black text-[12px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all"
              >
                Select Platform
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
