import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  X,
  ArrowLeft,
} from "lucide-react";

import { useState } from "react";

export default function IncidentResponsePanel({ open, onClose, result }) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  if (!open) return null;

  const isPhishing = result?.prediction?.label?.toLowerCase() === "phishing";

  const incidentOptions = {
    clicked: {
      title: "I clicked the link",
      subtitle:
        "You opened the suspicious webpage but did not enter information.",
      severity: "warn",
      actions: [
        "Close the suspicious webpage.",
        "Do not click anything else on the page.",
        "Do not download or install anything it offers.",
        "If you entered no information, the immediate risk is generally lower.",
        "Monitor the affected account for unusual activity.",
      ],
    },

    password: {
      title: "I entered my password",
      subtitle: "Your login credentials may have been exposed.",
      severity: "threat",
      actions: [
        "Change the affected password immediately.",
        "Use the official website or app — not the suspicious link.",
        "Change the password anywhere else you reused it.",
        "Sign out of other active sessions if the service provides that option.",
        "Enable two-factor authentication if available.",
      ],
    },

    financial: {
      title: "I entered OTP, PIN, card or UPI details",
      subtitle:
        "Sensitive financial or authentication information may have been exposed.",
      severity: "threat",
      actions: [
        "Contact your bank or payment provider immediately.",
        "Block or freeze the affected card/account if necessary.",
        "Monitor your bank and UPI transactions for unauthorized activity.",
        "Do not share any additional OTP, PIN or verification codes.",
        "For suspected financial fraud in India, report it through 1930 or the official cybercrime portal.",
      ],
    },

    malware: {
      title: "I downloaded or installed something",
      subtitle:
        "A downloaded file or application may require further investigation.",
      severity: "threat",
      actions: [
        "Do not open the downloaded file again.",
        "Do not grant additional permissions to the application.",
        "Uninstall suspicious applications if it is safe to do so.",
        "Run a trusted security scan on the device.",
        "If you notice suspicious activity, disconnect the device from the network and seek technical assistance.",
      ],
    },

    unsure: {
      title: "I'm not sure what happened",
      subtitle:
        "Follow these general precautions while you determine what happened.",
      severity: "warn",
      actions: [
        "Close the suspicious webpage.",
        "Do not revisit the link.",
        "Do not enter any additional information.",
        "Check whether you downloaded or installed anything.",
        "Monitor important accounts for unusual activity.",
      ],
    },
  };

  const selected = selectedIncident ? incidentOptions[selectedIncident] : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-hair bg-bg shadow-2xl">
        {/* Header */}
        <div
          className={`border-b px-5 py-4 ${
            isPhishing
              ? "border-threat/40 bg-threat/[0.08]"
              : "border-safe/30 bg-safe/[0.05]"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-faint transition-colors hover:text-ink"
            aria-label="Close incident response"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div
              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center border ${
                isPhishing
                  ? "border-threat/40 bg-threat/10 text-threat"
                  : "border-safe/40 bg-safe/10 text-safe"
              }`}
            >
              {isPhishing ? (
                <ShieldAlert size={19} strokeWidth={2.4} />
              ) : (
                <CheckCircle2 size={19} strokeWidth={2.4} />
              )}
            </div>

            <div>
              <p className="hud text-dim">INCIDENT RESPONSE</p>

              <h2
                className={`mt-1 font-display text-xl font-bold ${
                  isPhishing ? "text-threat" : "text-safe"
                }`}
              >
                Already clicked this link?
              </h2>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-5 p-5">
          {/* Intro */}
          <div className="border border-hair bg-panel2/40 p-4">
            <p className="text-base leading-relaxed text-ink">
              Don't panic. Clicking a suspicious link does not automatically
              mean your account or device has been compromised.
            </p>

            <p className="mt-2 text-sm leading-relaxed text-faint">
              Tell PhishNet what happened so we can show you the appropriate
              next steps.
            </p>
          </div>

          {/* What happened */}
          <section>
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle
                size={17}
                className="text-warn"
                strokeWidth={2.4}
              />

              <h3 className="hud text-dim">WHAT HAPPENED?</h3>
            </div>

            <div className="grid gap-2">
              {/* Clicked */}
              <button
                type="button"
                onClick={() => setSelectedIncident("clicked")}
                className={`group flex items-center justify-between border p-3 text-left transition-colors ${
                  selectedIncident === "clicked"
                    ? "border-warn/60 bg-warn/[0.08]"
                    : "border-hair bg-panel2/30 hover:border-warn/50 hover:bg-panel2/70"
                }`}
              >
                <div>
                  <p className="font-medium text-ink">I clicked the link</p>

                  <p className="mt-0.5 text-sm text-faint">
                    I opened the suspicious webpage but did not enter anything.
                  </p>
                </div>

                <span className="text-faint transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* Password */}
              <button
                type="button"
                onClick={() => setSelectedIncident("password")}
                className={`group flex items-center justify-between border p-3 text-left transition-colors ${
                  selectedIncident === "password"
                    ? "border-threat/60 bg-threat/[0.08]"
                    : "border-hair bg-panel2/30 hover:border-threat/50 hover:bg-panel2/70"
                }`}
              >
                <div>
                  <p className="font-medium text-ink">I entered my password</p>

                  <p className="mt-0.5 text-sm text-faint">
                    I submitted login credentials on the suspicious page.
                  </p>
                </div>

                <span className="text-faint transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* Financial information */}
              <button
                type="button"
                onClick={() => setSelectedIncident("financial")}
                className={`group flex items-center justify-between border p-3 text-left transition-colors ${
                  selectedIncident === "financial"
                    ? "border-threat/60 bg-threat/[0.08]"
                    : "border-hair bg-panel2/30 hover:border-threat/50 hover:bg-panel2/70"
                }`}
              >
                <div>
                  <p className="font-medium text-ink">
                    I entered OTP, PIN, card or UPI details
                  </p>

                  <p className="mt-0.5 text-sm text-faint">
                    Sensitive financial or authentication information may have
                    been exposed.
                  </p>
                </div>

                <span className="text-faint transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* Malware */}
              <button
                type="button"
                onClick={() => setSelectedIncident("malware")}
                className={`group flex items-center justify-between border p-3 text-left transition-colors ${
                  selectedIncident === "malware"
                    ? "border-threat/60 bg-threat/[0.08]"
                    : "border-hair bg-panel2/30 hover:border-threat/50 hover:bg-panel2/70"
                }`}
              >
                <div>
                  <p className="font-medium text-ink">
                    I downloaded or installed something
                  </p>

                  <p className="mt-0.5 text-sm text-faint">
                    A file, APK or application was downloaded or installed.
                  </p>
                </div>

                <span className="text-faint transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>

              {/* Unsure */}
              <button
                type="button"
                onClick={() => setSelectedIncident("unsure")}
                className={`group flex items-center justify-between border p-3 text-left transition-colors ${
                  selectedIncident === "unsure"
                    ? "border-warn/60 bg-warn/[0.08]"
                    : "border-hair bg-panel2/30 hover:border-hair/80 hover:bg-panel2/70"
                }`}
              >
                <div>
                  <p className="font-medium text-ink">
                    I'm not sure what happened
                  </p>

                  <p className="mt-0.5 text-sm text-faint">
                    I need help figuring out what to do next.
                  </p>
                </div>

                <span className="text-faint transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            </div>
          </section>

          {/* Recommended response */}
          {selected && (
            <section
              className={`border p-4 ${
                selected.severity === "threat"
                  ? "border-threat/30 bg-threat/[0.04]"
                  : "border-warn/30 bg-warn/[0.04]"
              }`}
            >
              <div className="mb-4 flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border ${
                    selected.severity === "threat"
                      ? "border-threat/30 bg-threat/10"
                      : "border-warn/30 bg-warn/10"
                  }`}
                >
                  <Check
                    size={17}
                    className={
                      selected.severity === "threat"
                        ? "text-threat"
                        : "text-warn"
                    }
                    strokeWidth={2.5}
                  />
                </div>

                <div className="min-w-0">
                  <p
                    className={`hud ${
                      selected.severity === "threat"
                        ? "text-threat"
                        : "text-warn"
                    }`}
                  >
                    RECOMMENDED RESPONSE
                  </p>

                  <h3 className="mt-1 font-display text-lg font-bold text-ink">
                    {selected.title}
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-faint">
                    {selected.subtitle}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {selected.actions.map((action, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 border-l-2 bg-panel2/40 px-3 py-2.5 ${
                      selected.severity === "threat"
                        ? "border-threat/50"
                        : "border-warn/50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 font-mono text-xs ${
                        selected.severity === "threat"
                          ? "text-threat"
                          : "text-warn"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <p className="text-sm leading-relaxed text-ink">{action}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setSelectedIncident(null)}
                className="btn-ghost mt-4 w-full"
              >
                <ArrowLeft size={15} strokeWidth={2.4} />
                Choose a different situation
              </button>
            </section>
          )}

          {/* Safety reminder */}
          <div className="border border-warn/35 bg-warn/[0.05] p-4">
            <p className="hud text-warn">UNTIL YOU KNOW MORE</p>

            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink">
              <li>• Do not open the suspicious link again.</li>
              <li>• Do not enter additional information.</li>
              <li>• Do not reply to the suspicious sender.</li>
              <li>
                • If credentials were entered, change them using the official
                website or app.
              </li>
            </ul>
          </div>

          {/* Detected URL */}
          {result?.rules?.suspicious_urls?.length > 0 && (
            <div className="border border-threat/30 bg-threat/[0.04] p-4">
              <div className="mb-2 flex items-center gap-2">
                <ExternalLink
                  size={16}
                  className="text-threat"
                  strokeWidth={2.3}
                />

                <p className="hud text-threat">SUSPICIOUS URL DETECTED</p>
              </div>

              <div className="space-y-1">
                {result.rules.suspicious_urls.map((url, index) => (
                  <code
                    key={`${url}-${index}`}
                    className="block break-all font-mono text-xs leading-relaxed text-ink"
                  >
                    {typeof url === "string" ? url : url?.url || String(url)}
                  </code>
                ))}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-faint">
                Do not revisit this URL to verify whether it is safe.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-hair px-5 py-4">
          <button type="button" onClick={onClose} className="btn-ghost w-full">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
