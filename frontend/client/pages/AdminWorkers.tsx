import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Users, Search, MapPin, Phone, UserPlus, UserX,
  CheckCircle2, Globe, Edit2, Trash2, Loader2, X, Save
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

interface Worker {
  id: string;
  name: string;
  platform: string;
  partner_id: string;
  city: string;
  zone: string;
  avg_daily_income: number;
  weekly_earnings: number;
  vehicle_type: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  is_active?: boolean;
  phone?: string;
  email?: string;
}

const PLATFORMS = ["Zomato", "Swiggy", "Blinkit", "Amazon", "Flipkart", "Zepto"];
const VEHICLES  = ["Bike", "Scooter", "Cycle", "Car"];

// ── Reusable Modal Shell ──────────────────────────────────────────────────────
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

// ── Field Component ───────────────────────────────────────────────────────────
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

export default function AdminWorkers() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");

  // Modal state
  const [addOpen, setAddOpen]       = useState(false);
  const [editWorker, setEditWorker] = useState<Worker | null>(null);
  const [deleteWorker, setDeleteWorker] = useState<Worker | null>(null);
  const [saving, setSaving]         = useState(false);

  // Form state
  const blankForm = { name: "", phone: "", email: "", platform: "Zomato", city: "", zone: "", vehicle_type: "Bike", weekly_earnings: "", partner_id: "", is_verified: false };
  const [form, setForm]     = useState(blankForm);
  const [editForm, setEditForm] = useState<any>({});

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await api.get<Worker[]>("/admin/workers/");
      setWorkers(data);
    } catch (e) {
      toast.error("Failed to load worker registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWorkers(); }, []);

  const platforms = [
    "all",
    ...PLATFORMS.filter(p =>
      workers.some(w => w.platform?.trim().toLowerCase() === p.toLowerCase())
    )
  ];

  const filtered = workers.filter(w => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || w.name?.toLowerCase().includes(q) || w.platform?.toLowerCase().includes(q) || w.city?.toLowerCase().includes(q)) &&
      (filterPlatform === "all" || w.platform?.trim().toLowerCase() === filterPlatform.toLowerCase())
    );
  });

  // ── ADD ──
  const handleAdd = async () => {
    setSaving(true);
    try {
      await api.post("/admin/workers/create/", { ...form, weekly_earnings: Number(form.weekly_earnings) || 0 });
      toast.success("Worker added to registry");
      setAddOpen(false);
      setForm(blankForm);
      fetchWorkers();
    } catch (e: any) {
      toast.error(e?.message || "Failed to add worker");
    } finally { setSaving(false); }
  };

  // ── EDIT ──
  const openEdit = (w: Worker) => { setEditWorker(w); setEditForm({ ...w }); };
  const handleEdit = async () => {
    if (!editWorker) return;
    setSaving(true);
    try {
      await api.patch(`/admin/workers/${editWorker.id}/`, editForm);
      toast.success("Worker profile updated");
      setEditWorker(null);
      fetchWorkers();
    } catch (e: any) {
      toast.error(e?.message || "Update failed");
    } finally { setSaving(false); }
  };

  // ── DELETE ──
  const handleDelete = async () => {
    if (!deleteWorker) return;
    setSaving(true);
    try {
      await api.delete(`/admin/workers/${deleteWorker.id}/`);
      toast.success("Worker deactivated");
      setDeleteWorker(null);
      fetchWorkers();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    } finally { setSaving(false); }
  };

  const verifiedCount  = workers.filter(w => w.is_verified).length;
  const pendingCount   = workers.filter(w => !w.is_verified).length;
  const onboardedCount = workers.filter(w => w.onboarding_completed).length;

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Loading Worker Registry...</h2>
      </div>
    );
  }

  return (
    <AdminLayout>

      {/* ── ADD Modal ──────────────────────────────────────────────────── */}
      {addOpen && (
        <Modal title="Add New Worker" onClose={() => setAddOpen(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name"><input className={inputCls} placeholder="Ravi Kumar" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} /></Field>
              <Field label="Phone"><input className={inputCls} placeholder="9876543210" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} /></Field>
              <Field label="Email"><input className={inputCls} placeholder="email@example.com" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} /></Field>
              <Field label="Platform">
                <select className={selectCls} value={form.platform} onChange={e => setForm(p => ({...p, platform: e.target.value}))}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="City"><input className={inputCls} placeholder="Bengaluru" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} /></Field>
              <Field label="Zone"><input className={inputCls} placeholder="KR Puram" value={form.zone} onChange={e => setForm(p => ({...p, zone: e.target.value}))} /></Field>
              <Field label="Vehicle">
                <select className={selectCls} value={form.vehicle_type} onChange={e => setForm(p => ({...p, vehicle_type: e.target.value}))}>
                  {VEHICLES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Weekly Earnings (₹)"><input type="number" className={inputCls} placeholder="3500" value={form.weekly_earnings} onChange={e => setForm(p => ({...p, weekly_earnings: e.target.value}))} /></Field>
              <Field label="Partner ID"><input className={inputCls} placeholder="ZOM-XXXXX" value={form.partner_id} onChange={e => setForm(p => ({...p, partner_id: e.target.value}))} /></Field>
              <Field label="KYC Verified">
                <select className={selectCls} value={form.is_verified ? "yes" : "no"} onChange={e => setForm(p => ({...p, is_verified: e.target.value === "yes"}))}>
                  <option value="no">Pending</option>
                  <option value="yes">Verified</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddOpen(false)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="flex-1 h-12 bg-[#004191] text-white rounded-2xl font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><UserPlus size={14} /> Add Worker</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── EDIT Modal ─────────────────────────────────────────────────── */}
      {editWorker && (
        <Modal title={`Edit — ${editWorker.name}`} onClose={() => setEditWorker(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name"><input className={inputCls} value={editForm.name || ""} onChange={e => setEditForm((p: any) => ({...p, name: e.target.value}))} /></Field>
              <Field label="Platform">
                <select className={selectCls} value={editForm.platform || ""} onChange={e => setEditForm((p: any) => ({...p, platform: e.target.value}))}>
                  {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="City"><input className={inputCls} value={editForm.city || ""} onChange={e => setEditForm((p: any) => ({...p, city: e.target.value}))} /></Field>
              <Field label="Zone"><input className={inputCls} value={editForm.zone || ""} onChange={e => setEditForm((p: any) => ({...p, zone: e.target.value}))} /></Field>
              <Field label="Vehicle">
                <select className={selectCls} value={editForm.vehicle_type || ""} onChange={e => setEditForm((p: any) => ({...p, vehicle_type: e.target.value}))}>
                  {VEHICLES.map(v => <option key={v}>{v}</option>)}
                </select>
              </Field>
              <Field label="Weekly Earnings (₹)"><input type="number" className={inputCls} value={editForm.weekly_earnings || ""} onChange={e => setEditForm((p: any) => ({...p, weekly_earnings: e.target.value}))} /></Field>
              <Field label="KYC Status">
                <select className={selectCls} value={editForm.is_verified ? "yes" : "no"} onChange={e => setEditForm((p: any) => ({...p, is_verified: e.target.value === "yes"}))}>
                  <option value="no">Pending</option>
                  <option value="yes">Verified</option>
                </select>
              </Field>
              <Field label="Active Status">
                <select className={selectCls} value={editForm.is_active !== false ? "yes" : "no"} onChange={e => setEditForm((p: any) => ({...p, is_active: e.target.value === "yes"}))}>
                  <option value="yes">Active</option>
                  <option value="no">Deactivated</option>
                </select>
              </Field>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditWorker(null)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 h-12 bg-[#004191] text-white rounded-2xl font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} /> Save Changes</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DELETE Confirm ─────────────────────────────────────────────── */}
      {deleteWorker && (
        <Modal title="Deactivate Worker" onClose={() => setDeleteWorker(null)}>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#ffdad6]/40 rounded-full flex items-center justify-center mx-auto">
              <UserX size={36} className="text-[#ba1a1a]" />
            </div>
            <div>
              <p className="font-bold text-lg text-[#1b1c1b]">{deleteWorker.name}</p>
              <p className="text-[#434751] text-sm mt-1">This worker will be deactivated and removed from active registry. This action can be reversed by re-editing.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteWorker(null)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 h-12 bg-[#ba1a1a] text-white rounded-2xl font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={14} /> Deactivate</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Worker Registry</h2>
          <p className="text-[#434751] mt-1 font-medium">{workers.length} total partners · {verifiedCount} verified</p>
        </div>
        <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-[#004191] text-white rounded-full font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all self-start sm:self-auto shadow-[0_8px_16px_-4px_rgba(0,65,145,0.3)]">
          <UserPlus size={14} /> Add Worker
        </button>
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Total Partners",  value: workers.length,   Icon: Users,        color: "text-[#004191]", bg: "bg-[#f0f4ff]" },
            { label: "Verified",        value: verifiedCount,    Icon: CheckCircle2, color: "text-green-600", bg: "bg-[#dcfce7]" },
            { label: "Pending KYC",     value: pendingCount,     Icon: UserX,        color: "text-orange-600",bg: "bg-orange-50" },
            { label: "Onboarded",       value: onboardedCount,   Icon: Globe,        color: "text-[#004191]", bg: "bg-[#f0f4ff]" },
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

      {/* ── Search + Filter ──────────────────────────────────────────────── */}
      <section>
        <div className="bg-white rounded-[2.5rem] border border-[#e4e2e0]/30 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] p-5 md:p-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a8aebf] group-focus-within:text-[#004191] transition-colors" size={18} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name, platform, or city..." className="w-full h-14 pl-14 pr-5 bg-[#fcf9f8] border border-[#e4e2e0] rounded-2xl text-sm font-bold placeholder:text-[#a8aebf] outline-none focus:ring-2 focus:ring-[#004191]/10 focus:border-[#004191]/30 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {platforms.map(p => (
              <button key={p} onClick={() => setFilterPlatform(p)} className={cn("h-12 px-5 rounded-2xl text-[9px] font-inter font-bold uppercase tracking-widest border transition-all", filterPlatform === p ? "bg-[#004191] text-white border-[#004191]" : "bg-white text-[#434751] border-[#e4e2e0] hover:border-[#004191]/30")}>
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <section>
        {/* Mobile cards */}
        <div className="block md:hidden space-y-4">
          {filtered.map((w, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#f0f4ff] rounded-2xl flex items-center justify-center font-bold text-[#004191]">
                    {w.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <div><p className="font-bold">{w.name}</p><p className="text-[9px] text-[#a8aebf] uppercase tracking-widest">{w.platform}</p></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(w)} className="w-9 h-9 bg-[#f0f4ff] text-[#004191] rounded-xl flex items-center justify-center hover:bg-[#004191] hover:text-white transition-all"><Edit2 size={14} /></button>
                  {!w.id?.startsWith("mock") && <button onClick={() => setDeleteWorker(w)} className="w-9 h-9 bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-all"><Trash2 size={14} /></button>}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-[#434751]"><MapPin size={11} className="text-[#ba1a1a]" />{w.city}</span>
                <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest", w.is_verified ? "bg-[#dcfce7] text-green-700" : "bg-orange-50 text-orange-600")}>{w.is_verified ? "Verified" : "Pending"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-[3rem] border border-[#e4e2e0]/30 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.12em] text-[#434751] bg-[#fcf9f8]/60 border-b border-[#e4e2e0]/40">
                <th className="px-8 py-5">Worker</th>
                <th className="px-8 py-5">Platform</th>
                <th className="px-8 py-5">Location</th>
                <th className="px-8 py-5">Avg Daily</th>
                <th className="px-8 py-5">KYC</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e0]/30">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-[#a8aebf] text-sm font-bold">No workers match your search</td></tr>
              ) : filtered.map((w, i) => (
                <tr key={i} className="hover:bg-[#fcf9f8] transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#f0f4ff] rounded-2xl flex items-center justify-center font-bold text-[#004191] text-sm group-hover:bg-[#004191] group-hover:text-white transition-colors">
                        {w.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
                      </div>
                      <div>
                        <p className="font-bold text-[#1b1c1b]">{w.name}</p>
                        <p className="text-[9px] font-bold text-[#a8aebf] flex items-center gap-1"><Phone size={9} /> {w.phone || "—"} · {w.partner_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                      w.platform === 'Zomato' ? "bg-red-50 text-red-600 border-red-100" :
                      w.platform === 'Swiggy' ? "bg-orange-50 text-orange-600 border-orange-100" :
                      w.platform === 'Zepto'  ? "bg-purple-50 text-purple-600 border-purple-100" :
                      "bg-blue-50 text-blue-600 border-blue-100")}>
                      {w.platform}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-medium text-[#434751] flex items-center gap-1"><MapPin size={12} className="text-[#ba1a1a]" />{w.city} · {w.zone}</td>
                  <td className="px-8 py-5 font-bold">₹{w.avg_daily_income || "—"}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", w.is_verified ? "bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" : "bg-orange-400")} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#434751]">{w.is_verified ? "Verified" : "Review"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(w)} className="flex items-center gap-1.5 px-3 py-2 bg-[#f0f4ff] text-[#004191] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#004191] hover:text-white transition-all"><Edit2 size={12} />Edit</button>
                      {!w.id?.startsWith("mock") && (
                        <button onClick={() => setDeleteWorker(w)} className="flex items-center gap-1.5 px-3 py-2 bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl text-[9px] font-bold uppercase tracking-widest hover:bg-[#ba1a1a] hover:text-white transition-all"><Trash2 size={12} />Remove</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  );
}
