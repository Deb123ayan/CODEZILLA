import Sidebar from "@/components/Sidebar";
import { Check, X, Eye, Clock, AlertTriangle, FileText, Download, Filter, Search, ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function AdminClaims() {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, statsRes] = await Promise.all([
        api.get<any[]>("/admin/claims/list/"),
        api.get<any>("/admin/claims/")
      ]);
      setClaims(claimsRes);
      setStats(statsRes);
    } catch (error) {
      console.error("AdminClaims fetch error:", error);
      toast.error("Failed to sync claims queue");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (claimId: string, action: "APPROVE" | "REJECT") => {
    try {
      await api.post(`/admin/claims/${claimId}/action/`, { action });
      toast.success(`Claim ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`);
      fetchData(); // Refresh
    } catch (error) {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    fetchData();
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white space-y-6">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Syncing Claims Queue...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar isAdmin={true} />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-16 sm:pl-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Claims Queue</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Review and process worker compensation</p>
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black rounded-2xl transition-all shadow-sm">
              <Download size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Export CSV</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-10">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Pending Approval", value: stats?.pending_claims || 0, icon: Clock, color: "bg-blue-50/50", iconColor: "text-blue-600" },
              { label: "Flagged Claims", value: stats?.fraud_flagged_claims || 0, icon: AlertTriangle, color: "bg-orange-50/50", iconColor: "text-orange-600" },
              { label: "Auto-Processed Today", value: stats?.auto_approved_claims || 0, icon: Check, color: "bg-green-50/50", iconColor: "text-green-600" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:bg-black group transition-all duration-500 transform hover:-translate-y-1 cursor-pointer reveal active shadow-sm"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={cn("p-4 w-14 h-14 rounded-2xl mb-6 flex items-center justify-center group-hover:bg-white/10 group-hover:text-white transition-colors", stat.color, stat.iconColor)}>
                  <stat.icon size={26} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1 group-hover:text-white transition-colors">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Claims Table */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "300ms" }}>
            <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by worker name, claim ID..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-[1.5rem] text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-6 py-4 bg-gray-50 text-gray-400 hover:text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                  <Filter size={16} />
                  <span>Type: All</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                    <th className="px-10 py-6">Claim & Worker</th>
                    <th className="px-10 py-6">Type</th>
                    <th className="px-10 py-6">Date</th>
                    <th className="px-10 py-6">Amount</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-10 py-20 text-center">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No claims in queue</p>
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr key={claim.claim_id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                        <td className="px-10 py-7">
                          <div>
                            <p className="text-base font-black text-gray-900 group-hover:translate-x-1 transition-transform">#{claim.claim_id.split('-')[0]}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{claim.worker__name} ({claim.worker__platform})</p>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg">{claim.claim_reason}</span>
                        </td>
                        <td className="px-10 py-7 text-xs font-bold text-gray-400">{new Date(claim.created_at).toLocaleDateString()}</td>
                        <td className="px-10 py-7 font-black text-gray-900">₹{claim.compensation}</td>
                        <td className="px-10 py-7">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                            claim.status === "PAID" || claim.status === "AUTO_APPROVED" ? "bg-green-50 text-green-700" :
                              claim.status === "FRAUD_FLAGGED" ? "bg-red-50 text-red-700" :
                                claim.status === "REJECTED" ? "bg-gray-50 text-gray-400" :
                                  "bg-blue-50 text-blue-700"
                          )}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            { (claim.status === 'PENDING' || claim.status === 'FRAUD_FLAGGED') && (
                              <>
                                <button 
                                  onClick={() => handleAction(claim.claim_id, 'APPROVE')}
                                  className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-black hover:text-white transition-all transform group-hover:-translate-x-1" title="Approve">
                                  <Check size={18} />
                                </button>
                                <button 
                                  onClick={() => handleAction(claim.claim_id, 'REJECT')}
                                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-black hover:text-white transition-all transform group-hover:-translate-x-1" title="Reject">
                                  <X size={18} />
                                </button>
                              </>
                            )}
                            <button className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all transform group-hover:-translate-x-1" title="View Details">
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-5 md:p-8 bg-blue-50/50 border-t border-blue-100 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                <FileText size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">AI Verification Active</p>
                <p className="text-xs font-medium text-blue-700/70">85% of claims are automatically cross-referenced against platform telemetry.</p>
              </div>
              <button className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 shrink-0">
                Adjust Engines
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
