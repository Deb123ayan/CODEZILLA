import Sidebar from "@/components/Sidebar";
import { Plus, Clock, CheckCircle, AlertCircle, ExternalLink, Filter, Search, Phone, Loader2, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function Claims() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claimsData, setClaimsData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("RAIN");
  const [lostHours, setLostHours] = useState("4");
  const [submitting, setSubmitting] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  const fetchClaims = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await api.get<any>(`/claims/history/?worker_id=${workerId}`);
      setClaimsData(res);
    } catch (error) {
      console.error("Failed to fetch claims:", error);
      toast.error("Error loading claim history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workerId) {
      toast.error("You must be logged in to file a claim");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post<any>("/claims/submit/", {
        worker_id: workerId,
        claim_reason: reason,
        lost_hours: parseInt(lostHours)
      });

      if (res.verdict === "AUTO_APPROVED") {
        toast.success(`Claim Approved! ₹${res.compensation} will be credited.`);
      } else if (res.verdict === "FRAUD_FLAGGED") {
        toast.warning("Claim flagged for manual review due to location discrepancy.");
      } else if (res.verdict === "REJECTED") {
        toast.error(`Claim Rejected: ${res.message || res.reason}`);
      }

      setIsModalOpen(false);
      fetchClaims(); // Refresh history
    } catch (error: any) {
      toast.error(error.message || "Submission failed. Please check your active policy.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchClaims();
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [workerId]);

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
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Syncing Claims...</h2>
      </div>
    );
  }

  const claims = claimsData?.claims || [];

  const claimReasons = [
    { value: "RAIN", label: "Heavy Rain / Monsoon" },
    { value: "HEAT", label: "Extreme Heat (above 40°C)" },
    { value: "AQI", label: "Severe Air Pollution" },
    { value: "STRIKE", label: "Gig Worker Strike" },
    { value: "ZONE_CLOSURE", label: "Restricted Zone Entry" },
    { value: "CURFEW", label: "Emergency Curfew" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-20 sm:pl-0">
            <div>
              <h1 className={cn("text-2xl md:text-3xl font-black tracking-tighter transition-all", platformColor)}>
                {platformName} Claims
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">{username}'s portal</p>
              {phoneNumber && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  <Phone size={12} className="text-blue-600" />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
              <span className="text-sm font-bold">File New Claim</span>
            </button>
          </div>
        </header>

        {/* Claim Submission Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 md:p-14 shadow-2xl reveal active transition-all">
              <div className="mb-10">
                <h2 className="text-2xl font-black tracking-tight">Parametric Relief</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Submit earnings protection claim</p>
              </div>

              <form onSubmit={handleSubmitClaim} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Disruption Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {claimReasons.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setReason(r.value)}
                        className={cn(
                          "px-4 py-4 rounded-2xl text-xs font-bold transition-all border-2 text-left",
                          reason === r.value
                            ? "bg-black text-white border-black shadow-lg"
                            : "bg-gray-50 text-gray-500 border-transparent hover:border-gray-200"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Lost Working Hours</label>
                  <div className="relative group">
                    <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={lostHours}
                      onChange={(e) => setLostHours(e.target.value)}
                      placeholder="e.g. 4"
                      className="w-full bg-gray-50 border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-16 border-2 border-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] h-16 bg-blue-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 disabled:bg-gray-400 flex items-center justify-center space-x-3"
                  >
                    {submitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>
                        <span>Submit Claim</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="section-padding space-y-12">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: "Total Claims", value: claimsData?.total_claims || 0, icon: CheckCircle, color: "bg-blue-50/50", iconColor: "text-blue-600" },
              { label: "Pending Approval", value: claims.filter((c: any) => c.status === 'FRAUD_FLAGGED' || c.status === 'PENDING').length, icon: Clock, color: "bg-orange-50/50", iconColor: "text-orange-600" },
              { label: "Total Payout", value: `₹${claimsData?.total_compensation || 0}`, icon: ExternalLink, color: "bg-green-50/50", iconColor: "text-green-600" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn("p-8 rounded-[2.5rem] border border-gray-100 hover:bg-black group transition-all duration-500 transform hover:-translate-y-1 cursor-pointer reveal active shadow-sm shadow-black/5", stat.color)}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={cn("p-4 w-14 h-14 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors", stat.color, stat.iconColor)}>
                  <stat.icon size={26} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1 group-hover:text-white transition-colors">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "300ms" }}>
            <div className="p-8 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search claims..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar pt-2">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                    <th className="px-8 py-5">Claim ID</th>
                    <th className="px-8 py-5">Issue Type</th>
                    <th className="px-8 py-5">Platform</th>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Amount</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No claims found</p>
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim: any) => (
                      <tr key={claim.claim_id} className="group hover:bg-gray-50/80 transition-all cursor-pointer">
                        <td className="px-8 py-6 font-black text-gray-900 group-hover:translate-x-1 transition-transform">
                          {claim.claim_id.split('-')[0]}...
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-500">{claim.claim_reason}</td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            {claim.policy__plan_type || 'STANDARD'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-gray-400 text-xs font-bold">
                          {new Date(claim.claim_date).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 font-black text-gray-900">₹{claim.compensation}</td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            claim.status === "PAID" || claim.status === "AUTO_APPROVED" ? "bg-green-100 text-green-700" :
                              claim.status === "FRAUD_FLAGGED" ? "bg-red-100 text-red-700" :
                                "bg-blue-100 text-blue-700"
                          )}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Banner */}
          <section className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden reveal active" style={{ transitionDelay: "400ms" }}>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl">
                <AlertCircle size={40} className="text-white" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tight mb-3">AI Verification Engine</h2>
                <p className="text-blue-100/70 font-medium leading-relaxed max-w-xl">
                  Our system verifies 92% of claims automatically using traffic and weather data, ensuring payouts reach your wallet in under 4 hours.
                </p>
              </div>
              <button className="px-8 py-4 bg-white text-blue-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 whitespace-nowrap">
                How it works
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
