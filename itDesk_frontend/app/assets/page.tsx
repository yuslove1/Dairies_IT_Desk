"use client";

import { useState, useEffect, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { AssetCard } from "@/components/ui/AssetCard";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { api } from "@/lib/api";
import type { Asset, AssetType, AssetStatus } from "@/types";
import { cn } from "@/lib/utils";

// ── API → UI mapper ───────────────────────────────────────────────────────────
function mapAsset(r: any): Asset {
  return {
    id:            r.id,
    name:          r.name,
    // "switch_device" in DB maps back to "switch" in the UI
    type:          r.type === "switch_device" ? "switch" : r.type,
    serialNumber:  r.serialNumber  ?? undefined,
    location:      r.location,
    department:    r.department,
    status:        r.status,
    purchaseDate:  r.purchaseDate  ? r.purchaseDate.slice(0, 10)  : undefined,
    warrantyExpiry: r.warrantyExpiry ? r.warrantyExpiry.slice(0, 10) : undefined,
    notes:         r.notes         ?? undefined,
    addedAt:       r.createdAt
      ? new Date(r.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
      : "—",
  };
}

// ── Filter options ─────────────────────────────────────────────────────────────
const TYPE_OPTIONS: { label: string; value: AssetType | "all" }[] = [
  { label: "All types",   value: "all"      },
  { label: "💻 Laptop",   value: "laptop"   },
  { label: "🖥 Desktop",  value: "desktop"  },
  { label: "🖨 Printer",  value: "printer"  },
  { label: "⚡ UPS",      value: "ups"      },
  { label: "🔀 Switch",   value: "switch"   },
  { label: "🗄 Server",   value: "server"   },
  { label: "🖵 Monitor",  value: "monitor"  },
  { label: "📱 Phone",    value: "phone"    },
  { label: "⌨ Keyboard", value: "keyboard" },
  { label: "📦 Other",    value: "other"    },
];
const STATUS_OPTIONS: { label: string; value: AssetStatus | "all" }[] = [
  { label: "All statuses", value: "all"        },
  { label: "Active",       value: "active"     },
  { label: "In Repair",    value: "in_repair"  },
  { label: "Unassigned",   value: "unassigned" },
  { label: "Retired",      value: "retired"    },
];

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-mono text-[9px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-100 whitespace-nowrap",
        active
          ? "bg-uac-green text-white border-uac-green"
          : "bg-surf text-ink4 border-border hover:border-uac-green hover:text-uac-green",
      )}
    >
      {label}
    </button>
  );
}

const inputCls = "w-full bg-paper border border-border rounded-[6px] px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-uac-green transition-colors";
const labelCls = "font-mono text-[9px] font-semibold uppercase tracking-wide text-ink4 block mb-1.5";

// ── Shared asset form fields ───────────────────────────────────────────────────
function AssetFormFields({
  form,
  set,
}: {
  form: Record<string, string>;
  set: (field: string, value: string) => void;
}) {
  return (
    <>
      <div className="mb-3">
        <label className={labelCls}>Asset name</label>
        <input className={inputCls} placeholder="e.g. HP LaserJet Pro M404dn" value={form.name} onChange={(e) => set("name", e.target.value)} required />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className={labelCls}>Type</label>
          <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
            {TYPE_OPTIONS.filter((o) => o.value !== "all").map((o) => (
              <option key={o.value} value={o.value}>{o.label.replace(/\S+\s/, "")}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="unassigned">Unassigned</option>
            <option value="in_repair">In Repair</option>
            <option value="retired">Retired</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <label className={labelCls}>Serial number</label>
          <input className={cn(inputCls, "font-mono text-[11px]")} placeholder="e.g. VNB3Q01234" value={form.serialNumber} onChange={(e) => set("serialNumber", e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input className={inputCls} placeholder="e.g. IT Office" value={form.location} onChange={(e) => set("location", e.target.value)} required />
        </div>
      </div>

      <div className="mb-3">
        <label className={labelCls}>Department</label>
        <input className={inputCls} placeholder="e.g. HR, Logistics, IT" value={form.department} onChange={(e) => set("department", e.target.value)} required />
      </div>

      <div className="mb-3">
        <label className={labelCls}>Warranty expiry (optional)</label>
        <input type="date" className={cn(inputCls, "font-mono text-[11px]")} value={form.warrantyExpiry} onChange={(e) => set("warrantyExpiry", e.target.value)} />
      </div>

      <div className="mb-4">
        <label className={labelCls}>Notes (optional)</label>
        <textarea className={cn(inputCls, "resize-none min-h-[60px]")} placeholder="Any known issues or important context" value={form.notes} onChange={(e) => set("notes", e.target.value)} />
      </div>
    </>
  );
}

// ── Add Asset form ─────────────────────────────────────────────────────────────
function AddAssetForm({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Asset) => void }) {
  const [form, setForm] = useState({
    name: "", type: "laptop", status: "active",
    serialNumber: "", location: "", department: "",
    warrantyExpiry: "", notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = { ...form, type: form.type === "switch" ? "switch_device" : form.type };
      const res = await api.post<{ asset: any }>("/assets", payload);
      onCreated(mapAsset(res.asset));
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to register asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surf border border-border rounded-[10px] p-4 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4">Register new asset</p>
        <button type="button" onClick={onClose} className="text-ink5 hover:text-ink text-sm leading-none">✕</button>
      </div>

      <AssetFormFields form={form} set={set} />

      {error && <p className="font-mono text-[10px] text-uac-red mb-2 bg-uac-red-soft px-2 py-1 rounded">⚠ {error}</p>}

      <Button variant="green" className="w-full" type="submit" disabled={saving}>
        {saving ? "Registering…" : "Register asset →"}
      </Button>
    </form>
  );
}

// ── Edit Asset modal ───────────────────────────────────────────────────────────
function EditAssetModal({
  asset,
  onClose,
  onUpdated,
}: {
  asset: Asset;
  onClose: () => void;
  onUpdated: (a: Asset) => void;
}) {
  const [form, setForm] = useState({
    name:           asset.name,
    type:           asset.type,
    status:         asset.status,
    serialNumber:   asset.serialNumber   ?? "",
    location:       asset.location,
    department:     asset.department,
    warrantyExpiry: asset.warrantyExpiry ?? "",
    notes:          asset.notes          ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        type: form.type === "switch" ? "switch_device" : form.type,
        serialNumber:   form.serialNumber   || undefined,
        warrantyExpiry: form.warrantyExpiry || undefined,
        notes:          form.notes          || undefined,
      };
      const res = await api.patch<{ asset: any }>(`/assets/${asset.id}`, payload);
      onUpdated(mapAsset(res.asset));
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Failed to update asset");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative bg-surf border border-border rounded-[12px] shadow-[0_8px_40px_rgba(17,19,24,0.18)] w-full max-w-md p-5 animate-fade-up overflow-y-auto max-h-[90vh]"
      >
        <div className="flex items-center justify-between mb-4">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-widest text-ink4">Edit asset</p>
          <button type="button" onClick={onClose} className="text-ink5 hover:text-ink leading-none text-lg">✕</button>
        </div>

        <AssetFormFields form={form} set={set} />

        {error && <p className="font-mono text-[10px] text-uac-red mb-2 bg-uac-red-soft px-2 py-1 rounded">⚠ {error}</p>}

        <div className="flex gap-2">
          <Button variant="green" className="flex-1" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes →"}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function AssetsPage() {
  const user = useCurrentUser();

  const [assets,        setAssets]        = useState<Asset[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [typeFilter,    setTypeFilter]    = useState<AssetType | "all">("all");
  const [statusFilter,  setStatusFilter]  = useState<AssetStatus | "all">("all");
  const [showForm,      setShowForm]      = useState(false);
  const [editingAsset,  setEditingAsset]  = useState<Asset | null>(null);

  const canManage = user?.role === "admin" || user?.role === "manager";

  useEffect(() => {
    api.get<{ assets: any[] }>("/assets")
      .then((res) => setAssets(res.assets.map(mapAsset)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => assets.filter((a) => {
    const typeMatch   = typeFilter   === "all" || a.type   === typeFilter;
    const statusMatch = statusFilter === "all" || a.status === statusFilter;
    return typeMatch && statusMatch;
  }), [assets, typeFilter, statusFilter]);

  const active     = assets.filter((a) => a.status === "active").length;
  const inRepair   = assets.filter((a) => a.status === "in_repair").length;
  const unassigned = assets.filter((a) => a.status === "unassigned").length;

  async function handleDeleteAsset(id: string) {
    try {
      await api.delete(`/assets/${id}`);
      setAssets((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error("Delete asset failed:", err);
    }
  }

  function handleAssetUpdated(updated: Asset) {
    setAssets((prev) => prev.map((a) => a.id === updated.id ? updated : a));
  }

  return (
    <>
      <AppShell user={user} subtitle="Asset Register">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h1 className="text-[16px] sm:text-[18px] font-bold tracking-tight text-ink">Asset Register</h1>
            <p className="font-mono text-[10px] text-ink5 mt-0.5">
              // {loading ? "…" : assets.length} devices tracked · Dairies Plant IT Dept
            </p>
          </div>
          {user?.role !== "manager" && (
            <Button variant="soft-green" size="sm" onClick={() => setShowForm((v) => !v)}>
              {showForm ? "✕ Cancel" : "+ Add asset"}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 mb-4 sm:mb-5">
          <StatCard label="Total assets" value={loading ? "…" : assets.length} />
          <StatCard label="Active"       value={loading ? "…" : active}     variant="green" />
          <StatCard label="In repair"    value={loading ? "…" : inRepair}   variant="amber" />
          <StatCard label="Unassigned"   value={loading ? "…" : unassigned} />
        </div>

        <div className={cn("grid gap-3 items-start", showForm ? "grid-cols-1 lg:grid-cols-[1fr_320px]" : "grid-cols-1")}>
          <div>
            <div className="mb-3 space-y-2">
              <div className="flex gap-1.5 flex-wrap">
                {TYPE_OPTIONS.map((o) => (
                  <FilterPill key={o.value} label={o.label} active={typeFilter === o.value} onClick={() => setTypeFilter(o.value as AssetType | "all")} />
                ))}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {STATUS_OPTIONS.map((o) => (
                  <FilterPill key={o.value} label={o.label} active={statusFilter === o.value} onClick={() => setStatusFilter(o.value as AssetStatus | "all")} />
                ))}
              </div>
            </div>

            <p className="font-mono text-[9px] text-ink5 mb-2">
              {filtered.length} asset{filtered.length !== 1 ? "s" : ""} shown
            </p>

            {loading ? (
              <p className="font-mono text-[10px] text-ink5">Loading assets…</p>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {filtered.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onDelete={canManage ? handleDeleteAsset : undefined}
                    onEdit={canManage ? setEditingAsset : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <span className="text-3xl mb-3">📦</span>
                <p className="text-[13px] font-semibold text-ink">No assets found</p>
                <p className="font-mono text-[10px] text-ink5 mt-1">
                  {assets.length === 0 ? "Register your first asset using the button above" : "Try changing the filters above"}
                </p>
              </div>
            )}
          </div>

          {showForm && (
            <AddAssetForm
              onClose={() => setShowForm(false)}
              onCreated={(newAsset) => setAssets((prev) => [newAsset, ...prev])}
            />
          )}
        </div>
      </AppShell>

      {editingAsset && (
        <EditAssetModal
          asset={editingAsset}
          onClose={() => setEditingAsset(null)}
          onUpdated={(updated) => { handleAssetUpdated(updated); setEditingAsset(null); }}
        />
      )}
    </>
  );
}
