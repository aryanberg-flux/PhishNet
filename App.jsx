import React, { useState } from "react";
import { ShieldAlert, Link as LinkIcon, Upload } from "lucide-react";
import UrlScanner from "./components/UrlScanner";
import ImageScanner from "./components/ImageScanner";
import ResultCard from "./components/ResultCard";
import { scanUrl, scanImage } from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("url"); // 'url' | 'image'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUrlScan = async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await scanUrl(url);
      setResult(data);
    } catch (err) {
      // Fallback mock result for testing frontend UI before backend integration
      setResult({
        is_phishing: true,
        confidence_score: 92.5,
        flags: [
          "Suspicious domain age (< 30 days)",
          "Domain typosquatting detected",
          "SSL Certificate authority untrusted",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageScan = async (file) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await scanImage(file);
      setResult(data);
    } catch (err) {
      // Fallback mock result for testing frontend UI before backend integration
      setResult({
        is_phishing: true,
        confidence_score: 88.0,
        flags: [
          "OCR detected fake login prompt text",
          "URL pattern match in image flagged as deceptive",
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <ShieldAlert className="w-10 h-10 text-cyan-400" />
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            PhishNet
          </h1>
        </div>
        <p className="text-slate-400 text-sm max-w-md">
          AI-Powered Real-time Phishing Detection via URL & Screenshot Analysis
        </p>
      </header>

      <main className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-lg mb-6 border border-slate-800">
          <button
            onClick={() => {
              setActiveTab("url");
              setResult(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-all cursor-pointer ${
              activeTab === "url"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LinkIcon className="w-4 h-4" /> URL Scan
          </button>
          <button
            onClick={() => {
              setActiveTab("image");
              setResult(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition-all cursor-pointer ${
              activeTab === "image"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4" /> Screenshot Analysis
          </button>
        </div>

        {/* Dynamic Input Views */}
        {activeTab === "url" ? (
          <UrlScanner onScan={handleUrlScan} loading={loading} />
        ) : (
          <ImageScanner onScan={handleImageScan} loading={loading} />
        )}

        {/* Scan Results Container */}
        <ResultCard result={result} />
      </main>
    </div>
  );
}
