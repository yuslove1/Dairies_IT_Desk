"use client";

import { useState } from "react";
import type { Asset, AssetType, AssetStatus } from "@/types";
import { cn } from "@/lib/utils";

const typeIcon: Record<AssetType, string> = {
  laptop: "💻", desktop: "🖥", printer: "🖨", ups: "⚡",
  switch: "🔀", server: "🗄", monitor: "🖵", phone: "📱",
  keyboard: "⌨", other: "📦",
};

const statusStyles: Record<AssetStatus, { pill: string; dot: string; label: string }> = {
  active:     { pill: "bg-uac-green-soft text-uac-green-dk", dot: "bg-uac-green",  label: "Active"     },
  in_repair:  { pill: "bg-amber-soft text-amber",           dot: "bg-amber",       label: "In Repair"  },
  retired:    { pill: "bg-paper text-ink5 border border-border", dot: "bg-ink5",   label: "Retired"    },
  unassigned: { pill: "bg-blue-soft text-blue",             dot: "bg-blue",        label: "Unassigned" },
};

interface AssetCardProps {
  asset:     Asset;
  onDelete?: (id: string) => void;
  onEdit?:   (asset: Asset) => void;
}

export function AssetCard({ asset, onDelete, onEdit }: AssetCardProps) {
  const { pill, dot, label } = statusStyles[asset.status];
  const muted = asset.status === "retired";
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  async function handleDelete() {
    if (!confirmDel) { setConfirmDel(true); return; }
    if (!onDelete) return;
    setDeleting(true);
    await onDelete(asset.id);
    setDeleting(false);
  }

  return (
    <div className={cn(
      "bg-surf border border-border rounded-[8px] p-3 group",
      "border-l-[3px] border-l-border",
      "hover:border-l-uac-green hover:shadow-[0_2px_8px_rgba(0,121,58,0.10)] transition-all duration-150",
      muted && "opacity-60",
    )}>
      {/* Top row */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-[18px] leading-none shrink-0 mt-0.5" role="img" aria-label={asset.type}>
          {typeIcon[asset.type]}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-ink leading-snug truncate">{asset.name}</p>
          <p className="font-mono text-[9px] text-ink5 capitalize mt-0.5">{asset.type}</p>
        </div>
        <span className={cn("flex items-center gap-1 font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0", pill)}>
          <span className={cn("w-1 h-1 rounded-full shrink-0", dot)} />{label}
        </span>
      </div>

      {asset.serialNumber && (
        <p className="font-mono text-[9px] text-ink5 mb-2 tracking-wide">S/N: {asset.serialNumber}</p>
      )}

      <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
        <span className="font-mono text-[9px] bg-paper border border-border text-ink4 px-1.5 py-0.5 rounded-[4px]">📍 {asset.location}</span>
        <span className="font-mono text-[9px] bg-paper border border-border text-ink4 px-1.5 py-0.5 rounded-[4px]">{asset.department}</span>
      </div>

      {asset.notes && <p className="text-[10px] text-ink4 leading-snug mt-1.5 line-clamp-2">{asset.notes}</p>}

      {/* Bottom row */}
      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-border">
        {asset.warrantyExpiry ? (
          <span className="font-mono text-[9px] text-ink5">Warranty: {asset.warrantyExpiry}</span>
        ) : (
          <span className="font-mono text-[9px] text-ink6">No warranty info</span>
        )}
        <span className="font-mono text-[9px] text-ink6 ml-auto">Added {asset.addedAt}</span>
      </div>

      {/* Edit + Delete — visible on hover */}
      {(onEdit || onDelete) && (
        <div className="flex gap-1.5 mt-2 pt-1.5 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          {onEdit && (
            <button onClick={() => { setConfirmDel(false); onEdit(asset); }}
              className="font-mono text-[9px] font-semibold px-2 py-0.5 rounded border border-border text-ink4 hover:text-ink hover:border-ink4 transition-colors">
              ✏ Edit
            </button>
          )}
          {onDelete && (
            <button onClick={handleDelete} disabled={deleting}
              className={cn(
                "font-mono text-[9px] font-semibold px-2 py-0.5 rounded border transition-colors",
                confirmDel ? "border-uac-red bg-uac-red text-white" : "border-border text-ink5 hover:border-uac-red hover:text-uac-red",
                deleting && "opacity-50 cursor-wait",
              )}>
              {deleting ? "Deleting…" : confirmDel ? "Confirm?" : "🗑 Delete"}
            </button>
          )}
          {confirmDel && (
            <button onClick={() => setConfirmDel(false)} className="font-mono text-[9px] text-ink5 hover:text-ink px-1">Cancel</button>
          )}
        </div>
      )}
    </div>
  );
}
