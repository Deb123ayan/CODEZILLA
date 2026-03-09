import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Check, Shield, Zap, ArrowRight, ShieldCheck, Heart, Star, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function BuyPlan() {
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">("weekly");

  const plans = [
    {
      name: "Starter",
      id: "starter",
      price: billingCycle === "weekly" ? "₹35" : "₹120",
      period: billingCycle === "weekly" ? "/week" : "/month",
      desc: "Essential protection for part-time earners.",
      icon: Shield,
      color: "border-gray-100",
      features: [
        "Real-time tracking",
        "Micro-weather detection",
        "Zero-click claims (Upto ₹500)",
        "Standard support"
      ]
    },
    {
      name: "Premium",
      id: "premium",
      price: billingCycle === "weekly" ? "₹85" : "₹290",
      period: billingCycle === "weekly" ? "/week" : "/month",
      desc: "Full coverage for full-time professionals.",
      icon: Zap,
      popular: true,
      color: "border-blue-600 shadow-2xl scale-105 bg-white relative z-10",
      features: [
        "Everything in Starter",
        "Traffic disruption protection",
        "Higher claim limits (Upto ₹2000)",
        "Priority 24/7 support",
        "Advanced fraud security"
      ]
    },
    {
      name: "Elite",
      id: "elite",
      price: billingCycle === "weekly" ? "₹150" : "₹500",
      period: billingCycle === "weekly" ? "/week" : "/month",
      desc: "Maximum stability for the top-tier workers.",
      icon: Star,
      color: "border-gray-100",
      features: [
        "Everything in Premium",
        "Multi-platform protection",
        "Unlimited claim volume",
        "Dedicated account manager",
        "Early access to insurance"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      <main className="section-padding pt-40 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-24 reveal active">
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl mb-8 border border-blue-100/50">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Step 3 of 3: Protection Plan</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 italic leading-none">
            Secure your <br /><span className="text-blue-600 not-italic">Daily Wage.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-gray-400 leading-relaxed tracking-tight italic">
            Select a plan that fits your work schedule. Cancel or upgrade anytime from your dashboard.
          </p>

          {/* Billing Switch */}
          <div className="mt-12 flex items-center justify-center space-x-4">
            <span className={cn("text-xs font-black uppercase transition-colors", billingCycle === "weekly" ? "text-gray-900" : "text-gray-400")}>Weekly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "weekly" ? "monthly" : "weekly")}
              className="w-16 h-8 bg-gray-200 rounded-full p-1 transition-all relative"
            >
              <div className={cn("w-6 h-6 bg-white rounded-full shadow-md transition-all", billingCycle === "monthly" ? "ml-8 bg-blue-600" : "ml-0")} />
            </button>
            <span className={cn("text-xs font-black uppercase transition-colors", billingCycle === "monthly" ? "text-gray-900" : "text-gray-400")}>Monthly</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch reveal active" style={{ transitionDelay: "200ms" }}>
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={cn(
                "group flex flex-col p-10 rounded-[3rem] border transition-all duration-700 hover:translate-y-[-10px]",
                plan.color
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <plan.icon size={32} className={plan.popular ? "text-blue-600" : "text-gray-400"} />
                </div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                  <span className="text-sm font-bold text-gray-400">{plan.period}</span>
                </div>
                <p className="text-sm font-bold text-gray-400 mt-4 leading-relaxed">{plan.desc}</p>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tight text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/dashboard"
                className={cn(
                  "w-full h-16 rounded-2xl flex items-center justify-center font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95",
                  plan.popular ? "bg-black text-white hover:bg-blue-700 shadow-xl" : "bg-gray-50 text-gray-900 border border-gray-100 hover:bg-black hover:text-white"
                )}
              >
                Choose {plan.name} Plan
              </Link>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="mt-24 p-12 bg-white border border-gray-100 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-10 reveal active">
          <div className="flex items-center gap-8">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center shrink-0">
              <Heart size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black italic tracking-tight">Need a customized enterprise plan?</h3>
              <p className="text-gray-400 font-bold text-sm tracking-tight italic">Protect your entire delivery fleet with custom volume pricing.</p>
            </div>
          </div>
          <button className="px-10 py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl">
            Talk to Sales
          </button>
        </div>
      </main>
    </div>
  );
}
