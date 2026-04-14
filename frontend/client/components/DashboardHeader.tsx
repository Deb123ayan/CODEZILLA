import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { name: "Home",       href: "/dashboard" },
  { name: "Tasks",      href: "/deliveries" },
  { name: "Protection", href: "/policies" },
  { name: "Earnings",   href: "/payouts" },
  { name: "Profile",    href: "/profile" },
];

export default function DashboardHeader() {
  const { username, workerId } = useUserAuth();
  const location  = useLocation();
  const navigate  = useNavigate();
  
  const isOnboarding = location.pathname === "/profile-setup" || location.pathname === "/document-verification";

  // Fetch the real name from the DB, fall back to auth-context username
  const [displayName, setDisplayName] = useState<string>(username || "");

  useEffect(() => {
    
    if (!workerId || isOnboarding) return;
    api.get<{ name: string }>(`/workers/${workerId}/profile/`)
      .then((res) => {
        if (res?.name) setDisplayName(res.name);
      })
      .catch(() => {
        // silently ignore — fallback to username is already set
      });
  }, [workerId, isOnboarding]);

  const { phoneNumber, status } = useUserAuth();
  const prevClaimsLen = useRef<number>(-1);

  useEffect(() => {
    if (status !== 'authenticated' || (!workerId && !phoneNumber)) return;
    const pid = workerId || phoneNumber;

    const checkAlerts = async () => {
      try {
        const claimRes = await api.get<any>(`/claims/history/?worker_id=${pid}`);
        const currentClaims = claimRes.claims || [];
        if (prevClaimsLen.current !== -1 && currentClaims.length > prevClaimsLen.current) {
          toast.success("New Claim Update Received!", {
            description: "Check your alerts for details."
          });
        }
        prevClaimsLen.current = currentClaims.length;
      } catch (e) {}
    };

    checkAlerts();
    const intervalId = setInterval(checkAlerts, 30000);
    return () => clearInterval(intervalId);
  }, [workerId, phoneNumber, status]);
  
  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 1)
    : (username || "?").charAt(0).toUpperCase();

  return (
    
    <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-[#e4e2e0]/50">
      <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto md:px-8 md:py-6">
      
        {/* Logo */}
        <div
          className={cn("flex items-center space-x-3 group", !isOnboarding && "cursor-pointer")}
          onClick={() => {
            if (!isOnboarding) navigate("/dashboard");
          }}
        >
          <BrandLogo />
        </div>

        <div className="flex items-center gap-6">
          {/* Desktop Nav */}
          {!isOnboarding && (
            <nav className="hidden md:flex items-center gap-8 font-inter text-[11px] font-bold tracking-[0.05em] uppercase">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={cn(
                    "transition-colors hover:text-[#004191]",
                    location.pathname === link.href
                      ? "text-[#004191]"
                      : "text-[#1b1c1b]/60"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          )}

          {/* Avatar — shows real name initials, tooltip shows full name */}
          {!isOnboarding && (
            <Link
              to="/profile"
              className="w-10 h-10 rounded-full bg-[#004191] flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform select-none"
              title={displayName}
            >
              {initials}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}