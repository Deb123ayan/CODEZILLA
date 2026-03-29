import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Shield, Zap, Star, LayoutDashboard, Loader2, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useUserAuth } from "@/context/UserAuthContext";
import Navbar from "@/components/Navbar";
import DashboardFooter from "@/components/DashboardFooter";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function BuyPlan() {
  const [billingCycle, setBillingCycle] = useState<"weekly" | "monthly">("weekly");
  const [loading, setLoading] = useState(false);
  const { phoneNumber: workerPhone } = useUserAuth();
  const navigate = useNavigate();

  const handleSelectPlan = async (planId: string) => {
    if (!workerPhone) {
      toast.error("User session mismatch. Please login again.");
      return;
    }

    setLoading(true);
    const promise = api.post<any>("/auth/finalize/", {
      phone: workerPhone,
      plan_type: planId.toUpperCase(),
      payment_method: "MOCK_GATEWAY"
    });

    toast.promise(promise, {
      loading: "Activating protection plan...",
      success: (data) => {
        setLoading(false);
        navigate("/dashboard");
        return `Shield Activated! Weekly Premium: ₹${data.weekly_premium}`;
      },
      error: (err) => {
        setLoading(false);
        return err.message || "Failed to start coverage";
      }
    });
  };

  const plans = [
    {
      name: "Starter",
      id: "BASIC",
      price: billingCycle === "weekly" ? "₹59" : "₹199",
      period: billingCycle === "weekly" ? "/week" : "/month",
      desc: "Essential protection for part-time earners.",
      features: [
        "Weather Lock Protection",
        "Flash Payouts up to ₹5,000"
      ]
    },
    {
      name: "Premium",
      id: "PRO",
      popular: true,
      price: billingCycle === "weekly" ? "₹89" : "₹399",
      period: billingCycle === "weekly" ? "/week" : "/month",
      desc: "Full coverage for full-time professionals.",
      features: [
        "Everything in Starter",
        "Zone Guard Coverage",
        "Flash Payouts up to ₹10,000",
        "24/7 Priority Support"
      ]
    },
    {
      name: "Elite",
      id: "PREMIUM_PLUS",
      price: billingCycle === "weekly" ? "₹119" : "₹599",
      period: billingCycle === "weekly" ? "/week" : "/month",
      desc: "Maximum stability for the top-tier workers.",
      features: [
        "Everything in Premium",
        "Flash Payouts up to ₹20,000",
        "Comprehensive Legal Shield",
        "Multi-platform Cloud Support"
      ]
    }
  ];

  return (
    <div className="bg-[#fcf9f8] min-h-screen text-[#1b1c1b] font-manrope selection:bg-[#004191]/10">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#ffffff]/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center space-y-6">
          <Loader2 className="w-16 h-16 text-[#0058be] animate-spin" />
          <h2 className="text-xl font-extrabold uppercase tracking-[0.3em] text-[#424753] italic font-inter">Deploying Smart Policy...</h2>
        </div>
      )}

      {/* Top Navigation Shell */}
      <Navbar />

      <main className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Editorial Section */}
        <section className="text-center mb-16 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter text-[#1b1c1b] mb-6 leading-tight">
            Choose Your <span className="text-[#004191] italic">Protection</span> Level
          </h1>
          <p className="text-lg md:text-xl text-[#424753] leading-relaxed">
            Secure your income with a plan that fits your work style. High-fidelity coverage for the modern independent professional.
          </p>

          {/* Billing Toggle */}
          <div className="mt-12 inline-flex items-center p-1 bg-[#f6f3f2] rounded-full">
            <button
               onClick={() => setBillingCycle("weekly")}
               className={cn(
                  "px-8 py-2.5 rounded-full text-sm font-inter font-semibold transition-all duration-300",
                  billingCycle === "weekly" ? "bg-[#ffffff] text-[#004191] shadow-sm" : "text-[#424753] hover:text-[#1b1c1b]"
               )}
            >
              Weekly
            </button>
            <button
               onClick={() => setBillingCycle("monthly")}
               className={cn(
                  "px-8 py-2.5 rounded-full text-sm font-inter font-semibold transition-all duration-300",
                  billingCycle === "monthly" ? "bg-[#ffffff] text-[#004191] shadow-sm" : "text-[#424753] hover:text-[#1b1c1b]"
               )}
            >
              Monthly
            </button>
          </div>
        </section>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {plans.map((plan, i) => (
             <div
               key={plan.id}
               className={cn(
                  "group relative rounded-[3rem] p-10 transition-all duration-500",
                  plan.popular 
                     ? "bg-[#ffffff] shadow-[0_40px_80px_-20px_rgba(0,88,190,0.12)] border border-[#0058be]/5 lg:scale-105 z-10" 
                     : "bg-[#f6f3f2] border border-transparent hover:border-[#c2c6d5]/20 hover:bg-[#ffffff] hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)]"
               )}
             >
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#004191] text-[#ffffff] px-6 py-1.5 rounded-full text-xs font-inter font-bold uppercase tracking-widest shadow-xl">
                    Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={cn("text-2xl font-bold mb-2", plan.popular ? "text-[#004191]" : "")}>{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-extrabold tracking-tight">{plan.price}</span>
                    <span className="text-[#424753] font-inter text-sm uppercase tracking-widest">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-6 mb-10 min-h-[220px]">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-[#1b1c1b]">
                       <CheckCircle2 size={20} className={plan.popular ? "text-[#004191]" : "text-[#004191]"} fill={plan.popular ? "currentColor" : "none"} />
                       <span className={cn("text-sm", plan.popular ? "font-semibold" : "font-medium text-[#424753]")}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                   onClick={() => handleSelectPlan(plan.id)}
                   className={cn(
                      "w-full py-4 px-6 rounded-full font-bold active:scale-95 transition-all duration-300",
                      plan.popular 
                         ? "bg-gradient-to-br from-[#004191] to-[#0058be] text-[#ffffff] shadow-lg hover:shadow-2xl hover:-translate-y-1" 
                         : "bg-[#eae7e7] text-[#1b1c1b] hover:bg-[#004191] hover:text-[#ffffff]"
                   )}
                >
                   Choose Plan
                </button>
             </div>
          ))}
        </div>

        {/* Enterprise CTA Section */}
        <section className="mt-24 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="bg-[#f6f3f2] rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center relative group transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] border border-transparent hover:border-[#c2c6d5]/20 hover:bg-[#ffffff]">
            <div className="w-full md:w-3/5 p-12 md:p-20 text-left">
              <div className="text-[#004191] font-inter text-xs font-bold uppercase tracking-widest mb-4">
                 For Organizations
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-tight">
                 Managing a fleet of 50+?
              </h2>
              <p className="text-[#424753] text-lg mb-10 leading-relaxed max-w-xl">
                 Customized coverage, centralized billing, and dedicated account managers for enterprise-level operations. Scale your protection as you scale your business.
              </p>
              <button className="inline-flex items-center gap-4 px-10 py-5 bg-[#1b1c1b] text-[#fcf9f8] rounded-full font-bold transition-all duration-300 hover:opacity-90 active:scale-95 hover:bg-[#004191]">
                  Talk to Sales
                  <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shell */}
      <DashboardFooter className="mt-20 mx-0 rounded-none bg-[#fcf9f8] backdrop-blur-none" />
    </div>
  );
}
