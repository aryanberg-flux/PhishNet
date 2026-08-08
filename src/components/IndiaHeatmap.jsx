import { useMemo, useState } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import { Crosshair, Flame, Globe2, MapPin, TrendingUp } from "lucide-react";
import { useLocale } from "../i18n/LocaleContext";
import { HOTSPOTS, LEVEL_META } from "../data/hotspots";
import { Chip, Panel, Pulse } from "./ui/Primitives";

const INDIA = [20.5937, 78.9629];

/** Recentre control. */
function Recentre({ label }) {
  const map = useMap();
  return (
    <button
      onClick={() => map.flyTo(INDIA, 4.4, { duration: 0.9 })}
      className="btn-ghost absolute right-2 top-2 z-[500] !bg-panel/90 backdrop-blur"
      title={label}
      aria-label={label}
    >
      <Crosshair size={15} strokeWidth={2.4} />
    </button>
  );
}

/** Hotspot: static core + two CSS-driven expanding radar rings. */
function Hotspot({ spot, active, onHover }) {
  const { locale } = useLocale();
  const meta = LEVEL_META[spot.level];
  const rgb = `rgb(var(${meta.color}))`;
  const name = spot.name[locale] || spot.name.EN;

  return (
    <>
      {/* radar rings — pure decoration, non-interactive */}
      {[0, 1].map((i) => (
        <CircleMarker
          key={i}
          center={[spot.lat, spot.lng]}
          radius={meta.radius}
          interactive={false}
          pathOptions={{
            color: rgb,
            weight: 1,
            opacity: 0.55,
            fillColor: rgb,
            fillOpacity: 0.06,
            className: `pn-ring pn-ring-${i}`,
          }}
        />
      ))}

      {/* interactive core */}
      <CircleMarker
        center={[spot.lat, spot.lng]}
        radius={active ? 7.5 : 5.5}
        eventHandlers={{
          mouseover: () => onHover(spot.id),
          mouseout: () => onHover(null),
          click: () => onHover(spot.id),
        }}
        pathOptions={{
          color: rgb,
          weight: active ? 2.5 : 1.5,
          opacity: 1,
          fillColor: rgb,
          fillOpacity: active ? 0.95 : 0.7,
          className: "pn-core",
        }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          <span className="font-semibold">{name}</span>
        </Tooltip>
      </CircleMarker>
    </>
  );
}

export default function IndiaHeatmap() {
  const { t, locale } = useLocale();
  const [active, setActive] = useState(null);

  const sorted = useMemo(() => [...HOTSPOTS].sort((a, b) => b.reports - a.reports), []);
  const total = useMemo(() => HOTSPOTS.reduce((a, s) => a + s.reports, 0), []);
  const top = sorted[0];
  const spot = HOTSPOTS.find((s) => s.id === active);

  return (
    <Panel
      title={t("liveHeatmap")}
      sub={t("heatmapSub")}
      icon={Globe2}
      right={
        <Chip color="threat" solid>
          <Pulse color="threat" size={5} />
          {HOTSPOTS.length} {t("activeHotspots")}
        </Chip>
      }
      bodyClass="p-0"
    >
      {/* ring animation is injected here so it travels with the component */}
      <style>{`
        .pn-ring { transform-box: fill-box; transform-origin: center; animation: ring 2.8s cubic-bezier(.2,.6,.3,1) infinite; }
        .pn-ring-1 { animation-delay: 1.4s; }
        .pn-core { transition: r .18s ease, stroke-width .18s ease; cursor: pointer; }
        @media (prefers-reduced-motion: reduce) { .pn-ring { animation: none; opacity:.25; } }
      `}</style>

      <div className="relative">
        <div className="h-[340px] w-full sm:h-[420px] lg:h-[460px]">
          <MapContainer
            center={INDIA}
            zoom={4.4}
            minZoom={3.5}
            maxZoom={9}
            scrollWheelZoom={false}
            zoomControl={true}
            attributionControl={true}
            style={{ height: "100%", width: "100%" }}
            worldCopyJump={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            {HOTSPOTS.map((s) => (
              <Hotspot key={s.id} spot={s} active={active === s.id} onHover={setActive} />
            ))}
            <Recentre label={t("liveHeatmap")} />
          </MapContainer>
        </div>

        {/* telemetry readout overlay */}
        <div className="pointer-events-none absolute bottom-2 left-2 z-[500] max-w-[260px]">
          <div className="panel cut border-hair/90 bg-panel/92 p-3 backdrop-blur">
            {spot ? (
              <div className="animate-slidein">
                <p className="flex items-center gap-1.5 font-display text-md font-bold leading-snug text-ink">
                  <MapPin size={15} className="text-threat" strokeWidth={2.5} />
                  {spot.name[locale] || spot.name.EN}
                </p>
                <p className="mt-1.5 hud text-dim">{spot.region[locale] || spot.region.EN}</p>
                <div className="mt-2.5 space-y-1.5 border-t border-hair pt-2.5">
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="hud text-dim">{t("reports")}</span>
                    <span className="font-mono text-xs tabular-nums text-ink">
                      {spot.reports.toLocaleString()}
                    </span>
                  </p>
                  <p className="flex items-baseline justify-between gap-3">
                    <span className="hud text-dim">{t("riskLevel")}</span>
                    <span
                      className={`font-mono text-2xs uppercase tracking-widest2 ${
                        spot.level === "critical" || spot.level === "high" ? "text-threat" : "text-warn"
                      }`}
                    >
                      {t(LEVEL_META[spot.level].tKey)}
                    </span>
                  </p>
                  <p>
                    <span className="hud text-dim">{t("primaryVector")}</span>
                    <span className="mt-1 block text-xs leading-snug text-dim">
                      {spot.vector[locale] || spot.vector.EN}
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="hud leading-relaxed text-faint">
                {t("activeHotspots")}: {HOTSPOTS.length} · {total.toLocaleString()} {t("reports")}
                <br />
                <span className="text-dim">↖ {t("primaryVector")} — hover a node</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* regional metrics footer */}
      <div className="grid grid-cols-2 divide-hair border-t border-hair sm:grid-cols-4 sm:divide-x">
        <div className="border-b border-r border-hair p-3 sm:border-b-0 sm:border-r-0">
          <p className="hud text-dim">{t("activeHotspots")}</p>
          <p className="mt-1.5 flex items-center gap-1.5 font-display text-xl font-bold leading-none tabular-nums text-threat">
            <Flame size={16} strokeWidth={2.5} />
            {HOTSPOTS.length}
          </p>
        </div>
        <div className="border-b border-hair p-3 sm:border-b-0">
          <p className="hud text-dim">{t("reports")}</p>
          <p className="mt-1.5 font-display text-xl font-bold leading-none tabular-nums text-ink">
            {total.toLocaleString()}
          </p>
        </div>
        <div className="col-span-2 border-r-0 p-3 sm:col-span-2">
          <p className="hud text-dim">{t("topScamType")}</p>
          <p className="mt-1.5 flex items-start gap-1.5 font-display text-md font-bold leading-snug text-warn">
            <TrendingUp size={16} strokeWidth={2.5} className="mt-[3px] shrink-0" />
            <span>{top.vector[locale] || top.vector.EN}</span>
          </p>
        </div>
      </div>
    </Panel>
  );
}
