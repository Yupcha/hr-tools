import { getIcon } from "../lib/icons";
import { cn } from "../lib/useLocalStorage";

/**
 * Visible-trust chip: a calm, omnipresent reminder that nothing leaves the
 * machine. Marked `no-print` so it never appears in exported PDFs.
 *
 * Two presentations of the same promise:
 *  - default `chip`  — pill used inline in a tool header.
 *  - `footer`        — a quieter, permanent shell presence pinned at the foot
 *                      of the sidebar; reads more like a settled status line
 *                      than a badge, so it never competes for attention.
 *
 * Always pointer-events-none and decorative (`aria-hidden`): it states a fact,
 * it is not interactive. The tooltip carries the full reassurance.
 *
 * SEAM (F-trust): the "what stays on device" detail popover hangs off this.
 */
export default function OfflineBadge({
  variant = "chip",
  className,
}: {
  variant?: "chip" | "footer";
  className?: string;
}) {
  const Shield = getIcon("ShieldCheck");
  const tip = "100% offline — nothing leaves your machine";

  if (variant === "footer") {
    return (
      <div
        className={cn(
          "no-print pointer-events-none flex items-center gap-2 text-[11px] font-medium text-faint",
          className,
        )}
        title={tip}
        aria-label={tip}
      >
        <Shield size={13} className="shrink-0 text-mint" />
        <span className="truncate">
          <span className="font-semibold text-muted">Offline</span>
          <span className="px-1 opacity-50">·</span>
          <span>Private · nothing leaves this device</span>
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "no-print pointer-events-none inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted",
        className,
      )}
      title={tip}
      aria-label={tip}
    >
      <Shield size={13} className="text-mint" />
      On-device
    </span>
  );
}
