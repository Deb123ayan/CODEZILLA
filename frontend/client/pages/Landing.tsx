import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  ShieldCheck, Shield, CloudRainWind, MapPin, Zap, UserCheck, HeartHandshake, CheckCircle 
} from "lucide-react";

// Partner Logos
import AmazonLogo from "@/assets/Amazon/Amazon_Logo_0.svg";
import ZomatoLogo from "@/assets/Zomato/Zomato_Logo_0.svg";
import FlipkartLogo from "@/assets/Flipkart/Flipkart_Logo_0.svg";
import ZeptoLogo from "@/assets/Zepto/Zepto_idm2wBp3DO_1.svg";
import BlinkitLogo from "@/assets/Blinkit/Blinkit_idCmcpCDCZ_0.svg";
import SwiggyLogo from "@/assets/Swiggy/Swiggy_id8bItcgXR_0.svg";

export default function Landing() {
  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a] font-manrope antialiased min-h-screen">
      <Navbar />

      <main className="pt-24 pb-8">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-16 overflow-hidden mt-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            {/* <div className="mb-8 inline-flex items-center gap-2 px-5 py-2 bg-[#f0f4ff] rounded-full border border-[#004191]/10">
              <ShieldCheck className="text-[#004191]" size={16} />
              <span className="text-[11px] font-inter font-bold tracking-[0.2em] uppercase text-[#004191]">Digital Shield v2.0 (India)</span>
            </div> */}
            
            <h1 className="text-5xl md:text-[5rem] leading-[1.1] font-extrabold tracking-tighter text-[#1b1c1b] mb-6">
              Protect your <span className="text-[#004191]">Income</span>
            </h1>
            
            <p className="text-lg md:text-xl leading-relaxed text-[#434751] max-w-2xl mx-auto mb-10 font-medium font-inter">
              A digital sanctuary for gig economy heroes. We safeguard your earnings against volatility, extreme weather, and sudden market shifts across India.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 justify-center w-full sm:w-auto">
              <Link 
                to="/register"
                className="px-10 py-5 bg-[#004191] text-[#ffffff] rounded-full text-[11px] font-inter uppercase tracking-[0.15em] font-bold shadow-[0_12px_24px_-8px_rgba(0,65,145,0.4)] hover:bg-[#003171] transition-all active:scale-[0.98] text-center"
              >
                Start Protection
              </Link>
              <Link 
                to="/login"
                className="px-10 py-5 bg-[#ffffff] text-[#1b1c1b] border border-[#e4e2e0] rounded-full text-[11px] font-inter uppercase tracking-[0.15em] font-bold hover:bg-[#f5f3f1] transition-all text-center"
              >
                Sign in
              </Link>
            </div>
          </div>
          
          <div className="max-w-5xl mx-auto mt-16 relative">
            <div className="rounded-[3rem] overflow-hidden aspect-video md:aspect-[21/9] bg-[#e4e2e0] shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)]">
              <img 
                alt="Gig economy worker" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQIDeZmKgAR8CMyP3qzZstIMkL1eWCYwFZNAXsSErjtNldkFW4xTEgVgQUsRhAgrLPWfMNX7IlgJ4EPLf09aVK04HL-W0Eo8mIkLEW6O8BBmNqt3uwwNrWOTt_ZNjxbqUs7EscIAlOKj2_8MFW0UrXLa5e8ZGXyU_JOKdaVn-xl-sPhrPTxwePwv8hYX8GOK9ru7W7Wr1VJ4R7tlUp4NoYfFH4MiopGUW43dU2ggL-GZfkHKe5iotUj9AT9e3mCABaSi15YZ4i5iY"
              />
            </div>
            {/* Abstract Protection Symbol Overlays */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#ffffff]/90 backdrop-blur-md rounded-[2rem] shadow-xl flex items-center justify-center hidden md:flex border border-[#e4e2e0]">
              <Shield className="text-[#004191]" size={48} />
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-12 bg-[#ffffff] border-y border-[#e4e2e0]/50 mb-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-[10px] font-inter font-bold tracking-[0.2em] text-[#a8aebf] mb-8 uppercase">Compatible with major Indian platforms</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 grayscale opacity-70 contrast-125">
               <img src={AmazonLogo} alt="Amazon" className="h-8 md:h-12 object-contain" />
               <img src={ZomatoLogo} alt="Zomato" className="h-8 md:h-12 object-contain" />
               <img src={FlipkartLogo} alt="Flipkart" className="h-8 md:h-12 object-contain" />
               <img src={ZeptoLogo} alt="Zepto" className="h-8 md:h-12 object-contain" />
               <img src={BlinkitLogo} alt="Blinkit" className="h-8 md:h-12 object-contain" />
               <img src={SwiggyLogo} alt="Swiggy" className="h-8 md:h-12 object-contain" />
            </div>
          </div>
        </section>

        {/* Features (Elite Coverage) */}
        <section className="px-6 mb-24 max-w-7xl mx-auto">
          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b] mb-3">Premium Indian Coverage</h2>
            <div className="h-1.5 w-16 bg-[#004191] rounded-full mx-auto md:mx-0"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-[#ffffff] p-10 rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] group hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#f0f4ff] flex items-center justify-center mb-8 group-hover:bg-[#004191] transition-colors">
                <CloudRainWind size={32} className="text-[#004191] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-extrabold mb-4 text-[#1b1c1b] tracking-tight">Monsoon & Heat Lock</h3>
              <p className="text-[#434751] font-medium leading-relaxed font-inter text-sm">
                Automatic compensation for extreme Indian weather conditions. Your earnings stay safe even when you can't ride.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-[#ffffff] p-10 rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] group hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#fffbeb] flex items-center justify-center mb-8 group-hover:bg-[#d97706] transition-colors">
                <MapPin size={32} className="text-[#d97706] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-extrabold mb-4 text-[#1b1c1b] tracking-tight">Zone Guard</h3>
              <p className="text-[#434751] font-medium leading-relaxed font-inter text-sm">
                Income stabilization when working in low-demand tier-2 zones. We bridge the gap when daily orders slow down.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-[#ffffff] p-10 rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] group hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 rounded-[1.5rem] bg-[#fcf9f8] flex items-center justify-center mb-8 group-hover:bg-[#1b1c1b] transition-colors border border-[#e4e2e0]/80">
                <Zap size={32} className="text-[#1b1c1b] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-extrabold mb-4 text-[#1b1c1b] tracking-tight">UPI Flash Payouts</h3>
              <p className="text-[#434751] font-medium leading-relaxed font-inter text-sm">
                Direct to your UPI VPA in under 60 seconds. No waiting days for the money you've already earned.
              </p>
            </div>
          </div>
        </section>

        {/* Plans Section */}
        <section id="plans" className="px-6 mb-24 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12 text-center">
              <p className="text-[10px] font-inter font-bold tracking-[0.2em] text-[#004191] uppercase mb-3">Income Protection Plans</p>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#1b1c1b] mb-4">Simple, transparent pricing</h2>
              <p className="text-[#434751] font-medium font-inter text-lg max-w-xl mx-auto">Weekly plans designed for Indian gig workers. Cancel anytime.</p>
              <div className="h-1.5 w-16 bg-[#004191] rounded-full mx-auto mt-6"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-stretch">
              {/* Basic */}
              <div className="bg-[#f5f3f1] rounded-[3rem] p-10 flex flex-col border border-[#e4e2e0] hover:-translate-y-2 transition-all duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.12)]">
                <div className="mb-8">
                  <h3 className="text-2xl font-extrabold text-[#1b1c1b] mb-1">Basic Plan</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold tracking-tighter text-[#1b1c1b]">₹1,200</span>
                    <span className="font-medium ml-1 text-[#a8aebf]">/week</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 mb-8">
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] mb-1 text-[#a8aebf]">Max Coverage</p>
                  <p className="text-2xl font-extrabold text-[#004191]">₹45,000 / disruption</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {["Weather Protection", "Traffic Delay Coverage", "Instant Payouts"].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-[#16a34a] flex-shrink-0" />
                      <span className="text-sm font-medium text-[#434751]">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="w-full py-5 text-center bg-[#1b1c1b] text-white rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-[#434751] transition-all active:scale-[0.98] shadow-lg">
                  Get Started
                </Link>
              </div>

              {/* Pro — Featured */}
              <div className="bg-gradient-to-br from-[#004191] to-[#0058be] rounded-[3rem] p-10 flex flex-col border border-transparent hover:-translate-y-2 transition-all duration-300 shadow-[0_24px_48px_-12px_rgba(0,65,145,0.4)] hover:shadow-[0_40px_80px_-20px_rgba(0,65,145,0.5)] relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ba1a1a] text-white px-4 py-1.5 rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.15em] shadow-lg">
                  Most Popular
                </div>
                <div className="mb-8">
                  <h3 className="text-2xl font-extrabold text-white mb-1">Pro Plan</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold tracking-tighter text-white">₹2,000</span>
                    <span className="font-medium ml-1 text-white/60">/week</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-8">
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] mb-1 text-white/60">Max Coverage</p>
                  <p className="text-2xl font-extrabold text-white">₹1,00,000 / disruption</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {["Everything in Basic", "Accident Coverage", "Vehicle Breakdown Aid", "Priority Claims"].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-[#bbf7d0] flex-shrink-0" />
                      <span className="text-sm font-medium text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="w-full py-5 text-center bg-white text-[#1b1c1b] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-[#f5f3f1] transition-all active:scale-[0.98] shadow-xl">
                  Activate Shield
                </Link>
              </div>

              {/* Premium Plus */}
              <div className="bg-[#1b1c1b] rounded-[3rem] p-10 flex flex-col border border-transparent hover:-translate-y-2 transition-all duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.3)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.5)]">
                <div className="mb-8">
                  <h3 className="text-2xl font-extrabold text-white mb-1">Premium Plus</h3>
                  <div className="flex items-baseline">
                    <span className="text-5xl font-extrabold tracking-tighter text-white">₹3,500</span>
                    <span className="font-medium ml-1 text-white/60">/week</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 mb-8">
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] mb-1 text-white/60">Max Coverage</p>
                  <p className="text-2xl font-extrabold text-white">₹2,00,000 / disruption</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {["Everything in Pro", "Health Insurance Add-on", "Family Coverage", "Legal Assistance"].map(f => (
                    <li key={f} className="flex items-center gap-3">
                      <CheckCircle size={20} className="text-[#bbf7d0] flex-shrink-0" />
                      <span className="text-sm font-medium text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="w-full py-5 text-center bg-white text-[#1b1c1b] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-[#f5f3f1] transition-all active:scale-[0.98] shadow-xl">
                  Get Full Coverage
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section (Bento Inspired) */}
        <section className="px-6 mb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#004191] text-[#ffffff] p-12 md:p-16 rounded-[3.5rem] flex flex-col justify-between shadow-[0_24px_48px_-12px_rgba(0,65,145,0.4)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ffffff] rounded-full -mr-32 -mt-32 blur-[150px] opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[10px] font-inter font-bold tracking-[0.2em] uppercase text-[#a8aebf]">Simulated Payouts</span>
                <h2 className="text-5xl md:text-7xl font-extrabold mt-4 tracking-tighter">₹15,000+</h2>
              </div>
              <p className="text-[15px] font-medium text-blue-100 max-w-sm mt-12 leading-relaxed">Early-stage pilot program tests for delivery partners in our initial beta launch.</p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="bg-[#ffffff] border border-[#e4e2e0]/50 p-10 rounded-[3rem] flex items-center gap-8 h-full shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)]">
                <div className="bg-[#f5f3f1] p-5 rounded-[1.5rem] border border-[#e4e2e0]">
                  <Shield size={36} className="text-[#1b1c1b]" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-[#1b1c1b] tracking-tight">Cloud Security Framework</h4>
                  <p className="text-[#434751] font-medium font-inter text-sm mt-2">Built with industry-standard encryption for user data.</p>
                </div>
              </div>
              
              <div className="bg-[#1b1c1b] text-white p-10 rounded-[3rem] flex items-center gap-8 h-full shadow-[0_24px_48px_-12px_rgba(27,28,27,0.4)]">
                <div className="bg-[#434751]/30 p-5 rounded-[1.5rem] border border-[#a8aebf]/20">
                  <UserCheck size={36} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white tracking-tight">Algorithmic Assessment</h4>
                  <p className="text-[#a8aebf] font-medium font-inter text-sm mt-2">Smart contract logic ready for future insurance underwriting.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Splash */}
        <section className="px-6">
          <div className="max-w-7xl mx-auto bg-[#ffffff] rounded-[3.5rem] p-12 md:p-24 text-center shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] overflow-hidden relative border border-[#e4e2e0]">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl leading-tight font-extrabold tracking-tighter mb-6 text-[#1b1c1b]">Ready to secure your bag?</h2>
              <p className="text-lg text-[#434751] mb-12 max-w-xl mx-auto font-medium font-inter">Join our early pilot program and help us build a more secure future for gig workers through algorithmic income protection.</p>
              
              <Link to="/register" className="inline-block px-12 py-5 bg-[#004191] text-[#ffffff] rounded-full text-[11px] font-inter uppercase tracking-[0.15em] font-bold shadow-[0_12px_24px_-8px_rgba(0,65,145,0.4)] hover:scale-105 active:scale-95 transition-all">
                Activate My Shield
              </Link>
            </div>
            
            {/* Background decoration */}
            {/* <div className="absolute top-0 right-0 w-80 h-80 bg-[#f0f4ff] rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#fffbeb] rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl pointer-events-none"></div> */}
          </div>
        </section>
      </main>

      {/* Footer */}
      <DashboardFooter className="mt-8 mx-0 rounded-none bg-[#fcf9f8] backdrop-blur-none" />
    </div>
  );
}
