import { Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import BrandLogo from "./BrandLogo";

interface DashboardFooterProps {
  className?: string;
}

export default function DashboardFooter({ className }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      "relative mt-auto py-12 px-8 border-t border-[#e4e2e0] bg-[#ffffff]/60 backdrop-blur-md rounded-[3rem] mb-8 mx-6 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(27,28,27,0.05)] text-[#1b1c1b] font-manrope animate-in fade-in",
      className
    )}>
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#f0f4ff] rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#fffbeb] rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <BrandLogo />
          </div>
          <p className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-[#a8aebf]">
            Securing Indian Gig Workers &bull; Beta Version
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {[
            { label: "Help Center", path: "/help-center" },
            { label: "Privacy Policy", path: "/privacy-policy" },
            { label: "IRDAI Terms", path: "/irdai-terms" },
            { label: "Bank Integrations", path: "/bank-integrations" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] hover:text-[#004191] hover:-translate-y-0.5 transition-all flex items-center group relative"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-end space-y-4">
          <div className="flex items-center space-x-4">
          </div>
          <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest flex items-center">
            &copy; {currentYear} Zafby Project Team
          </p>
        </div>
      </div>

      {/* Decorative Progress Bar */}
      
    </footer>
  );
}