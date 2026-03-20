import Sidebar from "@/components/Sidebar";
import {
  Package, MapPin, Clock, Play, AlertCircle, CheckCircle, Shield, RefreshCw,
  AlertTriangle, Loader2, ShieldAlert, Navigation, DollarSign, ChevronRight
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { toast } from "sonner";

export default function Deliveries() {
  const { platform: userPlatform, username: userUsername, phoneNumber, workerId } = useUserAuth();
  const platform = userPlatform || "general";
  const username = userUsername || "Worker";
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const [cancelType, setCancelType] = useState("RAIN");
  const [cancelReason, setCancelReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [checkingWeather, setCheckingWeather] = useState(false);

  const mainRef = useRef<HTMLElement>(null);

  const fetchDeliveries = async () => {
    if (!workerId) return;
    setLoading(true);
    try {
      const res = await api.get<any[]>(`/deliveries/?worker_id=${workerId}`);
      setDeliveries(res);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      toast.error("Error loading deliveries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && cancelType) {
      preCheckWeather(cancelType);
    }
  }, [cancelType, isModalOpen]);

  const preCheckWeather = async (type: string) => {
    setCheckingWeather(true);
    try {
      const workerPhone = sessionStorage.getItem("userPhone");
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

  useEffect(() => {
    fetchDeliveries();
    const el = mainRef.current;
    if (!el) return;
    const handleScroll = () => setScrolled(el.scrollTop > 20);
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [workerId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ASSIGNED": return "bg-blue-50 text-blue-600 border-blue-100";
      case "ONGOING": return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "COMPLETED": return "bg-green-50 text-green-600 border-green-100";
      case "CANCELLED": return "bg-red-50 text-red-600 border-red-100";
      case "RETRYING": return "bg-purple-50 text-purple-600 border-purple-100";
      default: return "bg-gray-50 text-gray-600 border-gray-100";
    }
  };

  const getPlatformColor = (id?: string) => {
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
        <h2 className="text-xl font-black uppercase tracking-[0.3em] text-gray-400">Loading Tasks...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-white">
      <Sidebar />
      <main ref={mainRef} className="flex-1 overflow-auto bg-gray-50/30">
        <header className={cn(
          "relative md:sticky top-0 z-20 transition-all duration-300 section-padding py-6",
          scrolled ? "bg-white border-b border-gray-100 shadow-sm py-4" : "bg-transparent"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-20 sm:pl-0">
            <div>
              <h1 className={cn("text-2xl md:text-3xl font-black tracking-tighter transition-all", platformColor)}>
                {platformName} Tasks
              </h1>
              <p className="text-gray-500 text-sm font-medium mt-0.5">Assigned Deliveries for {username}</p>
            </div>
            <div className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">System Online</span>
            </div>
          </div>
        </header>

        {/* Failed / Cancellation Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => !submitting && setIsModalOpen(false)} />
            <div className="relative bg-white w-full max-w-xl rounded-[3rem] p-10 md:p-14 shadow-2xl reveal active transition-all">
              <div className="mb-10 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Report Disruption</h2>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">AI will verify weather & traffic data for claim</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Disruption Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {cancelTypes.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setCancelType(r.value)}
                        className={cn(
                          "px-4 py-4 rounded-2xl text-xs font-bold transition-all border-2 text-left",
                          cancelType === r.value
                            ? "bg-black text-white border-black shadow-xl scale-[1.02]"
                            : "bg-gray-50 text-gray-500 border-transparent hover:border-gray-200"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {checkingWeather ? (
                  <div className="bg-blue-50/30 p-4 rounded-2xl flex items-center space-x-3 animate-pulse border border-blue-100">
                    <Loader2 className="animate-spin text-blue-600" size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">AI Radar Scanning Location...</span>
                  </div>
                ) : (verificationStatus && cancelType !== 'OTHER') && (
                  <div className={cn(
                    "p-4 rounded-2xl flex items-center space-x-3 border-l-4 transition-all duration-500",
                    verificationStatus.claim_verified ? "bg-green-50 border-green-600 text-green-700" : "bg-yellow-50 border-yellow-500 text-yellow-700"
                  )}>
                    <div className="p-2 bg-white/50 rounded-lg">
                      {verificationStatus.claim_verified ? <CheckCircle size={16} className="text-green-600" /> : <ShieldAlert size={16} className="text-yellow-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-black uppercase tracking-widest">
                        {verificationStatus.claim_verified ? "Disruption Detected" : "Verification Discrepancy"}
                      </p>
                      <p className="text-[9px] font-bold opacity-70 uppercase tracking-tight">
                        {verificationStatus.claim_verified
                          ? `Radar confirmed ${verificationStatus.actual_weather?.description || 'conditions'}.`
                          : `shows ${verificationStatus.actual_weather?.description || 'clear'} conditions. Manual review required.`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Additional Details (Optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Describe the issue..."
                    className="w-full bg-gray-50 border-none rounded-2xl p-6 text-sm font-bold min-h-[120px] focus:ring-2 focus:ring-black transition-all"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-16 border-2 border-gray-100 text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => handleAction(selectedDelivery.id, "cancel", { type: cancelType, reason: cancelReason })}
                    disabled={submitting}
                    className="flex-[2] h-16 bg-red-600 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={18} /> : <span>Confirm & Claim ₹</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="section-padding space-y-10">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Assigned", count: deliveries.filter(d => d.status === 'ASSIGNED' || d.status === 'PENDING').length, color: "text-blue-600", bg: "bg-blue-50/50" },
              { label: "Ongoing", count: deliveries.filter(d => d.status === 'ONGOING').length, color: "text-yellow-600", bg: "bg-yellow-50/50" },
              { label: "Completed", count: deliveries.filter(d => d.status === 'COMPLETED').length, color: "text-green-600", bg: "bg-green-50/50" },
              { label: "Cancelled", count: deliveries.filter(d => d.status === 'CANCELLED' || d.status === 'FAILED').length, color: "text-red-600", bg: "bg-red-50/50" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn("p-8 rounded-[2.5rem] border border-gray-100 flex flex-col items-center justify-center text-center reveal active transition-all hover:border-gray-200 shadow-sm shadow-black/5", stat.bg)}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <div className={cn("text-4xl font-black mb-2", stat.color)}>{stat.count}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label} Tasks</div>
              </div>
            ))}
          </div>

          {/* Deliveries List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black tracking-tight">Active Duty</h2>
              <button
                onClick={fetchDeliveries}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Refresh List
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
              {deliveries.length === 0 ? (
                <div className="col-span-full py-32 bg-white rounded-[3rem] border border-gray-100 flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <Package className="text-gray-300" size={40} />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-gray-400">Rest Day? No Tasks Assigned.</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">New requests will appear here in real-time</p>
                </div>
              ) : (
                deliveries.map((delivery: any, i: number) => (
                  <div
                    key={delivery.id}
                    className={cn(
                      "bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-xl transition-all duration-500 reveal active overflow-hidden group relative flex flex-col h-full",
                      delivery.status === 'ONGOING' ? "border-yellow-200 ring-2 ring-yellow-50" : ""
                    )}
                    style={{ transitionDelay: `${i * 50}ms` }}
                  >
                    {delivery.status === 'ONGOING' && (
                      <div className="absolute top-6 right-8 flex items-center space-x-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600">In Progress</span>
                      </div>
                    )}

                    <div className="flex flex-col h-full justify-between">
                      <div className="space-y-6">
                        <div className="flex items-start justify-between">
                          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-500">
                            <Package size={26} />
                          </div>
                          <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border", getStatusColor(delivery.status))}>
                            {delivery.status}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {delivery.products?.[0]?.name || "Package Delivery"}
                          </h3>
                          <div className="flex items-center space-x-2 text-gray-400 mb-4">
                            <MapPin size={14} className="text-blue-600" />
                            <span className="text-xs font-bold leading-none">{delivery.location}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 group-hover:bg-white group-hover:border-gray-100 transition-all">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Fee</p>
                              <div className="flex items-center space-x-1 text-green-600">
                                <span className="text-sm font-black">₹{delivery.amount}</span>
                              </div>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 group-hover:bg-white group-hover:border-gray-100 transition-all">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Due</p>
                              <div className="flex items-center space-x-2 text-gray-900 font-bold text-xs uppercase tracking-tight">
                                <Clock size={12} className="text-blue-600" />
                                <span>Exp. 45m</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between gap-4">
                        {(delivery.status === 'ASSIGNED' || delivery.status === 'PENDING') && (
                          <button
                            onClick={() => handleAction(delivery.id, "start")}
                            disabled={deliveries.some((d: any) => d.status === 'ONGOING')}
                            className={cn(
                              "flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center space-x-2",
                              deliveries.some((d: any) => d.status === 'ONGOING')
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-black text-white hover:bg-blue-600"
                            )}
                          >
                            <Play size={16} className="fill-current" />
                            <span>Start Delivery</span>
                          </button>
                        )}

                        {delivery.status === 'ONGOING' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setIsModalOpen(true);
                              }}
                              className="flex-1 h-14 border-2 border-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center space-x-2"
                            >
                              <AlertCircle size={16} />
                              <span>Facing Issues?</span>
                            </button>
                            <button
                              onClick={() => handleAction(delivery.id, "complete")}
                              className="flex-1 h-14 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-lg shadow-green-100"
                            >
                              <CheckCircle size={16} />
                              <span>Finish Delivery</span>
                            </button>
                          </>
                        )}

                        {(delivery.status === 'COMPLETED' || delivery.status === 'CANCELLED') && (
                          <div className="w-full flex items-center justify-center space-x-2 py-4 bg-gray-50 rounded-2xl opacity-50">
                            <Shield size={16} className="text-gray-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Securely Closed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="section-padding pb-32">
          <div className="bg-gradient-to-r from-blue-700 to-indigo-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden reveal active">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -mr-40 -mt-40" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-black tracking-tighter mb-4">Protection Active 🛡️</h2>
                <p className="text-blue-100/70 font-medium leading-relaxed max-w-xl">
                  Every task you start is monitored by our Risk Engine. If things go south (rain, breakdowns, closures), reporting it here triggers an automated claim based on your policy.
                </p>
              </div>
              <div className="flex items-center bg-white/10 backdrop-blur-xl px-8 py-6 rounded-3xl border border-white/20">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 mb-1">Protection Limit</p>
                  <p className="text-3xl font-black">₹1,500/Event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
