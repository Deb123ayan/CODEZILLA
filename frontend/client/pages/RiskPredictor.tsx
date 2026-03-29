import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Zap, Activity, ShieldCheck, Send, Sparkles, Loader2, Info, ArrowRight } from "lucide-react";
import DashboardFooter from "@/components/DashboardFooter";
import { api } from "@/lib/api-client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface RiskData {
  zone: string;
  forecast_data: any;
  ai_analysis: {
    disruption_probability: number;
    risk_level: string;
    alert: string;
  };
}

export default function RiskPredictor() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<RiskData | null>(null);
  const [selections, setSelections] = useState({
    city: "",
    weather: "",
    traffic: ""
  });
  const [chatMessages, setChatMessages] = useState([
    { role: "ai", text: "Hello! I form the primary analytical model behind Zafby's parametric protection framework. Describe your conditions and I will calculate your variance." }
  ]);
  const [inputValue, setInputValue] = useState("");

  const steps = [
    {
      question: "Operating geography for the shift?",
      options: ["Delhi NCR", "Mumbai Metro", "Bangalore Tech", "Hyderabad Core"],
      key: "city" as const
    },
    {
      question: "Current localized weather anomaly?",
      options: ["Severe Heat", "Heavy Rain", "Smog Index", "Baseline"],
      key: "weather" as const
    },
    {
      question: "Observed gridlock parameters?",
      options: ["Baseline", "Moderate Block", "Severe Gridlock"],
      key: "traffic" as const
    }
  ];

  const fetchBackendRisk = async (city: string) => {
    setLoading(true);
    try {
      const data = await api.get<RiskData>(`/risk/predict/?zone=${city}`);
      setRiskData(data);

      const aiResponse = `Based on the deep telemetry fetched for ${city}, here is your analysis: 
      - Probability of Yield Loss: ${(data.ai_analysis.disruption_probability * 100).toFixed(1)}%
      - System Risk Threshold: ${data.ai_analysis.risk_level}
      - Algorithmic Alert: ${data.ai_analysis.alert}`;

      setChatMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    } catch (error) {
      console.error("Risk prediction failed:", error);
      toast.error("Failed to fetch real-time AI risk data. Engaging simulation sub-routines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentStep === steps.length && selections.city) {
      fetchBackendRisk(selections.city);
    }
  }, [currentStep, selections.city]);

  const calculateRisk = () => {
    if (riskData) return riskData.ai_analysis.risk_level;
    const { weather, traffic } = selections;
    if (weather === "Heavy Rain" || traffic === "Severe Gridlock") return "High";
    if (weather !== "Baseline" || traffic === "Moderate Block") return "Medium";
    return "Low";
  };

  const resetPredictor = () => {
    setCurrentStep(0);
    setRiskData(null);
    setSelections({ city: "", weather: "", traffic: "" });
    setChatMessages([{ role: "ai", text: "Hello! I form the primary analytical model behind Zafby's parametric protection framework. Describe your conditions and I will calculate your variance." }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg = { role: "user", text: inputValue };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    const question = inputValue;
    setInputValue("");

    setTimeout(() => {
      const risk = calculateRisk();
      let aiResponse = "Processing analytical matrix...";

      if (question.toLowerCase().includes("how") || question.toLowerCase().includes("payout") || question.toLowerCase().includes("money")) {
        aiResponse = `Because the environmental risk in ${selections.city} is evaluated at ${risk}, your quantitative payout coverage is ₹${risk === "High" ? "1,500" : risk === "Medium" ? "500" : "0"}. Our neural engine detected anomalies mapping perfectly to ${selections.weather}.`;
      } else if (risk === "High") {
        aiResponse = riskData?.ai_analysis.alert || "Based on the severe metrics gathered over the last 60 minutes in your geographic bounds, the statistical probability of income reduction is critical.";
      } else if (risk === "Medium") {
        aiResponse = "There's a measured disruption factor present today. We advise continuous operation while keeping the Zafby connection active.";
      } else {
        aiResponse = "Telemetry points to baseline conditions. No parametric triggers hit within your sector.";
      }
      setChatMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a]">
      <Navbar />

      <main className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 flex flex-col items-center justify-center relative max-w-7xl mx-auto min-h-[90vh]">
        
        {/* Abstract Blob Element Desktop Only */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-[#004191] blur-[140px] rounded-full opacity-10 mix-blend-screen pointer-events-none hidden lg:block" />

        <div className="w-full max-w-4xl mx-auto bg-[#ffffff] rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-20px_rgba(27,28,27,0.08)] border border-[#e4e2e0]/50 animate-in zoom-in-95 duration-700 relative z-10 flex flex-col">
          <div className="p-8 md:p-14 space-y-16">
            
            <div className="space-y-6 text-center lg:text-left flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:justify-between border-b border-[#e4e2e0]/50 pb-12">
              <div className="space-y-5">
                <div className="w-24 h-24 bg-[#f0f4ff] text-[#004191] rounded-[2rem] flex items-center justify-center mx-auto lg:mx-0 shadow-sm border border-[#004191]/10">
                  <Zap size={44} className="fill-current" />
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Neural Risk <span className="text-[#004191]">Simulator</span></h1>
                  <p className="text-[#a8aebf] font-inter font-bold uppercase tracking-[0.15em] text-[10px]">Test Coverage & Parametric Triggers</p>
                </div>
              </div>
              <div className="px-5 py-2.5 bg-[#f5f3f1] rounded-full border border-[#e4e2e0]">
                <span className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#1b1c1b]">Version 4.2 LLM</span>
              </div>
            </div>

            {currentStep < steps.length ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#004191]">Phase {currentStep + 1} // 3</p>
                  <div className="flex gap-2.5">
                    {steps.map((_, i) => (
                      <div key={i} className={cn("w-10 h-1.5 rounded-full transition-all duration-700 ease-out", i <= currentStep ? "bg-[#004191]" : "bg-[#f5f3f1]")} />
                    ))}
                  </div>
                </div>
                
                <h4 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#1b1c1b] leading-tight max-w-lg">{steps[currentStep].question}</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
                  {steps[currentStep].options.map((opt, idx) => (
                    <button
                      key={opt}
                      onClick={() => {
                        const newSelections = { ...selections, [steps[currentStep].key]: opt };
                        setSelections(newSelections);
                        setCurrentStep(currentStep + 1);
                      }}
                      className="group p-8 md:p-10 text-left border border-[#e4e2e0] rounded-[2.5rem] bg-[#fcf9f8] hover:bg-[#1b1c1b] hover:text-[#ffffff] hover:border-[#1b1c1b] transition-all duration-500 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-[0_24px_48px_-12px_rgba(27,28,27,0.3)] hover:-translate-y-1"
                    >
                      <div className="w-14 h-14 bg-[#ffffff] border border-[#e4e2e0] rounded-2xl flex items-center justify-center group-hover:bg-[#ffffff]/10 group-hover:border-transparent transition-all shadow-sm">
                        <Activity size={24} className="text-[#004191] group-hover:text-white" />
                      </div>
                      <span className="font-extrabold text-xl md:text-2xl tracking-tight leading-none mt-6">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-6">
                <Loader2 size={56} className="text-[#004191] animate-spin" />
                <p className="text-[11px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">Correlating Global Datasets...</p>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                
                {/* Result Block */}
                <div className="bg-[#1b1c1b] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.4)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#004191] blur-[120px] -mr-32 -mt-32 opacity-30 mix-blend-screen pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-[#434751]/50 pb-8 rounded-b-none">
                    <div>
                      <div className="flex items-center space-x-2 bg-[#ffffff]/10 px-4 py-2 rounded-full border border-white/10 w-max mb-6">
                        <Info size={14} className="text-[#a8aebf]" />
                        <p className="text-[9px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">Generated Prediction</p>
                      </div>
                      <h4 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter leading-none">
                        {calculateRisk()} <span className="text-[#434751]">Risk</span>
                      </h4>
                    </div>

                    <div className="flex flex-col md:items-end gap-2 md:pl-10">
                      <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.15em] mb-1">Algorithmic Base Payout</p>
                      <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter">
                        {calculateRisk() === "High" ? "₹1,000 – ₹2,000" : calculateRisk() === "Medium" ? "₹400 – ₹800" : "Safe Zone"}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <ShieldCheck className="text-[#16a34a]" size={16} />
                        <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#16a34a]">Coverage Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 pt-6 flex items-center justify-between text-[#a8aebf]">
                    <p className="text-[9px] font-inter font-bold uppercase tracking-[0.2em]">Neural Engine v4.2.0.1</p>
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 bg-[#ffffff] rounded-full animate-pulse" />
                      <div className="w-1.5 h-1.5 bg-[#ffffff] rounded-full animate-pulse delay-75" />
                      <div className="w-1.5 h-1.5 bg-[#ffffff] rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>

                {/* AI Chat & Analytics Section */}
                <div className="space-y-12 pt-4">
                  
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-extrabold tracking-tight text-[#1b1c1b]">Risk Volatility Line</h2>
                         <Activity size={24} className="text-[#a8aebf]" />
                      </div>

                      <div className="h-[280px] w-full bg-[#f5f3f1] rounded-[2.5rem] p-6 border border-[#e4e2e0] shadow-inner relative overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            { time: "6AM", risk: 20 },
                            { time: "9AM", risk: calculateRisk() === "High" ? 65 : calculateRisk() === "Medium" ? 45 : 30 },
                            { time: "12PM", risk: calculateRisk() === "High" ? 85 : calculateRisk() === "Medium" ? 65 : 40 },
                            { time: "3PM", risk: calculateRisk() === "High" ? 70 : calculateRisk() === "Medium" ? 50 : 35 },
                            { time: "6PM", risk: calculateRisk() === "High" ? 95 : calculateRisk() === "Medium" ? 75 : 45 },
                            { time: "9PM", risk: calculateRisk() === "High" ? 50 : calculateRisk() === "Medium" ? 35 : 25 },
                          ]}>
                            <defs>
                              <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#004191" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#004191" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e2e0" opacity={0.6} />
                            <XAxis
                              dataKey="time"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 10, fontWeight: 700, fill: '#a8aebf', fontFamily: 'Inter' }}
                              dy={10}
                            />
                            <YAxis hide />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1b1c1b',
                                color: '#ffffff',
                                borderRadius: '1.5rem',
                                border: 'none',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                                padding: '1rem',
                                fontFamily: "Inter"
                              }}
                              itemStyle={{ color: '#fff', fontWeight: 800 }}
                            />
                            <Area type="monotone" dataKey="risk" stroke="#004191" strokeWidth={4} fillOpacity={1} fill="url(#colorRisk)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h2 className="text-2xl font-extrabold tracking-tight text-[#1b1c1b]">Analytical Assistant</h2>
                         <Sparkles size={24} className="text-[#a8aebf]" />
                      </div>

                      <div className="bg-[#ffffff] rounded-[2.5rem] border border-[#e4e2e0] shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] overflow-hidden flex flex-col h-[280px]">
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar bg-[#fcf9f8]/50">
                          {chatMessages.map((msg, i) => (
                            <div key={i} className={cn(
                              "flex",
                              msg.role === "user" ? "justify-end" : "justify-start"
                            )}>
                              <div className={cn(
                                "max-w-[85%] p-4 xs:p-5 text-[12px] font-inter font-medium leading-relaxed shadow-sm",
                                msg.role === "user"
                                  ? "bg-[#1b1c1b] text-[#ffffff] rounded-2xl rounded-tr-sm"
                                  : "bg-[#ffffff] text-[#1b1c1b] rounded-2xl rounded-tl-sm border border-[#e4e2e0]"
                              )}>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 bg-[#ffffff] border-t border-[#e4e2e0]/50">
                          <div className="relative">
                            <input
                              type="text"
                              value={inputValue}
                              onChange={(e) => setInputValue(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Message the model about coverage..."
                              className="w-full bg-[#f5f3f1] border border-[#e4e2e0] rounded-xl px-5 py-4 pr-16 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#004191] focus:border-transparent transition-all text-[#1b1c1b] placeholder:text-[#a8aebf]"
                            />
                            <button
                              onClick={handleSendMessage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#004191] text-white rounded-[0.85rem] flex items-center justify-center hover:bg-[#0058be] transition-colors active:scale-95 shadow-md"
                            >
                              <Send size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-6">
                    <Link
                      to="/login"
                      className="group py-6 px-10 bg-[#1b1c1b] text-white rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] text-center shadow-[0_12px_24px_-8px_rgba(27,28,27,0.3)] hover:bg-[#ba1a1a] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-4"
                    >
                      <span>Enable System Coverage</span>
                      <ArrowRight size={18} />
                    </Link>
                    <button
                      onClick={resetPredictor}
                      className="py-6 px-10 bg-[#ffffff] border border-[#e4e2e0] text-[#1b1c1b] rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-[#f5f3f1] transition-colors shadow-sm"
                    >
                      Reset Variables
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </main>
      <DashboardFooter />
    </div>
  );
}
