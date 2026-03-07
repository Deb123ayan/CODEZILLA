import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { CheckCircle2, Cloud, TrendingUp, AlertTriangle, Shield, Zap, X, MessageSquare, ArrowRight, Play, LayoutGrid, Award, ShieldCheck, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Partner Logos
import AmazonLogo from "@/assets/Amazon/Amazon_Logo_0.svg";
import ZomatoLogo from "@/assets/Zomato/Zomato_Logo_0.svg";
import FlipkartLogo from "@/assets/Flipkart/Flipkart_Logo_0.svg";
import ZeptoLogo from "@/assets/Zepto/Zepto_idm2wBp3DO_1.svg";
import BlinkitLogo from "@/assets/Blinkit/Blinkit_idCmcpCDCZ_0.svg";
import SwiggyLogo from "@/assets/Swiggy/Swiggy_id8bItcgXR_0.svg";

export default function Landing() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    city: "",
    weather: "",
    traffic: ""
  });

  const steps = [
    {
      question: "Where are you delivering today?",
      options: ["Mumbai", "Delhi", "Bangalore", "Hyderabad"],
      key: "city" as const
    },
    {
      question: "What's the current weather?",
      options: ["Heat", "Rain", "Pollution", "Normal"],
      key: "weather" as const
    },
    {
      question: "How is the traffic level?",
      options: ["Low", "Moderate", "Heavy"],
      key: "traffic" as const
    }
  ];

  const calculateRisk = () => {
    const { weather, traffic } = selections;
    if (weather === "Rain" || traffic === "Heavy") return "High";
    if (weather !== "Normal" || traffic === "Moderate") return "Medium";
    return "Low";
  };

  const resetPredictor = () => {
    setIsAssistantOpen(false);
    setCurrentStep(0);
    setSelections({ city: "", weather: "", traffic: "" });
  };

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 md:pt-48 md:pb-56 min-h-[auto] md:min-h-screen flex items-center justify-center section-padding">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-50/50 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-50/40 blur-[140px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto w-full text-center">
          <div className="space-y-8 md:space-y-12 reveal active">

            <h1 className="text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-black text-gray-900 tracking-tighter leading-[0.9] max-w-[12ch] mx-auto group">
              Protect your <span className="text-blue-600 group-hover:italic transition-all">Income</span> daily.
            </h1>

            <p className="max-w-3xl mx-auto text-base md:text-2xl text-gray-500 font-bold leading-normal tracking-tight px-4 sm:px-0">
              The world's first AI-driven protection layer for platform workers. No more worrying about rain, heat or traffic.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-6 bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all duration-500 hover:scale-[1.05] active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Start Protection</span>
                <Zap size={18} className="fill-current text-white" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-10 py-6 bg-white border border-gray-100 text-gray-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-xl active:scale-95 flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>

            {/* Trust Line */}
            <div className="pt-16 md:pt-24 flex flex-wrap items-center justify-center gap-6 md:gap-16 transition-all duration-700">
              {[
                { name: "Amazon", logo: AmazonLogo },
                { name: "Zomato", logo: ZomatoLogo },
                { name: "Flipkart", logo: FlipkartLogo },
                { name: "Zepto", logo: ZeptoLogo },
                { name: "Blinkit", logo: BlinkitLogo },
                { name: "Swiggy", logo: SwiggyLogo }
              ].map(p => (
                <div key={p.name} className="p-8 bg-white rounded-[3rem] shadow-sm hover:shadow-xl hover:-translate-y-3 transition-all duration-500 group">
                  <img src={p.logo} alt={p.name} className="h-16 md:h-24 object-contain rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Feature Visualization */}
      <section className="section-padding py-20 md:py-40 bg-gray-50/50 reveal active">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">Smart coverage, <br />payouts in <span className="text-emerald-500">seconds.</span></h2>
            <div className="space-y-8">
              {[
                { icon: ShieldCheck, title: "Weather Lock", desc: "Automatic payouts during heat waves or heavy rain." },
                { icon: MapPin, title: "Zone Guard", desc: "Dynamic coverage based on traffic density levels." },
                { icon: Zap, title: "Flash Payouts", desc: "Verified claims hit your wallet in under 60 minutes." },
              ].map((f, i) => {
                const Icon = f.icon;
                return (
                  <div key={i} className="flex gap-8 group cursor-pointer">
                    <div className="w-28 h-28 bg-white rounded-[3rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500">
                      <Icon size={48} className="text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black tracking-tight">{f.title}</h3>
                      <p className="text-gray-500 font-bold mt-2 max-w-sm leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative group perspective-[2000px]">
            <div className="bg-white rounded-[40px] p-12 shadow-[0_60px_100px_-20px_rgba(0,0,0,0.1)] border border-gray-100/50 transform group-hover:rotate-y-[-5deg] transition-all duration-1000">
              <div className="space-y-12">
                <div className="flex items-center justify-between">
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full">System Monitoring Active</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="p-8 bg-blue-600 text-white rounded-[2.5rem] shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-4">Payout Potential</p>
                    <h4 className="text-5xl font-black tracking-tighter">₹1,200</h4>
                    <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                      <TrendingUp size={14} className="mr-2" />
                      Based on zone heat
                    </div>
                  </div>
                  <div className="p-8 bg-gray-50 text-gray-900 rounded-[2.5rem] hover:scale-105 transition-all duration-500 shadow-sm border border-gray-100/50">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Active Coverage</p>
                    <h4 className="text-5xl font-black tracking-tighter">Gold</h4>
                    <div className="mt-8 flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <ShieldCheck size={14} className="mr-2" />
                      Full Protection
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="section-padding py-20 md:py-40 reveal active">
        <div className="max-w-7xl mx-auto text-center lg:text-left grid lg:grid-cols-3 gap-20 items-center">
          <div className="lg:col-span-1 space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-6">Trusted by thousands of delivery heroes.</h2>
            <p className="text-gray-400 font-bold text-lg md:text-xl leading-relaxed">Join the next generation of gig economy security.</p>
            <button className="px-10 py-5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-4 mx-auto lg:mx-0 group hover:scale-105 transition-all duration-500 active:scale-95">
              <Play className="fill-current text-blue-600 transition-colors" size={20} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">Watch our story</span>
            </button>
          </div>

          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
            {[
              { q: "EarnLock saved my weekly earnings during the Delhi heatwave. Payout was instant.", user: "Rajesh S.", role: "Zomato Partner" },
              { q: "Finally, an insurance company that understands our daily struggles with traffic.", user: "Priya K.", role: "Zepto Delivery" },
            ].map((t, i) => (
              <div key={i} className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105">
                <div className="flex gap-1 mb-6">
                  {[1, 2, 3, 4, 5].map(s => <Zap key={s} size={14} className="text-yellow-400 fill-current" />)}
                </div>
                <p className="text-lg font-black tracking-tight leading-relaxed mb-8 italic">"{t.q}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black">{t.user[0]}</div>
                  <div>
                    <p className="font-black text-sm">{t.user}</p>
                    <p className="text-xs font-bold text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="section-padding py-24 md:py-40 reveal active">
        <div className="max-w-6xl mx-auto bg-black rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 lg:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-600/20 blur-[150px] rounded-full group-hover:w-[90%] transition-all duration-1000" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter max-w-[12ch] mx-auto leading-none">Ready to earn without worry?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="w-full sm:w-auto px-12 py-7 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all duration-500 hover:scale-110"
              >
                Register Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-12 py-7 bg-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Predictor Widget */}
      <div className="fixed bottom-10 right-10 z-[100] group">
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 relative"
        >
          <Zap className="fill-current text-blue-400" size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </button>
      </div>

      {isAssistantOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-xl section-padding">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in duration-500 relative">
            <button
              onClick={resetPredictor}
              className="absolute top-8 right-8 p-3 text-gray-400 hover:bg-gray-50 rounded-2xl transition-all"
            >
              <X size={24} />
            </button>

            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Zap size={32} />
                </div>
                <h3 className="text-3xl font-black tracking-tighter">AI Risk Predictor</h3>
                <p className="text-gray-400 font-bold tracking-tight italic">Simulate conditions to see your potential protection payouts.</p>
              </div>

              {currentStep < steps.length ? (
                <div className="space-y-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Step {currentStep + 1} of 3</p>
                  <h4 className="text-xl font-black">{steps[currentStep].question}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {steps[currentStep].options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelections({ ...selections, [steps[currentStep].key]: opt });
                          setCurrentStep(currentStep + 1);
                        }}
                        className="p-6 text-left border-2 border-gray-50 rounded-3xl bg-gray-50/50 hover:bg-black hover:text-white hover:border-black transition-all duration-300 font-black text-sm tracking-tight"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                  <div className="bg-black p-10 rounded-[2.5rem] text-white space-y-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Simulated Result</p>
                      <h4 className="text-4xl font-black tracking-tighter">
                        {calculateRisk()} Risk Detected
                      </h4>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <p className="text-sm font-bold text-gray-400">Estimated Income Protection:</p>
                      <p className="text-3xl font-black text-emerald-400 mt-2">
                        {calculateRisk() === "High" ? "₹300 – ₹600" : calculateRisk() === "Medium" ? "₹100 – ₹250" : "No Gap"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Link
                      to="/register"
                      className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-center shadow-xl hover:bg-blue-700 transition-all hover:scale-105"
                    >
                      Activate Now
                    </Link>
                    <button
                      onClick={resetPredictor}
                      className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-black transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 section-padding py-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-1 space-y-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white fill-current" />
              </div>
              <span className="font-black text-xl tracking-tighter">EarnLock</span>
            </Link>
            <p className="text-sm font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
              Empowering the gig economy with smart, data-driven security.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-12">
            {[
              { t: "Platform", l: ["Features", "Predictor", "Pricing"] },
              { t: "Company", l: ["About Us", "Privacy", "Terms", "Admin Portal"] },
              { t: "Social", l: ["Twitter", "Instagram", "LinkedIn"] },
            ].map(col => (
              <div key={col.t} className="space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-900">{col.t}</h4>
                <ul className="space-y-4">
                  {col.l.map(link => (
                    <li key={link}>
                      {link === "Admin Portal" ? (
                        <Link to="/admin/login" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">{link}</Link>
                      ) : (
                        <a href="#" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">{link}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-32 flex flex-col sm:flex-row items-center justify-between gap-8">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">&copy; 2024 EarnLock. Built for the future of work.</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] cursor-pointer hover:text-black">Privacy</span>
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] cursor-pointer hover:text-black">Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
