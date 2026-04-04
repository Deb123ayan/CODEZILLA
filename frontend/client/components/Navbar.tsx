import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight, Zap, LayoutDashboard, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // ── Auth state ────────────────────────────────────────────────────
  const { status, username, workerId, logout } = useUserAuth();
  const isLoggedIn = status === "authenticated";

  // Fetch real name from DB (same as DashboardHeader)
  const [displayName, setDisplayName] = useState<string>(username || "");

  useEffect(() => {
    if (!isLoggedIn || !workerId) return;
    api.get<{ name: string }>(`/workers/${workerId}/profile/`)
      .then((res) => { if (res?.name) setDisplayName(res.name); })
      .catch(() => {});
  }, [isLoggedIn, workerId]);

  const initials = displayName
    ? displayName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 1)
    : (username || "?").charAt(0).toUpperCase();

  const toggleMenu = () => setIsOpen(!isOpen);

  // Exclude on dashboard/admin routes
  const isDashboardRoute =
    location.pathname.includes("/dashboard") ||
    location.pathname.includes("/admin");
  if (isDashboardRoute) return null;

  const navLinks = [
    { name: "How It Works",   href: "/how-it-works" },
    { name: "Coverage Zones", href: "/coverage-zones" },
    { name: "Plans",          href: "/#plans" },
    { name: "UPI Settlements",href: "/upi-settlements" },
  ];

  return (
    <nav className="absolute top-0 z-50 w-full px-4 py-6 sm:px-6 lg:px-8 font-manrope">
      <div className={cn(
        "max-w-7xl mx-auto rounded-[2.5rem] transition-all duration-500 border border-transparent",
        isOpen ? "bg-[#ffffff] shadow-[0_24px_48px_-12px_rgba(27,28,27,0.08)] border-[#e4e2e0] px-6" : "px-4"
      )}>
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/logo.png" alt="Zafby Logo" className="w-12 h-12 object-contain group-hover:rotate-6 transition-transform duration-500" />
            <span className="font-extrabold text-2xl tracking-tighter text-[#1b1c1b] group-hover:text-[#004191] transition-colors">
              Zafby<span className="text-[#004191]">.</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center justify-center flex-1 ml-10 space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751] hover:text-[#004191] hover:-translate-y-0.5 transition-all"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA — auth-aware */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              // ── Logged-in state ──
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-6 py-3 bg-[#f5f3f1] text-[#1b1c1b] text-[11px] font-inter font-bold uppercase tracking-[0.12em] rounded-full hover:bg-[#e4e2e0] transition-all border border-[#e4e2e0]"
                >
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="w-10 h-10 rounded-full bg-[#004191] flex items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform select-none"
                  title={displayName}
                >
                  {initials}
                </Link>
              </>
            ) : (
              // ── Guest state ──
              <>
                <Link
                  to="/login"
                  className="text-[11px] font-inter font-bold uppercase tracking-[0.15em] text-[#1b1c1b] hover:text-[#004191] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-4 bg-[#1b1c1b] text-[#ffffff] text-[11px] font-inter font-bold uppercase tracking-[0.15em] rounded-full hover:bg-[#ba1a1a] transition-colors shadow-[0_12px_24px_-8px_rgba(27,28,27,0.4)] active:scale-[0.98] flex items-center space-x-3"
                >
                  <span>Activate Shield</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-3 bg-[#f5f3f1] text-[#1b1c1b] rounded-[1rem] hover:bg-[#1b1c1b] hover:text-[#ffffff] transition-all"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <div className={cn(
          "md:hidden overflow-hidden transition-all duration-500 ease-in-out",
          isOpen ? "max-h-[500px] opacity-100 pb-8" : "max-h-0 opacity-0"
        )}>
          <div className="space-y-6 px-4 pt-4 border-t border-[#e4e2e0]/50 mt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block text-sm font-inter font-extrabold uppercase tracking-widest text-[#434751] hover:text-[#004191] transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-6 flex flex-col gap-4 border-t border-[#e4e2e0]/50">
              {isLoggedIn ? (
                // ── Logged-in mobile ──
                <>
                  <div className="flex items-center gap-4 px-2 py-3">
                    <div className="w-10 h-10 rounded-full bg-[#004191] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#1b1c1b] truncate">{displayName || username}</p>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf]">Logged in</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center bg-[#004191] text-white text-[11px] font-inter font-bold uppercase tracking-widest rounded-full shadow-md"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={() => { setIsOpen(false); logout(); }}
                    className="w-full py-4 text-center text-[11px] font-inter font-bold uppercase tracking-widest text-[#ba1a1a] bg-[#fff0f0] rounded-full border border-[#ffdad6]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                // ── Guest mobile ──
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-4 text-center text-[11px] font-inter font-bold uppercase tracking-widest text-[#1b1c1b] bg-[#f5f3f1] rounded-full border border-[#e4e2e0]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full py-5 text-center bg-[#1b1c1b] text-white text-[11px] font-inter font-bold uppercase tracking-[0.15em] rounded-full shadow-[0_12px_24px_-8px_rgba(27,28,27,0.4)]"
                  >
                    Activate Shield
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
