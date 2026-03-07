import Navbar from "@/components/Navbar";
import { Link } from "react-router-dom";
import { Zap, X, ArrowRight, ShieldCheck, MapPin, Activity } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function RiskPredictor() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState({
    city: "",
    weather: "",
    traffic: ""
  });

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

  const calculateRisk = () => {
    const { weather, traffic } = selections;
    if (weather === "Rain" || traffic === "Heavy") return "High";
    if (weather !== "Normal" || traffic === "Moderate") return "Medium";
    return "Low";
  };

  const resetPredictor = () => {
    setCurrentStep(0);
    setSelections({ city: "", weather: "", traffic: "" });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] selection:bg-black selection:text-white font-inter">
      <Navbar />

      <main className="section-padding pt-32 pb-20 md:pt-48 md:pb-32 flex items-center justify-center">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-50/50 blur-[160px] rounded-full" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-50/40 blur-[140px] rounded-full" />
        </div>

        <div className="w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in duration-500 relative">
          <div className="p-10 md:p-16 space-y-12">
            <div className="space-y-6 text-center lg:text-left flex flex-col lg:flex-row items-center lg:items-end gap-6 lg:justify-between">
              <div className="space-y-4">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto lg:mx-0 shadow-sm">
                  <Zap size={40} className="fill-current" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic">AI Risk <span className="text-blue-600 not-italic">Predictor.</span></h1>
                <p className="text-gray-400 font-bold tracking-tight italic text-lg max-w-md">"Simulate conditions to see your potential protection payouts in real-time."</p>
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
                        setSelections({ ...selections, [steps[currentStep].key]: opt });
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
            ) : (
              <div className="space-y-10 animate-in slide-in-from-bottom duration-700">
                <div className="bg-black p-12 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-20 -mt-20" />
                  <div className="relative z-10">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-blue-400 mb-4">Simulated Disruption Result</p>
                    <h4 className="text-5xl md:text-6xl font-black tracking-tighter italic uppercase leading-none">
                      {calculateRisk()} Risk <br />Detected
                    </h4>
                  </div>
                  <div className="relative z-10 pt-10 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest leading-none mb-3">Est. Income Protection</p>
                      <p className="text-4xl font-black text-emerald-400 tracking-tighter">
                        {calculateRisk() === "High" ? "₹300 – ₹600" : calculateRisk() === "Medium" ? "₹100 – ₹250" : "No Gap"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl">
                       <ShieldCheck className="text-emerald-400" size={20} />
                       <span className="text-[10px] font-black uppercase tracking-widest">Verified Payout Range</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/register"
                    className="group py-6 bg-blue-600 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] text-center shadow-2xl hover:bg-emerald-600 transition-all duration-500 hover:scale-[1.05] active:scale-95 flex items-center justify-center gap-4"
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
    </div>
  );
}
