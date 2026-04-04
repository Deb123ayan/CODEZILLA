import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Users, AlertCircle, DollarSign, Activity, ShieldCheck,
  CheckCircle2, TrendingUp, Loader2, LayoutGrid, Shield,
  CreditCard, Home, User, LogOut, Menu, X, Zap
} from "lucide-react";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from "recharts";

// ── Admin-specific nav links ──────────────────────────────────────────────────
const adminNavLinks = [
  { name: "Overview",  href: "/admin/dashboard" },
  { name: "Workers",   href: "/admin/workers" },
  { name: "Claims",    href: "/admin/claims" },
  { name: "Policies",  href: "/admin/policies" },
  { name: "Analytics", href: "/admin/analytics" },
];

const adminBottomNav = [
  { name: "Home",     href: "/admin/dashboard",  Icon: Home },
  { name: "Workers",  href: "/admin/workers",    Icon: Users },
  { name: "Claims",   href: "/admin/claims",     Icon: Shield },
  { name: "Policies", href: "/admin/policies",   Icon: CreditCard },
  { name: "Analytics",href: "/admin/analytics",  Icon: TrendingUp },
];

export default function AdminDashboard() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, claimsRes, workersRes] = await Promise.all([
        api.get<any>("/admin/analytics/"),
        api.get<any[]>("/admin/claims/list/"),
        api.get<any[]>("/admin/workers/")
      ]);
      setAnalytics(analyticsRes);
      setClaims(claimsRes || []);
      setWorkers(workersRes || []);
    } catch (error) {
      console.error("Admin fetch failed:", error);
      toast.error("Failed to sync platform data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
      toast.info("Please use the Navigation bar to move around.");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // ── Derive weekly chart data from claims ─────────────────────────────────
  const getChartData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split("T")[0];
      const dayName = days[d.getDay()];
      const approved = claims.filter(c =>
        (c.status === "AUTO_APPROVED" || c.status === "PAID") &&
        c.created_at?.split("T")[0] === dateStr
      ).reduce((s: number, c: any) => s + Number(c.compensation || 0), 0);
      const flagged = claims.filter(c =>
        c.status === "FRAUD_FLAGGED" &&
        c.created_at?.split("T")[0] === dateStr
      ).length * 500;
      return { name: dayName, payouts: approved, flagged };
    });
  };

  const chartData = getChartData();

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalClaims     = claims.length;
  const approvedClaims  = claims.filter(c => c.status === "AUTO_APPROVED" || c.status === "PAID").length;
  const flaggedClaims   = claims.filter(c => c.status === "FRAUD_FLAGGED").length;
  const pendingClaims   = claims.filter(c => c.status === "PENDING").length;
  const totalPayouts    = claims.reduce((s, c) => s + (c.status === "PAID" || c.status === "AUTO_APPROVED" ? Number(c.compensation || 0) : 0), 0);
  const activeWorkers   = analytics?.workers?.total ?? workers.length;
  const activePolicies  = analytics?.policies?.active ?? 0;
  const netRevenue      = analytics?.revenue?.net_revenue ?? 0;
  const lossRatio       = analytics?.revenue?.loss_ratio_percent ?? 0;
  const cyclePercent    = Math.min(Math.round((approvedClaims / Math.max(totalClaims, 1)) * 100), 100);

  // ── Loading screen (same as user dashboard) ───────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Syncing Platform Data...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#fcf9f8] text-[#1b1c1b] font-manrope selection:bg-[#004191]/20 selection:text-white min-h-screen flex flex-col pb-24 md:pb-0">

      {/* ── Admin Header (same style as DashboardHeader) ──────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-xl border-b border-[#e4e2e0]/50">
        <div className="flex justify-between items-center px-6 py-5 max-w-7xl mx-auto md:px-8 md:py-6">

          {/* Logo */}
          <div
            className="flex items-center space-x-3 group cursor-pointer"
            onClick={() => navigate("/admin/dashboard")}
          >
            <img src="/client/assets/logo/logo.png" alt="Zafby Logo" className="w-10 h-10 object-contain group-hover:rotate-6 transition-transform duration-500" />
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
                    location.pathname === link.href ? "text-[#004191]" : "text-[#1b1c1b]/60"
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

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center bg-[#f5f3f1] rounded-2xl border border-[#e4e2e0]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#fcf9f8] border-t border-[#e4e2e0]/50 px-6 py-4 space-y-1">
            {adminNavLinks.map(link => (
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

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 pt-32 pb-40 px-6 max-w-7xl mx-auto w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Metrics Grid (same pattern as Protection Overview) ──────────── */}
        <section>
          <div className="flex justify-between items-end mb-8 px-2">
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Platform Overview</h2>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-widest px-4 py-2 bg-[#004191] text-white rounded-full hover:bg-[#0058be] transition-all"
            >
              <Zap size={12} /> Refresh
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">

            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <Users className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Total Fleet</p>
                <p className="text-2xl font-extrabold">{activeWorkers > 1000 ? `${(activeWorkers/1000).toFixed(1)}k` : activeWorkers}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <ShieldCheck className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Active Policies</p>
                <p className="text-2xl font-extrabold">{activePolicies > 1000 ? `${(activePolicies/1000).toFixed(1)}k` : activePolicies || "–"}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <DollarSign className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Total Payouts</p>
                <p className="text-2xl font-extrabold">₹{totalPayouts > 1000 ? `${(totalPayouts/1000).toFixed(1)}k` : totalPayouts}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <AlertCircle className="text-[#ba1a1a] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Flagged Claims</p>
                <p className="text-2xl font-extrabold truncate">{flaggedClaims} <span className="text-xs font-normal text-[#434751]/80">total</span></p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[160px]">
              <CheckCircle2 className="text-[#004191] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Approved</p>
                <p className="text-2xl font-extrabold">{approvedClaims}</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border-2 border-[#16a34a]/20 min-h-[160px]">
              <Activity className="text-[#16a34a] mb-6" size={32} />
              <div>
                <p className="font-inter text-[9px] md:text-[10px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">Loss Ratio</p>
                <p className="text-2xl font-extrabold text-[#16a34a]">{lossRatio > 60 ? "High" : lossRatio > 30 ? "Med" : "Low"}</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── Platform Health Hero (same structure as 30-Day cycle section) ── */}
        <section className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-12 text-white shadow-[0_40px_80px_-20px_rgba(27,28,27,0.3)] relative overflow-hidden flex flex-col md:flex-row items-center gap-12 group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#004191] rounded-full -mr-32 -mt-32 blur-[120px] opacity-20 mix-blend-screen pointer-events-none group-hover:opacity-30 transition-opacity duration-700" />

          <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Platform Health Report</h2>
              <p className="text-[#a8aebf] font-medium text-lg mt-2">Real-time operational metrics and system integrity.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 py-4">
              <div className="space-y-1">
                <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em]">Total Claims</p>
                <p className="text-3xl font-extrabold text-white">{totalClaims}<span className="text-lg text-[#434751] font-medium ml-1">total</span></p>
              </div>
              <div className="w-px h-12 bg-[#434751]/40 hidden md:block" />
              <div className="space-y-1">
                <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em]">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#16a34a] rounded-full animate-pulse shadow-[0_0_8px_rgba(22,163,74,0.6)]" />
                  <p className="text-xl font-bold text-white tracking-tight">Operational</p>
                </div>
              </div>
              <div className="w-px h-12 bg-[#434751]/40 hidden md:block" />
              <div className="space-y-1">
                <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em]">Net Revenue</p>
                <p className="text-3xl font-extrabold text-white">₹{netRevenue > 1000 ? `${(netRevenue/1000).toFixed(1)}k` : netRevenue || "–"}</p>
              </div>
            </div>

            <p className="text-sm text-[#a8aebf] leading-relaxed max-w-md mx-auto md:mx-0">
              Claim approval rate is tracked continuously. Maintain fraud scores below 0.5 to keep the loss ratio in the healthy zone.
            </p>
          </div>

          {/* Circular Progress Ring (same as user dashboard) */}
          <div className="relative shrink-0 w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-[#434751]/30" />
              <circle
                cx="50" cy="50" r="44" stroke="currentColor" strokeWidth="8" fill="transparent"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={2 * Math.PI * 44 * (1 - cyclePercent / 100)}
                strokeLinecap="round"
                className="text-[#004191] transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-extrabold text-white tracking-tighter">{cyclePercent}%</span>
              <span className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-[0.2em] mt-1">Approval Rate</span>
            </div>
          </div>
        </section>

        {/* ── Chart + Pending Claims side panel ───────────────────────────── */}
        <section className="grid lg:grid-cols-3 gap-8 lg:gap-12">

          {/* Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/30 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 gap-6">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight mb-2">Claims Pipeline</h3>
                <p className="text-[#434751] font-medium text-sm">Payouts (blue) vs Fraud Flagged (red) this week</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#004191]"></span>
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751]">Payouts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ba1a1a]/60"></span>
                  <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-[#434751]">Flagged</span>
                </div>
              </div>
            </div>

            <div className="h-64 sm:h-80 relative flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPayouts" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#004191" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#004191" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFlagged" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e4e2e0" opacity={0.6} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#434751', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} dy={16} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#434751', fontSize: 11, fontFamily: 'Inter', fontWeight: 600 }} dx={-10} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '1.5rem', border: '1px solid #e4e2e0',
                      boxShadow: '0 24px 48px -12px rgba(27,28,27,0.1)', padding: '1.25rem',
                      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)'
                    }}
                    itemStyle={{ fontWeight: 800, fontSize: '12px', fontFamily: 'Manrope' }}
                    labelStyle={{ color: '#434751', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="payouts" stroke="#004191" strokeWidth={3} fillOpacity={1} fill="url(#colorPayouts)" />
                  <Area type="monotone" dataKey="flagged" stroke="#ba1a1a" strokeWidth={3} fillOpacity={1} fill="url(#colorFlagged)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pending Claims Queue (same card style as Assigned Tasks) */}
          <div className="space-y-6 flex flex-col">
            <div className="flex justify-between items-end px-2 mb-2">
              <h3 className="text-2xl font-extrabold tracking-tight">Pending Review</h3>
              <span className="text-[10px] font-inter text-[#004191] font-bold uppercase tracking-[0.1em] px-3 py-1 bg-[#d8e2ff] rounded-full">
                {pendingClaims} Open
              </span>
            </div>

            <div className="space-y-6 flex-1 max-h-[500px] overflow-y-auto no-scrollbar">
              {claims.filter(c => c.status === "PENDING" || c.status === "FRAUD_FLAGGED").length === 0 ? (
                <div className="bg-[#f5f3f1] rounded-[2rem] p-12 text-center h-full flex flex-col items-center justify-center border border-dashed border-[#c3c6d3]">
                  <CheckCircle2 size={40} className="text-[#a8aebf] mb-4" />
                  <h4 className="font-bold text-[#1b1c1b] text-lg">Queue Clear</h4>
                  <p className="text-sm text-[#434751] mt-2">No claims need manual review.</p>
                </div>
              ) : (
                claims.filter(c => c.status === "PENDING" || c.status === "FRAUD_FLAGGED").slice(0, 5).map((claim: any) => (
                  <div key={claim.claim_id} className="bg-white rounded-3xl p-8 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/50 hover:border-[#004191]/20 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        claim.status === "FRAUD_FLAGGED" ? "bg-[#ffdad6]/40" : "bg-[#f5f3f1]"
                      )}>
                        <AlertCircle className={claim.status === "FRAUD_FLAGGED" ? "text-[#ba1a1a]" : "text-[#004191]"} size={24} />
                      </div>
                      <span className="text-sm font-inter font-extrabold text-[#1b1c1b]">₹{claim.compensation}</span>
                    </div>
                    <h4 className="text-base font-bold mb-1 text-[#1b1c1b] leading-tight">
                      {claim.worker__name || "Unknown Worker"}
                    </h4>
                    <p className="text-xs text-[#434751] mb-6 leading-relaxed">
                      {claim.claim_reason?.replace(/_/g, ' ')} &nbsp;·&nbsp;
                      <span className={cn(
                        "uppercase text-[9px] tracking-widest px-1.5 py-0.5 rounded-full font-bold",
                        claim.status === "FRAUD_FLAGGED" ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#d8e2ff] text-[#004191]"
                      )}>
                        {claim.status?.replace(/_/g, ' ')}
                      </span>
                    </p>
                    <Link
                      to="/admin/claims"
                      className="block w-full py-3.5 bg-gradient-to-tr from-[#004191] to-[#0058be] text-white rounded-full font-inter font-bold text-xs uppercase tracking-[0.15em] text-center active:scale-[0.98] transition-all shadow-[0_8px_16px_-4px_rgba(0,65,145,0.3)]"
                    >
                      Review Claim
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

        </section>

        {/* ── Recent Workers table (same card style) ────────────────────── */}
        <section>
          <div className="flex justify-between items-end mb-8 px-2">
            <h3 className="text-2xl font-extrabold tracking-tight">Recent Worker Registrations</h3>
            <Link to="/admin/workers" className="text-[10px] font-inter text-[#004191] font-bold uppercase tracking-[0.1em] hover:underline">
              View All →
            </Link>
          </div>
          <div className="bg-white rounded-[3rem] border border-[#e4e2e0]/30 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] overflow-hidden">
            {/* Mobile: stacked cards */}
            <div className="block md:hidden divide-y divide-[#e4e2e0]/40">
              {workers.slice(0, 6).map((w: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-[#f0f4ff] rounded-2xl flex items-center justify-center font-bold text-[#004191] text-sm shrink-0">
                      {w.name?.split(' ').map((n: any) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-[#1b1c1b]">{w.name}</p>
                      <p className="text-[9px] font-bold text-[#a8aebf] uppercase tracking-widest">{w.platform} · {w.city}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                    w.is_verified ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef9c3] text-[#854d0e]"
                  )}>
                    {w.is_verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
              {workers.length === 0 && (
                <div className="py-16 text-center text-[#a8aebf] text-xs font-bold uppercase tracking-widest">No workers registered yet</div>
              )}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.12em] text-[#434751] bg-[#fcf9f8]/60 border-b border-[#e4e2e0]/40">
                    <th className="px-10 py-5">Worker</th>
                    <th className="px-10 py-5">Platform</th>
                    <th className="px-10 py-5">Location</th>
                    <th className="px-10 py-5">KYC Status</th>
                    <th className="px-10 py-5">Onboarding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e4e2e0]/30">
                  {workers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-16 text-center text-[#a8aebf] text-xs font-bold uppercase tracking-widest">
                        No workers registered yet — run load_mock_json.py to seed data
                      </td>
                    </tr>
                  ) : workers.slice(0, 8).map((w: any, i: number) => (
                    <tr key={i} className="hover:bg-[#fcf9f8] transition-all group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-[#f0f4ff] rounded-2xl flex items-center justify-center font-bold text-[#004191] text-sm shrink-0 group-hover:bg-[#004191] group-hover:text-white transition-colors">
                            {w.name?.split(' ').map((n: any) => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-bold text-[#1b1c1b]">{w.name}</p>
                            <p className="text-[9px] font-bold text-[#a8aebf] uppercase tracking-widest">{w.partner_id || "–"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={cn(
                          "px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                          w.platform === 'Zomato' ? "bg-red-50 text-red-600 border-red-100" :
                          w.platform === 'Swiggy' ? "bg-orange-50 text-orange-600 border-orange-100" :
                          w.platform === 'Zepto'  ? "bg-purple-50 text-purple-600 border-purple-100" :
                          "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                          {w.platform}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-sm font-medium text-[#434751]">{w.city} · {w.zone}</td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", w.is_verified ? "bg-green-500 shadow-[0_0_6px_rgba(22,197,94,0.5)]" : "bg-orange-400")} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#434751]">{w.is_verified ? "Verified" : "Review"}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                          w.onboarding_completed ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fef9c3] text-[#854d0e]"
                        )}>
                          {w.onboarding_completed ? "Complete" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </main>

      {/* ── Mobile Bottom Nav (same as user dashboard) ────────────────────── */}
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
