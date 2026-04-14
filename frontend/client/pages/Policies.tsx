import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Shield, Plus, CheckCircle, Calendar, ArrowRight, Loader2,
  ArrowUpRight, Zap, Star
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

const availablePlans = [
  {
    name: "Standard Plan",
    price: "₹59",
    period: "week",
    coverage: "₹1,500 / disruption",
    planKey: "STANDARD",
    premium: 59,
    coverageValue: 1500,
    features: ["Weather Protection", "Traffic Delay Coverage", "Instant Payouts"],
    color: "bg-[#f5f3f1]",
    borderColor: "border-[#e4e2e0]",
    buttonColor: "bg-[#1b1c1b] text-white hover:bg-[#434751]",
    textColor: "text-[#1b1c1b]",
    subTextColor: "text-[#a8aebf]",
    coverageTextColor: "text-[#004191]",
  },
  {
    name: "Pro Plan",
    price: "₹89",
    period: "week",
    coverage: "₹3,000 / disruption",
    planKey: "PRO",
    premium: 89,
    coverageValue: 3000,
    features: [
      "Everything in Standard",
      "Accident Coverage",
      "Vehicle Breakdown Aid",
      "Priority Claims",
    ],
    color: "bg-gradient-to-br from-[#004191] to-[#0058be]",
    borderColor: "border-transparent",
    buttonColor: "bg-white text-[#1b1c1b] hover:bg-[#f5f3f1]",
    textColor: "text-white",
    subTextColor: "text-white/60",
    coverageTextColor: "text-white",
    isPopular: true
  },
  {
    name: "Premium Plus",
    price: "₹119",
    period: "week",
    coverage: "₹5,000 / disruption",
    planKey: "PREMIUM_PLUS",
    premium: 119,
    coverageValue: 5000,
    features: [
      "Everything in Pro",
      "Health Insurance Add-on",
      "Family Coverage",
      "Legal Assistance",
    ],
    color: "bg-[#1b1c1b]",
    borderColor: "border-transparent",
    buttonColor: "bg-white text-[#1b1c1b] hover:bg-[#f5f3f1]",
    textColor: "text-white",
    subTextColor: "text-white/60",
    coverageTextColor: "text-white",
  },
];

export default function Policies() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState<any>(null);

  const fetchPolicy = async () => {
    if (!workerId && !phoneNumber) {
      setLoading(false);
      return;
    }
    const pid = workerId || phoneNumber;
    setLoading(true);
    try {
      const res = await api.get<any>(`/policy/status/?worker_id=${pid}`);
      setPolicyData(res);
    } catch (error) {
      console.error("Failed to fetch policy:", error);
      toast.error("Error loading policy details");
      setPolicyData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
  }, [workerId, phoneNumber]);

  const handleSelectPlan = async (plan: typeof availablePlans[0]) => {
    if (!workerId && !phoneNumber) {
      toast.error("Sign in to choose a plan");
      return;
    }
    
    // Pass the selected plan object to the Payment Checkout gateway
    navigate('/payment', { state: { plan } });
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Syncing Policies...</h2>
      </div>
    );
  }

  const activePolicy = policyData?.active_policy;

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      <DashboardHeader />

      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
              {activePolicy ? "Your Protection" : "Choose a Plan"}
            </h1>
            <p className="text-[#434751] mt-2 font-medium text-lg">
              {activePolicy
                ? `Active ${platformName} coverage — you're protected.`
                : `Select a plan to activate your ${platformName} income shield.`}
            </p>
          </div>
        </div>

        <div className="space-y-16">

          {/* ─── ACTIVE PLAN CARD (shown only if active plan exists) ─── */}
          {activePolicy && (
            <section>
              <h2 className="text-sm font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-6">Active Coverage</h2>
              <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.08)] transition-all duration-500 relative overflow-hidden group max-w-4xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#e2f5e9] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 opacity-60" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                  
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-[#f0fdf4] text-[#16a34a] rounded-[2rem] flex items-center justify-center shrink-0 border border-[#bbf7d0]/50">
                      <Shield size={40} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="text-3xl font-extrabold text-[#1b1c1b] leading-none">{activePolicy.plan_type || 'Standard Plan'}</h3>
                        <span className="px-3 py-1 bg-[#16a34a] text-white text-[10px] font-inter font-bold uppercase tracking-widest rounded-full">ACTIVE</span>
                      </div>
                      <p className="text-[11px] font-inter font-bold uppercase tracking-[0.1em] text-[#434751]">Policy #{activePolicy.policy_number}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center mt-6 text-[#1b1c1b] font-inter font-bold text-sm bg-[#f5f3f1] p-4 sm:px-5 sm:py-3 rounded-[1.25rem] w-fit gap-1 sm:gap-0">
                        <div className="flex items-center whitespace-nowrap">
                          <Calendar size={18} className="mr-2.5 text-[#004191]" />
                          Expires: {new Date(activePolicy.valid_until).toLocaleDateString()}
                        </div>
                        <div className="whitespace-nowrap text-[#004191] ml-[26px] sm:ml-4 sm:pl-4 sm:border-l sm:border-[#e4e2e0]">
                          {activePolicy.days_remaining} days left
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 md:border-l md:border-[#e4e2e0]/50 md:pl-10">
                    <div>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-2">Max Coverage</p>
                      <p className="text-3xl font-extrabold text-[#1b1c1b]">₹{activePolicy.coverage_limit}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-2">Premium/Wk</p>
                      <p className="text-3xl font-extrabold text-[#1b1c1b]">₹{activePolicy.weekly_premium}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ─── PLANS SECTION (marketplace or upgrade options) ─── */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-sm font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf]">
                  {activePolicy ? "Upgrade Options" : "Available Plans"}
                </h2>
                {activePolicy && (
                  <p className="text-xs text-[#434751] font-medium mt-1">
                    Upgrade anytime — new plan activates immediately.
                  </p>
                )}
              </div>
              <button className="text-[#004191] text-[11px] font-inter font-bold uppercase tracking-[0.15em] flex items-center space-x-1 hover:translate-x-1 transition-transform">
                <span>Compare Plans</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 items-stretch pt-4">
              {availablePlans.map((plan) => {
                const isCurrentPlan = activePolicy?.plan_type === plan.planKey;
                return (
                  <div
                    key={plan.name}
                    className={cn(
                      "rounded-[3rem] p-8 md:p-10 flex flex-col transition-all duration-500 hover:-translate-y-2 relative shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.12)] border",
                      plan.color, plan.borderColor,
                      isCurrentPlan && "ring-4 ring-[#16a34a]/30"
                    )}
                  >
                    {plan.isPopular && !isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ba1a1a] text-white px-4 py-1.5 rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.15em] shadow-lg">
                        Recommended
                      </div>
                    )}
                    {isCurrentPlan && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#16a34a] text-white px-4 py-1.5 rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.15em] shadow-lg flex items-center gap-1.5">
                        <CheckCircle size={12} /> Current Plan
                      </div>
                    )}
                    
                    <div className="mb-8 relative z-10">
                      <h3 className={cn("text-2xl font-extrabold mb-1", plan.textColor)}>{plan.name}</h3>
                      <div className="flex items-baseline">
                        <span className={cn("text-5xl font-extrabold tracking-tighter", plan.textColor)}>{plan.price}</span>
                        <span className={cn("font-medium ml-1", plan.subTextColor)}>/{plan.period}</span>
                      </div>
                    </div>

                    <div className={cn("rounded-2xl p-6 mb-8 relative z-10", plan.isPopular || plan.name === "Premium Plus" ? "bg-white/10" : "bg-white")}>
                      <p className={cn("text-[10px] font-inter font-bold uppercase tracking-[0.15em] mb-1", plan.subTextColor)}>Max Coverage</p>
                      <p className={cn("text-2xl font-extrabold tracking-tight", plan.coverageTextColor)}>{plan.coverage}</p>
                    </div>

                    <ul className="space-y-4 mb-10 flex-1 relative z-10">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start space-x-3">
                          <CheckCircle size={20} className={cn("mt-0.5 flex-shrink-0", plan.isPopular || plan.name === "Premium Plus" ? "text-[#bbf7d0]" : "text-[#16a34a]")} />
                          <span className={cn("text-sm font-medium leading-relaxed", plan.isPopular || plan.name === "Premium Plus" ? "text-white/90" : "text-[#434751]")}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => !isCurrentPlan && handleSelectPlan(plan)}
                      disabled={isCurrentPlan}
                      className={cn(
                        "w-full py-5 font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full transition-all active:scale-[0.98] relative z-10 shadow-lg flex items-center justify-center gap-2",
                        isCurrentPlan
                          ? "opacity-50 cursor-not-allowed bg-white/20 text-white"
                          : plan.buttonColor
                      )}
                    >
                      {isCurrentPlan ? (
                        "Active"
                      ) : activePolicy ? (
                        <><ArrowUpRight size={14} /> Upgrade to {plan.name}</>
                      ) : (
                        "Select Plan"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* AI Banner Footer */}
          <section className="bg-[#1b1c1b] rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10 shadow-[0_40px_80px_-20px_rgba(27,28,27,0.3)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#004191] to-transparent rounded-full -mr-20 -mt-20 blur-[100px] opacity-40 mix-blend-screen" />
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">Unsure about constraints?</h2>
              <p className="text-[#a8aebf] font-medium leading-relaxed max-w-lg">
                Our AI analyzes your delivery frequency, locations, and historical disruptions to recommend the optimal risk shield.
              </p>
            </div>
            <button 
              onClick={() => navigate('/risk-predictor')}
              className="relative z-10 w-full md:w-auto px-10 py-5 bg-white text-[#1b1c1b] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-all shadow-xl active:scale-[0.98] whitespace-nowrap"
            >
              Run AI Analysis
            </button>
          </section>

        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
