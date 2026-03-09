import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { CheckCircle2, ArrowRight, Zap, Target, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

// Partner Logos
import AmazonLogo from "@/assets/Amazon/Amazon_Logo_0.svg";
import ZomatoLogo from "@/assets/Zomato/Zomato_Logo_0.svg";
import FlipkartLogo from "@/assets/Flipkart/Flipkart_Logo_0.svg";
import ZeptoLogo from "@/assets/Zepto/Zepto_idm2wBp3DO_1.svg";
import BlinkitLogo from "@/assets/Blinkit/Blinkit_idCmcpCDCZ_0.svg";
import SwiggyLogo from "@/assets/Swiggy/Swiggy_id8bItcgXR_0.svg";

import { useUserAuth } from "@/context/UserAuthContext";

interface Platform {
  id: string;
  name: string;
  logo: string;
  description: string;
  color: string;
  route: string;
}

export default function PlatformSelection() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const { login } = useUserAuth();

  const platforms: Platform[] = [
    {
      id: "zomato",
      name: "Zomato",
      logo: ZomatoLogo,
      description: "Food delivery with meal count tracking and zone management",
      color: "border-red-100/50",
      route: "/register/zomato",
    },
    {
      id: "blinkit",
      name: "Blinkit",
      logo: BlinkitLogo,
      description: "Quick commerce with hourly order tracking",
      color: "border-yellow-100/50",
      route: "/register/blinkit",
    },
    {
      id: "flipkart",
      name: "Flipkart",
      logo: FlipkartLogo,
      description: "Logistics and delivery with package tracking",
      color: "border-blue-100/50",
      route: "/register/flipkart",
    },
    {
      id: "amazon",
      name: "Amazon",
      logo: AmazonLogo,
      description: "Global delivery network with performance tracking",
      color: "border-orange-100/50",
      route: "/register/amazon",
    },
    {
      id: "zepto",
      name: "Zepto",
      logo: ZeptoLogo,
      description: "10-minute delivery with speed and efficiency tracking",
      color: "border-purple-100/50",
      route: "/register/zepto",
    },
    {
      id: "swiggy",
      name: "Swiggy",
      logo: SwiggyLogo,
      description: "Comprehensive food and grocery delivery partner network",
      color: "border-orange-100/50",
      route: "/register/swiggy",
    },
  ];

  const handleSelectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform.id);

    setTimeout(() => {
      navigate(platform.route);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white">
      <Navbar />

      <main className="section-padding pt-40 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-24 reveal active">
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-2xl mb-8">
            <LayoutGrid size={16} className="text-blue-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Registration Step 1 of 2</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-6 italic leading-none">
            Choose your <span className="text-blue-600 not-italic">Battlefield.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-bold text-gray-400 leading-relaxed tracking-tight group">
            Select the platform you currently work with. We'll synchronize your telemetry to provide real-time protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 reveal active" style={{ transitionDelay: "200ms" }}>
          {platforms.map((platform, i) => (
            <button
              key={platform.id}
              onClick={() => handleSelectPlatform(platform)}
              className={cn(
                "group relative bg-white p-10 rounded-[3rem] transition-all duration-700 transform hover:scale-105 hover:shadow-2xl overflow-hidden flex flex-col items-start text-left h-full",
                selectedPlatform === platform.id ? "border-2 border-blue-600 scale-105 shadow-2xl" : "border border-gray-100/50",
                platform.color
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative z-10 w-full flex flex-col h-full">
                <div className="mb-10 group-hover:scale-110 transition-transform duration-500 bg-white p-6 rounded-[2.5rem] w-fit shadow-sm">
                  <img src={platform.logo} alt={platform.name} className="h-16 md:h-20 object-contain rounded-xl" />
                </div>
                <div className="flex-1">
                  <h2 className={cn("text-3xl font-black tracking-tight mb-4 transition-colors", selectedPlatform === platform.id ? "text-blue-600" : "text-gray-900")}>
                    {platform.name}
                  </h2>
                  <p className={cn("text-sm font-bold leading-relaxed mb-8 transition-colors text-gray-400")}>
                    {platform.description}
                  </p>
                </div>
                <div className={cn("flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all", selectedPlatform === platform.id ? "text-emerald-600" : "text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-2")}>
                  {selectedPlatform === platform.id ? <CheckCircle2 size={16} /> : <ArrowRight size={16} />}
                  <span>{selectedPlatform === platform.id ? "Selected" : "Continue"}</span>
                </div>
              </div>

              {/* Background Glow */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-all duration-1000" />
            </button>
          ))}
        </div>

        {/* Info Callout */}
        <div className="mt-24 p-12 bg-black rounded-[3rem] text-white overflow-hidden relative reveal active" style={{ transitionDelay: "600ms" }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
              <Target size={32} className="text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-black mb-1">Working with multiple platforms?</h3>
              <p className="text-gray-400 font-medium text-sm leading-relaxed">
                You can link additional platforms from your dashboard after registration to merge your protection limits.
              </p>
            </div>
            <button className="px-10 py-5 bg-white text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-gray-100 transition-all shadow-xl active:scale-95 whitespace-nowrap">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
