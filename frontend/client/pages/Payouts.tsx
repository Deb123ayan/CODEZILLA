import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  CreditCard, Banknote, Download, ChevronRight,
  ArrowUpRight, ArrowDownLeft, Loader2, Zap, Calendar, ArrowRight,
  X, CheckCircle2, AlertCircle, Smartphone, Building2,
  ShieldCheck, RefreshCw, Plus, Pencil, Wallet, IndianRupee, Send
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

// ─── Types ───────────────────────────────────────────────────────────
interface PayoutMethod {
  upi_id: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_holder_name: string | null;
  bank_name: string | null;
  has_upi: boolean;
  has_bank: boolean;
}

type PanelMode = null | "upi" | "bank" | "withdraw";

// ─── Helpers ─────────────────────────────────────────────────────────
function maskUpi(upi: string): string {
  const parts = upi.split("@");
  if (parts.length < 2) return upi;
  const name = parts[0];
  const masked = name.length > 3 ? name.slice(0, 3) + "••••" : name;
  return `${masked}@${parts[1]}`;
}

function maskAccount(acc: string): string {
  if (!acc || acc.length < 4) return acc;
  return "••••" + acc.slice(-4);
}

export default function Payouts() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId, logout } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({ available: 0, totalEarned: 0, pending: 0 });

  // Payout method state
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [saving, setSaving] = useState(false);

  // UPI form
  const [upiId, setUpiId] = useState("");

  // Bank form
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankName, setBankName] = useState("");

  // Withdraw form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawTo, setWithdrawTo] = useState<"upi" | "bank">("upi");
  const [withdrawing, setWithdrawing] = useState(false);

  // ─── Fetch transactions ────────────────────────────────────────────
  const fetchPayouts = useCallback(async () => {
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
  }, [workerId, phoneNumber]);

  // ─── Fetch payout method ───────────────────────────────────────────
  const fetchPayoutMethod = useCallback(async () => {
    if (!workerId) return;
    try {
      const res = await api.get<PayoutMethod>(`/workers/${workerId}/payout-method/`);
      setPayoutMethod(res);
    } catch {
      // Silently fail - means no payout method set
      setPayoutMethod({ upi_id: null, bank_account_number: null, bank_ifsc: null, bank_holder_name: null, bank_name: null, has_upi: false, has_bank: false });
    }
  }, [workerId]);

  useEffect(() => {
    fetchPayouts();
    fetchPayoutMethod();
  }, [fetchPayouts, fetchPayoutMethod]);

  // ─── Open panel ────────────────────────────────────────────────────
  const openPanel = (mode: PanelMode) => {
    if (mode === "upi" && payoutMethod?.upi_id) {
      setUpiId(payoutMethod.upi_id);
    } else {
      setUpiId("");
    }
    if (mode === "bank" && payoutMethod?.bank_account_number) {
      setBankAccount(payoutMethod.bank_account_number);
      setBankIfsc(payoutMethod.bank_ifsc || "");
      setBankHolder(payoutMethod.bank_holder_name || "");
      setBankName(payoutMethod.bank_name || "");
    } else {
      setBankAccount("");
      setBankIfsc("");
      setBankHolder("");
      setBankName("");
    }
    setPanelMode(mode);
  };

  const closePanel = () => setPanelMode(null);

  // ─── Save payout method ────────────────────────────────────────────
  const savePayoutMethod = async () => {
    if (!workerId) return;
    setSaving(true);
    try {
      if (panelMode === "upi") {
        await api.post<any>(`/workers/${workerId}/payout-method/`, {
          method_type: "upi",
          upi_id: upiId
        });
        toast.success("UPI ID saved successfully!");
      } else if (panelMode === "bank") {
        await api.post<any>(`/workers/${workerId}/payout-method/`, {
          method_type: "bank",
          bank_account_number: bankAccount,
          bank_ifsc: bankIfsc,
          bank_holder_name: bankHolder,
          bank_name: bankName
        });
        toast.success("Bank details saved successfully!");
      }
      await fetchPayoutMethod();
      closePanel();
    } catch (error: any) {
      toast.error(error.message || "Failed to save payout details");
    } finally {
      setSaving(false);
    }
  };

  // ─── CSV download ──────────────────────────────────────────────────
  const downloadStatement = () => {
    if (transactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }
    const headers = ["TXN Ref", "Date", "Details", "Amount", "Status"];
    const rows = transactions.map(txn => [
      txn.id, txn.date, txn.bank, txn.amount.replace('₹', ''), txn.status
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

  // ─── Withdraw handler ──────────────────────────────────────────────
  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid withdrawal amount");
      return;
    }
    if (amount > stats.available) {
      toast.error(`Insufficient balance. Available: ₹${stats.available.toFixed(2)}`);
      return;
    }
    if (withdrawTo === "upi" && !hasUpi) {
      toast.error("Please connect a UPI ID first");
      return;
    }
    if (withdrawTo === "bank" && !hasBank) {
      toast.error("Please add bank details first");
      return;
    }
    setWithdrawing(true);
    try {
      // Simulate withdrawal processing (in production, this would hit a real payment gateway)
      await new Promise(resolve => setTimeout(resolve, 2000));
      const destination = withdrawTo === "upi" 
        ? `UPI (${maskUpi(payoutMethod!.upi_id!)})` 
        : `Bank (${maskAccount(payoutMethod!.bank_account_number!)})`;
      toast.success(`₹${amount.toFixed(2)} withdrawal initiated to ${destination}`);
      setStats(prev => ({ ...prev, available: prev.available - amount }));
      setWithdrawAmount("");
      closePanel();
    } catch (error: any) {
      toast.error(error.message || "Withdrawal failed. Try again.");
    } finally {
      setWithdrawing(false);
    }
  };

  // ─── Computed state booleans ───────────────────────────────────────
  const hasUpi = payoutMethod?.has_upi ?? false;
  const hasBank = payoutMethod?.has_bank ?? false;
  const hasAnyMethod = hasUpi || hasBank;

  // ─── Loader ────────────────────────────────────────────────────────
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
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
              Earnings & Payouts
            </h2>
            <p className="text-[#434751] mt-3 font-medium text-lg">Manage your {platformName} income protection settlements.</p>
          </div>
          <div className="flex items-center space-x-3">
             {/* <button 
               onClick={() => {
                 if (!hasAnyMethod) {
                   toast.error("Connect a UPI ID or Bank Account first to withdraw");
                   return;
                 }
                 if (stats.available <= 0) {
                   toast.error("No available balance to withdraw");
                   return;
                 }
                 setWithdrawAmount("");
                 setWithdrawTo(hasUpi ? "upi" : "bank");
                 setPanelMode("withdraw");
               }}
               className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#16a34a] text-white rounded-full hover:bg-[#15803d] transition-all shadow-[0_12px_24px_-8px_rgba(22,163,74,0.3)] active:scale-[0.98] font-inter font-bold text-[11px] uppercase tracking-[0.1em]"
             >
               <Send size={16} />
               <span>Withdraw Money</span>
             </button> */}
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
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-[10px] font-inter font-bold uppercase tracking-widest text-[#bbf7d0]">
                      <ArrowUpRight size={14} className="mr-1" />
                      Protected by Zafby
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!hasAnyMethod) {
                          toast.error("Connect a UPI ID or Bank Account first");
                          return;
                        }
                        if (stats.available <= 0) {
                          toast.error("No available balance to withdraw");
                          return;
                        }
                        setWithdrawAmount("");
                        setWithdrawTo(hasUpi ? "upi" : "bank");
                        setPanelMode("withdraw");
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.1em] transition-all active:scale-[0.96]"
                    >
                      <Send size={12} />
                      Withdraw
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ─── PAYOUT METHODS SECTION ─────────────────────────────────── */}
        <div className="mb-12">
          <h2 className="text-2xl font-extrabold text-[#1b1c1b] mb-2">Settlement Methods</h2>
          <p className="text-[#434751] font-medium text-sm mb-8">
            {hasAnyMethod
              ? "Your connected settlement accounts for receiving claim payouts."
              : "Connect a UPI ID or bank account to receive instant claim payouts."
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── UPI Card ────────────────────────────────────────── */}
            <div className={cn(
              "relative rounded-[2rem] p-8 border transition-all overflow-hidden group",
              hasUpi
                ? "bg-gradient-to-br from-[#f0fdf4] to-[#ecfdf5] border-[#bbf7d0] shadow-[0_12px_36px_-8px_rgba(22,163,74,0.08)]"
                : "bg-white border-[#e4e2e0]/60 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.02)] hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)]"
            )}>
              {/* Decorative gradient blob */}
              {hasUpi && (
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#16a34a] rounded-full blur-[80px] opacity-10" />
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={cn(
                    "p-4 w-14 h-14 rounded-2xl flex items-center justify-center",
                    hasUpi ? "bg-[#16a34a]/10 text-[#16a34a]" : "bg-[#f5f3f1] text-[#a8aebf]"
                  )}>
                    <Smartphone size={28} />
                  </div>
                  {hasUpi && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16a34a]/10 rounded-full">
                      <CheckCircle2 size={12} className="text-[#16a34a]" />
                      <span className="text-[9px] font-inter font-bold uppercase tracking-widest text-[#16a34a]">Connected</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-extrabold text-[#1b1c1b] mb-1">UPI Settlement</h3>
                {hasUpi ? (
                  <p className="text-[#434751] font-medium text-sm mb-6">
                    Linked to <span className="font-bold text-[#1b1c1b]">{maskUpi(payoutMethod!.upi_id!)}</span>
                  </p>
                ) : (
                  <p className="text-[#a8aebf] font-medium text-sm mb-6">
                    No UPI ID connected yet. Add one for instant payouts.
                  </p>
                )}

                {/* Action button */}
                <button
                  onClick={() => openPanel("upi")}
                  className={cn(
                    "w-full h-14 rounded-2xl font-inter font-bold text-[11px] uppercase tracking-[0.12em] transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                    hasUpi
                      ? "bg-[#1b1c1b]/5 text-[#1b1c1b] hover:bg-[#1b1c1b]/10"
                      : "bg-[#004191] text-white hover:bg-[#002b63] shadow-[0_8px_24px_-4px_rgba(0,65,145,0.3)]"
                  )}
                >
                  {hasUpi ? (
                    <>
                      <RefreshCw size={14} />
                      Update UPI ID
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Connect UPI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Bank Card ───────────────────────────────────────── */}
            <div className={cn(
              "relative rounded-[2rem] p-8 border transition-all overflow-hidden group",
              hasBank
                ? "bg-gradient-to-br from-[#eff6ff] to-[#f0f4ff] border-[#bfdbfe] shadow-[0_12px_36px_-8px_rgba(0,65,145,0.08)]"
                : "bg-white border-[#e4e2e0]/60 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.02)] hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)]"
            )}>
              {hasBank && (
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#004191] rounded-full blur-[80px] opacity-10" />
              )}

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className={cn(
                    "p-4 w-14 h-14 rounded-2xl flex items-center justify-center",
                    hasBank ? "bg-[#004191]/10 text-[#004191]" : "bg-[#f5f3f1] text-[#a8aebf]"
                  )}>
                    <Building2 size={28} />
                  </div>
                  {hasBank && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004191]/10 rounded-full">
                      <CheckCircle2 size={12} className="text-[#004191]" />
                      <span className="text-[9px] font-inter font-bold uppercase tracking-widest text-[#004191]">Connected</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <h3 className="text-xl font-extrabold text-[#1b1c1b] mb-1">Bank Account</h3>
                {hasBank ? (
                  <p className="text-[#434751] font-medium text-sm mb-6">
                    {payoutMethod!.bank_name || "Bank"} — <span className="font-bold text-[#1b1c1b]">{maskAccount(payoutMethod!.bank_account_number!)}</span>
                  </p>
                ) : (
                  <p className="text-[#a8aebf] font-medium text-sm mb-6">
                    No bank account added. Add NEFT/IMPS details for payouts.
                  </p>
                )}

                {/* Action button */}
                <button
                  onClick={() => openPanel("bank")}
                  className={cn(
                    "w-full h-14 rounded-2xl font-inter font-bold text-[11px] uppercase tracking-[0.12em] transition-all active:scale-[0.98] flex items-center justify-center gap-2",
                    hasBank
                      ? "bg-[#1b1c1b]/5 text-[#1b1c1b] hover:bg-[#1b1c1b]/10"
                      : "bg-[#004191] text-white hover:bg-[#002b63] shadow-[0_8px_24px_-4px_rgba(0,65,145,0.3)]"
                  )}
                >
                  {hasBank ? (
                    <>
                      <RefreshCw size={14} />
                      Update Bank Details
                    </>
                  ) : (
                    <>
                      <Plus size={14} />
                      Add Bank Account
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
                {hasAnyMethod
                  ? "Your settlement account is active. Payouts are processed within 60 seconds of claim approval."
                  : "Connect your Bank or UPI ID for instant settlements within 60 seconds of any claim approval."
                }
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
            {!hasAnyMethod ? (
              <button
                onClick={() => openPanel("upi")}
                className="w-full h-16 mt-10 bg-white text-[#1b1c1b] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Connect Payout Method
              </button>
            ) : (
              <div className="mt-10 flex items-center gap-3 text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#bbf7d0]">
                <ShieldCheck size={16} />
                Settlement Active
              </div>
            )}
          </div>
        </div>
      </main>

      <MobileBottomNav />

      {/* ─── SLIDE-OVER PANEL ─────────────────────────────────────────── */}
      {panelMode && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closePanel}
          />

          {/* Panel */}
          <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-lg bg-[#fcf9f8] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
            {/* Panel Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#e4e2e0]/50">
              <div>
                <h3 className="text-xl font-extrabold text-[#1b1c1b]">
                  {panelMode === "upi"
                    ? (hasUpi ? "Update UPI ID" : "Connect UPI")
                    : panelMode === "bank"
                    ? (hasBank ? "Update Bank Account" : "Add Bank Account")
                    : "Withdraw Money"
                  }
                </h3>
                <p className="text-xs text-[#434751] mt-1 font-medium">
                  {panelMode === "upi"
                    ? "Enter your UPI ID to receive instant settlements."
                    : panelMode === "bank"
                    ? "Enter your NEFT/IMPS-enabled bank account details."
                    : "Transfer your available balance to your connected account."
                  }
                </p>
              </div>
              <button
                onClick={closePanel}
                className="p-3 rounded-2xl hover:bg-[#1b1c1b]/5 transition-colors"
              >
                <X size={20} className="text-[#434751]" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
              {panelMode === "upi" && (
                <>
                  {/* Security notice */}
                  <div className="flex items-start gap-3 p-5 bg-[#004191]/5 rounded-2xl border border-[#004191]/10">
                    <ShieldCheck size={20} className="text-[#004191] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#004191] uppercase tracking-wider">Encrypted & Secure</p>
                      <p className="text-[11px] text-[#434751] mt-0.5 leading-relaxed">
                        Your UPI ID is encrypted and stored securely. We never process payments without your approval.
                      </p>
                    </div>
                  </div>

                  {/* UPI ID input */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      UPI ID
                    </label>
                    <div className="relative">
                      <Smartphone size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a8aebf]" />
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        className="w-full h-16 pl-14 pr-5 text-base font-medium bg-white border border-[#e4e2e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004191]/20 focus:border-[#004191] transition-all text-[#1b1c1b] placeholder:text-[#c5c9d4]"
                      />
                    </div>
                    <p className="text-[11px] text-[#a8aebf] mt-2">
                      Supports Google Pay, PhonePe, Paytm, BHIM, and all UPI apps.
                    </p>
                  </div>

                  {/* UPI previews */}
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {["@oksbi", "@okaxis", "@ybl", "@paytm"].map((suffix) => (
                      <button
                        key={suffix}
                        onClick={() => {
                          const name = upiId.split("@")[0] || "";
                          setUpiId(name + suffix);
                        }}
                        className="h-11 bg-white border border-[#e4e2e0]/60 rounded-xl text-[10px] font-inter font-bold text-[#434751] hover:border-[#004191] hover:text-[#004191] transition-colors"
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {panelMode === "bank" && (
                <>
                  {/* Security notice */}
                  {/* <div className="flex items-start gap-3 p-5 bg-[#004191]/5 rounded-2xl border border-[#004191]/10">
                    <ShieldCheck size={20} className="text-[#004191] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#004191] uppercase tracking-wider">Bank-Grade Security</p>
                      <p className="text-[11px] text-[#434751] mt-0.5 leading-relaxed">
                        Your bank details are 256-bit encrypted and never shared with third parties.
                      </p>
                    </div>
                  </div> */}

                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={bankHolder}
                      onChange={(e) => setBankHolder(e.target.value)}
                      placeholder="As per bank passbook"
                      className="w-full h-14 px-5 text-base font-medium bg-white border border-[#e4e2e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004191]/20 focus:border-[#004191] transition-all text-[#1b1c1b] placeholder:text-[#c5c9d4]"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter account number"
                      maxLength={18}
                      className="w-full h-14 px-5 text-base font-medium bg-white border border-[#e4e2e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004191]/20 focus:border-[#004191] transition-all text-[#1b1c1b] placeholder:text-[#c5c9d4] tracking-widest font-mono"
                    />
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                      placeholder="e.g. SBIN0001234"
                      maxLength={11}
                      className="w-full h-14 px-5 text-base font-medium bg-white border border-[#e4e2e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004191]/20 focus:border-[#004191] transition-all text-[#1b1c1b] placeholder:text-[#c5c9d4] tracking-widest font-mono uppercase"
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      Bank Name <span className="text-[#a8aebf] normal-case">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full h-14 px-5 text-base font-medium bg-white border border-[#e4e2e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#004191]/20 focus:border-[#004191] transition-all text-[#1b1c1b] placeholder:text-[#c5c9d4]"
                    />
                  </div>
                </>
              )}

              {panelMode === "withdraw" && (
                <>
                  {/* Available balance display */}
                  <div className="bg-gradient-to-br from-[#004191] to-[#0058be] rounded-2xl p-6 text-white">
                    <p className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-blue-200 mb-1">Available Balance</p>
                    <h3 className="text-3xl font-extrabold tracking-tight">₹{stats.available.toFixed(2)}</h3>
                  </div>

                  {/* Amount input */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      Withdrawal Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-bold text-[#434751]">₹</span>
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        max={stats.available}
                        className="w-full h-16 pl-10 pr-5 text-2xl font-extrabold bg-white border border-[#e4e2e0] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#16a34a]/20 focus:border-[#16a34a] transition-all text-[#1b1c1b] placeholder:text-[#c5c9d4]"
                      />
                    </div>
                  </div>

                  {/* Quick amount buttons */}
                  <div className="grid grid-cols-4 gap-3">
                    {[100, 250, 500, stats.available].map((amt, idx) => (
                      <button
                        key={amt}
                        onClick={() => setWithdrawAmount(String(Math.min(amt, stats.available)))}
                        className={cn(
                          "h-11 rounded-xl text-[11px] font-inter font-bold transition-colors border",
                          idx === 3
                            ? "bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20 hover:bg-[#16a34a]/20"
                            : "bg-white text-[#434751] border-[#e4e2e0]/60 hover:border-[#004191] hover:text-[#004191]"
                        )}
                      >
                        {idx === 3 ? "MAX" : `₹${amt}`}
                      </button>
                    ))}
                  </div>

                  {/* Destination selector */}
                  <div>
                    <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] mb-3">
                      Transfer To
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* UPI option */}
                      <button
                        onClick={() => hasUpi && setWithdrawTo("upi")}
                        disabled={!hasUpi}
                        className={cn(
                          "relative p-5 rounded-2xl border-2 transition-all text-left",
                          withdrawTo === "upi" && hasUpi
                            ? "border-[#16a34a] bg-[#f0fdf4]"
                            : hasUpi
                            ? "border-[#e4e2e0] bg-white hover:border-[#a8aebf]"
                            : "border-[#e4e2e0]/40 bg-[#f5f3f1]/50 opacity-50 cursor-not-allowed"
                        )}
                      >
                        {withdrawTo === "upi" && hasUpi && (
                          <CheckCircle2 size={16} className="absolute top-3 right-3 text-[#16a34a]" />
                        )}
                        <Smartphone size={22} className={cn("mb-2", withdrawTo === "upi" && hasUpi ? "text-[#16a34a]" : "text-[#a8aebf]")} />
                        <p className="text-xs font-bold text-[#1b1c1b]">UPI</p>
                        <p className="text-[10px] text-[#434751] mt-0.5">
                          {hasUpi ? maskUpi(payoutMethod!.upi_id!) : "Not connected"}
                        </p>
                      </button>

                      {/* Bank option */}
                      <button
                        onClick={() => hasBank && setWithdrawTo("bank")}
                        disabled={!hasBank}
                        className={cn(
                          "relative p-5 rounded-2xl border-2 transition-all text-left",
                          withdrawTo === "bank" && hasBank
                            ? "border-[#004191] bg-[#eff6ff]"
                            : hasBank
                            ? "border-[#e4e2e0] bg-white hover:border-[#a8aebf]"
                            : "border-[#e4e2e0]/40 bg-[#f5f3f1]/50 opacity-50 cursor-not-allowed"
                        )}
                      >
                        {withdrawTo === "bank" && hasBank && (
                          <CheckCircle2 size={16} className="absolute top-3 right-3 text-[#004191]" />
                        )}
                        <Building2 size={22} className={cn("mb-2", withdrawTo === "bank" && hasBank ? "text-[#004191]" : "text-[#a8aebf]")} />
                        <p className="text-xs font-bold text-[#1b1c1b]">Bank Account</p>
                        <p className="text-[10px] text-[#434751] mt-0.5">
                          {hasBank ? `${payoutMethod!.bank_name || "Bank"} — ${maskAccount(payoutMethod!.bank_account_number!)}` : "Not added"}
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Processing time notice */}
                  <div className="flex items-start gap-3 p-5 bg-[#16a34a]/5 rounded-2xl border border-[#16a34a]/10">
                    <Zap size={20} className="text-[#16a34a] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-[#16a34a] uppercase tracking-wider">Instant Settlement</p>
                      <p className="text-[11px] text-[#434751] mt-0.5 leading-relaxed">
                        {withdrawTo === "upi"
                          ? "UPI transfers are processed within 60 seconds."
                          : "Bank NEFT/IMPS transfers are processed within 2-4 hours."
                        }
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-8 py-6 border-t border-[#e4e2e0]/50 bg-white/80 backdrop-blur-sm">
              {panelMode === "withdraw" ? (
                <>
                  <button
                    onClick={handleWithdraw}
                    disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    className="w-full h-16 bg-[#16a34a] text-white font-inter font-bold text-[12px] uppercase tracking-[0.12em] rounded-2xl hover:bg-[#15803d] transition-all active:scale-[0.98] shadow-[0_12px_24px_-8px_rgba(22,163,74,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Withdraw ₹{withdrawAmount ? parseFloat(withdrawAmount).toFixed(2) : "0.00"}
                      </>
                    )}
                  </button>
                  <button
                    onClick={closePanel}
                    className="w-full h-12 mt-3 text-[#434751] font-inter font-bold text-[11px] uppercase tracking-[0.12em] rounded-2xl hover:bg-[#f5f3f1] transition-all"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={savePayoutMethod}
                    disabled={saving}
                    className="w-full h-16 bg-[#004191] text-white font-inter font-bold text-[12px] uppercase tracking-[0.12em] rounded-2xl hover:bg-[#002b63] transition-all active:scale-[0.98] shadow-[0_12px_24px_-8px_rgba(0,65,145,0.3)] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        {panelMode === "upi"
                          ? (hasUpi ? "Update UPI ID" : "Save UPI ID")
                          : (hasBank ? "Update Bank Details" : "Save Bank Details")
                        }
                      </>
                    )}
                  </button>
                  <button
                    onClick={closePanel}
                    className="w-full h-12 mt-3 text-[#434751] font-inter font-bold text-[11px] uppercase tracking-[0.12em] rounded-2xl hover:bg-[#f5f3f1] transition-all"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
