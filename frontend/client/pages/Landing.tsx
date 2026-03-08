import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { CheckCircle2, Cloud, TrendingUp, AlertTriangle, Shield, Zap, X, MessageSquare, ArrowRight, Play, LayoutGrid, Award, ShieldCheck, MapPin, Activity, Smartphone, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "@/context/UserAuthContext";
import { cn } from "@/lib/utils";

// Partner Logos
import AmazonLogo from "@/assets/Amazon/Amazon_Logo_0.svg";
import ZomatoLogo from "@/assets/Zomato/Zomato_Logo_0.svg";
import FlipkartLogo from "@/assets/Flipkart/Flipkart_Logo_0.svg";
import ZeptoLogo from "@/assets/Zepto/Zepto_idm2wBp3DO_1.svg";
import BlinkitLogo from "@/assets/Blinkit/Blinkit_idCmcpCDCZ_0.svg";
import SwiggyLogo from "@/assets/Swiggy/Swiggy_id8bItcgXR_0.svg";

export default function Landing() {
  const navigate = useNavigate();
  const { login } = useUserAuth();
  const [isOverDark, setIsOverDark] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + window.innerHeight - 100; // Point where widget sits
      const darkSections = document.querySelectorAll('#how-it-works, #cta-final, footer');
      
      let overDark = false;
      darkSections.forEach(section => {
        const rect = (section as HTMLElement).getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;
        const absoluteBottom = absoluteTop + (section as HTMLElement).offsetHeight;
        
        if (scrollY >= absoluteTop && scrollY <= absoluteBottom) {
          overDark = true;
        }
      });
      setIsOverDark(overDark);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
                className="w-full sm:w-auto px-6 py-4 md:px-10 md:py-6 bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all duration-500 hover:scale-[1.05] active:scale-95 flex items-center justify-center space-x-3"
              >
                <span>Start Protection</span>
                <Zap size={18} className="fill-current text-white" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-4 md:px-10 md:py-6 bg-white border border-gray-100 text-gray-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-50 transition-all shadow-xl active:scale-95 flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="section-padding py-20 bg-white border-b border-gray-50 reveal active">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-12">Proudly partnering with top platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-20 w-full">
            {[
              { id: "amazon", name: "Amazon", logo: AmazonLogo },
              { id: "zomato", name: "Zomato", logo: ZomatoLogo },
              { id: "flipkart", name: "Flipkart", logo: FlipkartLogo },
              { id: "zepto", name: "Zepto", logo: ZeptoLogo },
              { id: "blinkit", name: "Blinkit", logo: BlinkitLogo },
              { id: "swiggy", name: "Swiggy", logo: SwiggyLogo }
            ].map(p => (
              <div 
                key={p.name} 
                className="group cursor-pointer"
                onClick={() => {
                  login(p.id, "Demo Worker");
                  navigate("/dashboard");
                }}
              >
                <img src={p.logo} alt={p.name} className="h-12 md:h-16 object-contain group-hover:scale-110 transition-all duration-500" />
              </div>
            ))}
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
                  <div key={i} className="flex gap-4 sm:gap-8 group cursor-pointer">
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-[2rem] md:rounded-[3rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500 shrink-0">
                      <Icon size={32} className="md:size-[48px] text-black" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-black tracking-tight">{f.title}</h3>
                      <p className="text-xs md:text-gray-500 font-bold mt-2 max-w-sm leading-relaxed">{f.desc}</p>
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

      {/* Expanded Features Section */}
      <section id="features" className="section-padding py-20 md:py-40 bg-white reveal active border-t border-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-6">
            <h2 className="text-4xl md:text-7xl font-black tracking-tighter">Everything you need <br /><span className="text-blue-600">to earn securely.</span></h2>
            <p className="text-gray-400 font-bold max-w-2xl mx-auto text-lg md:text-xl">Our intelligent platform handles the risk while you focus on the road.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Real-time Tracking", desc: "Live API integrations with your delivery apps to monitor active dashes and earnings.", color: "bg-orange-50 text-orange-600", route: "/features/tracking" },
              { icon: Cloud, title: "Micro-Weather AI", desc: "Hyper-local weather tracking to predict conditions down to your specific delivery zone.", color: "bg-blue-50 text-blue-600", route: "/features/weather-ai" },
              { icon: AlertTriangle, title: "Traffic Disruption", desc: "Proactive alerts for roadblocks and traffic surges, ensuring you're compensated for delays.", color: "bg-red-50 text-red-600", route: "/features/traffic" },
              { icon: Wallet, title: "Zero-Click Claims", desc: "The system automatically detects qualifying events and initiates payouts—no forms required.", color: "bg-emerald-50 text-emerald-600", route: "/features/claims" },
              { icon: Shield, title: "Fraud Protection", desc: "Advanced forensic image analysis and location verification to keep the platform secure.", color: "bg-purple-50 text-purple-600", route: "/features/fraud" },
              { icon: Smartphone, title: "Mobile Optimized", desc: "A buttery-smooth mobile interface designed to be used safely while on the move.", color: "bg-gray-100 text-gray-900", route: "/features/mobile" }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <Link to={f.route} key={i} className="bg-gray-50/50 border border-gray-50 rounded-[2.5rem] p-10 hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-500 group transform hover:-translate-y-2">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500", f.color)}>
                    <Icon size={24} className="group-hover:animate-pulse" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight mb-4 group-hover:text-blue-600 transition-colors uppercase italic leading-none">{f.title}</h3>
                  <p className="text-sm font-bold text-gray-400 leading-relaxed italic">"{f.desc}"</p>
                </Link>
              )
            })}
          </div>

          <div className="mt-20 text-center">
            <Link 
              to="/register"
              className="inline-flex items-center space-x-4 px-10 py-6 bg-black text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all duration-500 hover:scale-[1.05] active:scale-95"
            >
              <span>Explore All Features</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="section-padding py-20 md:py-40 bg-black text-white reveal active overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-emerald-900/20 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-20 items-center">

            <div className="lg:w-1/3 space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-10 shadow-2xl">
                <LayoutGrid size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">How it <br /><span className="text-emerald-400">Works.</span></h2>
              <p className="text-gray-400 font-bold text-lg leading-relaxed">Three simple steps to absolute peace of mind during your shifts.</p>
              <Link 
                to="/register"
                className="inline-block px-8 py-5 mt-4 bg-white/5 border border-white/10 hover:bg-white hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 text-center"
              >
                Get Started
              </Link>
            </div>

            <div className="lg:w-2/3 grid sm:grid-cols-3 gap-8 relative">
              {/* Connecting line for desktop */}
              <div className="hidden sm:block absolute top-[4.5rem] left-10 right-10 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/20 to-emerald-500/0 z-0" />

              {[
                { step: "01", title: "Connect", desc: "Link your delivery accounts with one secure click to sync data.", icon: ShieldCheck, color: "text-blue-400" },
                { step: "02", title: "Drive", desc: "Our AI silently monitors weather and traffic in the background.", icon: Zap, color: "text-yellow-400" },
                { step: "03", title: "Earn", desc: "Instant payouts triggered automatically if conditions breach limits.", icon: Wallet, color: "text-emerald-400" }
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="relative z-10 bg-[#111] p-8 lg:p-10 rounded-[2.5rem] border border-white/5 hover:bg-[#151515] hover:border-white/10 transition-all duration-500 group transform hover:-translate-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-8 group-hover:text-white transition-colors">Step {s.step}</p>
                    <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-8 border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                      <Icon size={32} className={cn("transition-colors", s.color)} />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight mb-4 text-gray-100 group-hover:text-white transition-colors">{s.title}</h3>
                    <p className="text-xs font-bold text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">{s.desc}</p>
                  </div>
                )
              })}
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
      <section id="cta-final" className="section-padding py-24 md:py-40 reveal active">
        <div className="max-w-6xl mx-auto bg-black rounded-[2.5rem] md:rounded-[4rem] p-10 md:p-20 lg:p-32 text-center text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-blue-600/20 blur-[150px] rounded-full group-hover:w-[90%] transition-all duration-1000" />
          <div className="relative z-10 space-y-12">
            <h2 className="text-4xl md:text-8xl font-black tracking-tighter max-w-[12ch] mx-auto leading-none">Ready to earn without worry?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-4 md:px-12 md:py-7 bg-white text-black rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all duration-500 hover:scale-110"
              >
                Register Account
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-4 md:px-12 md:py-7 bg-white/10 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/20 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Predictor Widget Link */}
      <div className="fixed bottom-10 right-10 z-[100] group">
        <Link
          to="/risk-predictor"
          className={cn(
            "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500 relative ring-1",
            isOverDark 
              ? "bg-white text-black ring-white/10" 
              : "bg-black text-white ring-black/10"
          )}
        >
          <Zap className={cn("fill-current transition-colors", isOverDark ? "text-blue-600" : "text-blue-400")} size={24} />
          <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        </Link>
      </div>


      {/* Footer */}
      <footer className="bg-black border-t border-white/5 section-padding py-32 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-1 space-y-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Zap size={16} className="text-white fill-current" />
              </div>
              <span className="font-black text-xl tracking-tighter">EarnLock</span>
            </Link>
            <p className="text-sm font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
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
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">{col.t}</h4>
                <ul className="space-y-4">
                  {col.l.map(link => (
                    <li key={link}>
                      {link === "Admin Portal" ? (
                        <Link to="/admin/login" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">{link}</Link>
                      ) : link === "Predictor" ? (
                        <Link to="/risk-predictor" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">{link}</Link>
                      ) : (
                        <a href="#" className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">{link}</a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-32 flex flex-col sm:flex-row items-center justify-between gap-8 border-t border-white/5 mt-10">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">&copy; 2024 EarnLock. Built for the future of work.</p>
          <div className="flex gap-8">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">Privacy</span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] cursor-pointer hover:text-white transition-colors">Cookies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
