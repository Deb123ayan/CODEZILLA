import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Zap, X, ArrowRight, ShieldCheck, MapPin, Activity, MessageSquare, Send, Sparkles, Loader2 } from "lucide-react";
import DashboardFooter from "@/components/DashboardFooter";
import { api } from "@/lib/api-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
    { role: "ai", text: "Hello! I'm Zafby AI. I can explain your risk factors. Ask me anything!" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const steps = [
    {
      question: "Where are you delivering today?",
      options: ["Mumbai", "Delhi", "Bangalore", "Hyderabad"],
      key: "city" as const
    },
    {
      question: "What's the current weather?",
      options: ["Heat", "Rain", "Pollution", "Normal"],
      key: "weather" as const
    },
    {
      question: "How is the traffic level?",
      options: ["Low", "Moderate", "Heavy"],
      key: "traffic" as const
    }
  ];

  const fetchBackendRisk = async (city: string) => {
    setLoading(true);
    try {
      const data = await api.get<RiskData>(`/risk/predict/?zone=${city}`);
      setRiskData(data);

      const aiResponse = `Based on the latest data for ${city}, here is the breakdown: 
      - Probability: ${(data.ai_analysis.disruption_probability * 100).toFixed(1)}%
      - Risk Level: ${data.ai_analysis.risk_level}
      - Forecast: ${data.ai_analysis.alert}`;

      setChatMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    } catch (error) {
      console.error("Risk prediction failed:", error);
      toast.error("Failed to fetch real-time AI risk data. Using simulation.");
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
    if (weather === "Rain" || traffic === "Heavy") return "High";
    if (weather !== "Normal" || traffic === "Moderate") return "Medium";
    return "Low";
  };

  const resetPredictor = () => {
    setCurrentStep(0);
    setRiskData(null);
    setSelections({ city: "", weather: "", traffic: "" });
    setChatMessages([{ role: "ai", text: "Hello! I'm Zafby AI. I can explain your risk factors. Ask me anything!" }]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMsg = { role: "user", text: inputValue };
    const newMessages = [...chatMessages, userMsg];
    setChatMessages(newMessages);
    const question = inputValue;
    setInputValue("");

    // In a real app, this would call a LLM/AI Chat backend.
    // For now we simulate an intelligent response based on the current risk data.
    setTimeout(() => {
      const risk = calculateRisk();
      let aiResponse = "I'm analyzing your situation...";

      if (question.toLowerCase().includes("how") || question.toLowerCase().includes("payout")) {
        aiResponse = `Since the risk in ${selections.city} is currently ${risk}, your potential payout gap is ₹${risk === "High" ? "600" : risk === "Medium" ? "250" : "0"}. Our AI detects anomalies in ${selections.weather} levels.`;
      } else if (risk === "High") {
        aiResponse = riskData?.ai_analysis.alert || "Based on the severe conditions in your city, the risk of income loss is significant.";
      } else if (risk === "Medium") {
        aiResponse = "There's a moderate risk today due to current conditions. We recommend active monitoring through the Zafby app.";
      } else {
        aiResponse = "Looks like a smooth day ahead! But remember, conditions can change rapidly in the gig economy.";
      }
      setChatMessages(prev => [...prev, { role: "ai", text: aiResponse }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      <main className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 flex items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-50/50 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-50/40 blur-[140px] rounded-full" />
        </div>

        <div className="w-full max-w-3xl mx-auto bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in duration-500 relative">
          <div className="p-10 md:p-16 space-y-12">
            <div className="space-y-6 text-center lg:text-left flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:justify-between">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto lg:mx-0 shadow-sm">
                  <Zap size={40} className="fill-current" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic">AI Risk <span className="text-blue-600 not-italic">Predictor.</span></h1>
                <p className="text-gray-400 font-bold tracking-tight italic text-sm max-w-sm">"Simulate conditions to see your potential protection payouts in real-time."</p>
              </div>
              <div className="px-6 py-2 bg-gray-50 rounded-full border border-gray-100">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">Beta Version 1.2</span>
              </div>
            </div>

            {currentStep < steps.length ? (
              <div className="space-y-10 reveal active">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Step {currentStep + 1} of 3</p>
                  <div className="flex gap-2">
                    {steps.map((_, i) => (
                      <div key={i} className={cn("w-8 h-1 rounded-full transition-all duration-500", i <= currentStep ? "bg-blue-600" : "bg-gray-100")} />
                    ))}
                  </div>
                </div>
                <h4 className="text-2xl md:text-3xl font-black tracking-tight leading-none italic">"{steps[currentStep].question}"</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {steps[currentStep].options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        const newSelections = { ...selections, [steps[currentStep].key]: opt };
                        setSelections(newSelections);
                        setCurrentStep(currentStep + 1);
                      }}
                      className="group p-8 text-left border-2 border-gray-50 rounded-[2rem] bg-gray-50/50 hover:bg-black hover:text-white hover:border-black transition-all duration-500 flex flex-col justify-between h-40"
                    >
                      <div className="w-10 h-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
                        <Activity size={18} className="text-blue-600 group-hover:text-white" />
                      </div>
                      <span className="font-black text-lg uppercase tracking-tight italic">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : loading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
                <p className="text-sm font-black uppercase tracking-[0.2em] text-gray-400">Consulting AI Engine...</p>
              </div>
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom duration-700">
                <div className="bg-black p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-20 -mt-20" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-1">Simulated Disruption Result</p>
                      <h4 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter italic uppercase leading-tight">
                        {calculateRisk()} Risk <br className="hidden md:block" />Detected
                      </h4>
                    </div>

                    <div className="flex flex-col md:items-end gap-2 pr-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                      <p className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">Est. Income Protection</p>
                      <p className="text-xl md:text-3xl font-black text-blue-400 tracking-tighter">
                        {calculateRisk() === "High" ? "₹300 – ₹600" : calculateRisk() === "Medium" ? "₹100 – ₹250" : "No Gap"}
                      </p>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl mt-1">
                        <ShieldCheck className="text-blue-400" size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">Verified Range</span>
                      </div>
                    </div>
                  </div>

                  {/* Internal Footer for the Result Section */}
                  <div className="relative z-10 pt-3 md:pt-4 mt-2 md:mt-4 border-t border-white/5 flex items-center justify-between opacity-40">
                    <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.3em]">AI-Model v4.2.0-Production</p>
                    <div className="flex gap-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-75" />
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </div>

                {/* AI Chart & Analytics Section (Inside Result View) */}
                <div className="space-y-8 pt-8 border-t border-gray-100">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Activity size={16} className="text-blue-600" />
                      </div>
                      <h2 className="text-xl font-black tracking-tighter italic uppercase text-gray-900">Disruption Variance</h2>
                    </div>

                    <div className="h-[200px] w-full bg-black rounded-[2rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] -mr-16 -mt-16" />
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[
                          { time: "6AM", risk: 20 },
                          { time: "9AM", risk: 45 },
                          { time: "12PM", risk: 75 },
                          { time: "3PM", risk: 60 },
                          { time: "6PM", risk: 85 },
                          { time: "9PM", risk: 40 },
                        ]}>
                          <defs>
                            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
                          <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fontWeight: 900, fill: '#fff', opacity: 0.8 }}
                          />
                          <YAxis hide />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#000',
                              borderRadius: '1rem',
                              border: '1px solid #333',
                              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                              padding: '1rem'
                            }}
                            labelStyle={{ fontWeight: 900, color: '#fff' }}
                            itemStyle={{ color: '#3b82f6', fontWeight: 800 }}
                          />
                          <Area type="monotone" dataKey="risk" stroke="#fff" strokeWidth={4} fillOpacity={1} fill="url(#colorRisk)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Sparkles size={16} className="text-blue-400" />
                      </div>
                      <h2 className="text-xl font-black tracking-tighter italic uppercase text-gray-900">AI Analytics</h2>
                    </div>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-lg overflow-hidden flex flex-col h-[300px]">
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-gray-50/30">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className={cn(
                            "flex",
                            msg.role === "user" ? "justify-end" : "justify-start"
                          )}>
                            <div className={cn(
                              "max-w-[85%] p-4 rounded-2xl text-[10px] font-bold leading-relaxed",
                              msg.role === "user"
                                ? "bg-blue-600 text-white rounded-tr-none shadow-md"
                                : "bg-white text-gray-900 rounded-tl-none border border-gray-100 shadow-sm"
                            )}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-white border-t border-gray-100">
                        <div className="relative">
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Explain this risk score..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 pr-12 text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all text-gray-900"
                          />
                          <button
                            onClick={handleSendMessage}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center hover:bg-blue-600 transition-all active:scale-90"
                          >
                            <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/register"
                    className="group py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] text-center shadow-2xl hover:bg-black transition-all duration-500 hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4"
                  >
                    <span>Activate Protection</span>
                    <ArrowRight size={18} />
                  </Link>
                  <button
                    onClick={resetPredictor}
                    className="py-6 bg-gray-50 text-gray-400 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:text-black transition-all border border-transparent hover:border-gray-200"
                  >
                    Recalculate Risk
                  </button>
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
