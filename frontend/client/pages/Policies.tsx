import Sidebar from "@/components/Sidebar";
import { Shield, Plus, CheckCircle, Calendar, ArrowRight, Phone, Loader2, History } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { authApi, policyApi } from "@/lib/api";
import { format } from "date-fns";

export default function Policies() {
  const { platform: userPlatform, username: userUsername, phoneNumber } = useUserAuth();
  const [activePolicies, setActivePolicies] = useState<any[]>([]);
  const [allPolicies, setAllPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerId, setWorkerId] = useState<string | null>(null);

  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!phoneNumber) return;
      try {
        const workerData = await authApi.getMe(phoneNumber);
        setWorkerId(workerData.id);
        const policyData = await policyApi.getStatus(workerData.id);
        
        // Filter active vs expired
        const active = policyData.all_policies.filter((p: any) => p.status === 'ACTIVE');
        const historical = policyData.all_policies.filter((p: any) => p.status !== 'ACTIVE');
        
        setActivePolicies(active);
        setAllPolicies(historical);
      } catch (err) {
        console.error("Failed to fetch policy data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 20);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [phoneNumber]);

  const getPlatformColor = (id: string) => {
    switch (id.toLowerCase()) {
      case "zomato": return "text-red-600";
      case "swiggy": return "text-orange-500";
      case "blinkit": return "text-yellow-600";
      case "flipkart": return "text-blue-600";
      case "amazon": return "text-orange-600";
      case "zepto": return "text-purple-600";
      default: return "text-blue-600";
    }
  };

  const platformColor = getPlatformColor(platform);

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
            
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 bg-white rounded-[2.5rem] border border-gray-100 italic font-bold text-center">
                 <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                 <p className="text-gray-400 uppercase tracking-widest text-xs">Accessing Policy Vault...</p>
              </div>
            ) : activePolicies.length === 0 ? (
               <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-20 text-center">
                  <p className="text-gray-400 font-black uppercase text-xs tracking-[0.2em] mb-6">No active policy found for your account.</p>
                  <button className="px-8 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">
                    Browse Plans
                  </button>
               </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {activePolicies.map((policy) => (
                  <div key={policy.policy_id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center space-x-4">
                          <div className="p-4 bg-green-50 text-green-600 rounded-2xl group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                            <Shield size={28} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black text-gray-900 leading-none mb-1">{policy.plan_type.charAt(0) + policy.plan_type.slice(1).toLowerCase()} Plan</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400"># {policy.policy_number}</p>
                          </div>
                        </div>
                        <span className="px-4 py-1.5 bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                          {policy.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-8 mb-10">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Platform</p>
                          <p className="text-lg font-black text-gray-900">{policy.platform || platformName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Premium</p>
                          <p className="text-lg font-black text-gray-900">₹{policy.weekly_premium} / wk</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Coverage</p>
                          <p className="text-lg font-black text-gray-900">₹{policy.coverage_limit}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Expiry</p>
                          <p className="text-lg font-black text-gray-900">{format(new Date(policy.end_date), "MMM dd, yyyy")}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button className="w-full sm:flex-1 h-12 border border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all">
                          Details
                        </button>
                        <button className="w-full sm:flex-1 h-12 bg-black text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-800 transition-all shadow-md active:scale-95">
                          Renew Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Historical Policies */}
          <section className="reveal active" style={{ transitionDelay: "200ms" }}>
            <div className="flex items-center space-x-3 mb-8">
               <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                  <History size={20} />
               </div>
               <h2 className="text-lg font-black uppercase tracking-widest text-gray-400">Coverage History</h2>
            </div>
            
            {loading ? (
               <div className="h-32 flex items-center justify-center">
                  <Loader2 className="animate-spin text-gray-300" />
               </div>
            ) : allPolicies.length === 0 ? (
               <div className="p-12 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No historical policies found.</p>
               </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <th className="px-8 py-5">Policy Number</th>
                      <th className="px-8 py-5">Plan</th>
                      <th className="px-8 py-5">Platform</th>
                      <th className="px-8 py-5">Premium</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allPolicies.map((policy) => (
                      <tr key={policy.policy_id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-black text-gray-900">{policy.policy_number}</td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-500">
                              {policy.plan_type}
                           </span>
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-500">{policy.platform || "Platform"}</td>
                        <td className="px-8 py-6 font-black text-gray-900">₹{policy.weekly_premium}</td>
                        <td className="px-8 py-6">
                           <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                             policy.status === "EXPIRED" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                           )}>
                             {policy.status}
                           </span>
                        </td>
                        <td className="px-8 py-6 text-right text-xs font-bold text-gray-400">
                           {format(new Date(policy.start_date), "MMM d")} - {format(new Date(policy.end_date), "MMM d, yyyy")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* AI Banner */}
          <section className="bg-neutral-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden reveal active" style={{ transitionDelay: "400ms" }}>
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
