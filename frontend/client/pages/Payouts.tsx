import Sidebar from "@/components/Sidebar";
import { DollarSign, ArrowUpRight, ArrowDownRight, Download, Calendar, ArrowRight, Zap, Target, Phone, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function Payouts() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    available: 0,
    totalEarned: 0,
    pending: 0
  });
  const mainRef = useRef<HTMLElement>(null);

  const fetchPayouts = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const response = await api.get<any>(`/claims/history/?worker_id=${workerId}`);
      const claims = response.claims || [];
      
      const txns = claims.map((c: any) => ({
        id: `TXN-${c.claim_id.split('-')[0].toUpperCase()}`,
        amount: `₹${c.compensation}`,
        date: new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
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
        available: totalEarned * 0.2, // Mock available for demo
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
  }, [workerId]);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  const getPlatformColor = (id: string) => {
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
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Syncing Payout Hub...</h2>
      </div>
    );
  }

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
                {platformName} Payouts
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">{username}'s earnings</p>
              {phoneNumber && (
                <div className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                  <Phone size={12} className="text-blue-600" />
                  <span>{phoneNumber}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-200 text-gray-400 hover:text-black hover:border-black rounded-2xl transition-all shadow-sm">
                <Download size={18} />
                <span className="text-xs font-black uppercase tracking-widest">History</span>
              </button>
              <button 
                onClick={() => toast.success("Settlement request sent!")}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95">
                <Target size={18} />
                <span className="text-sm font-bold">Withdraw</span>
              </button>
            </div>
          </div>
        </header>

        <div className="section-padding space-y-12">
          {/* Dashboard Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: "Available for Withdrawal", value: `₹${stats.available.toFixed(0)}`, icon: Zap, color: "bg-blue-600", textColor: "text-white" },
              { label: "Total Earned", value: `₹${stats.totalEarned.toFixed(0)}`, icon: DollarSign, color: "bg-white", textColor: "text-gray-900" },
              { label: "Pending Payouts", value: `₹${stats.pending.toFixed(0)}`, icon: Calendar, color: "bg-white", textColor: "text-gray-900" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "p-10 rounded-[2.5rem] border border-gray-100 group transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer reveal active",
                  stat.color, stat.textColor, stat.color === "bg-white" ? "hover:bg-black hover:text-white" : "hover:brightness-110"
                )}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={cn("p-4 w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-all",
                  stat.color === "bg-white" ? "bg-gray-50 text-gray-900 group-hover:bg-white/10 group-hover:text-white" : "bg-white/10 text-white"
                )}>
                  <stat.icon size={28} />
                </div>
                <div>
                  <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    stat.color === "bg-white" ? "text-gray-400 group-hover:text-gray-500" : "text-white/60"
                  )}>{stat.label}</p>
                  <h3 className="text-4xl font-black mt-2 tracking-tight">{stat.value}</h3>
                  <div className="mt-6 flex items-center space-x-2">
                    <div className={cn("flex items-center text-[10px] font-black uppercase tracking-widest",
                      stat.color === "bg-white" ? "text-green-600 group-hover:text-green-400" : "text-white/80"
                    )}>
                      <ArrowUpRight size={14} className="mr-1" />
                      Protected by EarnLock
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent History Table */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active" style={{ transitionDelay: "300ms" }}>
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-black tracking-tight">Recent Transfers</h2>
                <button className="text-xs font-black text-blue-600 uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center space-x-2">
                  <span>View All</span>
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                      <th className="px-8 py-5">TXN ID</th>
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Bank</th>
                      <th className="px-8 py-5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-8 py-20 text-center">
                          <p className="text-gray-400 font-bold uppercase tracking-widest">No transfers yet</p>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((txn, i) => (
                        <tr key={txn.id} className="group hover:bg-gray-50/80 transition-all cursor-pointer">
                          <td className="px-8 py-7">
                            <p className="font-black text-gray-900 group-hover:translate-x-1 transition-transform">{txn.id}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{txn.type}</p>
                          </td>
                          <td className="px-8 py-7 text-xs font-bold text-gray-500">{txn.date}</td>
                          <td className="px-8 py-7 text-xs font-bold text-gray-400">{txn.bank}</td>
                          <td className="px-8 py-7 text-right">
                            <p className="font-black text-gray-900 text-lg">{txn.amount}</p>
                            <span className={cn(
                              "px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded",
                              txn.status === 'Success' ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"
                            )}>{txn.status}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-8 reveal active" style={{ transitionDelay: "400ms" }}>
              <div className="bg-gradient-to-br from-indigo-900 to-black rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between min-h-[400px]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full -mr-10 -mt-10 blur-[80px] opacity-30" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-6 leading-tight">Fast-Track Your Payouts</h3>
                  <p className="text-gray-400 font-medium text-sm leading-relaxed mb-8">
                    Connect your UPI ID for instant settlements within 60 seconds of claim approval.
                  </p>
                  <div className="space-y-4">
                    {["Instant Settlements", "Zero Transfer Fees", "Tax Invoices Generated"].map((info) => (
                      <div key={info} className="flex items-center space-x-3">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="text-xs font-bold text-gray-300">{info}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button className="w-full h-14 mt-10 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all active:scale-95 shadow-xl">
                  Connect UPI
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
