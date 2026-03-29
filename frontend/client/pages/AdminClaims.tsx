import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Check, X, Eye, Clock, AlertTriangle, FileText, Download, 
  Filter, Search, ArrowRight, Loader2, ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

export default function AdminClaims() {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

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
      fetchData(); 
    } catch (error) {
      toast.error("Action failed");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a] min-h-screen flex flex-col pb-10">
      
      {/* Admin Top Navbar */}
      <header className="fixed top-0 w-full z-50 bg-[#1b1c1b] text-white backdrop-blur-xl border-b border-[#434751]/30">
        <div className="flex justify-between items-center px-6 py-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
            <ShieldAlert className="text-[#ba1a1a]" size={28} />
            <span className="text-2xl font-extrabold tracking-tighter hidden sm:block">Zafby<span className="text-[#a8aebf] font-medium ml-1">Admin</span></span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-10 font-inter text-[11px] font-bold tracking-[0.1em] uppercase">
            <Link to="/admin/dashboard" className="text-[#a8aebf] hover:text-white transition-colors">Overview</Link>
            <Link to="/admin/workers" className="text-[#a8aebf] hover:text-white transition-colors">Workers</Link>
            <Link to="/admin/claims" className="text-white relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-1 after:bg-[#ba1a1a]">Claims</Link>
            <Link to="/admin/alerts" className="text-[#a8aebf] hover:text-white transition-colors">Risk Sonar</Link>
          </nav>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center px-4 py-2 bg-[#ba1a1a]/20 text-[#ffb4ab] text-[10px] font-inter font-bold uppercase tracking-[0.15em] rounded-full border border-[#ba1a1a]/30">
              <span className="w-2 h-2 bg-[#ffb4ab] rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.8)]" />
              Live Feed
            </div>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-[#ffffff] text-[#1b1c1b] font-inter font-bold text-[10px] uppercase tracking-[0.15em] rounded-full hover:bg-[#e4e2e0] transition-colors">
              Secure Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 px-6 max-w-[1400px] mx-auto w-full animate-in fade-in duration-700 space-y-12">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1b1c1b]">Claims Queue</h1>
            <p className="text-[#434751] mt-1 font-medium text-lg">Review and process worker compensation requests.</p>
          </div>
          <button className="flex items-center justify-center space-x-3 px-8 py-4 bg-[#ffffff] border border-[#e4e2e0] text-[#1b1c1b] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-colors shadow-sm">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Pending Approval", value: stats?.pending_claims || 0, icon: Clock, color: "text-[#004191]", bg: "bg-[#f0f4ff]" },
            { label: "Flagged Claims", value: stats?.fraud_flagged_claims || 0, icon: AlertTriangle, color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]/40" },
            { label: "Auto-Processed Today", value: stats?.auto_approved_claims || 0, icon: Check, color: "text-[#16a34a]", bg: "bg-[#f0fdf4]" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-[#ffffff] p-8 md:p-10 rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] hover:shadow-[0_40px_80px_-20px_rgba(27,28,27,0.1)] transition-all duration-500 hover:-translate-y-1 cursor-pointer group"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={cn("p-4 w-16 h-16 rounded-[1.5rem] mb-6 flex items-center justify-center border border-[#e4e2e0]/30 transition-colors", stat.bg, stat.color)}>
                <stat.icon size={28} />
              </div>
              <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] group-hover:text-[#434751] transition-colors mb-1">{stat.label}</p>
              <h3 className="text-4xl font-extrabold text-[#1b1c1b] tracking-tight group-hover:text-[#004191] transition-colors">{stat.value}</h3>
            </div>
          ))}
        </div>

        {/* Claims Table */}
        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden flex flex-col">
          
          <div className="p-8 md:p-10 border-b border-[#e4e2e0]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#fcf9f8]/30">
            <div className="relative flex-1 max-w-2xl">
              <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a8aebf]" />
              <input
                type="text"
                placeholder="Search by worker name, claim ID..."
                className="w-full pl-16 pr-6 py-5 bg-[#ffffff] border border-[#e4e2e0] rounded-full text-[15px] font-bold text-[#1b1c1b] placeholder:text-[#a8aebf] focus:ring-2 focus:ring-[#004191] focus:border-transparent transition-all outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
               <button className="whitespace-nowrap flex items-center space-x-2 px-6 py-4 bg-[#f5f3f1] text-[#434751] hover:text-[#1b1c1b] hover:bg-[#e4e2e0] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] transition-all">
                 <Filter size={18} />
                 <span>Type: All</span>
               </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar min-h-[400px]">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 py-32">
                <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
                <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">Syncing Queues...</p>
              </div>
            ) : (
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] bg-[#fcf9f8]/80 border-b border-[#e4e2e0]/50">
                    <th className="px-10 py-6">Claim & Worker</th>
                    <th className="px-10 py-6">Type</th>
                    <th className="px-10 py-6">Date</th>
                    <th className="px-10 py-6">Amount</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2e0]/40">
                  {claims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-10 py-32 text-center">
                        <Check size={48} className="mx-auto text-[#e4e2e0] mb-4" />
                        <p className="text-sm font-inter font-bold text-[#a8aebf] uppercase tracking-widest">No claims in queue</p>
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr key={claim.claim_id} className="group hover:bg-[#fcf9f8] transition-colors cursor-pointer">
                        <td className="px-10 py-6 md:py-8">
                          <div>
                            <p className="text-lg font-extrabold text-[#1b1c1b] uppercase">#{claim.claim_id.split('-')[0]}</p>
                            <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-1">{claim.worker__name} ({claim.worker__platform})</p>
                          </div>
                        </td>
                        <td className="px-10 py-6 md:py-8">
                          <span className="px-4 py-2 bg-[#f5f3f1] border border-[#e4e2e0]/80 text-[10px] font-inter font-bold text-[#434751] uppercase tracking-[0.15em] rounded-full">
                            {claim.claim_reason.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-10 py-6 md:py-8 text-sm font-bold text-[#434751]">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-10 py-6 md:py-8 text-lg font-extrabold text-[#1b1c1b]">
                          ${claim.compensation}
                        </td>
                        <td className="px-10 py-6 md:py-8">
                          <span className={cn(
                            "px-4 py-1.5 rounded-full text-[10px] font-inter font-bold uppercase tracking-widest",
                            claim.status === "PAID" || claim.status === "AUTO_APPROVED" ? "bg-[#e2f5e9] text-[#16a34a]" :
                              claim.status === "FRAUD_FLAGGED" ? "bg-[#ffdad6]/40 text-[#ba1a1a]" :
                                claim.status === "REJECTED" ? "bg-[#f5f3f1] text-[#a8aebf]" :
                                  "bg-[#f0f4ff] text-[#004191]"
                          )}>
                            {claim.status.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-10 py-6 md:py-8 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            { (claim.status === 'PENDING' || claim.status === 'FRAUD_FLAGGED') && (
                              <>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAction(claim.claim_id, 'APPROVE'); }}
                                  className="w-12 h-12 inline-flex items-center justify-center bg-[#e2f5e9] text-[#16a34a] hover:bg-[#16a34a] hover:text-white rounded-[1.5rem] transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 shadow-sm" title="Approve">
                                  <Check size={24} />
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleAction(claim.claim_id, 'REJECT'); }}
                                  className="w-12 h-12 inline-flex items-center justify-center bg-[#ffdad6]/40 text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white rounded-[1.5rem] transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 shadow-sm" title="Reject">
                                  <X size={24} />
                                </button>
                              </>
                            )}
                            <button className="w-12 h-12 inline-flex items-center justify-center bg-[#f5f3f1] text-[#434751] hover:bg-[#1b1c1b] hover:text-white rounded-[1.5rem] transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 shadow-sm" title="View Details">
                              <Eye size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-8 md:p-10 bg-[#f0f4ff]/50 border-t border-[#004191]/10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="w-16 h-16 bg-[#ffffff] rounded-[1.5rem] flex items-center justify-center text-[#004191] shadow-sm shrink-0 border border-[#004191]/10">
              <FileText size={32} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-extrabold text-[#004191] tracking-tight mb-1">AI Verification Active</p>
              <p className="text-[13px] font-medium text-[#434751] max-w-lg">85% of claims are automatically cross-referenced against platform telemetry and approved instantly without requiring manual review.</p>
            </div>
            <button className="w-full md:w-auto px-8 py-4 bg-[#004191] text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#0058be] transition-colors shadow-lg active:scale-[0.98] shrink-0">
              Adjust Engines
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
