import { ArrowDownRight, ArrowUpRight, ExternalLink, Flame } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { TRENDING } from "../data/trending";
import { Chip, Panel, Pulse } from "./ui/Primitives";

const SEV = { critical: "threat", high: "warn", elevated: "beam" };

export default function TrendingScams() {
  const { t, locale } = useLocale();

  return (
    <Panel
      title={t("trendingScams")}
      sub={t("trendingSub")}
      icon={Flame}
      right={<Chip color="threat" solid><Pulse color="threat" size={5} />{TRENDING.length}</Chip>}
      bodyClass="p-0"
    >
      <ul className="max-h-[560px] divide-y divide-hair overflow-y-auto">
        {TRENDING.map((s, i) => {
          const c = SEV[s.severity];
          const up = s.delta >= 0;
          return (
            <li
              key={s.id}
              className="group relative px-3.5 py-3 transition-colors hover:bg-panel2/60"
              style={{ animation: `slidein .4s ${i * 0.05}s cubic-bezier(.16,1,.3,1) both` }}
            >
              <span
                className="absolute inset-y-0 left-0 w-[2px] opacity-70 transition-opacity group-hover:opacity-100"
                style={{ background: `rgb(var(--c-${c}))` }}
                aria-hidden="true"
              />
              <div className="flex items-start gap-2.5">
                <span className="mt-px font-mono text-2xs leading-none text-faint tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Chip color={c} solid className="!py-[2px]">
                      {s.tag[locale] || s.tag.EN}
                    </Chip>
                    <span
                      className={`inline-flex items-center gap-0.5 font-mono text-2xs tabular-nums ${
                        up ? "text-threat" : "text-safe"
                      }`}
                    >
                      {up ? <ArrowUpRight size={16} strokeWidth={2.8} /> : <ArrowDownRight size={16} strokeWidth={2.8} />}
                      {Math.abs(s.delta)}%
                    </span>
                  </div>
                  <h3 className="mt-2 text-md font-bold leading-snug text-ink">
                    {s.title[locale] || s.title.EN}
                  </h3>
                  <p className="mt-1.5 text-base leading-relaxed text-dim">
                    {s.desc[locale] || s.desc.EN}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <span className="hud text-dim">
                      {s.reports.toLocaleString()} {t("reportsToday")}
                    </span>
                    <a
                      href={s.advisory}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      title={t("viewAdvisory")}
                      className="inline-flex items-center gap-1 border border-hair px-1.5 py-1 font-mono text-2xs uppercase tracking-widest2 text-faint transition-colors hover:border-beam/50 hover:text-beam"
                    >
                      <ExternalLink size={16} strokeWidth={2.4} />
                    </a>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
