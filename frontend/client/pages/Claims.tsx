import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  Plus, Clock, CheckCircle, AlertCircle, ExternalLink, Search, 
  Phone, Loader2, ArrowRight, LayoutGrid, Home, Shield, User 
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function Claims() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [claimsData, setClaimsData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("RAIN");
  const [lostHours, setLostHours] = useState("4");
  const [submitting, setSubmitting] = useState(false);

  const fetchClaims = async () => {
    if (!workerId && !phoneNumber) return;
    const pid = workerId || phoneNumber;
    setLoading(true);
    try {
      const res = await api.get<any>(`/claims/history/?worker_id=${pid}`);
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
    if (!workerId && !phoneNumber) {
      toast.error("You must be logged in to file a claim");
      return;
    }
    const pid = workerId || phoneNumber;

    setSubmitting(true);
    try {
      const res = await api.post<any>("/claims/submit/", {
        worker_id: pid,
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
      fetchClaims(); 
    } catch (error: any) {
      toast.error(error.message || "Submission failed. Please check your active policy.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [workerId, phoneNumber]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Loading Claims...</h2>
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
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      <DashboardHeader />

      {/* Claim Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1b1c1b]/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-[#ffffff] w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(27,28,27,0.12)] border border-[#e4e2e0]/50 animate-in zoom-in-95 duration-300">
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Parametric Relief</h2>
              <p className="text-[#434751] font-inter text-[10px] font-bold uppercase tracking-[0.1em] mt-2">Submit earnings protection claim</p>
            </div>

            <form onSubmit={handleSubmitClaim} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] ml-2">Disruption Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {claimReasons.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setReason(r.value)}
                      className={cn(
                        "px-4 py-4 rounded-2xl text-xs font-bold transition-all border-2 text-left font-manrope",
                        reason === r.value
                          ? "bg-[#1b1c1b] text-white border-[#1b1c1b] shadow-md scale-[1.02]"
                          : "bg-[#f5f3f1] text-[#434751] border-transparent hover:border-[#e4e2e0]"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] ml-2">Lost Working Hours</label>
                <div className="relative group">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a8aebf] group-focus-within:text-[#004191] transition-colors" size={20} />
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={lostHours}
                    onChange={(e) => setLostHours(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full bg-[#f5f3f1] border-none rounded-2xl h-16 pl-16 pr-6 text-sm font-bold focus:ring-2 focus:ring-[#004191]/20 focus:bg-white transition-all text-[#1b1c1b] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button
                   type="button"
                   disabled={submitting}
                   onClick={() => setIsModalOpen(false)}
                   className="w-full md:w-auto px-8 py-5 border border-[#e4e2e0] text-[#434751] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-all disabled:opacity-50"
                 >
                   Cancel
                 </button>
                 <button
                   type="submit"
                   disabled={submitting}
                   className="w-full flex-1 px-8 py-5 bg-[#004191] text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#0058be] transition-all shadow-lg shadow-[#004191]/20 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-3"
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

      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
              {platformName} Claims
            </h1>
            <p className="text-[#434751] mt-2 font-medium text-lg">Protection log and payouts.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#1b1c1b] text-white rounded-full hover:bg-[#434751] transition-all shadow-[0_12px_24px_-8px_rgba(27,28,27,0.3)] active:scale-[0.98]"
          >
            <Plus size={20} />
            <span className="text-xs font-inter font-bold uppercase tracking-[0.1em]">File New Claim</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total Claims", value: claimsData?.total_claims || 0, icon: CheckCircle, color: "text-[#004191]", bg: "bg-[#004191]/5" },
            { label: "Pending Approval", value: claims.filter((c: any) => c.status === 'FRAUD_FLAGGED' || c.status === 'PENDING').length, icon: Clock, color: "text-[#d97706]", bg: "bg-[#d97706]/5" },
            { label: "Total Payout", value: `₹${claimsData?.total_compensation || 0}`, icon: ExternalLink, color: "text-[#16a34a]", bg: "bg-[#16a34a]/5" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-[#ffffff] rounded-3xl p-8 flex flex-col justify-between border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.02)] min-h-[180px] hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] transition-all cursor-pointer"
            >
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6", stat.bg, stat.color)}>
                <stat.icon size={26} />
              </div>
              <div>
                 <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-1">{stat.label}</p>
                 <h3 className="text-3xl font-extrabold text-[#1b1c1b]">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* AI Banner */}
        <section className="bg-gradient-to-r from-[#004191] to-[#0058be] rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden mb-12 shadow-[0_24px_48px_-12px_rgba(0,65,145,0.3)]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40 mix-blend-overlay" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center shrink-0 border border-white/20">
              <AlertCircle size={36} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-extrabold tracking-tight mb-2">AI Verification Engine</h2>
              <p className="text-blue-100 font-medium leading-relaxed max-w-xl text-sm">
                Our system verifies 92% of claims automatically using traffic and weather data, ensuring payouts reach your wallet in minutes.
              </p>
            </div>
          </div>
        </section>

        {/* Claims Table wrapper */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
          <div className="p-8 border-b border-[#e4e2e0]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <h3 className="text-xl font-extrabold text-[#1b1c1b]">Claims History</h3>
            <div className="relative max-w-sm w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a8aebf]" />
              <input
                type="text"
                placeholder="Search specific claim..."
                className="w-full pl-12 pr-4 py-3 bg-[#f5f3f1] border-none rounded-2xl text-sm font-medium placeholder:text-[#a8aebf] focus:ring-2 focus:ring-[#004191]/20 outline-none text-[#1b1c1b]"
              />
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] bg-[#fcf9f8]/50">
                  <th className="px-8 py-6 font-semibold border-b border-[#e4e2e0]/30">Claim Ref</th>
                  <th className="px-8 py-6 font-semibold border-b border-[#e4e2e0]/30">Issue Type</th>
                  <th className="px-8 py-6 font-semibold border-b border-[#e4e2e0]/30">Date</th>
                  <th className="px-8 py-6 font-semibold border-b border-[#e4e2e0]/30 text-right">Amount</th>
                  <th className="px-8 py-6 font-semibold border-b border-[#e4e2e0]/30 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e4e2e0]/30">
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-[#a8aebf] font-inter font-bold uppercase tracking-widest text-xs">No claims filed yet</p>
                    </td>
                  </tr>
                ) : (
                  claims.map((claim: any) => {
                    const statusConfig: Record<string, string> = {
                      PAID: "bg-[#e2f5e9] text-[#16a34a] border-[#16a34a]/30",
                      AUTO_APPROVED: "bg-[#e2f5e9] text-[#16a34a] border-[#16a34a]/30",
                      FRAUD_FLAGGED: "bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]",
                      PENDING: "bg-[#fef3c7] text-[#d97706] border-[#fde68a]",
                      REJECTED: "bg-[#f5f3f1] text-[#434751] border-[#e4e2e0]",
                    };

                    const statusClass = statusConfig[claim.status] || "bg-[#f5f3f1] text-[#434751] border-[#e4e2e0]";

                    return (
                      <tr key={claim.claim_id} className="hover:bg-[#fcf9f8] transition-colors">
                        <td className="px-8 py-6 font-extrabold text-[#1b1c1b]">
                          #{claim.claim_id.split('-')[0]}
                        </td>
                        <td className="px-8 py-6 font-medium text-[#434751]">{claim.claim_reason}</td>
                        <td className="px-8 py-6 text-[#a8aebf] font-medium text-sm">
                          {new Date(claim.claim_date).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6 font-extrabold text-[#1b1c1b] text-right">₹{claim.compensation}</td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.1em] border",
                            statusClass
                          )}>
                            {claim.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
