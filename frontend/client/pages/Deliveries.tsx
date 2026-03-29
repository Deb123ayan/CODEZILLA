import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Package, MapPin, Clock, Play, AlertCircle, CheckCircle, Shield, RefreshCw,
  AlertTriangle, Loader2, ShieldAlert, Navigation, DollarSign, ChevronRight
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function Deliveries() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [cancelType, setCancelType] = useState("RAIN");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingWeather, setCheckingWeather] = useState(false);

  const fetchDeliveries = async () => {
    if (!workerId && !phoneNumber) return;
    const pid = workerId || phoneNumber;
    setLoading(true);
    try {
      const res = await api.get<any[]>(`/deliveries/?worker_id=${pid}`);
      setDeliveries(res);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      toast.error("Error loading deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, [workerId, phoneNumber]);

  useEffect(() => {
    if (isModalOpen && cancelType) {
      preCheckWeather(cancelType);
    }
  }, [cancelType, isModalOpen]);

  const preCheckWeather = async (type: string) => {
    setCheckingWeather(true);
    try {
      const workerPhone = phoneNumber || sessionStorage.getItem("userPhone");
      const res = await api.post<any>("/weather/verify-claim/", {
        phone: workerPhone,
        claimed_reason: type
      });
      setVerificationStatus(res);
    } catch (err) {
      console.error("Manual verification failed", err);
    } finally {
      setCheckingWeather(false);
    }
  };

  const cancelTypes = [
    { label: "Heavy Rain", value: "RAIN" },
    { label: "Extreme Heat", value: "HEAT" },
    { label: "Severe Traffic", value: "TRAFFIC" },
    { label: "Storm/Wind", value: "STORM" },
    { label: "Air Pollution", value: "AQI" },
    { label: "Other", value: "OTHER" },
  ];

  const handleAction = async (deliveryId: string, action: string, data: any = {}) => {
    try {
      setSubmitting(true);
      const res = await api.post<any>(`/deliveries/${deliveryId}/${action}/`, data);

      if (action === "cancel" && res.automated_claim) {
        const { status, compensation, audit_summary } = res.automated_claim;
        if (status === 'AUTO_APPROVED') {
          toast.success(`Verified! Claim Approved. ₹${compensation} added to wallet.`);
        } else if (status === 'PENDING_REVIEW') {
          toast.warning(`Claim Flagged: ${res.verification || "Weather discrepancy detected. Manual review required."}`);
        } else {
          toast.error("Claim Rejected by AI Risk Engine.");
        }
      } else {
        toast.success(res.message || `Delivery marked as ${action}`);
      }

      setIsModalOpen(false);
      fetchDeliveries();
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED": return "bg-[#d8e2ff] text-[#004191] border-[#aec6ff]/50";
      case "ONGOING": return "bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]";
      case "COMPLETED": return "bg-[#e2f5e9] text-[#16a34a] border-[#16a34a]/30";
      case "CANCELLED": return "bg-[#f5f3f1] text-[#434751] border-[#e4e2e0]";
      case "RETRYING": return "bg-[#f3e8ff] text-[#9333ea] border-[#9333ea]/30";
      default: return "bg-[#f5f3f1] text-[#434751] border-[#e4e2e0]";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Loading Tasks...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">
      
      <DashboardHeader />

      {/* Disruption Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#1b1c1b]/40 backdrop-blur-sm" onClick={() => !submitting && setIsModalOpen(false)} />
          <div className="relative bg-[#ffffff] w-full max-w-xl rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(27,28,27,0.12)] border border-[#e4e2e0]/50 animate-in zoom-in-95 duration-300">
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-[#ffdad6]/50 text-[#ba1a1a] rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Report Disruption</h2>
              <p className="text-[#434751] font-inter text-[10px] font-bold uppercase tracking-[0.1em] mt-2">AI verifies weather & traffic context instantly.</p>
            </div>

            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] ml-2">Disruption Type</label>
                <div className="grid grid-cols-2 gap-3">
                  {cancelTypes.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setCancelType(r.value)}
                      className={cn(
                        "px-4 py-4 rounded-2xl text-xs font-bold transition-all border-2 text-left font-manrope",
                        cancelType === r.value
                          ? "bg-[#1b1c1b] text-white border-[#1b1c1b] shadow-md scale-[1.02]"
                          : "bg-[#f5f3f1] text-[#434751] border-transparent hover:border-[#e4e2e0]"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {checkingWeather ? (
                <div className="bg-[#f0f4ff] p-4 rounded-2xl flex items-center space-x-3 border border-[#aec6ff]/40">
                  <Loader2 className="animate-spin text-[#004191]" size={18} />
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#004191]">AI Radar Scanning Location...</span>
                </div>
              ) : (verificationStatus && cancelType !== 'OTHER') && (
                <div className={cn(
                  "p-4 rounded-2xl flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 border transition-all duration-500",
                  verificationStatus.claim_verified ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]" : "bg-[#fffbeb] border-[#fde68a] text-[#92400e]"
                )}>
                  <div className="p-3 bg-white/60 rounded-xl shrink-0 self-start md:self-center">
                    {verificationStatus.claim_verified ? <CheckCircle size={24} className="text-[#166534]" /> : <ShieldAlert size={24} className="text-[#92400e]" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold tracking-tight mb-1">
                      {verificationStatus.claim_verified ? "Disruption Detected" : "Verification Discrepancy"}
                    </p>
                    <p className="text-[11px] font-medium opacity-90 leading-tight">
                      {verificationStatus.claim_verified
                        ? `Radar confirmed ${verificationStatus.actual_weather?.description || 'conditions'}.`
                        : `shows ${verificationStatus.actual_weather?.description || 'clear'} conditions. Manual review required.`}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] ml-2">Additional Details (Optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full bg-[#f5f3f1] border-none rounded-2xl p-6 text-sm font-medium min-h-[100px] focus:ring-2 focus:ring-[#004191]/20 focus:bg-white transition-all text-[#1b1c1b] placeholder:text-[#a8aebf] outline-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                 <button
                   type="button"
                   disabled={submitting}
                   onClick={() => setIsModalOpen(false)}
                   className="w-full md:w-auto px-8 py-5 border border-[#e4e2e0] text-[#434751] font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:bg-[#f5f3f1] transition-all"
                 >
                   Back
                 </button>
                 <button
                   onClick={() => handleAction(selectedDelivery.id, "cancel", { cancel_type: cancelType, reason: cancelReason })}
                   disabled={submitting}
                   className="w-full flex-1 px-8 py-5 bg-[#ba1a1a] text-white font-inter font-bold text-[11px] uppercase tracking-[0.15em] rounded-full hover:opacity-90 transition-all shadow-lg shadow-[#ba1a1a]/20 active:scale-[0.98] flex items-center justify-center space-x-3"
                 >
                   {submitting ? <Loader2 className="animate-spin" size={18} /> : <span>Confirm Cancellation</span>}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1b1c1b]">
              Assigned Tasks
            </h1>
            <p className="text-[#434751] mt-2 font-medium text-lg">Manage your {platformName} routes.</p>
          </div>
          <button
            onClick={fetchDeliveries}
            className="flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-widest text-[#004191] bg-[#004191]/5 px-4 py-2 rounded-full hover:bg-[#004191]/10 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Status Count Bento */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: "Assigned", count: deliveries.filter(d => d.status === 'ASSIGNED' || d.status === 'PENDING').length, color: "text-[#004191]" },
            { label: "Ongoing", count: deliveries.filter(d => d.status === 'ONGOING').length, color: "text-[#d97706]" },
            { label: "Completed", count: deliveries.filter(d => d.status === 'COMPLETED').length, color: "text-[#16a34a]" },
            { label: "Cancelled", count: deliveries.filter(d => d.status === 'CANCELLED' || d.status === 'FAILED').length, color: "text-[#ba1a1a]" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-[#ffffff] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center border border-[#e4e2e0]/50 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.02)]"
            >
              <div className={cn("text-4xl font-extrabold mb-2", stat.color)}>{stat.count}</div>
              <div className="text-[10px] font-inter font-bold uppercase tracking-[0.1em] text-[#434751] text-center">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Deliveries Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {deliveries.length === 0 ? (
             <div className="col-span-full py-24 bg-[#f5f3f1] rounded-[3rem] border border-dashed border-[#c3c6d3] flex flex-col items-center justify-center space-y-4">
               <Package className="text-[#a8aebf]" size={48} />
               <h3 className="text-xl font-bold tracking-tight text-[#1b1c1b]">No routes currently.</h3>
               <p className="text-sm font-medium text-[#434751]">New requests will appear here automatically.</p>
             </div>
          ) : (
            deliveries.map((delivery: any) => (
              <div
                key={delivery.id}
                className={cn(
                  "bg-[#ffffff] rounded-[3rem] border p-8 md:p-10 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] flex flex-col transition-all hover:-translate-y-1",
                  delivery.status === 'ONGOING' ? "border-[#004191]/30 ring-4 ring-[#004191]/5" : "border-[#e4e2e0]/30"
                )}
              >
                {/* Status bar */}
                <div className="flex justify-between items-start mb-8">
                  <div className="p-4 bg-[#f5f3f1] rounded-2xl">
                     <Package className="text-[#004191]" size={28} />
                  </div>
                  <div className={cn("px-4 py-2 rounded-full text-[10px] font-inter font-bold uppercase tracking-[0.1em] border", getStatusColor(delivery.status))}>
                    {delivery.status}
                  </div>
                </div>

                {/* Info block */}
                <div className="flex-1">
                  <h3 className="text-2xl font-extrabold text-[#1b1c1b] mb-4">
                    {delivery.products?.[0]?.name || "Package Delivery"}
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                     <div className="flex items-center space-x-3 text-[#434751]">
                       <MapPin size={18} className="text-[#004191]" />
                       <span className="text-sm font-bold leading-tight line-clamp-2">{delivery.location}</span>
                     </div>
                     <div className="flex items-center space-x-3 text-[#434751]">
                       <DollarSign size={18} className="text-[#16a34a]" />
                       <span className="text-sm font-bold leading-tight">Order Value: ₹{delivery.amount}</span>
                     </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-6 border-t border-[#e4e2e0]/50 flex flex-col md:flex-row gap-4 mt-auto">
                  {(delivery.status === 'ASSIGNED' || delivery.status === 'PENDING') && (
                    <button
                      onClick={() => handleAction(delivery.id, "start")}
                      disabled={deliveries.some((d: any) => d.status === 'ONGOING')}
                      className={cn(
                        "w-full py-5 rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2",
                        deliveries.some((d: any) => d.status === 'ONGOING')
                          ? "bg-[#f5f3f1] text-[#a8aebf] cursor-not-allowed"
                          : "bg-[#1b1c1b] text-white hover:bg-[#004191] active:scale-[0.98] shadow-lg shadow-[#1b1c1b]/10"
                      )}
                    >
                      <Play size={16} className="fill-current" />
                      <span>Start Route</span>
                    </button>
                  )}

                  {delivery.status === 'ONGOING' && (
                    <>
                      <button
                        onClick={() => handleAction(delivery.id, "complete")}
                        className="w-full flex-1 py-5 bg-gradient-to-br from-[#166534] to-[#15803d] text-white rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-[0_12px_24px_-8px_rgba(22,101,52,0.4)]"
                      >
                        <CheckCircle size={16} />
                        <span>Finish</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDelivery(delivery);
                          setIsModalOpen(true);
                        }}
                        className="w-full flex-1 py-5 border border-[#ba1a1a]/30 text-[#ba1a1a] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-[#ffdad6]/20 transition-all flex items-center justify-center gap-2"
                      >
                        <AlertCircle size={16} />
                        <span>Issue?</span>
                      </button>
                    </>
                  )}

                  {(delivery.status === 'COMPLETED' || delivery.status === 'CANCELLED') && (
                    <div className="w-full py-4 bg-[#f5f3f1] rounded-full flex justify-center items-center gap-2 opacity-70">
                       <Shield size={16} className="text-[#434751]" />
                       <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751]">Closed</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
