import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Search, Filter, MoreVertical, Globe, UserCheck, UserX, ArrowRight, UserPlus, 
  Loader2, ShieldAlert, Zap
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/context/AdminAuthContext";

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
  status?: string; 
  risk?: string;   
}

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await api.get<Worker[]>("/admin/workers/");
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
            <Link to="/admin/workers" className="text-white relative after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-1 after:bg-[#ba1a1a]">Workers</Link>
            <Link to="/admin/claims" className="text-[#a8aebf] hover:text-white transition-colors">Claims</Link>
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
            <h1 className="text-4xl font-extrabold tracking-tight text-[#1b1c1b]">Worker Registry</h1>
            <p className="text-[#434751] mt-1 font-medium text-lg">Manage active platform partners & accounts.</p>
          </div>
          <button className="flex items-center justify-center space-x-2 px-8 py-4 bg-[#1b1c1b] text-white rounded-full hover:bg-[#ba1a1a] transition-all shadow-[0_12px_24px_-8px_rgba(27,28,27,0.3)] active:scale-[0.98] font-inter font-bold text-[11px] uppercase tracking-[0.1em]">
            <UserPlus size={18} />
            <span>Add Worker</span>
          </button>
        </div>

        <div className="bg-[#ffffff] rounded-[3rem] border border-[#e4e2e0]/50 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.04)] overflow-hidden flex flex-col">
          
          <div className="p-8 md:p-10 border-b border-[#e4e2e0]/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#fcf9f8]/30">
            <div className="relative flex-1 max-w-2xl">
              <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#a8aebf]" />
              <input
                type="text"
                placeholder="Search by name, ID or phone..."
                className="w-full pl-16 pr-6 py-5 bg-[#ffffff] border border-[#e4e2e0] rounded-full text-[15px] font-bold text-[#1b1c1b] placeholder:text-[#a8aebf] focus:ring-2 focus:ring-[#004191] focus:border-transparent transition-all outline-none shadow-sm"
              />
            </div>
            <div className="flex justify-between items-center gap-4 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
              <button className="whitespace-nowrap flex items-center space-x-2 px-6 py-4 bg-[#f5f3f1] text-[#434751] hover:text-[#1b1c1b] hover:bg-[#e4e2e0] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] transition-all">
                <Filter size={18} />
                <span>Platform: All</span>
              </button>
              <button className="whitespace-nowrap flex items-center space-x-2 px-6 py-4 bg-[#f5f3f1] text-[#434751] hover:text-[#1b1c1b] hover:bg-[#e4e2e0] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] transition-all">
                <Globe size={18} />
                <span>Zone: All</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar min-h-[400px] flex flex-col bg-[#ffffff]">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
                <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">Syncing Worker Data...</p>
              </div>
            ) : (
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] bg-[#fcf9f8]/80 border-b border-[#e4e2e0]/50">
                    <th className="px-10 py-6">Worker Profile</th>
                    <th className="px-10 py-6">Platform</th>
                    <th className="px-10 py-6">Risk Index</th>
                    <th className="px-10 py-6">Active Since</th>
                    <th className="px-10 py-6">Status</th>
                    <th className="px-10 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2e0]/40">
                  {workers.map((worker) => (
                    <tr key={worker.id} className="group hover:bg-[#fcf9f8] transition-colors cursor-pointer">
                      <td className="px-10 py-6 md:py-8">
                        <div className="flex items-center space-x-6">
                          <div className="w-14 h-14 bg-[#f5f3f1] border border-[#e4e2e0] rounded-[1.5rem] flex items-center justify-center font-extrabold text-[#1b1c1b] text-lg group-hover:bg-[#004191] group-hover:text-white transition-all transform group-hover:scale-105 group-hover:rotate-3 shadow-sm">
                            {worker.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div>
                            <p className="text-lg font-extrabold text-[#1b1c1b]">{worker.name}</p>
                            <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mt-1">{worker.partner_id || worker.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 md:py-8">
                        <span className="px-4 py-2 bg-[#f5f3f1] border border-[#e4e2e0]/80 text-[10px] font-inter font-bold text-[#434751] uppercase tracking-[0.15em] rounded-full">
                          {worker.platform}
                        </span>
                      </td>
                      <td className="px-10 py-6 md:py-8">
                        <div className="flex items-center space-x-3">
                          <div className={cn("w-2 h-2 rounded-full",
                            worker.risk === "Low" ? "bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.6)]" :
                            worker.risk === "Medium" ? "bg-[#d97706] shadow-[0_0_8px_rgba(217,119,6,0.6)]" : "bg-[#ba1a1a] shadow-[0_0_8px_rgba(186,26,26,0.6)]"
                          )} />
                          <span className={cn("text-[11px] font-inter font-bold uppercase tracking-[0.15em]",
                            worker.risk === "Low" ? "text-[#16a34a]" :
                            worker.risk === "Medium" ? "text-[#d97706]" : "text-[#ba1a1a]"
                          )}>
                            {worker.risk}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 md:py-8 text-sm font-bold text-[#434751]">
                        {new Date(worker.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-10 py-6 md:py-8">
                        <div className="flex items-center space-x-2">
                           <span className={cn(
                             "px-4 py-1.5 flex items-center space-x-2 rounded-full text-[10px] font-inter font-bold uppercase tracking-widest",
                             worker.status === "Active" ? "bg-[#e2f5e9] text-[#16a34a]" : "bg-[#ffdad6]/40 text-[#ba1a1a]"
                           )}>
                             {worker.status === "Active" ? <UserCheck size={14} /> : <UserX size={14} />}
                             <span>{worker.status}</span>
                           </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 md:py-8 text-right">
                        <button className="w-12 h-12 inline-flex items-center justify-center bg-[#f5f3f1] text-[#434751] hover:bg-[#1b1c1b] hover:text-white rounded-[1.5rem] transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 shadow-sm">
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {workers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-10 py-32 text-center">
                        <UserX size={48} className="mx-auto text-[#e4e2e0] mb-4" />
                        <p className="text-sm font-inter font-bold text-[#a8aebf] uppercase tracking-widest">No workers found in registry.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="p-8 md:p-10 bg-[#fcf9f8]/50 border-t border-[#e4e2e0]/50 flex sm:flex-row flex-col justify-between items-center gap-6">
            <p className="text-[11px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em]">Page 1 of 4,978</p>
            <div className="flex items-center space-x-4">
              <button className="px-8 py-4 bg-[#ffffff] border border-[#e4e2e0] text-[#a8aebf] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full cursor-not-allowed hidden sm:block">Previous</button>
              <button className="px-8 py-4 bg-[#ffffff] border border-[#e4e2e0] text-[#1b1c1b] hover:bg-[#f5f3f1] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full transition-colors shadow-sm w-full sm:w-auto">Next Page</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
