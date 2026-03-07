import Sidebar from "@/components/Sidebar";
import { Check, X, Eye, Clock, AlertTriangle, FileText, Download, Filter, Search, ArrowRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const claims = [
  { id: "CLM-98766", worker: "Sunita Sharma", type: "Weather Impact", date: "May 14, 2024", amount: "₹800", status: "Pending", evidence: "Verified" },
  { id: "CLM-98767", worker: "Rajesh Kumar", type: "Traffic Delay", date: "May 15, 2024", amount: "₹1,200", status: "Reviewing", evidence: "Pending" },
  { id: "CLM-98768", worker: "Amit Patel", type: "Disruption", date: "May 15, 2024", amount: "₹500", status: "Pending", evidence: "Verified" },
  { id: "CLM-98769", worker: "Priya Singh", type: "Weather Impact", date: "May 16, 2024", amount: "₹2,000", status: "Pending", evidence: "Under Review" },
];

export default function AdminClaims() {
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => {
      setScrolled(el.scrollTop > 20);
    };
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

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
              { label: "Pending Approval", value: "42", icon: Clock, color: "bg-blue-50/50", iconColor: "text-blue-600" },
              { label: "Flagged Claims", value: "8", icon: AlertTriangle, color: "bg-orange-50/50", iconColor: "text-orange-600" },
              { label: "Auto-Processed Today", value: "156", icon: Check, color: "bg-green-50/50", iconColor: "text-green-600" },
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
                    <th className="px-10 py-6">Verify Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map((claim) => (
                    <tr key={claim.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                      <td className="px-10 py-7">
                        <div>
                          <p className="text-base font-black text-gray-900 group-hover:translate-x-1 transition-transform">{claim.id}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{claim.worker}</p>
                        </div>
                      </td>
                      <td className="px-10 py-7">
                        <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg">{claim.type}</span>
                      </td>
                      <td className="px-10 py-7 text-xs font-bold text-gray-400">{claim.date}</td>
                      <td className="px-10 py-7 font-black text-gray-900">{claim.amount}</td>
                      <td className="px-10 py-7">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${claim.evidence === "Verified" ? "bg-green-50 text-green-700" :
                          claim.evidence === "Pending" ? "bg-yellow-50 text-yellow-700" :
                            "bg-blue-50 text-blue-700"
                          }`}>
                          {claim.evidence}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-black hover:text-white transition-all transform group-hover:-translate-x-1" title="Approve">
                            <Check size={18} />
                          </button>
                          <button className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-black hover:text-white transition-all transform group-hover:-translate-x-1" title="Reject" style={{ transitionDelay: '50ms' }}>
                            <X size={18} />
                          </button>
                          <button className="p-3 bg-gray-100 text-gray-400 rounded-xl hover:bg-black hover:text-white transition-all transform group-hover:-translate-x-1" title="View Details" style={{ transitionDelay: '100ms' }}>
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
