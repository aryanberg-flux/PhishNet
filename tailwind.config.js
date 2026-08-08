/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(${v}) / <alpha-value>)`;

const TONES = ["threat", "warn", "safe", "beam", "node", "ink", "dim", "faint"];

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  // Tone classes are built dynamically (`text-${color}`), so the static
  // scanner cannot see them — enumerate them explicitly.
  safelist: [
    ...TONES.map((t) => `text-${t}`),
    ...TONES.map((t) => `border-${t}`),
    ...TONES.map((t) => `bg-${t}`),
    ...TONES.flatMap((t) => [`border-${t}/40`, `border-${t}/45`, `bg-${t}/12`, `bg-${t}/10`]),
  ],
  theme: {
    // Breakpoints in `em`, not `px`, so the layout reflows when the reader has
    // raised their browser's default font size — a px breakpoint would keep
    // three columns while the text inside them is crushed. Values mirror the
    // stock px scale at a 16px default. Tailwind also silently drops arbitrary
    // `min-[..em]` variants unless every screen shares that unit.
    screens: {
      xs: "24em", //  384px
      sm: "40em", //  640px
      md: "48em", //  768px
      lg: "64em", // 1024px
      xl: "80em", // 1280px
      "2xl": "96em", // 1536px
    },
    extend: {
      colors: {
        base: c("--c-base"),
        panel: c("--c-panel"),
        panel2: c("--c-panel-2"),
        hair: c("--c-hair"),
        hair2: c("--c-hair-2"),
        ink: c("--c-ink"),
        dim: c("--c-dim"),
        faint: c("--c-faint"),
        threat: c("--c-threat"),
        warn: c("--c-warn"),
        safe: c("--c-safe"),
        beam: c("--c-beam"),
        node: c("--c-node"),
      },
      fontFamily: {
        // Atkinson Hyperlegible: designed by the Braille Institute for low
        // vision — unambiguous 0/O, 1/l/I, rn/m letterforms.
        display: ['"Atkinson Hyperlegible"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
        sans: ['"Atkinson Hyperlegible"', '"Noto Sans Devanagari"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', '"Noto Sans Devanagari"', "ui-monospace", "monospace"],
      },
      // rem-based so the app scales with the reader's browser/OS font size.
      fontSize: {
        "2xs": ["0.8125rem", { lineHeight: "1.5" }], // 13px — micro labels
        xs: ["0.875rem", { lineHeight: "1.55" }], //    14px
        sm: ["0.9375rem", { lineHeight: "1.6" }], //    15px
        base: ["1.0625rem", { lineHeight: "1.65" }], // 17px — body
        md: ["1.125rem", { lineHeight: "1.6" }], //     18px
        lg: ["1.25rem", { lineHeight: "1.45" }], //     20px
        xl: ["1.4375rem", { lineHeight: "1.35" }], //   23px
        "2xl": ["1.75rem", { lineHeight: "1.25" }], //  28px
        "3xl": ["2.125rem", { lineHeight: "1.2" }], //  34px
        "4xl": ["2.875rem", { lineHeight: "1.05" }], // 46px — gauge
      },
      // Tightened from 0.22em: extreme tracking is a major legibility cost.
      letterSpacing: { widest2: "0.08em", hud: "0.06em" },
      boxShadow: {
        threat: "0 0 0 1px rgb(var(--c-threat)/.35), 0 18px 50px -12px rgb(var(--c-threat)/.45)",
        safe: "0 0 0 1px rgb(var(--c-safe)/.28), 0 18px 50px -18px rgb(var(--c-safe)/.3)",
        panel: "0 24px 60px -28px rgb(0 0 0 / .75)",
      },
      keyframes: {
        sweep: { to: { transform: "rotate(360deg)" } },
        ring: {
          "0%": { transform: "scale(.35)", opacity: ".75" },
          "70%": { opacity: "0" },
          "100%": { transform: "scale(1.9)", opacity: "0" },
        },
        scanline: { to: { transform: "translateY(100%)" } },
        flick: { "0%,100%": { opacity: "1" }, "48%": { opacity: ".55" }, "52%": { opacity: ".85" } },
        rise: {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "none" },
        },
        slidein: {
          from: { opacity: "0", transform: "translateX(-10px)" },
          to: { opacity: "1", transform: "none" },
        },
        marquee: { to: { transform: "translateX(-50%)" } },
        blip: { "0%,100%": { opacity: ".25" }, "50%": { opacity: "1" } },
        bar: { from: { width: "0%" } },
        grow: { from: { transform: "scaleY(0)" } },
      },
      animation: {
        sweep: "sweep 4s linear infinite",
        ring: "ring 2.6s cubic-bezier(.2,.6,.3,1) infinite",
        scanline: "scanline 7s linear infinite",
        flick: "flick 3.5s steps(2,end) infinite",
        rise: "rise .55s cubic-bezier(.16,1,.3,1) both",
        slidein: "slidein .4s cubic-bezier(.16,1,.3,1) both",
        marquee: "marquee 38s linear infinite",
        blip: "blip 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
