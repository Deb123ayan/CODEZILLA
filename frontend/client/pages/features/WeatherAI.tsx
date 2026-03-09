import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Cloud, Zap, ArrowRight, ShieldCheck, Wind, Sun, CloudRain, AlertCircle, Thermometer } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WeatherAI() {
  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      {/* Hero Section */}
      <section className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="lg:w-1/2 space-y-8 reveal active">
            <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/50">
              <Cloud size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hyper-Local AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-gray-900">
              AI-Powered <br /><span className="text-blue-600">Weather Detection.</span>
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-400 leading-relaxed max-w-lg">
              Predict weather risks in your delivery zone before they impact earnings. EarnLock uses hyper-local weather data and AI models to detect rainfall, heatwaves and storms.
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
            {/* Visual Dashboard Mockup */}
            <div className="bg-gray-900 rounded-[2.5rem] p-4 shadow-2xl relative overflow-hidden group-hover:-translate-y-2 transition-transform duration-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="bg-[#111] rounded-[2rem] p-8 border border-white/5 space-y-10">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-white text-lg font-black tracking-tight italic">Weather Matrix AI</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Scanning Zone: North Delhi</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <CloudRain size={24} className="text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Humidity", value: "84%", icon: CloudRain, color: "text-blue-400" },
                    { label: "Temp", value: "42°C", icon: Sun, color: "text-blue-400" },
                    { label: "Wind", value: "12 km/h", icon: Wind, color: "text-blue-400" },
                    { label: "Predictor", value: "Storm", icon: AlertCircle, color: "text-blue-400" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[1.5rem] space-y-4 hover:border-white/10 transition-colors">
                      <stat.icon size={20} className={stat.color} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                        <h5 className="text-xl font-black text-white mt-1 uppercase">{stat.value}</h5>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center gap-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center shrink-0">
                    <Thermometer className="text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-black uppercase tracking-widest leading-none mb-2">Protection Status</p>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-[85%]" />
                    </div>
                  </div>
                  <span className="text-white font-black text-sm">85%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Blocks */}
      <section className="section-padding py-24 bg-[#f8fafc]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">Weather AI <span className="text-blue-600 not-italic">Predicts.</span></h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Real-time detection for real-world risks</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Heavy Rain", desc: "Instantly triggers coverage when localized precipitation exceeds delivery safety limits.", icon: CloudRain, color: "bg-blue-50 text-blue-600" },
              { title: "Heatwaves", desc: "Detects extreme temperature surges that impact delivery health and speed performance.", icon: Sun, color: "bg-blue-50 text-blue-600" },
              { title: "Storm conditions", desc: "Hyper-local monitoring for high winds and dust storms that disrupt navigation.", icon: Wind, color: "bg-blue-50 text-blue-600" },
              { title: "Localized disruption", desc: "AI identifies specific zone weather anomalies not caught by generic weather apps.", icon: AlertCircle, color: "bg-blue-50 text-blue-600" }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:bg-black transition-all duration-500 group relative overflow-hidden">
                <div className={cn("inline-flex p-4 rounded-2xl mb-8 group-hover:scale-110 transition-transform", f.color)}>
                  <f.icon size={28} />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-4 group-hover:text-white">{f.title}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed group-hover:text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Call to Action */}
      <section className="section-padding py-24 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto bg-black rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-600/10 blur-[150px] group-hover:bg-blue-600/20 transition-all duration-1000" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none italic max-w-2xl mx-auto">
              Ready to outsmart the <span className="text-blue-500 not-italic">Weather?</span>
            </h2>
            <Link 
              to="/buy-plan"
              className="inline-flex items-center space-x-4 px-10 py-6 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-500 hover:text-white transition-all duration-500 hover:scale-[1.05]"
            >
              <span>Activate Protection</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
