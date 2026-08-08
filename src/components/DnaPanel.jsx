import { useMemo } from "react";
import { Fingerprint } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { hash32 } from "../lib/detect";
import { Chip, Modal } from "./ui/Primitives";

/** Deterministic 16x8 bit-lattice derived from the artefact hash. */
function Lattice({ seed, tone }) {
  const cells = useMemo(() => {
    const out = [];
    for (let i = 0; i < 128; i++) {
      const h = hash32(`${seed}:${i}`);
      out.push((h >>> (i % 11)) & 1 ? (h % 100 > 62 ? 2 : 1) : 0);
    }
    return out;
  }, [seed]);

  return (
    <div className="grid grid-cols-16 gap-[2px]" style={{ gridTemplateColumns: "repeat(16, minmax(0,1fr))" }}>
      {cells.map((c, i) => (
        <span
          key={i}
          className="aspect-square"
          style={{
            background:
              c === 2 ? `rgb(var(--c-${tone}))` : c === 1 ? `rgb(var(--c-${tone})/.32)` : "rgb(var(--c-hair)/.55)",
            animation: `rise .3s ${(i % 16) * 0.012 + Math.floor(i / 16) * 0.03}s both`,
          }}
        />
      ))}
    </div>
  );
}

function Row({ k, v, mono = true }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-hair py-2.5 last:border-0">
      <span className="hud shrink-0 text-faint">{k}</span>
      <span className={`min-w-0 text-right text-sm text-dim [overflow-wrap:anywhere] ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}

export default function DnaPanel({ open, onClose, result }) {
  const { t } = useLocale();
  if (!result) return null;

  const tone = result.verdict === "safe" ? "safe" : result.verdict === "suspicious" ? "warn" : "threat";
  const d = result.dna;
  if (!d) return null;

  return (
    <Modal open={open} onClose={onClose} title={t("dnaTitle")} sub={t("dnaSub")} icon={Fingerprint} closeLabel={t("close")}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <Chip color={tone} solid>
            {result.kind} · {result.score}%
          </Chip>
          <span className="font-mono text-2xs text-faint">{result.id}</span>
        </div>

        <div className="border border-hair bg-panel2/40 p-3">
          <Lattice seed={d.sig} tone={tone} />
        </div>

        <div className="border border-hair bg-panel2/30 px-3">
          <Row k={t("signature")} v={d.sig} />
          <Row k={t("entropy")} v={`${d.entropy} bits/char`} />
          <Row k={t("tokens")} v={`${d.tokenCount} · ${d.len} chars`} />
          <Row k={t("structure")} v={d.structure} />
        </div>

        <div>
          <p className="mb-2 hud text-dim">{t("tokens")}</p>
          <div className="flex flex-wrap gap-1.5">
            {d.tokens.length ? (
              d.tokens.map((tok, i) => (
                <span
                  key={tok + i}
                  className="border border-hair bg-panel2/60 px-1.5 py-[3px] font-mono text-2xs text-dim"
                >
                  {tok}
                </span>
              ))
            ) : (
              <span className="hud text-dim">—</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
