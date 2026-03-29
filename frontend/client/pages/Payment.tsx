import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { useUserAuth } from "@/context/UserAuthContext";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Smartphone, 
  CreditCard, 
  Building,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const { workerId, phoneNumber } = useUserAuth();
  
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment Form States
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [bank, setBank] = useState("");

  const plan = location.state?.plan;

  useEffect(() => {
    // If user arrived here manually without a selected plan, boot them back to policies.
    if (!plan) {
      navigate('/policies', { replace: true });
    }
  }, [plan, navigate]);

  if (!plan) return null;

  const paymentMethods = [
    { id: "upi", label: "UPI / PhonePe / GPay", icon: Smartphone },
    { id: "card", label: "Credit or Debit Card", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", icon: Building },
  ];

  const handlePayment = async () => {
    if (!workerId && !phoneNumber) {
      toast.error("Sign in to process payment");
      return;
    }

    const pid = workerId || phoneNumber;
    setIsProcessing(true);
    toast.loading(`Securing your ${plan.name} coverage...`, { id: 'payment' });

    try {
      // Simulate network gateway feeling
      await new Promise(resolve => setTimeout(resolve, 2000));

      await api.post("/policy/purchase/", {
        worker_id: pid,
        payment_status: "SUCCESS",
        plan_type: plan.planKey,
        premium: plan.premium,
        coverage: plan.coverageValue,
      });

      toast.success(`${plan.name} activated successfully!`, { id: 'payment' });
      navigate('/policies');
    } catch (error: any) {
      toast.error(error.message || "Payment attempt failed", { id: 'payment' });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope min-h-screen flex flex-col selection:bg-[#004191]/20 selection:text-white">
      
      {/* ─── Top Navigation Bar ─── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-transparent">
        <div className="flex items-center px-6 h-20 max-w-2xl mx-auto w-full">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-[#f5f3f1] flex items-center justify-center hover:bg-[#e4e2e0] transition-colors"
          >
            <ArrowLeft size={20} className="text-[#1b1c1b]" />
          </button>
          <div className="flex-1 text-center pr-12">
            <h1 className="text-[14px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783]">
              Secure Checkout
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-40 px-6 max-w-2xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="space-y-12">
          
          {/* ─── Plan Summary Card ─── */}
          <section>
            <h2 className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-6 px-2">Order Summary</h2>
            <div className={cn("bg-[#ffffff] rounded-[2.5rem] p-8 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] relative overflow-hidden", plan.isPopular ? "border border-[#004191]/10 ring-4 ring-[#004191]/5" : "border-none")}>
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#d8e2ff] to-transparent rounded-full -mr-12 -mt-12 opacity-50" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-[#f5f3f1] text-[#004191] rounded-[1.5rem] flex items-center justify-center shrink-0">
                    <ShieldCheck size={28} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#1b1c1b] tracking-tight">{plan.name} Protection</h3>
                    <p className="text-[#434751] font-medium mt-1">{plan.features[0]} & more</p>
                  </div>
                </div>

                <div className="bg-[#f5f3f1] rounded-2xl px-6 py-4 flex flex-col gap-1 w-fit">
                  <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783]">Dues</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[#1b1c1b] tracking-tighter">{plan.price}</span>
                    <span className="text-sm font-bold text-[#434751]">/wk</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Payment Methods ─── */}
          <section>
            <h2 className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-6 px-2">Select Method</h2>
            <div className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <div 
                    key={method.id} 
                    className={cn(
                      "rounded-[2rem] transition-all duration-300 border", 
                      isSelected ? "bg-[#ffffff] shadow-[0_16px_32px_-8px_rgba(27,28,27,0.08)] border-[#004191]" : "bg-[#ffffff]/50 hover:bg-[#ffffff] border-transparent"
                    )}
                  >
                    <button
                      onClick={() => setSelectedMethod(method.id)}
                      className="w-full flex items-center justify-between p-6 group focus:outline-none"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
                          isSelected ? "bg-[#d8e2ff] text-[#004191]" : "bg-[#f5f3f1] text-[#737783] group-hover:text-[#434751]"
                        )}>
                          <Icon size={20} strokeWidth={isSelected ? 2 : 1.5} />
                        </div>
                        <span className={cn("text-lg font-bold text-left", isSelected ? "text-[#1b1c1b]" : "text-[#434751]")}>
                          {method.label}
                        </span>
                      </div>

                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0",
                        isSelected ? "text-[#004191] scale-100" : "scale-0"
                      )}>
                        <CheckCircle2 size={24} className="fill-current text-white" />
                      </div>
                    </button>
                    
                    {isSelected && (
                      <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-4 fade-in duration-300">
                        {method.id === 'upi' && (
                          <div className="space-y-4">
                            <div className="flex gap-3">
                               <button type="button" className="flex-1 py-3 bg-[#f5f3f1] hover:bg-[#e4e2e0] rounded-2xl font-bold text-sm transition-colors text-[#1b1c1b]">GPay</button>
                               <button type="button" className="flex-1 py-3 bg-[#f5f3f1] hover:bg-[#e4e2e0] rounded-2xl font-bold text-sm transition-colors text-[#1b1c1b]">PhonePe</button>
                               <button type="button" className="flex-1 py-3 bg-[#f5f3f1] hover:bg-[#e4e2e0] rounded-2xl font-bold text-sm transition-colors text-[#1b1c1b]">Paytm</button>
                            </div>
                            <div className="relative">
                              <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-2 px-1">Or enter UPI ID</p>
                              <input 
                                type="text"
                                placeholder="name@oksbi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full bg-[#f5f3f1] border-none rounded-2xl h-14 px-5 text-sm font-bold focus:ring-2 focus:ring-[#004191] transition-all placeholder:text-[#a8aebf]"
                              />
                            </div>
                          </div>
                        )}
                        {method.id === 'card' && (
                          <div className="space-y-4">
                            <div>
                              <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-2 px-1">Card Number</p>
                              <input 
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                                className="w-full bg-[#f5f3f1] border-none rounded-2xl h-14 px-5 text-sm font-bold focus:ring-2 focus:ring-[#004191] transition-all placeholder:text-[#a8aebf] tracking-widest"
                              />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-2 px-1">Expiry</p>
                                <input 
                                  type="text"
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  value={expiry}
                                  onChange={(e) => setExpiry(e.target.value)}
                                  className="w-full bg-[#f5f3f1] border-none rounded-2xl h-14 px-5 text-sm font-bold focus:ring-2 focus:ring-[#004191] transition-all placeholder:text-[#a8aebf]"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-2 px-1">CVV</p>
                                <input 
                                  type="password"
                                  placeholder="123"
                                  maxLength={4}
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value)}
                                  className="w-full bg-[#f5f3f1] border-none rounded-2xl h-14 px-5 text-sm font-bold focus:ring-2 focus:ring-[#004191] transition-all placeholder:text-[#a8aebf]"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        {method.id === 'netbanking' && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-2 px-1">Select Bank</p>
                            <div className="grid grid-cols-2 gap-3">
                               {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank'].map(b => (
                                 <button 
                                   key={b}
                                   onClick={() => setBank(b)}
                                   className={cn(
                                     "py-3 rounded-2xl font-bold text-sm transition-colors border outline-none",
                                     bank === b ? "bg-[#d8e2ff] border-[#004191] text-[#004191]" : "bg-[#f5f3f1] border-transparent text-[#1b1c1b] hover:bg-[#e4e2e0]"
                                   )}
                                 >
                                   {b}
                                 </button>
                               ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      </main>

      {/* ─── Fixed Footer Pay Bar ─── */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-[#f5f3f1] px-6 py-6 md:py-8 z-50 rounded-t-[2.5rem] shadow-[0_-20px_40px_-20px_rgba(27,28,27,0.06)]">
        <div className="max-w-2xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col">
            <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#737783] mb-1">Total Payload</p>
            <p className="text-3xl font-extrabold text-[#1b1c1b]">{plan.price}</p>
          </div>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="bg-gradient-to-r from-[#004191] to-[#0058be] text-white px-10 py-5 rounded-full font-inter w-full md:w-auto text-[13px] font-bold uppercase tracking-[0.15em] flex items-center justify-center transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
          >
            {isProcessing ? (
              <span className="flex items-center gap-3">
                <Loader2 size={18} className="animate-spin" /> Verifying...
              </span>
            ) : (
              `Pay Securely`
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
