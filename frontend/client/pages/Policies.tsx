import Sidebar from "@/components/Sidebar";
import { Shield, Plus, CheckCircle, Calendar, ArrowRight, Phone, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

const availablePlans = [
  {
    name: "Basic Plan",
    price: "₹15",
    period: "week",
    coverage: "₹500 / disruption",
    features: ["Weather Protection", "Traffic Delay Coverage", "Instant Payouts"],
    color: "bg-blue-50/50",
    borderColor: "border-blue-100",
    buttonColor: "bg-blue-600 hover:bg-black",
  },
  {
    name: "Pro Plan",
    price: "₹25",
    period: "week",
    coverage: "₹1,200 / disruption",
    features: [
      "Everything in Basic",
      "Accident Coverage",
      "Vehicle Breakdown Aid",
      "Priority Claims",
    ],
    color: "bg-purple-50/50",
    borderColor: "border-purple-100",
    buttonColor: "bg-purple-600 hover:bg-black",
  },
  {
    name: "Premium Plus",
    price: "₹45",
    period: "week",
    coverage: "₹2,500 / disruption",
    features: [
      "Everything in Pro",
      "Health Insurance Add-on",
      "Family Coverage",
      "Legal Assistance",
    ],
    color: "bg-orange-50/50",
    borderColor: "border-orange-100",
    buttonColor: "bg-orange-600 hover:bg-black",
  },
];

export default function Policies() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [policyData, setPolicyData] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

  const fetchPolicy = async () => {
    if (!workerId) {
      setLoading(false); // If no workerId, stop loading and show no policy
      return;
    }
    setLoading(true);
    try {
      const res = await api.get<any>(`/policy/status/?worker_id=${workerId}`);
      setPolicyData(res.data);
    } catch (error) {
      console.error("Failed to fetch policy:", error);
      toast.error("Error loading policy details");
      setPolicyData(null); // Ensure policyData is null on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicy();
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [workerId]);

  const handleSelectPlan = async (planName: string) => {
    if (!workerId) {
      toast.error("Sign in to choose a plan");
      return;
    }
    toast.success(`Redirecting to payment for ${planName}...`);
    // Future: Connect to /api/policy/purchase/ after payment simulation
  };

  const getPlatformColor = (id?: string) => {
    switch (id?.toLowerCase()) {
      case "zomato": return "text-red-600";
      case "blinkit": return "text-yellow-600";
      case "flipkart": return "text-blue-600";
      case "amazon": return "text-orange-600";
      case "zepto": return "text-purple-600";
      default: return "text-blue-600";
    }
  };

  const platformColor = getPlatformColor(platform);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Syncing Policies...</h2>
      </div>
    );
  }

  const activePolicy = policyData?.active_policy;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-20 sm:pl-0">
            <div>
              <h1 className={cn("text-2xl md:text-3xl font-black tracking-tighter transition-all", platformColor)}>
                {platformName} Policies
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">{username}'s coverage</p>
              {phoneNumber && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  <Phone size={12} className="text-blue-600" />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95">
              <Plus size={20} />
              <span className="text-sm font-bold">New Policy</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-12">
          {/* Active Policies */}
          <section className="reveal active">
            <h2 className="text-lg font-black uppercase tracking-widest text-gray-400 mb-8">Active Coverage</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {!activePolicy ? (
                <div className="col-span-full bg-white rounded-[2.5rem] border border-gray-100 p-12 text-center shadow-sm">
                  <Shield size={40} className="mx-auto text-gray-200 mb-6" />
                  <p className="text-gray-400 font-bold uppercase tracking-widest">No active policy found</p>
                  <p className="text-xs text-gray-300 mt-2">Select a plan below to start your protection</p>
                </div>
              ) : (
                <div key={activePolicy.policy_id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                          <Shield size={28} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900 leading-none mb-1">{activePolicy.plan_type || 'Standard Plan'}</h3>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">ID: {activePolicy.policy_number}</p>
                        </div>
                      </div>
                      <span className="px-4 py-1.5 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                        ACTIVE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-10">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Coverage</p>
                        <p className="text-lg font-black text-gray-900">₹{activePolicy.coverage_limit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Premium</p>
                        <p className="text-lg font-black text-gray-900">₹{activePolicy.weekly_premium}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-2 text-blue-600" />
                          Expires: {new Date(activePolicy.valid_until).toLocaleDateString()}
                        </span>
                        <span className="text-blue-600">{activePolicy.days_remaining} days left</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Available Plans */}
          <section className="reveal active" style={{ transitionDelay: "200ms" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Available Plans</h2>
              <button className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center space-x-2 hover:translate-x-1 transition-transform">
                <span>Compare all</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {availablePlans.map((plan, i) => (
                <div
                  key={plan.name}
                  className={cn(
                    "border rounded-[2.5rem] p-8 flex flex-col h-full hover:bg-black group transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer",
                    plan.color, plan.borderColor
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-black text-gray-900 mb-2 group-hover:text-white transition-colors">{plan.name}</h3>
                    <div className="flex items-baseline group-hover:text-gray-400 transition-colors">
                      <span className="text-4xl font-black text-gray-900 group-hover:text-white transition-colors">{plan.price}</span>
                      <span className="text-gray-500 font-bold ml-1">/{plan.period}</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 mb-8 group-hover:bg-white/10 transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 group-hover:text-gray-500 transition-colors">Max Coverage</p>
                    <p className="text-xl font-black text-blue-600 group-hover:text-blue-400 transition-colors">{plan.coverage}</p>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start space-x-3">
                        <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0 group-hover:text-green-400 transition-colors" />
                        <span className="text-xs font-bold text-gray-600 group-hover:text-gray-400 transition-colors leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button className={cn(
                    "w-full h-14 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-lg active:scale-95 group-hover:bg-white group-hover:text-black",
                    plan.buttonColor
                  )}>
                    Select Plan
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Help/Inspiration Section */}
          <section className="bg-black rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden reveal active" style={{ transitionDelay: "400ms" }}>
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500 rounded-full -mr-20 -mt-20 blur-[120px] opacity-20" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-black tracking-tight mb-4">Unsure about your coverage?</h2>
                <p className="text-gray-400 font-medium leading-relaxed max-w-lg">
                  Our algorithm analyzes your work patterns and zone risks to recommend the most optimal protection plan for you.
                </p>
              </div>
              <button className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 whitespace-nowrap">
                Run AI Analysis
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
