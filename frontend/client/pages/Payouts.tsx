import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CreditCard, Banknote, Download, Target, ChevronRight,
  Search, Filter, ArrowUpRight, ArrowDownRight,
  Loader2, Zap, Calendar, ArrowRight, DollarSign
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function Payouts() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId, logout } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    available: 0,
    totalEarned: 0,
    pending: 0
  });

  const fetchPayouts = async () => {
    if (!workerId && !phoneNumber) return;
    const pid = workerId || phoneNumber;
    setLoading(true);
    try {
      const response = await api.get<any>(`/claims/history/?worker_id=${pid}`);
      const claims = response.claims || [];

      const txns = claims.map((c: any) => ({
        id: `TXN-${c.claim_id.split('-')[0].toUpperCase()}`,
        amount: `₹${c.compensation}`,
        date: new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        type: c.claim_reason,
        status: c.status === 'PAID' ? 'Success' : c.status,
        bank: "UPI Settlement"
      }));

      const totalEarned = claims
        .filter((c: any) => c.status === 'PAID' || c.status === 'AUTO_APPROVED')
        .reduce((acc: number, c: any) => acc + parseFloat(c.compensation), 0);

      const pending = claims
        .filter((c: any) => c.status === 'PENDING' || c.status === 'FRAUD_FLAGGED')
        .reduce((acc: number, c: any) => acc + parseFloat(c.compensation), 0);

      setTransactions(txns);
      setStats({
        available: response.worker_balance || 0,
        totalEarned,
        pending
      });
    } catch (error) {
      toast.error("Failed to sync payouts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
  }, [workerId, phoneNumber]);

  const downloadStatement = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    
    const headers = ["TXN Ref", "Date", "Details", "Amount", "Status"];
    const rows = transactions.map(txn => [
      txn.id,
      txn.date,
      txn.bank,
      txn.amount.replace('₹', ''),
      txn.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zafby_statement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statement downloaded successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Syncing Payout Hub...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      <DashboardHeader />

      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
        
        {/* Earnings Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#16a34a]/20 mb-4">
              <Banknote size={14} /> Settlement Hub
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
              Earnings & Payouts
            </h2>
            <p className="text-[#434751] mt-3 font-medium text-lg">Manage your {platformName} income protection settlements.</p>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={downloadStatement}
               className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#004191] text-white rounded-full hover:bg-[#002b63] transition-all shadow-[0_12px_24px_-8px_rgba(0,65,145,0.3)] active:scale-[0.98] font-inter font-bold text-[11px] uppercase tracking-[0.1em]"
             >
               <Download size={16} />
               <span>Download Statement</span>
             </button>
          </div>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Available for Withdrawal", value: `₹${stats.available.toFixed(2)}`, icon: Zap, color: "text-[#004191]", bg: "bg-[#004191]/5", main: true },
            { label: "Total Protected", value: `₹${stats.totalEarned.toFixed(2)}`, icon: Banknote, color: "text-[#16a34a]", bg: "bg-[#16a34a]/5", main: false },
            { label: "Pending Payouts", value: `₹${stats.pending.toFixed(2)}`, icon: Calendar, color: "text-[#d97706]", bg: "bg-[#d97706]/5", main: false },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-[3rem] p-8 md:p-10 flex flex-col justify-between min-h-[220px] transition-all cursor-pointer shadow-[0_12px_24px_-8px_rgba(27,28,27,0.02)] border border-[#e4e2e0]/50 hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)]",
                stat.main ? "bg-gradient-to-br from-[#004191] to-[#0058be] text-white shadow-[0_24px_48px_-12px_rgba(0,65,145,0.3)] border-none hover:scale-[1.02]" : "bg-[#ffffff]"
              )}
            >
              <div className={cn("p-4 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6", stat.main ? "bg-white/10 text-white" : cn(stat.bg, stat.color))}>
                <stat.icon size={32} />
              </div>
              <div>
                <p className={cn("text-[10px] font-inter font-bold uppercase tracking-[0.15em] mb-1", stat.main ? "text-blue-200" : "text-[#434751]")}>{stat.label}</p>
                <h3 className={cn("text-4xl font-extrabold tracking-tight", stat.main ? "text-white" : "text-[#1b1c1b]")}>{stat.value}</h3>
                
                {stat.main && (
                  <div className="mt-6 flex items-center text-[10px] font-inter font-bold uppercase tracking-widest text-[#bbf7d0]">
                     <ArrowUpRight size={14} className="mr-1" />
                     Protected by Zafby
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent History Table */}
          <div className="lg:col-span-2 bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden">
            <div className="p-8 border-b border-[#e4e2e0]/50 flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#1b1c1b]">Recent Transfers</h2>
              <button className="text-[11px] font-inter font-bold text-[#004191] uppercase tracking-[0.15em] hover:translate-x-1 transition-transform flex items-center space-x-1">
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left whitespace-nowrap min-w-[500px]">
                <thead>
                  <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] bg-[#fcf9f8]/50">
                    <th className="px-8 py-5 border-b border-[#e4e2e0]/30">TXN Ref</th>
                    <th className="px-8 py-5 border-b border-[#e4e2e0]/30">Date</th>
                    <th className="px-8 py-5 border-b border-[#e4e2e0]/30">Details</th>
                    <th className="px-8 py-5 border-b border-[#e4e2e0]/30 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2e0]/30">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <p className="text-[#a8aebf] font-inter font-bold uppercase tracking-widest text-xs">No transfers yet</p>
                      </td>
                    </tr>
                  ) : (
                    transactions.map((txn, i) => (
                      <tr key={txn.id} className="hover:bg-[#fcf9f8] transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-extrabold text-[#1b1c1b]">{txn.id}</p>
                          <p className="text-[10px] font-medium text-[#434751] uppercase mt-0.5">{txn.type}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-medium text-[#434751]">{txn.date}</td>
                        <td className="px-8 py-6 text-sm font-medium text-[#434751]">{txn.bank}</td>
                        <td className="px-8 py-6 text-right">
                          <p className="font-extrabold text-[#1b1c1b] text-base">{txn.amount}</p>
                          <span className={cn(
                            "px-2 py-0.5 text-[9px] font-inter font-bold uppercase tracking-widest rounded-full",
                            txn.status === 'Success' || txn.status === 'AUTO_APPROVED' ? "bg-[#e2f5e9] text-[#16a34a]" : "bg-[#f0f4ff] text-[#004191]"
                          )}>
                            {txn.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats Sidebar */}
          <div className="bg-[#1b1c1b] rounded-[3rem] p-10 text-white shadow-[0_24px_48px_-12px_rgba(27,28,27,0.3)] relative overflow-hidden flex flex-col justify-between min-h-[400px]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#004191] rounded-full -mr-20 -mt-20 blur-[100px] opacity-40 mix-blend-screen" />
            <div className="relative z-10">
              <h3 className="text-3xl font-extrabold mb-4 leading-tight">Fast-Track Your Payouts</h3>
              <p className="text-[#a8aebf] font-medium text-sm leading-relaxed mb-8">
                Connect your Bank or UPI ID for instant settlements within 60 seconds of any claim approval.
              </p>
              <div className="space-y-4">
                {["Instant Settlements", "Zero Transfer Fees", "Tax Invoices Generated"].map((info) => (
                  <div key={info} className="flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 bg-[#004191] rounded-full" />
                    <span className="text-sm font-bold text-white/90">{info}</span>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full h-16 mt-10 bg-white text-[#1b1c1b] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-all active:scale-[0.98] shadow-xl">
              Connect UPI
            </button>
          </div>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
