/**
 * PhishNet heuristic engine (simulation).
 *
 * Returns STRUCTURED findings — { code, weight, vector, v } — instead of
 * prose, so the UI can render the verdict in EN / HI / MR.
 *
 * Safety Index: 100 = clean, 0 = certain phish.
 *   > 75  safe        (emerald)
 *   40-75 suspicious  (amber)
 *   < 40  critical    (crimson)  -> highRisk = true
 */

export const VECTORS = ["domain", "lexical", "urgency", "credential", "infra", "reputation"];

/* ----------------------------- reference data ----------------------------- */

const SUSPECT_TLDS = [
  "top", "xyz", "online", "click", "buzz", "rest", "cyou", "icu", "work", "zip",
  "mov", "cfd", "sbs", "shop", "live", "monster", "quest", "fit", "bar", "casa",
  "surf", "gdn", "ml", "tk", "ga", "cf", "gq", "link", "site", "website", "space",
];

const SHORTENERS = [
  "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "is.gd", "rb.gy", "shorturl.at",
  "ow.ly", "rebrand.ly", "t.ly", "shorturl.com", "clck.ru", "urlz.fr", "v.gd",
  "tiny.cc", "gg.gg", "linktr.ee",
];

const FREE_HOSTS = [
  "weebly.com", "blogspot.com", "firebaseapp.com", "web.app", "pages.dev",
  "vercel.app", "netlify.app", "glitch.me", "wixsite.com", "000webhostapp.com",
  "github.io", "repl.co", "r2.dev", "workers.dev", "square.site", "godaddysites.com",
];

/** Brands habitually impersonated in Indian phishing campaigns. */
const BRANDS = {
  sbi: ["sbi.co.in", "onlinesbi.sbi", "onlinesbi.com", "sbi.bank.in"],
  hdfc: ["hdfcbank.com", "hdfcbank.bank.in"],
  icici: ["icicibank.com", "icicibank.bank.in"],
  axis: ["axisbank.com", "axisbank.bank.in"],
  kotak: ["kotak.com"],
  pnb: ["pnbindia.in", "netpnb.com"],
  bob: ["bankofbaroda.in"],
  canara: ["canarabank.com"],
  paytm: ["paytm.com", "paytmbank.com"],
  phonepe: ["phonepe.com"],
  gpay: ["pay.google.com"],
  googlepay: ["pay.google.com"],
  npci: ["npci.org.in"],
  upi: ["npci.org.in", "bhimupi.org.in"],
  bhim: ["bhimupi.org.in", "npci.org.in"],
  irctc: ["irctc.co.in"],
  epfo: ["epfindia.gov.in"],
  uidai: ["uidai.gov.in"],
  aadhaar: ["uidai.gov.in"],
  incometax: ["incometax.gov.in", "eportal.incometax.gov.in"],
  itr: ["incometax.gov.in"],
  amazon: ["amazon.in", "amazon.com"],
  flipkart: ["flipkart.com"],
  jio: ["jio.com"],
  airtel: ["airtel.in"],
  bsnl: ["bsnl.co.in"],
  netflix: ["netflix.com"],
  whatsapp: ["whatsapp.com"],
  instagram: ["instagram.com"],
  facebook: ["facebook.com"],
  cybercrime: ["cybercrime.gov.in"],
  dhl: ["dhl.com"],
  fedex: ["fedex.com"],
  bluedart: ["bluedart.com"],
  indiapost: ["indiapost.gov.in"],
  cowin: ["cowin.gov.in"],
};

/** High-trust registrable domains / suffixes. */
const TRUSTED = [
  "gov.in", "nic.in", "rbi.org.in", "npci.org.in", "sebi.gov.in", "uidai.gov.in",
  "epfindia.gov.in", "incometax.gov.in", "irctc.co.in", "indiapost.gov.in",
  "cybercrime.gov.in", "sbi.co.in", "onlinesbi.sbi", "hdfcbank.com", "icicibank.com",
  "axisbank.com", "kotak.com", "bankofbaroda.in", "pnbindia.in", "paytm.com",
  "phonepe.com", "google.com", "youtube.com", "wikipedia.org", "github.com",
  "microsoft.com", "apple.com", "amazon.in", "flipkart.com", "linkedin.com",
  "cloudflare.com", "mozilla.org", "who.int",
];

const CRED_PATH = [
  "login", "signin", "log-in", "verify", "verification", "kyc", "re-kyc", "update",
  "secure", "account", "netbanking", "internetbanking", "otp", "auth", "password",
  "unblock", "reactivate", "validate", "confirm", "billdesk", "payment", "wallet",
  "refund", "redeem", "claim", "reward", "cashback", "customer", "support",
];

/* ------- SMS lexicon: [regex, weight, vector, code] ------- */
const SMS_RULES = [
  [/\b(otp|ओटीपी|एकवेळ|one[\s-]?time\s?(password|pin))\b/i, 20, "credential", "sms.otp"],
  [/\b(upi\s?pin|atm\s?pin|cvv|card\s?number|कार्ड\s?नंबर|पिन)\b/i, 22, "credential", "sms.pin"],
  [/\b(kyc|के\s?वाय\s?सी|केवायसी|aadhaar|आधार|pan\s?card|पैन)\b/i, 14, "credential", "sms.kyc"],
  [/\b(urgent|immediately|within\s?\d+\s?(hour|hrs|hour?s)|last\s?warning|तुरंत|तात्काळ|ताबडतोब|आज\s?ही|अंतिम\s?चेतावनी)\b/i, 16, "urgency", "sms.urgency"],
  [/\b(disconnect|deactivat|suspend|block(ed)?|expire|terminat|बंद\s?हो|खंडित|ब्लॉक|निलंबित)\w*/i, 15, "urgency", "sms.threat"],
  [/\b(electricity|bijli|बिजली|वीज|power\s?bill|meter)\b/i, 12, "urgency", "sms.electricity"],
  [/\b(lottery|prize|winner|lucky\s?draw|jackpot|लॉटरी|इनाम|पुरस्कार|बक्षीस)\b/i, 20, "reputation", "sms.lottery"],
  [/\b(refund|cashback|रिफंड|परतावा|reward\s?points|redeem)\b/i, 13, "reputation", "sms.refund"],
  [/\b(work\s?from\s?home|part[\s-]?time\s?job|daily\s?income|earn\s?₹?\s?\d|job\s?offer|नौकरी|नोकरी)\b/i, 17, "reputation", "sms.job"],
  [/\.apk\b/i, 30, "infra", "sms.apk"],
  [/\b(parcel|courier|customs|delivery\s?fail|shipment|कस्टम|पार्सल|कुरिअर)\b/i, 12, "reputation", "sms.courier"],
  [/\b(click\s?(here|link)|tap\s?here|यहाँ\s?क्लिक|येथे\s?क्लिक|क्लिक\s?करें|क्लिक\s?करा)\b/i, 11, "lexical", "sms.clickbait"],
  [/\b(dear\s?(customer|user|sir\/madam)|प्रिय\s?ग्राहक|प्रिय\s?ग्राहका)\b/i, 8, "lexical", "sms.generic"],
  [/\b(call|whatsapp|contact)\s?(on|at|us)?\s?\+?\d[\d\s-]{7,}/i, 12, "infra", "sms.callback"],
  [/₹\s?[\d,]{3,}|\bRs\.?\s?[\d,]{3,}|\binr\s?[\d,]{3,}/i, 7, "lexical", "sms.amount"],
  [/\b(verify|validate|confirm|update)\s?(your)?\s?(account|detail|profile|bank|mobile)/i, 12, "credential", "sms.verifyacct"],
  [/\b(loan|instant\s?loan|pre[\s-]?approved|credit\s?limit|लोन|कर्ज)\b/i, 10, "reputation", "sms.loan"],
  [/\b(army|csd|militar|jawan|सेना|फौजी)\b/i, 14, "reputation", "sms.army"],
];

/* ------------------------------- utilities -------------------------------- */

/** FNV-1a — deterministic, so repeat scans of the same artefact agree. */
export function hash32(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

export function shannon(str) {
  if (!str) return 0;
  const freq = {};
  for (const ch of str) freq[ch] = (freq[ch] || 0) + 1;
  const n = str.length;
  let h = 0;
  for (const k in freq) {
    const p = freq[k] / n;
    h -= p * Math.log2(p);
  }
  return h;
}

const URL_RE =
  /(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9][a-z0-9-]{0,61}(?:\.[a-z0-9-]{1,61})*\.(?:com|net|org|in|co|io|xyz|top|online|click|info|site|shop|live|app|dev|me|ru|cn|uk|us|biz|link|buzz|icu|cfd|sbs|work|space|website|store|pro|vip|fit|zip|mov|ly|gd|cc|to|at|im|sh|st|ai|gg|tk|ml|ga|cf|gq|cyou|monster|quest|rest|casa|bar|surf|gdn|be|ws|so|tv)\b(?:\/[^\s]*)?/i;

export function findUrl(text = "") {
  const m = String(text).match(URL_RE);
  return m ? m[0].replace(/[),.\]}"']+$/, "") : null;
}

/** URL | SMS | SCREENSHOT | null — drives the live input badge. */
export function detectType(text, file) {
  if (file) return "SCREENSHOT";
  const s = String(text || "").trim();
  if (!s) return null;
  const url = findUrl(s);
  // A bare link (no prose around it) is a URL scan; a link inside a message is SMS.
  if (url && s.split(/\s+/).length <= 2 && url.length >= s.length * 0.6) return "URL";
  if (s.split(/\s+/).length > 2 || /[\u0900-\u097F]/.test(s) || s.length > 90) return "SMS";
  return url ? "URL" : "SMS";
}

function parseUrl(raw) {
  let s = String(raw).trim();
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = "http://" + s;
  try {
    const u = new URL(s);
    return { u, hadScheme: /^https?:\/\//i.test(String(raw).trim()) };
  } catch {
    return null;
  }
}

function registrable(host) {
  const parts = host.split(".");
  const twoLevel = ["co.in", "org.in", "net.in", "gov.in", "ac.in", "nic.in", "co.uk", "com.au", "co.jp"];
  const last2 = parts.slice(-2).join(".");
  if (twoLevel.includes(last2)) return parts.slice(-3).join(".");
  return parts.slice(-2).join(".");
}

const isTrusted = (host) => {
  const reg = registrable(host);
  return TRUSTED.some((d) => reg === d || host === d || host.endsWith("." + d));
};

/* ------------------------------ URL analysis ------------------------------ */

function analyzeUrl(raw, push) {
  const parsed = parseUrl(raw);
  if (!parsed) {
    push("url.malformed", 12, "lexical");
    return { host: raw, path: "" };
  }
  const { u, hadScheme } = parsed;
  const host = u.hostname.toLowerCase();
  const path = (u.pathname + u.search).toLowerCase();
  const reg = registrable(host);
  const tld = host.split(".").pop();
  const sub = host.replace(/^www\./, "").split(".").slice(0, -2).join(".");
  const trusted = isTrusted(host);

  if (trusted) push("url.trusted", -34, "reputation", reg);
  if (u.protocol === "http:" && hadScheme) push("url.nohttps", 16, "infra");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) push("url.iphost", 30, "infra", host);
  if (host.startsWith("xn--") || host.includes(".xn--")) push("url.punycode", 30, "domain", host);
  if (!trusted && SUSPECT_TLDS.includes(tld)) push("url.tld", 22, "domain", "." + tld);
  if (SHORTENERS.includes(reg)) push("url.shortener", 18, "infra", reg);
  const free = FREE_HOSTS.find((d) => reg === d || host.endsWith("." + d));
  if (free && !trusted) push("url.freehost", 19, "infra", free);
  if (u.port && !["80", "443", ""].includes(u.port)) push("url.port", 14, "infra", u.port);

  // brand impersonation — the single strongest phishing tell
  const hay = host + path;
  for (const [brand, official] of Object.entries(BRANDS)) {
    if (!hay.includes(brand)) continue;
    const legit = official.some((d) => reg === d || host.endsWith("." + d));
    if (!legit) {
      push(host.includes(brand) ? "url.brandhost" : "url.brandpath", host.includes(brand) ? 30 : 16, "domain", brand.toUpperCase());
      break;
    }
  }

  const hyphens = (host.match(/-/g) || []).length;
  if (hyphens >= 2) push("url.hyphens", 12, "domain", String(hyphens));
  const depth = host.replace(/^www\./, "").split(".").length;
  if (depth >= 4 && !trusted) push("url.subdepth", 13, "domain", String(depth - 2));
  if (host.length > 34 && !trusted) push("url.longhost", 9, "domain", String(host.length));
  if (/\d/.test(host.replace(/^www\./, "").split(".")[0]) && !trusted) push("url.digits", 10, "domain");
  if (sub && sub.length >= 12 && shannon(sub) > 3.4) push("url.entropy", 14, "domain", shannon(sub).toFixed(2));

  const credHits = CRED_PATH.filter((k) => path.includes(k));
  if (credHits.length && !trusted) push("url.credpath", Math.min(9 + credHits.length * 5, 24), "credential", credHits.slice(0, 3).join(", "));
  if (/\.(apk|exe|msi|scr|bat|zip|dmg)(\?|$)/i.test(path)) push("url.payload", 30, "infra", path.match(/\.(apk|exe|msi|scr|bat|zip|dmg)/i)[0]);
  if (/(redirect|url=|next=|goto|continue=|return=)/.test(path)) push("url.redirect", 12, "infra");
  if (/@/.test(u.href.replace(/^https?:\/\//, "").split("/")[0])) push("url.userinfo", 22, "domain");
  if (path.length > 90) push("url.longpath", 7, "lexical", String(path.length));

  return { host, path, reg, trusted };
}

/* ------------------------------ SMS analysis ------------------------------ */

function analyzeSms(text, push) {
  const s = String(text);
  for (const [re, w, vec, code] of SMS_RULES) {
    const m = s.match(re);
    if (m) push(code, w, vec, m[0].trim().slice(0, 28));
  }

  const url = findUrl(s);
  if (url) {
    push("sms.link", 10, "infra", url.slice(0, 44));
    analyzeUrl(url, push);
  }

  const letters = s.replace(/[^A-Za-z]/g, "");
  if (letters.length > 24) {
    const caps = (s.match(/[A-Z]/g) || []).length / letters.length;
    if (caps > 0.55) push("sms.shouting", 9, "lexical", Math.round(caps * 100) + "%");
  }
  if ((s.match(/!/g) || []).length >= 2) push("sms.punct", 6, "lexical");
  if (/\b\d{10}\b/.test(s) && !/₹/.test(s)) push("sms.rawnumber", 8, "infra");

  return { url };
}

/* --------------------------- screenshot analysis -------------------------- */

function analyzeScreenshot(file, push) {
  const name = (file?.name || "screenshot").toLowerCase();
  const seed = hash32(name + ":" + (file?.size || 0));

  push("shot.ocr", 0, "lexical");

  // deterministic simulated OCR verdict, stable across repeat scans
  const bank = /(bank|sbi|hdfc|icici|axis|kyc|upi|paytm|phonepe|netbank)/.test(name);
  const chat = /(whatsapp|telegram|sms|message|chat|inbox)/.test(name);
  if (bank) push("shot.brandmark", 24, "domain");
  if (chat) push("shot.chat", 10, "lexical");

  // A financial brand mark in a non-official layout contradicts a "clean
  // template" verdict, so the benign bucket is withheld once one is seen.
  const bucket = seed % (bank ? 82 : 100);
  if (bucket < 34) {
    push("shot.formfield", 26, "credential");
    push("shot.urgency", 14, "urgency");
  } else if (bucket < 62) {
    push("shot.lookalike", 18, "domain");
    push("shot.lowres", 8, "infra");
  } else if (bucket < 82) {
    push("shot.qr", 22, "credential");
  } else {
    push("shot.clean", -20, "reputation");
  }
  if ((file?.size || 0) < 24 * 1024) push("shot.tiny", 7, "infra");
  return { seed };
}

/* -------------------------------- verdict --------------------------------- */

export function verdictOf(score) {
  if (score > 75) return "safe";
  if (score >= 40) return "suspicious";
  return "critical";
}

/**
 * Main entry point.
 * @returns {{score:number, verdict:string, highRisk:boolean, findings:Array, vectors:Object, dna:Object, ...}}
 */
export function analyze({ text = "", file = null, type }) {
  const kind = type || detectType(text, file);
  const findings = [];
  const push = (code, weight, vector, v) => findings.push({ code, weight, vector, v });

  let meta = {};
  if (kind === "URL") meta = analyzeUrl(text, push) || {};
  else if (kind === "SMS") meta = analyzeSms(text, push) || {};
  else if (kind === "SCREENSHOT") meta = analyzeScreenshot(file, push) || {};

  const risk = findings.reduce((a, f) => a + f.weight, 0);
  // saturating curve keeps stacked signals from collapsing straight to zero
  const score = Math.max(2, Math.min(99, Math.round(100 - 96 * (1 - Math.exp(-Math.max(risk, 0) / 46)) + Math.min(0, risk) * 0.35)));
  const verdict = verdictOf(score);

  // per-vector risk 0-100 for the bar readout
  const vectors = {};
  for (const v of VECTORS) {
    const w = findings.filter((f) => f.vector === v).reduce((a, f) => a + Math.max(f.weight, 0), 0);
    vectors[v] = Math.min(100, Math.round(100 * (1 - Math.exp(-w / 26))));
  }

  const signals = findings.filter((f) => f.weight > 0).length;
  const confidence = Math.min(98, 58 + signals * 6 + (meta.trusted ? 14 : 0));

  const subject = kind === "SCREENSHOT" ? file?.name || "screenshot.png" : String(text).trim();
  const h = hash32(subject);
  const tokens = subject.toLowerCase().split(/[^a-z0-9\u0900-\u097F]+/).filter(Boolean);

  return {
    id: `${Date.now().toString(36)}-${(h % 46656).toString(36).padStart(3, "0")}`,
    kind,
    subject,
    score,
    verdict,
    highRisk: score < 40,
    confidence,
    findings: findings.sort((a, b) => b.weight - a.weight),
    vectors,
    signals,
    meta,
    at: new Date().toISOString(),
    dna: {
      sig: h.toString(16).toUpperCase().padStart(8, "0").match(/.{2}/g).join(" "),
      entropy: +shannon(subject).toFixed(2),
      len: subject.length,
      tokens: tokens.slice(0, 12),
      tokenCount: tokens.length,
      structure:
        kind === "URL"
          ? [meta.host && `host:${meta.host}`, meta.reg && `registrable:${meta.reg}`, meta.path && `path:${meta.path.slice(0, 40)}`]
              .filter(Boolean)
              .join("  ›  ")
          : kind === "SMS"
            ? `chars:${subject.length}  ›  words:${tokens.length}  ›  link:${meta.url ? "yes" : "none"}`
            : `file:${file?.name || "-"}  ›  bytes:${file?.size || 0}`,
    },
  };
}
