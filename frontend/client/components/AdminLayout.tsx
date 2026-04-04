import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Home, Users, Shield, CreditCard, TrendingUp, LogOut } from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { cn } from "@/lib/utils";

const adminNavLinks = [
  { name: "Overview",  href: "/admin/dashboard" },
  { name: "Workers",   href: "/admin/workers" },
  { name: "Claims",    href: "/admin/claims" },
  { name: "Policies",  href: "/admin/policies" },
  { name: "Analytics", href: "/admin/analytics" },
];

const adminBottomNav = [
  { name: "Home",      href: "/admin/dashboard",  Icon: Home },
  { name: "Workers",   href: "/admin/workers",    Icon: Users },
  { name: "Claims",    href: "/admin/claims",     Icon: Shield },
  { name: "Policies",  href: "/admin/policies",   Icon: CreditCard },
  { name: "Analytics", href: "/admin/analytics",  Icon: TrendingUp },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">

      {/* ── Header (matches DashboardHeader style) ──────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-[#e4e2e0]/50">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto md:px-8 md:py-6">

          {/* Logo */}
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => navigate("/admin/dashboard")}
          >
            <img
              src="/client/assets/logo/logo.png"
              alt="Zafby Logo"
              className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform duration-500"
            />
            <span className="font-extrabold text-2xl tracking-tighter text-[#1b1c1b]">
              Zafby<span className="text-[#004191]">.</span>
              <span className="text-[#ba1a1a] text-sm font-medium ml-2 bg-[#ba1a1a]/10 px-2 py-0.5 rounded-full">Admin</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8 font-inter text-[11px] font-bold tracking-[0.05em] uppercase">
              {adminNavLinks.map((link) => (
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

            {/* Admin Avatar / Logout */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="hidden md:flex w-10 h-10 rounded-full bg-[#ba1a1a] items-center justify-center text-white font-bold text-sm shadow-md hover:scale-105 transition-transform select-none"
            >
              A
            </button>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center bg-[#f5f3f1] rounded-2xl border border-[#e4e2e0]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#fcf9f8] border-t border-[#e4e2e0]/50 px-6 py-4 space-y-1">
            {adminNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all",
                  location.pathname === link.href
                    ? "bg-[#004191] text-white"
                    : "text-[#1b1c1b]/60 hover:bg-[#f5f3f1] hover:text-[#004191]"
                )}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-[#ba1a1a] hover:bg-[#ffdad6]/30 transition-all"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </header>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>

      {/* ── Mobile Bottom Nav (matches MobileBottomNav style) ─────────────── */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/90 backdrop-blur-xl shadow-[0_-10px_30px_rgba(27,28,27,0.06)] rounded-t-[2.5rem] border-t border-[#e4e2e0]/40 px-4 py-4 pb-7">
        <div className="flex justify-around items-center max-w-sm mx-auto">
          {adminBottomNav.map(({ name, href, Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link
                key={name}
                to={href}
                className={cn(
                  "flex flex-col items-center justify-center px-3 py-2 rounded-2xl transition-all",
                  isActive
                    ? "bg-gradient-to-br from-[#004191] to-[#0058be] text-white shadow-md"
                    : "text-[#434751] hover:text-[#004191]"
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="font-inter text-[9px] font-bold tracking-[0.05em] uppercase mt-1">{name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
