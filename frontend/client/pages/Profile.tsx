import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User, Phone, MapPin, LogOut, ChevronRight, Zap, CreditCard,
  Truck, Shield, Calendar, Star, Loader2, Bell, Globe, Lock,
  HelpCircle, Wallet, ArrowUpRight, CheckCircle2, X, Save,
  Pencil, IdCard,
} from "lucide-react";
import { useUserAuth } from "@/context/UserAuthContext";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import DashboardHeader from "@/components/DashboardHeader";
import MobileBottomNav from "@/components/MobileBottomNav";

interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  platform: string;
  partner_id: string;
  city: string;
  zone: string;
  weekly_earnings: number;
  total_deliveries: number;
  rating: number | null;
  vehicle_type: string;
  joined_date: string;
  is_verified: boolean;
  wallet_savings: number;
  aadhaar_number: string | null;
  pan_number: string | null;
  aadhar_front: string | null;
  aadhar_back: string | null;
  pan_card: string | null;
}

interface EditForm {
  name: string;
  city: string;
  zone: string;
  vehicle_type: string;
}

const VEHICLE_OPTIONS = ["Bike", "Scooter", "Cycle", "Car"];

export default function Profile() {
  const { username, phoneNumber, platformId, workerId, logout, updateUsername } = useUserAuth();
  const navigate = useNavigate();

  const [profile, setProfile]       = useState<WorkerProfile | null>(null);
  const [loading, setLoading]       = useState(true);
  const [editOpen, setEditOpen]     = useState(false);
  const [govtIdOpen, setGovtIdOpen] = useState(false);
  const [saving, setSaving]         = useState(false);
  const [form, setForm]             = useState<EditForm>({
    name: "", city: "", zone: "", vehicle_type: "",
  });

  // ── Fetch profile ────────────────────────────────────────────────────
  const fetchProfile = async () => {
    if (!workerId) { setLoading(false); return; }
    try {
      const res = await api.get<WorkerProfile>(`/workers/${workerId}/profile/`);
      setProfile(res);
    } catch {
      toast.error("Could not load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, [workerId]);

  // ── Open drawer & auto-fill form from live data ───────────────────
  const handleEditOpen = () => {
    if (!profile) return;
    setForm({
      name:            profile.name            || "",
      city:            profile.city            || "",
      zone:            profile.zone            || "",
      vehicle_type:    profile.vehicle_type    || "Bike",
    });
    setEditOpen(true);
  };

  // ── Save changes ─────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!workerId) return;
    setSaving(true);
    try {
      await api.patch(`/workers/${workerId}/profile/`, {
        name:            form.name,
        city:            form.city,
        zone:            form.zone,
        vehicle_type:    form.vehicle_type,
      });
      toast.success("Profile updated successfully!");
      setEditOpen(false);
      updateUsername(form.name);
      await fetchProfile();          // re-fetch to show updated values
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    toast.success("You've been logged out securely");
    logout();
  };

  // ── Derived display values ─────────────────────────────────────────
  const displayName       = profile?.name       || username || "Delivery Partner";
  const displayPhone      = profile?.phone      || phoneNumber;
  const displayPlatform   = profile?.platform   || "General";
  const platformName      = displayPlatform.charAt(0).toUpperCase() + displayPlatform.slice(1);
  const displayCity       = profile?.city       || "India";
  const displayZone       = profile?.zone       || "";
  const displayRating     = profile?.rating     ?? null;
  const displayDeliveries = profile?.total_deliveries?.toLocaleString() ?? "—";
  const displayWeekly     = profile?.weekly_earnings ? `₹${profile.weekly_earnings.toLocaleString()}` : "—";
  const displayVehicle    = profile?.vehicle_type || "—";
  const displayPartner    = profile?.partner_id  || platformId || "—";
  const displayWallet     = profile?.wallet_savings ? `₹${Number(profile.wallet_savings).toLocaleString()}` : "₹0";
  const displayJoined     = profile?.joined_date
    ? new Date(profile.joined_date).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "—";
  const displayUPI        = displayPhone ? `${displayPhone}@okaxis` : "Not set";
  const initials          = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const getPlatformColors = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "zomato":
        return { bar: "from-[#E23744] via-[#cb202d] to-[#E23744]", base: "from-[#E23744] to-[#cb202d]", shadow: "shadow-[#E23744]/30", bg: "bg-[#fdf2f2]", text: "text-[#E23744]" };
      case "swiggy":
        return { bar: "from-[#FC8019] via-[#e26a04] to-[#FC8019]", base: "from-[#FC8019] to-[#e26a04]", shadow: "shadow-[#FC8019]/30", bg: "bg-[#fff7f0]", text: "text-[#FC8019]" };
      case "zepto":
        return { bar: "from-[#3B1578] via-[#240c4a] to-[#3B1578]", base: "from-[#3B1578] to-[#240c4a]", shadow: "shadow-[#3B1578]/30", bg: "bg-[#f3effb]", text: "text-[#3B1578]" };
      case "blinkit":
        return { bar: "from-[#F8CB46] via-[#d6a518] to-[#F8CB46]", base: "from-[#F8CB46] to-[#d6a518]", shadow: "shadow-[#F8CB46]/30", bg: "bg-[#fefaf0]", text: "text-[#d6a518]" };
      case "flipkart":
        return { bar: "from-[#FFC200] via-[#e6af00] to-[#FFC200]", base: "from-[#FFC200] to-[#e6af00]", shadow: "shadow-[#FFC200]/30", bg: "bg-[#fffce8]", text: "text-[#b08600]" };
      case "amazon":
        return { bar: "from-[#232F3E] via-[#131A22] to-[#232F3E]", base: "from-[#232F3E] to-[#131A22]", shadow: "shadow-[#232F3E]/30", bg: "bg-[#f2f4f8]", text: "text-[#232F3E]" };
      default:
        return { bar: "from-[#004191] via-[#0058be] to-[#004191]", base: "from-[#004191] to-[#0058be]", shadow: "shadow-[#004191]/30", bg: "bg-[#e8f0ff]", text: "text-[#004191]" };
    }
  };

  const pColors = getPlatformColors(displayPlatform);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f7f5f3] text-[#1b1c1b] font-manrope min-h-screen flex flex-col pb-28 md:pb-8">

      <DashboardHeader />

      <main className="flex-1 pt-28 md:pt-32 px-4 md:px-8 max-w-5xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Hero Card ── */}
        <div className="bg-white rounded-[2.5rem] shadow-[0_8px_32px_-8px_rgba(27,28,27,0.10)] border border-[#e4e2e0]/40 overflow-hidden">
          <div className={cn("h-2 w-full bg-gradient-to-r", pColors.bar)} />
          <div className="p-8 md:p-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className={cn("w-24 h-24 md:w-28 md:h-28 rounded-[1.75rem] bg-gradient-to-br flex items-center justify-center shadow-lg", pColors.base, pColors.shadow)}>
                  <span className="text-white text-3xl md:text-4xl font-black tracking-tighter">{initials}</span>
                </div>
                {profile?.is_verified && (
                  <div className="absolute -bottom-2 -right-2 bg-[#16a34a] rounded-full p-1.5 border-4 border-white shadow-md">
                    <CheckCircle2 size={14} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Name + meta */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
                  <span className={cn("px-3 py-1 text-[10px] font-inter font-bold uppercase tracking-[0.08em] rounded-full", pColors.bg, pColors.text)}>
                    {platformName} Partner
                  </span>
                  {profile?.is_verified && (
                    <span className="px-3 py-1 bg-[#dcfce7] text-[#16a34a] text-[10px] font-inter font-bold uppercase tracking-[0.08em] rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} strokeWidth={3} /> Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-4 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-[#1b1c1b] leading-none">
                    {displayName}
                  </h1>
                  <button
                    onClick={handleEditOpen}
                    className="w-8 h-8 rounded-full bg-[#f5f3f1] border border-[#e4e2e0] flex items-center justify-center text-[#434751] hover:bg-[#004191] hover:text-white hover:border-[#004191] transition-all active:scale-90"
                    title="Edit Profile"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-[#434751] font-medium mt-3">
                  {displayZone && (
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-[#004191]" />{displayZone}</span>
                  )}
                  {displayJoined !== "—" && (
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#004191]" />Since {displayJoined}</span>
                  )}
                  {displayVehicle !== "—" && (
                    <span className="flex items-center gap-1.5"><Truck size={14} className="text-[#004191]" />{displayVehicle}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Rating",     value: displayRating ? displayRating.toFixed(1) : "—", Icon: Star,    color: "text-[#d4af37]", bg: "bg-[#fefce8]" },
            { label: "Weekly",     value: displayWeekly,                                   Icon: Zap,     color: "text-[#004191]", bg: "bg-[#e8f0ff]" },
            { label: "Deliveries", value: displayDeliveries,                               Icon: Truck,   color: "text-[#7c3aed]", bg: "bg-[#f3e8ff]" },
            { label: "Savings",    value: displayWallet,                                   Icon: Wallet,  color: "text-[#16a34a]", bg: "bg-[#dcfce7]" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[1.75rem] p-6 shadow-[0_4px_16px_-4px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/40 hover:-translate-y-1 transition-all duration-300">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", s.bg)}>
                <s.Icon size={20} className={s.color} />
              </div>
              <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-1">{s.label}</p>
              <p className="text-xl font-black text-[#1b1c1b] truncate">{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Account Details ── */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_16px_-4px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/40 overflow-hidden">
          <div className="px-8 pt-8 pb-4 border-b border-[#f5f3f1]">
            <h2 className="text-lg font-black text-[#1b1c1b]">Account Details</h2>
          </div>
          <div className="divide-y divide-[#f5f3f1]">
            {[
              { Icon: Phone,      label: "Phone",               value: displayPhone || "—" },
              { Icon: Zap,        label: `${platformName} Partner ID`, value: displayPartner },
              { Icon: Shield,     label: "Aadhaar Card",        value: profile?.aadhaar_number || "—" },
              { Icon: CreditCard, label: "PAN Card",            value: profile?.pan_number || "—" },
              { Icon: MapPin,     label: "Service Zone",         value: displayZone || displayCity },
              { Icon: CreditCard, label: "UPI Settlement",       value: displayUPI },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 px-8 py-5 hover:bg-[#fafaf9] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-[#f5f3f1] flex items-center justify-center text-[#004191] flex-shrink-0">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf]">{label}</p>
                  <p className="text-sm font-bold text-[#1b1c1b] mt-0.5 font-mono">{value}</p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* ── Preferences ── */}
        <div className="bg-white rounded-[2rem] shadow-[0_4px_16px_-4px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/40 overflow-hidden">
          <div className="px-8 pt-8 pb-4 border-b border-[#f5f3f1]">
            <h2 className="text-lg font-black text-[#1b1c1b]">Preferences</h2>
          </div>
          <div className="divide-y divide-[#f5f3f1]">
            {[
              { Icon: Bell,  label: "Notifications", value: "Active",   dot: "#004191", onClick: () => {} },
              { Icon: Globe, label: "Language",       value: "English",  dot: "#16a34a", onClick: () => {} },
              { Icon: Shield,label: "Govt ID Status", value: profile?.is_verified ? "Verified" : "Pending", dot: profile?.is_verified ? "#16a34a" : "#ca8a04", onClick: () => setGovtIdOpen(true) },
              // { Icon: Lock,  label: "Biometrics",     value: "Enabled",  dot: "#16a34a", onClick: () => {} },
            ].map(({ Icon, label, value, dot, onClick }) => (
              <div 
                key={label} 
                onClick={onClick}
                className="flex items-center justify-between px-8 py-5 hover:bg-[#fafaf9] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f5f3f1] flex items-center justify-center text-[#434751] group-hover:bg-[#e8f0ff] group-hover:text-[#004191] transition-colors">
                    <Icon size={18} />
                  </div>
                  <p className="text-sm font-bold text-[#1b1c1b]">{label}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }} />
                    <span className="text-xs font-inter font-bold text-[#434751]">{value}</span>
                  </div>
                  <ChevronRight size={16} className="text-[#d4d4d4] group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Support + Logout ── */}
        <div className="grid sm:grid-cols-2 gap-4 pb-4">
          <button
            onClick={() => navigate("/help-center")}
            className="group flex items-center justify-between bg-white rounded-[2rem] p-8 shadow-[0_4px_16px_-4px_rgba(27,28,27,0.06)] border border-[#e4e2e0]/40 hover:border-[#004191]/30 hover:shadow-[0_8px_32px_-8px_rgba(0,65,145,0.15)] transition-all text-left"
          >
            <div>
              <HelpCircle size={28} className="text-[#004191] mb-3" />
              <p className="text-base font-black text-[#1b1c1b]">Help & Support</p>
              <p className="text-xs text-[#434751] font-medium mt-1">Claims, disputes, 24/7 chat</p>
            </div>
            <ArrowUpRight size={20} className="text-[#004191] opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <button
            onClick={handleLogout}
            className="group flex items-center justify-between bg-[#1b1c1b] rounded-[2rem] p-8 shadow-[0_8px_32px_-8px_rgba(27,28,27,0.3)] hover:bg-[#ba1a1a] transition-all duration-300 text-left"
          >
            <div>
              <LogOut size={28} className="text-white/60 group-hover:text-white mb-3 transition-colors" />
              <p className="text-base font-black text-white">Logout</p>
              <p className="text-xs text-white/50 group-hover:text-white/70 font-medium mt-1 transition-colors">Sign out of Zafby</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
              <ChevronRight size={18} className="text-white" />
            </div>
          </button>
        </div>

      </main>

      <MobileBottomNav />

      {/* ════════════════════════════════════════════════════════════════
          Edit Profile Drawer (slides up from bottom)
      ════════════════════════════════════════════════════════════════ */}
      {editOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setEditOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_-12px_rgba(27,28,27,0.25)] max-h-[92vh] overflow-y-auto">

              {/* Handle bar */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-[#e4e2e0] rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-8 py-4 border-b border-[#f5f3f1]">
                <div>
                  <h2 className="text-xl font-black text-[#1b1c1b]">Edit Profile</h2>
                  <p className="text-xs text-[#a8aebf] font-medium mt-0.5">Details pre-filled from your platform data</p>
                </div>
                <button
                  onClick={() => setEditOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#f5f3f1] flex items-center justify-center text-[#434751] hover:bg-[#e4e2e0] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <div className="px-8 py-6 space-y-5 pb-10">

                {/* Full Name */}
                <div>
                  <label className="block text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-5 py-4 bg-[#f7f5f3] border border-[#e4e2e0] rounded-2xl text-sm font-bold text-[#1b1c1b] focus:outline-none focus:border-[#004191] focus:ring-2 focus:ring-[#004191]/10 transition-all"
                    placeholder="Your full name"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-5 py-4 bg-[#f7f5f3] border border-[#e4e2e0] rounded-2xl text-sm font-bold text-[#1b1c1b] focus:outline-none focus:border-[#004191] focus:ring-2 focus:ring-[#004191]/10 transition-all"
                    placeholder="e.g. Bangalore"
                  />
                </div>

                {/* Zone */}
                <div>
                  <label className="block text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-2">
                    Service Zone
                  </label>
                  <input
                    type="text"
                    value={form.zone}
                    onChange={(e) => setForm({ ...form, zone: e.target.value })}
                    className="w-full px-5 py-4 bg-[#f7f5f3] border border-[#e4e2e0] rounded-2xl text-sm font-bold text-[#1b1c1b] focus:outline-none focus:border-[#004191] focus:ring-2 focus:ring-[#004191]/10 transition-all"
                    placeholder="e.g. Koramangala, Bangalore"
                  />
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="block text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-2">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {VEHICLE_OPTIONS.map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setForm({ ...form, vehicle_type: v })}
                        className={cn(
                          "py-3 rounded-2xl text-xs font-inter font-bold uppercase tracking-wider border-2 transition-all",
                          form.vehicle_type === v
                            ? "bg-[#004191] border-[#004191] text-white shadow-md"
                            : "bg-[#f7f5f3] border-[#e4e2e0] text-[#434751] hover:border-[#004191]/40"
                        )}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weekly Earnings (read-only) */}
                <div>
                  <label className="block text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-2">
                    Weekly Earnings <span className="text-[#a8aebf] normal-case tracking-normal font-normal">(fetched from platform)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a8aebf] font-bold text-sm">₹</span>
                    <input
                      type="text"
                      value={profile?.weekly_earnings?.toLocaleString() || "0"}
                      readOnly
                      className="w-full pl-9 pr-5 py-4 bg-[#f0eeed] border border-[#e4e2e0] rounded-2xl text-sm font-bold text-[#a8aebf] cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone (read-only) */}
                <div>
                  <label className="block text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf] mb-2">
                    Phone Number <span className="text-[#a8aebf] normal-case tracking-normal font-normal">(cannot be changed)</span>
                  </label>
                  <input
                    type="text"
                    value={displayPhone || "—"}
                    readOnly
                    className="w-full px-5 py-4 bg-[#f0eeed] border border-[#e4e2e0] rounded-2xl text-sm font-bold text-[#a8aebf] cursor-not-allowed"
                  />
                </div>

                {/* Save button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-5 bg-[#004191] hover:bg-[#0058be] text-white rounded-2xl font-inter font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.98] shadow-lg shadow-[#004191]/25 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {saving ? (
                    <><Loader2 size={18} className="animate-spin" /> Saving...</>
                  ) : (
                    <><Save size={18} /> Save Changes</>
                  )}
                </button>

              </div>
            </div>
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════
          Govt IDs Drawer
      ════════════════════════════════════════════════════════════════ */}
      {govtIdOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setGovtIdOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white rounded-t-[2.5rem] shadow-[0_-20px_60px_-12px_rgba(27,28,27,0.25)] max-h-[92vh] overflow-y-auto">
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1.5 bg-[#e4e2e0] rounded-full" />
              </div>

              <div className="flex items-center justify-between px-8 py-4 border-b border-[#f5f3f1]">
                <div>
                  <h2 className="text-xl font-black text-[#1b1c1b]">Government IDs</h2>
                  <p className="text-xs text-[#a8aebf] font-medium mt-0.5">Your verified identity documents</p>
                </div>
                <button
                  onClick={() => setGovtIdOpen(false)}
                  className="w-10 h-10 rounded-full bg-[#f5f3f1] flex items-center justify-center text-[#434751] hover:bg-[#e4e2e0] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="px-8 py-6 space-y-8 pb-12">
                {/* Aadhaar Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#e8f0ff] flex items-center justify-center text-[#004191]">
                      <IdCard size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf]">Aadhaar Number</p>
                      <p className="text-sm font-bold text-[#1b1c1b] font-mono">
                        {profile?.aadhaar_number ? `XXXX XXXX ${profile.aadhaar_number.replace(/\s/g, "").slice(-4)}` : "—"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase">Front View</p>
                      <div className="aspect-[3/2] bg-[#f7f5f3] rounded-2xl border border-[#e4e2e0] overflow-hidden flex items-center justify-center">
                        {profile?.aadhar_front ? (
                          <img src={profile.aadhar_front} alt="Aadhaar Front" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Shield className="w-8 h-8 text-[#e4e2e0] mx-auto mb-2" />
                            <p className="text-[8px] text-[#a8aebf] font-bold uppercase text-center">No image</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase">Back View</p>
                      <div className="aspect-[3/2] bg-[#f7f5f3] rounded-2xl border border-[#e4e2e0] overflow-hidden flex items-center justify-center">
                        {profile?.aadhar_back ? (
                          <img src={profile.aadhar_back} alt="Aadhaar Back" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center p-4">
                            <Shield className="w-8 h-8 text-[#e4e2e0] mx-auto mb-2" />
                            <p className="text-[8px] text-[#a8aebf] font-bold uppercase text-center">No image</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* PAN Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 border-t border-[#f5f3f1] pt-6">
                    <div className="w-8 h-8 rounded-lg bg-[#fefce8] flex items-center justify-center text-[#d4af37]">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-inter font-bold uppercase tracking-widest text-[#a8aebf]">PAN Card Number</p>
                      <p className="text-sm font-bold text-[#1b1c1b] font-mono">
                        {profile?.pan_number ? `${profile.pan_number.slice(0, 2)}***${profile.pan_number.slice(5, 6)}${profile.pan_number.slice(6, 9).replace(/./g, "*")}${profile.pan_number.slice(-1)}` : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-inter font-bold text-[#a8aebf] uppercase">Card Image</p>
                    <div className="aspect-video bg-[#f7f5f3] rounded-2xl border border-[#e4e2e0] overflow-hidden flex items-center justify-center">
                      {profile?.pan_card ? (
                        <img src={profile.pan_card} alt="PAN Card" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <Shield className="w-8 h-8 text-[#e4e2e0] mx-auto mb-2" />
                          <p className="text-[8px] text-[#a8aebf] font-bold uppercase text-center">No image</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
