import Sidebar from "@/components/Sidebar";
import { Search, Filter, MoreVertical, Shield, Smartphone, Globe, UserCheck, UserX, ArrowRight, UserPlus, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

interface Worker {
  id: string;
  name: string;
  platform: string;
  partner_id: string;
  city: string;
  zone: string;
  avg_daily_income: number;
  is_verified: boolean;
  onboarding_completed: boolean;
  created_at: string;
  status?: string; // Derived or extra field
  risk?: string;   // Derived or extra field
}

export default function AdminWorkers() {
  const [scrolled, setScrolled] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await api.get<Worker[]>("/admin/workers/");
      // Add mock fields for UI if they don't exist in backend response
      const enhancedWorkers = data.map(w => ({
        ...w,
        status: w.onboarding_completed ? "Active" : "Pending",
        risk: w.is_verified ? "Low" : "High"
      }));
      setWorkers(enhancedWorkers);
    } catch (error: any) {
      console.error("Failed to fetch workers:", error);
      toast.error("Failed to load worker registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

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
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter">Worker Registry</h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Manage 24.8k active platform partners</p>
            </div>
            <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95">
              <UserPlus size={20} />
              <span className="text-sm font-bold">Add Worker</span>
            </button>
          </div>
        </header>

        <div className="section-padding space-y-10">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden reveal active">
            <div className="p-8 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-xl">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID or phone..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-[1.5rem] text-sm font-bold placeholder:text-gray-400 focus:ring-2 focus:ring-black transition-all"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-6 py-4 bg-gray-50 text-gray-400 hover:text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                  <Filter size={16} />
                  <span>Platform: All</span>
                </button>
                <button className="flex items-center space-x-2 px-6 py-4 bg-gray-50 text-gray-400 hover:text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                  <Globe size={16} />
                  <span>Zone: All</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto no-scrollbar min-h-[400px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Syncing Worker Data...</p>
                </div>
              ) : (
                <table className="w-full text-left whitespace-nowrap">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 bg-gray-50/50">
                      <th className="px-10 py-6">Worker Profile</th>
                      <th className="px-10 py-6">Platform</th>
                      <th className="px-10 py-6">Risk Index</th>
                      <th className="px-10 py-6">Active Since</th>
                      <th className="px-10 py-6">Status</th>
                      <th className="px-10 py-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {workers.map((worker) => (
                      <tr key={worker.id} className="group hover:bg-gray-50/50 transition-all cursor-pointer">
                        <td className="px-10 py-7">
                          <div className="flex items-center space-x-5">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-black group-hover:text-white transition-all transform group-hover:rotate-6">
                              {worker.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-base font-black text-gray-900 group-hover:translate-x-1 transition-transform">{worker.name}</p>
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{worker.partner_id || worker.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-7">
                          <span className="px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-lg">{worker.platform}</span>
                        </td>
                        <td className="px-10 py-7">
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full",
                              worker.risk === "Low" ? "bg-green-500" :
                                worker.risk === "Medium" ? "bg-orange-500" : "bg-red-500"
                            )} />
                            <span className={cn("text-xs font-black uppercase tracking-widest",
                              worker.risk === "Low" ? "text-green-600" :
                                worker.risk === "Medium" ? "text-orange-600" : "text-red-600"
                            )}>
                              {worker.risk}
                            </span>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-xs font-bold text-gray-400">
                          {new Date(worker.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-10 py-7">
                          <div className={cn("flex items-center space-x-2", worker.status === "Active" ? "text-green-600" : "text-red-500")}>
                            {worker.status === "Active" ? <UserCheck size={16} /> : <UserX size={16} />}
                            <span className="text-xs font-black uppercase tracking-widest">{worker.status}</span>
                          </div>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <button className="p-3 bg-gray-50 text-gray-300 hover:bg-black hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0">
                            <ArrowRight size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {workers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-10 py-20 text-center">
                          <p className="text-sm font-bold text-gray-400 italic">No workers found in registry.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Page 1 of 4,978</p>
              <div className="flex items-center space-x-3">
                <button className="px-6 py-3 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-xl text-gray-300 cursor-not-allowed">Prev</button>
                <button className="px-6 py-3 bg-white border border-gray-200 text-[10px] font-black uppercase tracking-widest rounded-xl text-gray-400 hover:text-black hover:border-black transition-all">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
