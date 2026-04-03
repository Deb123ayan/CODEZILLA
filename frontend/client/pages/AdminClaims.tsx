import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  AlertCircle, CheckCircle2, XCircle, Clock, ShieldAlert,
  Search, Download, Eye, Check, X, Loader2, Edit2, Trash2, Save,
  FileSearch, MessageSquare, Flag, UserCheck
} from "lucide-react";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import AdminLayout from "@/components/AdminLayout";

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

const STATUS_OPTIONS = ["PENDING", "AUTO_APPROVED", "PAID", "FRAUD_FLAGGED", "REJECTED"];

export default function AdminClaims() {
  const [loading, setLoading] = useState(true);
  const [claims, setClaims]   = useState<any[]>([]);
  const [stats, setStats]     = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modal state
  const [editClaim, setEditClaim]       = useState<any | null>(null);
  const [deleteClaim, setDeleteClaim]   = useState<any | null>(null);
  const [reviewClaim, setReviewClaim]   = useState<any | null>(null);
  const [reviewNote, setReviewNote]     = useState("");
  const [editForm, setEditForm]         = useState<any>({});
  const [saving, setSaving]         = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [claimsRes, statsRes] = await Promise.all([
        api.get<any[]>("/admin/claims/list/"),
        api.get<any>("/admin/claims/")
      ]);
      setClaims(claimsRes || []);
      setStats(statsRes);
    } catch (error) {
      toast.error("Failed to sync claims queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Quick Approve / Reject ───────────────────────────────────────────────
  const handleAction = async (claimId: string, action: "APPROVE" | "REJECT") => {
    try {
      await api.post(`/admin/claims/${claimId}/action/`, { action });
      toast.success(`Claim ${action === "APPROVE" ? "✓ Approved" : "Rejected"}`);
      fetchData();
    } catch { toast.error("Action failed"); }
  };

  // ── Edit ────────────────────────────────────────────────────────────────
  const openEdit = (c: any) => { setEditClaim(c); setEditForm({ status: c.status, compensation: c.compensation, claim_reason: c.claim_reason }); };
  const handleEdit = async () => {
    if (!editClaim) return;
    setSaving(true);
    try {
      await api.patch(`/admin/claims/${editClaim.claim_id}/detail/`, editForm);
      toast.success("Claim updated successfully");
      setEditClaim(null);
      fetchData();
    } catch (e: any) { toast.error(e?.message || "Update failed"); }
    finally { setSaving(false); }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteClaim) return;
    setSaving(true);
    try {
      await api.delete(`/admin/claims/${deleteClaim.claim_id}/detail/`);
      toast.success("Claim record removed");
      setDeleteClaim(null);
      fetchData();
    } catch (e: any) { toast.error(e?.message || "Delete failed"); }
    finally { setSaving(false); }
  };

  const statusOptions = ["all", ...STATUS_OPTIONS];
  const filtered = claims.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (!q || c.worker__name?.toLowerCase().includes(q) || c.claim_id?.toLowerCase().includes(q) || c.claim_reason?.toLowerCase().includes(q)) &&
      (filterStatus === "all" || c.status === filterStatus)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fcf9f8] space-y-6">
        <Loader2 className="w-16 h-16 text-[#004191] animate-spin" />
        <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#434751] font-inter">Loading Claims Queue...</h2>
      </div>
    );
  }

  return (
    <AdminLayout>

      {/* ── EDIT Modal ──────────────────────────────────────────────────── */}
      {editClaim && (
        <Modal title={`Edit Claim #${editClaim.claim_id?.split("-")[0]}`} onClose={() => setEditClaim(null)}>
          <div className="space-y-4">
            <Field label="Worker">{editClaim.worker__name && <p className="text-sm font-bold text-[#1b1c1b] h-12 flex items-center px-4 bg-[#f5f3f1] rounded-2xl">{editClaim.worker__name}</p>}</Field>
            <Field label="Status">
              <select className={selectCls} value={editForm.status} onChange={e => setEditForm((p: any) => ({...p, status: e.target.value}))}>
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Compensation (₹)">
              <input type="number" className={inputCls} value={editForm.compensation} onChange={e => setEditForm((p: any) => ({...p, compensation: e.target.value}))} />
            </Field>
            <Field label="Claim Reason">
              <input className={inputCls} value={editForm.claim_reason} onChange={e => setEditForm((p: any) => ({...p, claim_reason: e.target.value}))} />
            </Field>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditClaim(null)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="flex-1 h-12 bg-[#004191] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={14} />Save</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DELETE Confirm ──────────────────────────────────────────────── */}
      {deleteClaim && (
        <Modal title="Delete Claim Record" onClose={() => setDeleteClaim(null)}>
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-[#ffdad6]/40 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={36} className="text-[#ba1a1a]" />
            </div>
            <div>
              <p className="font-bold text-lg">Claim #{deleteClaim.claim_id?.split("-")[0]}</p>
              <p className="text-[#434751] text-sm mt-1">This claim record will be permanently deleted. This cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDeleteClaim(null)} className="flex-1 h-12 bg-[#f5f3f1] text-[#434751] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">Cancel</button>
              <button onClick={handleDelete} disabled={saving} className="flex-1 h-12 bg-[#ba1a1a] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <><Trash2 size={14} />Delete</>}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1c1b]">Dispute Pipeline</h2>
          <p className="text-[#434751] mt-1 font-medium">{claims.length} total claims · {stats?.fraud_flagged_claims || 0} flagged</p>
        </div>
        <button onClick={() => toast.info("Export coming soon")} className="flex items-center gap-2 px-6 py-3 bg-[#004191] text-white rounded-full font-inter font-bold text-[10px] uppercase tracking-widest hover:bg-[#0058be] transition-all self-start sm:self-auto">
          <Download size={14} /> Export Ledger
        </button>
      </div>

      {/* ── Quick Stats ──────────────────────────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: "Pending Review", value: stats?.pending_claims || 0,      Icon: Clock,        color: "text-[#004191]", bg: "bg-[#f0f4ff]" },
            { label: "Auto Approved",  value: stats?.auto_approved_claims || 0, Icon: CheckCircle2, color: "text-green-600", bg: "bg-[#dcfce7]" },
            { label: "Fraud Flagged",  value: stats?.fraud_flagged_claims || 0, Icon: ShieldAlert,  color: "text-[#ba1a1a]", bg: "bg-[#ffdad6]/40" },
            { label: "Rejected",       value: stats?.rejected_claims || 0,      Icon: XCircle,      color: "text-[#434751]", bg: "bg-[#f5f3f1]" },
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

      {/* ── Manual Review Queue ──────────────────────────────────────────── */}
      {(() => {
        const reviewQueue = claims.filter(c => c.status === 'PENDING' || c.status === 'FRAUD_FLAGGED');
        if (reviewQueue.length === 0) return null;
        return (
          <section>
            <div className="bg-[#1b1c1b] rounded-[3rem] p-8 md:p-10 relative overflow-hidden">
              {/* glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#ba1a1a] rounded-full -mr-24 -mt-24 blur-[120px] opacity-15 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#ba1a1a]/20 border border-[#ba1a1a]/30 rounded-2xl flex items-center justify-center">
                      <Flag size={22} className="text-[#ff8a80]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-white">Manual Review Queue</h3>
                      <p className="text-[#a8aebf] text-sm font-medium">{reviewQueue.length} claim{reviewQueue.length !== 1 ? 's' : ''} awaiting human adjudication</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-[#ba1a1a]/20 rounded-full border border-[#ba1a1a]/30">
                    <div className="w-2 h-2 bg-[#ff8a80] rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#ff8a80]">Action Required</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {reviewQueue.map((c: any) => (
                    <div key={c.claim_id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: claim details */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                            c.status === 'FRAUD_FLAGGED' ? "bg-[#ba1a1a]/30" : "bg-[#004191]/30"
                          )}>
                            {c.status === 'FRAUD_FLAGGED'
                              ? <ShieldAlert size={22} className="text-[#ff8a80]" />
                              : <Clock size={22} className="text-[#90b4ff]" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <p className="text-[9px] font-bold text-[#a8aebf] uppercase tracking-widest">#{c.claim_id?.split('-')[0]}</p>
                              <span className={cn(
                                "px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest",
                                c.status === 'FRAUD_FLAGGED' ? "bg-[#ba1a1a]/30 text-[#ff8a80]" : "bg-[#004191]/30 text-[#90b4ff]"
                              )}>{c.status?.replace(/_/g, ' ')}</span>
                            </div>
                            <p className="font-extrabold text-white text-lg leading-tight">{c.worker__name}</p>
                            <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                              <span className="text-[11px] text-[#a8aebf]">{c.claim_reason?.replace(/_/g, ' ')}</span>
                              <span className="text-[11px] font-bold text-[#a8aebf]">₹{c.compensation} payout</span>
                              {c.fraud_score > 0 && (
                                <span className={cn(
                                  "text-[10px] font-bold",
                                  c.fraud_score > 0.6 ? "text-[#ff8a80]" : c.fraud_score > 0.3 ? "text-orange-400" : "text-green-400"
                                )}>Fraud Risk: {((c.fraud_score || 0) * 100).toFixed(0)}%</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => { setReviewClaim(c); setReviewNote(""); }}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-white/10 text-white border border-white/20 rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                          >
                            <FileSearch size={13} />Inspect
                          </button>
                          <button
                            onClick={async () => {
                              try { await api.post(`/admin/claims/${c.claim_id}/action/`, { action: 'APPROVE' }); toast.success('Claim approved'); fetchData(); }
                              catch { toast.error('Action failed'); }
                            }}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-green-500 text-white rounded-2xl text-[9px] font-bold uppercase tracking-widest hover:bg-green-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
                          >
                            <UserCheck size={13} />Approve
                          </button>
                          <button
                            onClick={async () => {
                              try { await api.post(`/admin/claims/${c.claim_id}/action/`, { action: 'REJECT' }); toast.success('Claim rejected'); fetchData(); }
                              catch { toast.error('Action failed'); }
                            }}
                            className="w-10 h-10 bg-[#ba1a1a]/30 text-[#ff8a80] border border-[#ba1a1a]/30 rounded-2xl flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* ── Review Inspector Modal ────────────────────────────────────────── */}
      {reviewClaim && (
        <Modal title={`Inspect Claim — ${reviewClaim.worker__name}`} onClose={() => setReviewClaim(null)}>
          <div className="space-y-5">
            {/* Claim Meta */}
            <div className="bg-[#fcf9f8] rounded-2xl p-5 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest mb-1">Claim ID</p>
                  <p className="text-sm font-bold text-[#1b1c1b] font-mono">#{reviewClaim.claim_id?.split('-')[0]}</p>
                </div>
                <div>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest mb-1">Status</p>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest inline-block",
                    reviewClaim.status === 'FRAUD_FLAGGED' ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#d8e2ff] text-[#004191]"
                  )}>{reviewClaim.status?.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest mb-1">Worker</p>
                  <p className="text-sm font-bold">{reviewClaim.worker__name}</p>
                  <p className="text-[9px] text-[#a8aebf]">{reviewClaim.worker__platform}</p>
                </div>
                <div>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest mb-1">Compensation</p>
                  <p className="text-2xl font-extrabold">₹{reviewClaim.compensation}</p>
                </div>
                <div>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest mb-1">Reason</p>
                  <p className="text-sm font-bold">{reviewClaim.claim_reason?.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-[9px] font-inter font-bold text-[#a8aebf] uppercase tracking-widest mb-1">Filed</p>
                  <p className="text-sm font-bold">{reviewClaim.created_at ? new Date(reviewClaim.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—'}</p>
                </div>
              </div>
            </div>

            {/* Fraud Score Visual */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] font-inter font-bold text-[#434751] uppercase tracking-widest">Fraud Risk Score</p>
                <span className={cn(
                  "text-sm font-extrabold",
                  (reviewClaim.fraud_score || 0) > 0.6 ? "text-[#ba1a1a]" : (reviewClaim.fraud_score || 0) > 0.3 ? "text-orange-500" : "text-green-600"
                )}>{((reviewClaim.fraud_score || 0) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-[#f5f3f1] rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all duration-700",
                    (reviewClaim.fraud_score || 0) > 0.6 ? "bg-[#ba1a1a]" : (reviewClaim.fraud_score || 0) > 0.3 ? "bg-orange-500" : "bg-green-500"
                  )}
                  style={{ width: `${(reviewClaim.fraud_score || 0) * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-[#a8aebf] mt-2">
                {(reviewClaim.fraud_score || 0) > 0.6
                  ? '⚠︎ High risk — verify geolocation, event timestamp, and worker history before approving.'
                  : (reviewClaim.fraud_score || 0) > 0.3
                  ? '⚡ Moderate risk — check platform earnings history.'
                  : '✓ Low risk — claim appears legitimate based on behavioral signals.'}
              </p>
            </div>

            {/* Adjudicator Notes */}
            <Field label="Adjudicator Notes (internal)">
              <textarea
                rows={3}
                placeholder="Add decision rationale, evidence reviewed, escalation notes..."
                value={reviewNote}
                onChange={e => setReviewNote(e.target.value)}
                className="w-full px-4 py-3 bg-[#fcf9f8] border border-[#e4e2e0] rounded-2xl text-sm font-bold placeholder:text-[#a8aebf] outline-none focus:ring-2 focus:ring-[#004191]/15 focus:border-[#004191]/40 transition-all resize-none"
              />
            </Field>

            {/* Decision Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={async () => {
                  try {
                    await api.post(`/admin/claims/${reviewClaim.claim_id}/action/`, { action: 'APPROVE' });
                    toast.success('Claim manually approved');
                    setReviewClaim(null);
                    fetchData();
                  } catch { toast.error('Action failed'); }
                }}
                className="h-13 py-3 bg-green-500 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-green-400 transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <UserCheck size={14} />Approve & Pay
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post(`/admin/claims/${reviewClaim.claim_id}/action/`, { action: 'REJECT' });
                    toast.success('Claim rejected');
                    setReviewClaim(null);
                    fetchData();
                  } catch { toast.error('Action failed'); }
                }}
                className="h-13 py-3 bg-[#ba1a1a] text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                <X size={14} />Reject Claim
              </button>
            </div>
            <button onClick={() => setReviewClaim(null)} className="w-full h-11 bg-[#f5f3f1] text-[#434751] rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#e4e2e0] transition-all">
              Close Inspector
            </button>
          </div>
        </Modal>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <section>
        <div className="bg-white rounded-[2.5rem] border border-[#e4e2e0]/30 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] p-5 md:p-8 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#a8aebf] group-focus-within:text-[#004191] transition-colors" size={18} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by worker, claim ID, or reason..." className="w-full h-14 pl-14 pr-5 bg-[#fcf9f8] border border-[#e4e2e0] rounded-2xl text-sm font-bold placeholder:text-[#a8aebf] outline-none focus:ring-2 focus:ring-[#004191]/10 focus:border-[#004191]/30 transition-all" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusOptions.slice(0,5).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={cn("h-10 px-4 rounded-xl text-[9px] font-inter font-bold uppercase tracking-widest border transition-all", filterStatus === s ? "bg-[#004191] text-white border-[#004191]" : "bg-white text-[#434751] border-[#e4e2e0] hover:border-[#004191]/30")}>
                {s === "all" ? "All" : s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Claims Table ─────────────────────────────────────────────────── */}
      <section>
        {/* Mobile cards */}
        <div className="block md:hidden space-y-4">
          {filtered.map((c: any) => (
            <div key={c.claim_id} className="bg-white rounded-3xl p-6 shadow-[0_12px_24px_-8px_rgba(27,28,27,0.04)] border border-[#e4e2e0]/30">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[9px] font-bold text-[#ba1a1a]">#{c.claim_id?.split("-")[0]}</p>
                  <p className="font-bold text-[#1b1c1b]">{c.worker__name}</p>
                  <p className="text-xs text-[#434751]">{c.claim_reason?.replace(/_/g, ' ')}</p>
                </div>
                <span className="text-xl font-extrabold">₹{c.compensation}</span>
              </div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={cn("px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest",
                  c.status === 'PAID' || c.status === 'AUTO_APPROVED' ? "bg-[#dcfce7] text-green-700" :
                  c.status === 'FRAUD_FLAGGED' ? "bg-[#ffdad6] text-[#ba1a1a]" : "bg-[#d8e2ff] text-[#004191]")}>
                  {c.status?.replace(/_/g, ' ')}
                </span>
                <div className="flex gap-2">
                  {(c.status === 'PENDING' || c.status === 'FRAUD_FLAGGED') && <>
                    <button onClick={() => handleAction(c.claim_id, 'APPROVE')} className="w-8 h-8 bg-green-500 text-white rounded-xl flex items-center justify-center"><Check size={14} /></button>
                    <button onClick={() => handleAction(c.claim_id, 'REJECT')} className="w-8 h-8 bg-red-500 text-white rounded-xl flex items-center justify-center"><X size={14} /></button>
                  </>}
                  <button onClick={() => openEdit(c)} className="w-8 h-8 bg-[#f0f4ff] text-[#004191] rounded-xl flex items-center justify-center"><Edit2 size={14} /></button>
                  <button onClick={() => setDeleteClaim(c)} className="w-8 h-8 bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl flex items-center justify-center"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-[3rem] border border-[#e4e2e0]/30 shadow-[0_24px_48px_-12px_rgba(27,28,27,0.06)] overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-inter font-bold uppercase tracking-[0.12em] text-[#434751] bg-[#fcf9f8]/60 border-b border-[#e4e2e0]/40">
                <th className="px-8 py-5">Claim</th>
                <th className="px-8 py-5">Worker</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Risk Score</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e2e0]/30">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-[#a8aebf] text-sm font-bold">No claims match your filter</td></tr>
              ) : filtered.map((c: any) => (
                <tr key={c.claim_id} className="hover:bg-[#fcf9f8] transition-all group">
                  <td className="px-8 py-5">
                    <p className="text-[9px] font-bold text-[#ba1a1a] uppercase tracking-widest">#{c.claim_id?.split("-")[0]}</p>
                    <p className="text-sm font-bold text-[#434751] mt-0.5">{c.claim_reason?.replace(/_/g, ' ')}</p>
                    <p className="text-[9px] text-[#a8aebf] font-bold">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-[#1b1c1b]">{c.worker__name}</p>
                    <p className="text-[9px] font-bold text-[#a8aebf] uppercase tracking-widest">{c.worker__platform}</p>
                  </td>
                  <td className="px-8 py-5 text-xl font-extrabold">₹{c.compensation}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[60px] h-2 bg-[#f5f3f1] rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", c.fraud_score > 0.6 ? "bg-red-500" : c.fraud_score > 0.3 ? "bg-orange-500" : "bg-green-500")} style={{ width: `${(c.fraud_score || 0) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-bold text-[#434751]">{((c.fraud_score || 0) * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn("px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest",
                      c.status === 'PAID' || c.status === 'AUTO_APPROVED' ? "bg-[#dcfce7] text-green-700" :
                      c.status === 'FRAUD_FLAGGED' ? "bg-[#ffdad6] text-[#ba1a1a]" :
                      c.status === 'REJECTED' ? "bg-[#f5f3f1] text-[#434751]" : "bg-[#d8e2ff] text-[#004191]")}>
                      {c.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      {(c.status === 'PENDING' || c.status === 'FRAUD_FLAGGED') && <>
                        <button onClick={() => handleAction(c.claim_id, 'APPROVE')} className="w-9 h-9 bg-green-500 text-white rounded-xl flex items-center justify-center hover:shadow-[0_0_16px_rgba(34,197,94,0.4)] transition-all"><Check size={15} /></button>
                        <button onClick={() => handleAction(c.claim_id, 'REJECT')} className="w-9 h-9 bg-red-500 text-white rounded-xl flex items-center justify-center hover:shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all"><X size={15} /></button>
                      </>}
                      <button onClick={() => openEdit(c)} className="w-9 h-9 bg-[#f0f4ff] text-[#004191] rounded-xl flex items-center justify-center hover:bg-[#004191] hover:text-white transition-all"><Edit2 size={15} /></button>
                      <button onClick={() => setDeleteClaim(c)} className="w-9 h-9 bg-[#ffdad6]/40 text-[#ba1a1a] rounded-xl flex items-center justify-center hover:bg-[#ba1a1a] hover:text-white transition-all"><Trash2 size={15} /></button>
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
