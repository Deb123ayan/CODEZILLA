import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";

// Partner Logos
import AmazonLogo from "@/assets/Amazon/Amazon_Logo_0.svg";
import ZomatoLogo from "@/assets/Zomato/Zomato_Logo_0.svg";
import FlipkartLogo from "@/assets/Flipkart/Flipkart_Logo_0.svg";
import ZeptoLogo from "@/assets/Zepto/Zepto_idm2wBp3DO_1.svg";
import BlinkitLogo from "@/assets/Blinkit/Blinkit_idCmcpCDCZ_0.svg";
import SwiggyLogo from "@/assets/Swiggy/Swiggy_id8bItcgXR_0.svg";

interface Platform {
  id: string;
  name: string;
  logo: string;
  description: string;
  route: string;
  colorClass: string;
}

export default function PlatformSelection() {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const platforms: Platform[] = [
    {
      id: "zomato",
      name: "Zomato",
      logo: ZomatoLogo,
      description: "Food Delivery Partner",
      route: "/register/zomato",
      colorClass: "bg-red-50",
    },
    {
      id: "blinkit",
      name: "Blinkit",
      logo: BlinkitLogo,
      description: "Hyperlocal Delivery",
      route: "/register/blinkit",
      colorClass: "bg-yellow-100",
    },
    {
      id: "flipkart",
      name: "Flipkart",
      logo: FlipkartLogo,
      description: "Supply Chain Partner",
      route: "/register/flipkart",
      colorClass: "bg-blue-50",
    },
    {
      id: "amazon",
      name: "Amazon",
      logo: AmazonLogo,
      description: "E-commerce Logistics",
      route: "/register/amazon",
      colorClass: "bg-slate-100",
    },
    {
      id: "zepto",
      name: "Zepto",
      logo: ZeptoLogo,
      description: "Quick Commerce Partner",
      route: "/register/zepto",
      colorClass: "bg-purple-50",
    },
    {
      id: "swiggy",
      name: "Swiggy",
      logo: SwiggyLogo,
      description: "Instant Delivery Partner",
      route: "/register/swiggy",
      colorClass: "bg-orange-50",
    },
  ];

  const handleSelectPlatform = (platform: Platform) => {
    setSelectedPlatform(platform.id);
  };

  const handleConnect = () => {
    if (selectedPlatform) {
      const p = platforms.find(pl => pl.id === selectedPlatform);
      if (p) navigate(p.route);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b] font-['Inter'] selection:bg-[#d8e2ff] selection:text-[#004395]">
      <Navbar />

      <main className="pt-24 pb-32 px-6 md:px-[5rem] max-w-7xl mx-auto mt-16">
        {/* Navigation / Header Area */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(-1)}>
            <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors scale-95 active:scale-90 shadow-sm border border-gray-100">
              <ArrowLeft className="text-[#1c1b1b]" size={20} />
            </button>
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest hidden sm:inline-block">Back</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <span className="text-[#727785] font-bold text-xs uppercase tracking-widest bg-white px-4 py-2 rounded-full shadow-sm">Step 1 of 3</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#1c1b1b] tracking-tighter mb-4">
            Connect Your Platform
          </h2>
          <p className="text-lg text-[#424754] max-w-2xl leading-relaxed font-medium">
            Select the food delivery or e-commerce platform you work for to sync your earnings and performance data seamlessly.
          </p>
        </section>

        {/* Platform Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            
            return (
              <button
                key={platform.id}
                onClick={() => handleSelectPlatform(platform)}
                className={cn(
                  "group relative bg-[#ffffff] p-8 rounded-[2rem] text-left transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] ring-2",
                  isSelected 
                    ? "ring-[#0058be] scale-[1.02] bg-[#fcf9f8]" 
                    : "ring-transparent hover:ring-[#0058be]/10 hover:scale-[1.02]"
                )}
              >
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 overflow-hidden", platform.colorClass)}>
                  <img src={platform.logo} alt={platform.name} className="w-10 h-10 object-contain" />
                </div>
                
                <h3 className={cn("text-xl font-bold mb-1 transition-colors", isSelected ? "text-[#0058be]" : "text-[#1c1b1b]")}>
                  {platform.name}
                </h3>
                <p className="text-sm text-[#424754] font-medium">{platform.description}</p>
                
                <div className={cn(
                  "absolute top-6 right-6 transition-all duration-300",
                  isSelected ? "opacity-100 scale-110 text-[#0058be]" : "opacity-0 group-hover:opacity-100 text-[#0058be]/50 rotate-[-10deg] group-hover:rotate-0"
                )}>
                  <CheckCircle2 size={24} className={isSelected ? "fill-current text-[#0058be]" : "text-[#0058be]/50"} />
                </div>
              </button>
            )
          })}
        </div>

        {/* Action Footer */}
        <div className="mt-20 flex flex-col items-center gap-6">
          <button 
            onClick={handleConnect}
            disabled={!selectedPlatform}
            className="w-full md:w-auto md:min-w-[320px] bg-[#0058be] text-[#ffffff] font-bold text-lg py-5 px-12 rounded-full shadow-[0_20px_40px_rgba(0,88,190,0.2)] hover:bg-[#2170e4] transition-all scale-100 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:pointer-events-none"
          >
            Connect Platform
            <ArrowRight size={20} strokeWidth={3} />
          </button>
          
          <p className="text-sm text-[#424754] font-medium">
            Don't see your platform? <a className="text-[#0058be] hover:underline underline-offset-4 font-bold ml-1" href="/support">Request integration</a>
          </p>
        </div>
      </main>
    </div>
  );
}
