import { useEffect } from "react";
import { Radio } from "lucide-react";

/** Section shell: registration marks, mono eyebrow, tick strip. */
export function Panel({ title, sub, icon: Icon, right, children, className = "", bodyClass = "", tone }) {
  const toneRing =
    tone === "threat"
      ? "border-threat/45 shadow-threat"
      : tone === "safe"
        ? "border-safe/40 shadow-safe"
        : "border-hair";
  return (
    <section className={`panel cut ${toneRing} ${className}`}>
      {/* Header wraps rather than truncates, so titles stay legible when the
          reader has enlarged their browser font size. */}
      {(title || right) && (
        <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 border-b border-hair px-4 py-3">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-start gap-2 font-display text-lg font-bold leading-snug text-ink">
              {Icon && <Icon size={17} className="mt-[3px] shrink-0 text-threat" strokeWidth={2.4} />}
              <span>{title}</span>
            </h2>
            {sub && <p className="mt-1.5 hud text-dim">{sub}</p>}
          </div>
          {right && <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>}
        </header>
      )}
      <div className={bodyClass || "p-4"}>{children}</div>
    </section>
  );
}

/** Uppercase mono chip. */
export function Chip({ children, color = "faint", solid = false, className = "" }) {
  const map = {
    threat: "text-threat border-threat/45",
    warn: "text-warn border-warn/45",
    safe: "text-safe border-safe/45",
    beam: "text-beam border-beam/45",
    node: "text-node border-node/45",
    faint: "text-faint border-hair",
    dim: "text-dim border-hair",
  };
  const bg = solid
    ? { threat: "bg-threat/12", warn: "bg-warn/12", safe: "bg-safe/12", beam: "bg-beam/12", node: "bg-node/12", faint: "bg-panel2", dim: "bg-panel2" }[color]
    : "";
  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-[3px] font-sans text-2xs font-bold leading-none tracking-hud ${map[color]} ${bg} ${className}`}
    >
      {children}
    </span>
  );
}

/** Pulsing telemetry dot. */
export function Pulse({ color = "safe", size = 6 }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span
        className="absolute inset-0 animate-ping rounded-full opacity-70"
        style={{ background: `rgb(var(--c-${color}))`, animationDuration: "1.8s" }}
      />
      <span className="relative inset-0 rounded-full" style={{ width: size, height: size, background: `rgb(var(--c-${color}))` }} />
    </span>
  );
}

/** Thin labelled meter used for per-vector risk. */
export function Meter({ label, value, color = "threat", delay = 0 }) {
  return (
    <div className="group/m">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="hud text-dim transition-colors group-hover/m:text-ink">{label}</span>
        <span className="font-mono text-2xs tabular-nums text-dim">{String(value).padStart(2, "0")}</span>
      </div>
      <div className="h-[3px] w-full overflow-hidden bg-hair/70">
        <div
          className="h-full transition-[width] duration-[900ms] ease-out"
          style={{
            width: `${value}%`,
            background: `linear-gradient(90deg, rgb(var(--c-${color})/.35), rgb(var(--c-${color})))`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

/** Small header stat readout. */
export function Stat({ k, v, color = "ink" }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="hud text-dim">{k}</span>
      <span className={`font-display text-xl font-semibold leading-none tabular-nums text-${color}`}>{v}</span>
    </div>
  );
}

/** Live signal strip for the header. */
export function SignalBars({ color = "safe" }) {
  return (
    <span className="flex items-end gap-[2px]" aria-hidden="true">
      {[5, 8, 11, 7].map((h, i) => (
        <span
          key={i}
          className="w-[2px] animate-blip"
          style={{ height: h, background: `rgb(var(--c-${color}))`, animationDelay: `${i * 0.22}s` }}
        />
      ))}
    </span>
  );
}

export function LiveBadge({ label }) {
  return (
    <span className="inline-flex items-center gap-2 border border-safe/40 bg-safe/[0.07] px-2.5 py-[5px]">
      <Radio size={17} className="animate-blip text-safe" strokeWidth={2.5} />
      <span className="hud text-safe">{label}</span>
      <SignalBars />
    </span>
  );
}

/** Modal shell used by Report + DNA panels. */
export function Modal({ open, onClose, title, sub, icon: Icon, children, closeLabel = "Close" }) {
  // Escape closes, and body scroll is locked while open — declared before the
  // early return so hook order stays stable across renders.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1200] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-[3px] animate-[rise_.3s_ease-out_both]"
      />
      <div className="relative m-0 w-full max-w-xl animate-rise sm:m-4">
        <div className="panel cut border-hair shadow-panel">
          <header className="flex items-start justify-between gap-3 border-b border-hair px-4 py-3">
            <div>
              <h3 className="flex items-center gap-2 font-display text-lg font-bold leading-snug text-ink">
                {Icon && <Icon size={17} className="text-threat" strokeWidth={2.4} />}
                {title}
              </h3>
              {sub && <p className="mt-1.5 hud text-dim">{sub}</p>}
            </div>
            <button onClick={onClose} className="btn-ghost !px-2 !py-1.5" aria-label={closeLabel}>
              ✕
            </button>
          </header>
          <div className="max-h-[72vh] overflow-y-auto p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
