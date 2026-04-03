import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Shield, DollarSign, Activity, ShieldCheck,
  TrendingUp, Edit2, ToggleLeft, ToggleRight,
  Zap, Plus, X, Loader2, Save, Trash2, Search, Users
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

// ── Reusable Modal ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1b1c1b]/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-[2.5rem] shadow-[0_40px_80px_-20px_rgba(27,28,27,0.3)] w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[#e4e2e0]/40">
          <h3 className="text-xl font-extrabold tracking-tight text-[#1b1c1b]">{title}</h3>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-[#f5f3f1] rounded-xl text-[#434751] hover:bg-[#ba1a1a] hover:text-white transition-all"><X size={16} /></button>
        </div>
        <div className="px-8 py-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-inter font-bold text-[#434751] uppercase tracking-[0.12em]">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-12 px-4 bg-[#fcf9f8] border border-[#e4e2e0] rounded-2xl text-sm font-bold placeholder:text-[#a8aebf] outline-none focus:ring-2 focus:ring-[#004191]/15 focus:border-[#004191]/40 transition-all";
const selectCls = inputCls + " cursor-pointer";

const PLAN_PRESETS: Record<string, { weekly_premium: number; coverage_limit: number }> = {
  BASIC:        { weekly_premium: 49,  coverage_limit: 5000  },
  PRO:          { weekly_premium: 99,  coverage_limit: 15000 },
  PREMIUM_PLUS: { weekly_premium: 199, coverage_limit: 50000 },
};

const PLAN_COLORS: Record<string, string> = {
  BASIC:        "bg-[#f5f3f1] text-[#434751]",
  PRO:          "bg-[#004191] text-white",
  PREMIUM_PLUS: "bg-[#1b1c1b] text-white",
};

const riskParams = [
  { label: "Auto-Approve Threshold",  value: "85%",     hint: "Claims with fraud score below this are auto-approved" },
  { label: "Fraud Flag Threshold",    value: "60%",     hint: "Claims above this score are flagged for manual review" },
  { label: "Max Daily Payout",        value: "₹50,000", hint: "Maximum compensation disbursed per worker per day" },
  { label: "Premium Scaling Factor",  value: "1.2×",    hint: "Applied to premiums in high-risk zones" },
  { label: "Claim Cooldown Period",   value: "7 days",  hint: "Minimum days between claims from the same worker" },
  { label: "Cycle Renewal Window",    value: "4 days",  hint: "Active policy duration before mandatory renewal" },
];

export default function AdminPolicies() {
  const [policies, setPolicies]   = useState<any[]>([]);
  const [workers,  setWorkers]    = useState<any[]>([]);
  const [loading,  setLoading]    = useState(true);
  const [search,   setSearch]     = useState("");

  // Modal state
  const [addOpen,    setAddOpen]    = useState(false);
  const [editPolicy, setEditPolicy] = useState<any | null>(null);
  const [dropPolicy, setDropPolicy] = useState<any | null>(null);
  const [saving,     setSaving]     = useState(false);

  // Form
  const blankAdd = { worker_id: "", plan_type: "BASIC", weekly_premium: "49", coverage_limit: "5000", payment_method: "MANUAL", duration_days: "4" };
  const [addForm,  setAddForm]  = useState(blankAdd);
  const [editForm, setEditForm] = useState<any>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pols, wkrs] = await Promise.all([
        api.get<any[]>("/admin/policies/list/"),
        api.get<any[]>("/admin/workers/")
      ]);
      setPolicies(pols || []);
      setWorkers(wkrs.filter((w: any) => !String(w.id).startsWith("mock")) || []);
    } catch {
      toast.error("Failed to load policies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── ADD ──────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.worker_id) { toast.error("Please select a worker"); return; }
    setSaving(true);
    try {
      await api.post("/admin/policies/list/", {
        ...addForm,
        weekly_premium: Number(addForm.weekly_premium),
        coverage_limit: Number(addForm.coverage_limit),
        duration_days: Number(addForm.duration_days)
      });
      toast.success("Policy issued to worker");
      setAddOpen(false);
      setAddForm(blankAdd);
      fetchData();
    } catch (e: any) { toast.error(e?.message || "Failed to issue policy"); }
    finally { setSaving(false); }
  };

  // Auto-fill premium/coverage when plan type changes
  const handleAddPlanChange = (plan: string) => {
    const preset = PLAN_PRESETS[plan];
    setAddForm(p => ({ ...p, plan_type: plan, weekly_premium: String(preset.weekly_premium), coverage_limit: String(preset.coverage_limit) }));
  };

  // ── EDIT ─────────────────────────────────────────────────────────────────
  const openEdit = (p: any) => { setEditPolicy(p); setEditForm({ plan_type: p.plan_type, weekly_premium: p.weekly_premium, coverage_limit: p.coverage_limit, status: p.status, payment_method: p.payment_method }); };
  const handleEdit = async () => {
    if (!editPolicy) return;
    setSaving(true);
    try {
      await api.patch(`/admin/policies/${editPolicy.policy_id}/`, { ...editForm, weekly_premium: Number(editForm.weekly_premium), coverage_limit: Number(editForm.coverage_limit) });
      toast.success("Policy updated");
      setEditPolicy(null);
      fetchData();
    } catch (e: any) { toast.error(e?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  // ── CANCEL ───────────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!dropPolicy) return;
    setSaving(true);
    try {
      await api.delete(`/admin/policies/${dropPolicy.policy_id}/`);
      toast.success("Policy cancelled");
      setDropPolicy(null);
      fetchData();
    } catch (e: any) { toast.error(e?.message || "Cancel failed"); }
    finally { setSaving(false); }
  };

  const filtered = policies.filter(p => {
    const q = search.toLowerCase();
    return !q || p.worker_name?.toLowerCase().includes(q) || p.policy_number?.toLowerCase().includes(q) || p.plan_type?.toLowerCase().includes(q);
  });

  const activePolicies   = policies.filter(p => p.status === "ACTIVE").length;
  const expiredPolicies  = policies.filter(p => p.status === "EXPIRED").length;
  const cancelledPolicies= policies.filter(p => p.status === "CANCELLED").length;
  const avgPremium       = policies.length ? Math.round(policies.reduce((s, p) => s + (p.weekly_premium || 0), 0) / policies.length) : 0;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Loading Policies...</h2>
      </div>
    );
  }

  return (
    <AdminLayout>

      {/* ── ADD Modal ──────────────────────────────────────────────────── */}
      {addOpen && (
        <Modal title="Issue New Policy" onClose={() => setAddOpen(false)}>
          <div className="space-y-4">
            <Field label="Worker">
              <select className={selectCls} value={addForm.worker_id} onChange={e => setAddForm(p => ({ ...p, worker_id: e.target.value }))}>
                <option value="">— Select a worker —</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name} · {w.platform} · {w.city}</option>)}
              </select>
            </Field>
            <Field label="Plan Type">
              <select className={selectCls} value={addForm.plan_type} onChange={e => handleAddPlanChange(e.target.value)}>
                <option value="BASIC">Basic (₹49 / 4 days)</option>
                <option value="PRO">Pro (₹99 / 4 days)</option>
                <option value="PREMIUM_PLUS">Premium Plus (₹199 / 4 days)</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Weekly Premium (₹)">
                <input type="number" className={inputCls} value={addForm.weekly_premium} onChange={e => setAddForm(p => ({ ...p, weekly_premium: e.target.value }))} />
              </Field>
              <Field label="Coverage Limit (₹)">
                <input type="number" className={inputCls} value={addForm.coverage_limit} onChange={e => setAddForm(p => ({ ...p, coverage_limit: e.target.value }))} />
              </Field>
              <Field label="Duration (days)">
                <input type="number" className={inputCls} value={addForm.duration_days} onChange={e => setAddForm(p => ({ ...p, duration_days: e.target.value }))} />
              </Field>
              <Field label="Payment Method">
                <select className={selectCls} value={addForm.payment_method} onChange={e => setAddForm(p => ({ ...p, payment_method: e.target.value }))}>
                  <option value="MANUAL">Manual</option>
                  <option value="UPI_AUTOPAY">UPI AutoPay</option>
                  <option value="WALLET">Wallet</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddOpen(false)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 h-12 bg-[#004191] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Shield size={14} />Issue Policy</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── EDIT Modal ──────────────────────────────────────────────────── */}
      {editPolicy && (
        <Modal title={`Edit — ${editPolicy.policy_number}`} onClose={() => setEditPolicy(null)}>
          <div className="space-y-4">
            <Field label="Worker"><p className="text-sm font-bold h-12 flex items-center px-4 bg-[#f5f3f1] rounded-2xl">{editPolicy.worker_name}</p></Field>
            <Field label="Plan Type">
              <select className={selectCls} value={editForm.plan_type} onChange={e => { const preset = PLAN_PRESETS[e.target.value]; setEditForm((p: any) => ({ ...p, plan_type: e.target.value, weekly_premium: preset?.weekly_premium || p.weekly_premium, coverage_limit: preset?.coverage_limit || p.coverage_limit })); }}>
                <option value="BASIC">Basic</option>
                <option value="PRO">Pro</option>
                <option value="PREMIUM_PLUS">Premium Plus</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Weekly Premium (₹)">
                <input type="number" className={inputCls} value={editForm.weekly_premium} onChange={e => setEditForm((p: any) => ({ ...p, weekly_premium: e.target.value }))} />
              </Field>
              <Field label="Coverage Limit (₹)">
                <input type="number" className={inputCls} value={editForm.coverage_limit} onChange={e => setEditForm((p: any) => ({ ...p, coverage_limit: e.target.value }))} />
              </Field>
            </div>
            <Field label="Status">
              <select className={selectCls} value={editForm.status} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="PENDING">Pending</option>
              </select>
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditPolicy(null)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 h-12 bg-[#004191] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} />Update</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CANCEL Confirm ──────────────────────────────────────────────── */}
      {dropPolicy && (
        <Modal title="Cancel Policy" onClose={() => setDropPolicy(null)}>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#ffdad6]/40 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={36} className="text-[#ba1a1a]" />
            </div>
            <div>
              <p className="font-bold text-lg">{dropPolicy.policy_number}</p>
              <p className="text-[#434751] text-sm mt-1">This policy will be marked as CANCELLED. The worker will lose coverage immediately.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDropPolicy(null)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Keep Active</button>
              <button onClick={handleCancel} disabled={saving} className="flex-1 h-12 bg-[#ba1a1a] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={14} />Cancel Policy</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Policy Ledger</h2>
          <p className="text-[#434751] mt-1 font-medium">{policies.length} total policies · {activePolicies} active · avg ₹{avgPremium}/4d</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#004191] text-white rounded-full font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all self-start sm:self-auto shadow-[0_8px_16px_-4px_rgba(0,65,145,0.3)]">
          <Plus size={14} /> Issue Policy
        </button>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Active Policies",    value: activePolicies,    Icon: ShieldCheck, color: "text-green-600", bg: "bg-[#dcfce7]" },
            { label: "Total Policies",     value: policies.length,   Icon: Shield,      color: "text-[#004191]", bg: "bg-[#f0f4ff]" },
            { label: "Avg Premium",        value: `₹${avgPremium}`,  Icon: DollarSign,  color: "text-[#004191]", bg: "bg-[#f0f4ff]" },
            { label: "Cancelled/Expired",  value: cancelledPolicies + expiredPolicies, Icon: Activity, color: "text-[#434751]", bg: "bg-[#f5f3f1]" },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:translate-y-[-4px] transition-transform duration-300 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30 min-h-[140px]">
              <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4", bg, color)}><Icon size={22} /></div>
              <div>
                <p className="font-inter text-[9px] font-bold text-[#434751] uppercase tracking-[0.1em] mb-1">{label}</p>
                <p className="text-2xl font-extrabold">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <section>
        <div className="bg-white rounded-[2.5rem] border border-[#e4e2e0]/30 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] p-5 md:p-6 flex items-center gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a8aebf] group-focus-within:text-[#004191] transition-colors" size={18} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by worker, policy number, or plan..." className="w-full h-14 pl-14 pr-5 bg-[#fcf9f8] border border-[#e4e2e0] rounded-2xl text-sm font-bold placeholder:text-[#a8aebf] outline-none focus:ring-2 focus:ring-[#004191]/10 transition-all" />
          </div>
        </div>
      </section>

      {/* ── Policies Table ───────────────────────────────────────────────── */}
      <section>
        {/* Mobile: cards */}
        <div className="block md:hidden space-y-4">
          {filtered.map((p: any) => (
            <div key={p.policy_id} className="bg-white rounded-3xl p-6 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[9px] font-bold text-[#004191] uppercase tracking-widest">{p.policy_number}</p>
                  <p className="font-bold text-[#1b1c1b]">{p.worker_name}</p>
                  <p className="text-[9px] text-[#a8aebf] uppercase tracking-widest">{p.worker_platform}</p>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest", PLAN_COLORS[p.plan_type] || "bg-[#f5f3f1] text-[#434751]")}>{p.plan_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-extrabold">₹{p.weekly_premium}<span className="text-xs font-normal text-[#a8aebf] ml-1">/ 4d</span></p>
                  <p className="text-[9px] text-[#434751]">covers up to ₹{(p.coverage_limit/1000).toFixed(0)}k</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(p)} className="w-9 h-9 bg-[#f0f4ff] text-[#004191] rounded-xl flex items-center justify-center hover:bg-[#004191] hover:text-white transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => setDropPolicy(p)} className="w-9 h-9 bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-all"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-[#e4e2e0]"><Shield size={36} className="text-[#e4e2e0] mx-auto mb-4" /><p className="font-bold text-[#a8aebf]">No policies found — issue one above</p></div>}
        </div>

        {/* Desktop: table */}
        <div className="hidden md:block bg-white rounded-[3rem] border border-[#e4e2e0]/30 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.12em] text-[#434751] bg-[#fcf9f8]/60 border-b border-[#e4e2e0]/40">
                <th className="px-8 py-5">Policy #</th>
                <th className="px-8 py-5">Worker</th>
                <th className="px-8 py-5">Plan</th>
                <th className="px-8 py-5">Premium</th>
                <th className="px-8 py-5">Coverage</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Valid Until</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e0]/30">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-8 py-20 text-center">
                  <Shield size={40} className="text-[#e4e2e0] mx-auto mb-4" />
                  <p className="text-[#a8aebf] text-sm font-bold">No policies yet — click "Issue Policy" to create one</p>
                </td></tr>
              ) : filtered.map((p: any) => (
                <tr key={p.policy_id} className="hover:bg-[#fcf9f8] transition-all group">
                  <td className="px-8 py-5">
                    <p className="text-[9px] font-bold text-[#004191] uppercase tracking-widest">{p.policy_number}</p>
                    <p className="text-[9px] text-[#a8aebf] font-bold mt-0.5">{p.payment_method?.replace(/_/g, ' ')}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#f0f4ff] rounded-xl flex items-center justify-center font-bold text-[#004191] text-xs group-hover:bg-[#004191] group-hover:text-white transition-colors">
                        {p.worker_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1b1c1b]">{p.worker_name}</p>
                        <p className="text-[9px] font-bold text-[#a8aebf] uppercase tracking-widest">{p.worker_platform}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest", PLAN_COLORS[p.plan_type] || "bg-[#f5f3f1] text-[#434751]")}>{p.plan_type}</span>
                  </td>
                  <td className="px-8 py-5 font-extrabold text-[#1b1c1b]">₹{p.weekly_premium}<span className="text-[9px] text-[#a8aebf] font-normal ml-1">/ 4d</span></td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-[#1b1c1b]">₹{(p.coverage_limit / 1000).toFixed(0)}k</p>
                    <div className="mt-1 h-1.5 bg-[#f5f3f1] rounded-full overflow-hidden max-w-[80px]">
                      <div className="h-full bg-[#004191] rounded-full" style={{ width: `${Math.min((p.coverage_limit / 50000) * 100, 100)}%` }} />
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                      p.status === "ACTIVE"    ? "bg-[#dcfce7] text-green-700" :
                      p.status === "EXPIRED"   ? "bg-orange-50 text-orange-600" :
                      p.status === "CANCELLED" ? "bg-[#f5f3f1] text-[#434751]" : "bg-[#d8e2ff] text-[#004191]")}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-[#434751]">{p.end_date || "—"}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="flex items-center gap-1.5 px-3 py-2 bg-[#f0f4ff] text-[#004191] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#004191] hover:text-white transition-all"><Edit2 size={12} />Edit</button>
                      <button onClick={() => setDropPolicy(p)} className="flex items-center gap-1.5 px-3 py-2 bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#ba1a1a] hover:text-white transition-all"><Trash2 size={12} />Cancel</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Risk Parameters (dark section) ───────────────────────────────── */}
      <section className="bg-[#1b1c1b] text-white rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(27,28,27,0.3)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#004191] rounded-full -mr-32 -mt-32 blur-[120px] opacity-20 mix-blend-screen pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Global Risk Parameters</h3>
              <p className="text-[#a8aebf] font-medium mt-2">AI-managed thresholds for claim processing and fraud detection.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#a8aebf]">Live</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {riskParams.map(param => (
              <div key={param.label} className="bg-white/5 rounded-3xl border border-white/10 p-6 hover:bg-white/10 transition-all">
                <p className="text-[9px] font-inter font-bold uppercase tracking-[0.15em] text-[#a8aebf] mb-2">{param.label}</p>
                <p className="text-3xl font-extrabold tracking-tighter text-white mb-2">{param.value}</p>
                <p className="text-[11px] text-[#a8aebf] leading-relaxed">{param.hint}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <button onClick={() => toast.success("Risk parameters synced to AI engine")} className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#1b1c1b] rounded-full font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#f0f4ff] transition-all shadow-lg">
              <Zap size={14} /> Sync AI Engine
            </button>
            <button onClick={() => toast.info("Audit log exported")} className="flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all border border-white/20">
              <TrendingUp size={14} /> Export Audit Log
            </button>
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
