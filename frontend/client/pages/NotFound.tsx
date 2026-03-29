import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "Zafby Engine 404: Unmapped route exception:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8] text-[#1b1c1b] selection:bg-[#ba1a1a]/20 selection:text-[#ba1a1a] p-6 font-manrope">
      <div className="max-w-md w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-700">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-[#ffffff] border border-[#e4e2e0] rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_24px_48px_-12px_rgba(27,28,27,0.05)]">
            <ShieldAlert size={40} className="text-[#004191]" />
          </div>
          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#ba1a1a] rounded-full border-4 border-[#fcf9f8] flex items-center justify-center shadow-sm">
            <span className="text-white font-extrabold text-sm">!</span>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-[#1b1c1b] leading-tight">Signal <span className="text-[#a8aebf]">Lost.</span></h1>
          <p className="text-sm font-medium text-[#434751] leading-relaxed max-w-sm mx-auto">
            The endpoint <span className="text-[#ba1a1a] font-bold">{location.pathname}</span> is outside the parameters of our system network.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center space-x-3 px-10 py-5 bg-[#1b1c1b] text-white rounded-full font-inter font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-[#004191] transition-all duration-300 active:scale-[0.98] shadow-lg"
        >
          <ArrowLeft size={16} />
          <span>Return to Baseline</span>
        </Link>
      </div>
    </div>
  );
}
