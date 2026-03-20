import { Shield, Zap, Bell, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardFooterProps {
  className?: string;
}

export default function DashboardFooter({ className }: DashboardFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={cn(
      "relative mt-auto py-12 px-8 border-t border-gray-100 bg-white/40 backdrop-blur-md rounded-[3rem] mb-8 mx-6 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] reveal active",
      className
    )}>
      {/* Background Decorative Blob */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/30 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-50/30 rounded-full -ml-24 -mb-24 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center transform transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300">
              <Shield className="text-white fill-current opacity-20" size={20} />
              <Zap className="text-white absolute scale-75" size={18} />
            </div>
            <span className="font-black text-2xl tracking-tighter text-gray-900">Zafby.</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Secure Platform Protection &bull; Since 2024
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {[
            { label: "Support", path: "#" },
            { label: "Privacy", path: "#" },
            { label: "Terms", path: "#" },
            { label: "API Status", path: "#" },
            { label: "Whitepaper", path: "#" },
          ].map((link) => (
            <a
              key={link.label}
              href={link.path}
              className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-black hover:translate-x-1 transition-all flex items-center"
            >
              <div className="w-1 h-1 bg-gray-200 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex flex-col items-center md:items-end space-y-4">
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-100/50 rounded-2xl flex items-center space-x-3 shadow-sm hover:shadow-md transition-shadow cursor-default group">
              <div className="relative">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping absolute opacity-75" />
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full relative border-2 border-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center">
                All Systems Operational
              </span>
            </div>
          </div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center">
            &copy; {currentYear} Zafby INC. &bull; BUILT FOR DELIVERY HEROES
          </p>
        </div>
      </div>

      {/* Decorative Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-50/50">
        <div className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600 w-[45%] rounded-full opacity-30 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
      </div>
    </footer>
  );
}
