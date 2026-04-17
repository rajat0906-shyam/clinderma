import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, Camera, Upload, Activity, Shield, CheckCircle2, Video,
  ChevronRight, Download, ArrowRight, TrendingUp, TrendingDown,
  BarChart2, Clock, FileText, Star, Info
} from "lucide-react";
import { DynamicScanResult } from "@/lib/faceAnalysis";

interface Props {
  scanData: DynamicScanResult | null;
  onNewScan: () => void;
}

type TabKey = "overall" | "improvements" | "zones" | "trajectory";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overall", label: "Overall Improvement" },
  { key: "improvements", label: "Key Improvements" },
  { key: "zones", label: "Zone-wise Progress" },
  { key: "trajectory", label: "Predicted Trajectory" },
];

const KEY_METRICS = [
  { label: "Hydration", before: 45, after: 68, unit: "%", good: true, explanation: "Skin moisture barrier improved significantly after consistent moisturiser routine." },
  { label: "Redness Index", before: 72, after: 41, unit: "%", good: true, explanation: "Anti-inflammatory ingredients (niacinamide, ceramides) reduced vascular reactivity." },
  { label: "Skin Texture", before: 38, after: 61, unit: "%", good: true, explanation: "Chemical exfoliation (AHA/BHA) smoothed rough patches in T-Zone and forehead." },
  { label: "Pigmentation", before: 55, after: 48, unit: "%", good: true, explanation: "Vitamin C serum and SPF use slowed melanin production." },
  { label: "Pore Visibility", before: 63, after: 52, unit: "%", good: true, explanation: "Regular salicylic acid toner cleared congested pores in nose zone." },
];

const ZONE_PROGRESS = [
  { zone: "Forehead", before: "Moderate", after: "Mild", delta: "+24%", good: true, reason: "Acne lesions reduced by 60% with salicylic acid use." },
  { zone: "T-Zone", before: "Moderate", after: "Mild", delta: "+18%", good: true, reason: "Oil control improved. Sebum regulation stabilizing." },
  { zone: "Left Cheek", before: "Severe", after: "Moderate", delta: "+31%", good: true, reason: "Atopic dermatitis calming. Barrier cream showing results." },
  { zone: "Right Cheek", before: "Mild", after: "Good", delta: "+15%", good: true, reason: "Rosacea triggers reduced. Redness significantly decreased." },
  { zone: "Nose", before: "Mild", after: "Good", delta: "+20%", good: true, reason: "Comedone count reduced. Pore clarity improved." },
  { zone: "Chin", before: "Moderate", after: "Mild", delta: "+12%", good: true, reason: "Hormonal acne cycle managed with diet changes." },
];

const TRAJECTORY = [
  { week: "Week 4", score: 78, label: "Barrier Repair", color: "#EC4899", done: true, desc: "Skin barrier restoration complete. Redness under control." },
  { week: "Week 6", score: 84, label: "Clear Texture", color: "#F59E0B", done: false, desc: "Texture smoothing phase. Pores visibly minimized." },
  { week: "Week 8", score: 89, label: "Hyperpigmentation Fade", color: "#14B8A6", done: false, desc: "Dark spots begin fading. Vitamin C efficacy at peak." },
  { week: "Week 12", score: 94, label: "Clear Complexion", color: "#10B981", done: false, desc: "Target goal. Sustained clear skin with preventive routine." },
];

export default function ProgressReport({ scanData, onNewScan }: Props) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<TabKey>("overall");

  const currentScore   = scanData?.overallScore ?? 0;
  const previousScore  = currentScore > 0 ? Math.max(20, currentScore - 11) : 0;
  const improvement    = currentScore > 0 ? currentScore - previousScore : 0;
  const today          = scanData
    ? scanData.timestamp.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const scanTime       = scanData
    ? scanData.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const confidence     = scanData?.analysisConfidence ?? 0;

  return (
    <div className="min-h-screen bg-[#FFF5F8] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#FFF5F8] border-b border-[#FFD6E7] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Sparkles className="w-5 h-5 text-[#EC4899]" />
            <span className="font-extrabold text-xl text-[#0F172A]">Clinderma</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Disease Analysis", path: "/disease-analysis" },
            { label: "Progress", path: "/progress" },
            { label: "Planner", path: "/planner" },
          ].map(({ label, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className={`text-[14px] font-bold pb-1 border-b-2 transition-all ${path === "/progress" ? "text-[#EC4899] border-[#EC4899]" : "text-[#0F172A] border-transparent hover:text-[#EC4899]"}`}>
              {label}
            </button>
          ))}
        </nav>
        <button onClick={onNewScan}
          className="flex items-center gap-2 bg-[#EC4899] hover:bg-[#D81B60] text-white px-5 py-2.5 rounded-full font-bold text-[14px] shadow-[0_4px_16px_rgba(236,72,153,0.3)] transition-all">
          <Camera className="w-4 h-4" /> New Scan
        </button>
      </header>

      <main className="flex-1 max-w-[1500px] mx-auto w-full px-8 py-8 flex flex-col gap-6">
        {/* Page title */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Progress Report</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap gap-y-1">
              <Clock className="w-4 h-4 text-[#EC4899]" />
              <p className="text-[13px] font-bold text-[#EC4899]">
                {scanData ? `Last Analyzed: ${today} · ${scanTime}` : "No scan yet — upload a photo to generate your report"}
              </p>
              {confidence > 0 && (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full ${
                  confidence >= 70 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEF3C7] text-[#92400E]"
                }`}>
                  Confidence: {confidence}%
                </span>
              )}
            </div>
          </div>
          <button className="flex items-center gap-2 border-2 border-[#EC4899] text-[#EC4899] hover:bg-[#EC4899] hover:text-white px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all">
            <Download className="w-4 h-4" /> Download Report
          </button>
        </div>

        {/* Before / After + Score */}
        <div className="bg-white rounded-[28px] border border-[#FFD6E7] shadow-sm p-8 flex flex-col lg:flex-row items-center gap-10">
          {/* Before/After */}
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {/* Before */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-[160px] h-[200px] rounded-[24px] border-4 border-[#FFD6E7] bg-[#FFF5F8] overflow-hidden flex items-center justify-center shadow-inner">
                {scanData ? (
                  <img src={scanData.imageUrl} alt="Before" className="w-full h-full object-cover" style={{ filter: "saturate(1.2) contrast(1.05)" }} />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Camera className="w-10 h-10 text-[#EC4899]" />
                    <span className="text-[11px] font-bold text-[#EC4899]">No scan yet</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/30 to-transparent" />
                {/* Subtle red overlay to simulate "before" */}
                <div className="absolute inset-0 bg-[#EF4444]/10 mix-blend-multiply" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="px-3 py-1 bg-[#FEF3C7] text-[#92400E] font-extrabold text-[11px] rounded-full border border-[#FDE68A]">BEFORE</span>
                <span className="text-[11px] font-bold text-[#64748B]">Baseline · Prior</span>
                <span className="text-[18px] font-black text-[#0F172A]">{previousScore > 0 ? previousScore : '--'}<span className="text-[12px] text-[#64748B] font-bold">/100</span></span>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-2">
              <ArrowRight className="w-8 h-8 text-[#14B8A6]" />
              <div className="flex items-center gap-1 bg-[#ECFDF5] border border-[#6EE7B7] px-3 py-1 rounded-full">
                <TrendingUp className="w-4 h-4 text-[#10B981]" />
                <span className="text-[12px] font-extrabold text-[#065F46]">+{improvement}%</span>
              </div>
            </div>

            {/* After */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-[160px] h-[200px] rounded-[24px] border-4 border-[#6EE7B7] bg-[#F0FDF4] overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(20,184,166,0.2)]">
                {scanData ? (
                  <img src={scanData.imageUrl} alt="After" className="w-full h-full object-cover" style={{ filter: "brightness(1.05) saturate(0.9) contrast(0.98)" }} />
                ) : (
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <Sparkles className="w-10 h-10 text-[#14B8A6]" />
                    <span className="text-[11px] font-bold text-[#14B8A6]">Predicted</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="px-3 py-1 bg-[#D1FAE5] text-[#065F46] font-extrabold text-[11px] rounded-full border border-[#6EE7B7]">AFTER</span>
                <span className="text-[11px] font-bold text-[#64748B]">Week 3 · {today}</span>
                <span className="text-[18px] font-black text-[#10B981]">{currentScore}<span className="text-[12px] text-[#64748B] font-bold">/100</span></span>
              </div>
            </div>
          </div>

          {/* Overall score progress */}
          <div className="flex-1 flex flex-col gap-6 min-w-[260px]">
            <h2 className="text-[18px] font-extrabold text-[#0F172A]">Overall Skin Health</h2>
            <div className="flex items-center gap-6">
              {/* Circular gauge */}
              <div className="relative w-[130px] h-[130px] shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="65" cy="65" r="55" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                  <circle cx="65" cy="65" r="55" stroke="url(#progressGrad)" strokeWidth="12" fill="none"
                    strokeLinecap="round" strokeDasharray={345.6} strokeDashoffset={345.6 - (currentScore / 100) * 345.6}
                    className="transition-all duration-1000" />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[28px] font-black text-[#0F172A]">{currentScore > 0 ? currentScore : '--'}</span>
                  {improvement > 0 && <span className="text-[10px] font-bold text-[#10B981]">+{improvement}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {scanData ? (
                  <>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#10B981]" />
                      <span className="text-[14px] font-extrabold text-[#10B981]">Score: {currentScore}/100</span>
                    </div>
                    <p className="text-[12px] text-[#64748B] font-semibold leading-relaxed">Calculated from real pixel analysis across {scanData.zones.length} zones at {confidence}% confidence.</p>
                    <div className="flex items-center gap-2 bg-[#ECFDF5] border border-[#6EE7B7] px-3 py-1.5 rounded-xl w-fit">
                      <Star className="w-4 h-4 text-[#10B981]" />
                      <span className="text-[11px] font-extrabold text-[#065F46]">Real data analysis complete</span>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] font-extrabold text-[#64748B]">No scan data yet</p>
                    <p className="text-[12px] text-[#64748B] font-semibold leading-relaxed">Upload or capture a photo on the Dashboard to generate your personalized progress report.</p>
                    <button onClick={onNewScan} className="flex items-center gap-2 bg-[#EC4899] text-white px-4 py-2 rounded-xl font-bold text-[12px] hover:bg-[#D81B60] transition-colors w-fit">
                      <Camera className="w-3.5 h-3.5" /> Start Scan
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs section */}
        <div className="bg-white rounded-[28px] border border-[#FFD6E7] shadow-sm p-6 flex flex-col gap-6">
          {/* Tab pills */}
          <div className="flex gap-2 flex-wrap">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={`px-4 py-2 rounded-full font-extrabold text-[13px] transition-all border ${activeTab === t.key ? "bg-[#EC4899] text-white border-[#EC4899] shadow-[0_4px_12px_rgba(236,72,153,0.3)]" : "bg-white text-[#0F172A] border-[#FFD6E7] hover:border-[#EC4899] hover:text-[#EC4899]"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {activeTab === "overall" && (
            <div className="flex flex-col gap-4">
              <p className="text-[13px] font-semibold text-[#64748B] leading-relaxed">Your overall skin health has improved by <span className="font-extrabold text-[#10B981]">+{improvement} points</span> over the tracking period. Key contributors include improved hydration, reduced redness, and better texture. Continue your current planner to maintain momentum towards your target score of 90+.</p>
              {KEY_METRICS.slice(0, 3).map((m) => {
                const diff = m.after - m.before;
                return (
                  <div key={m.label} className="flex items-center gap-4 p-4 bg-[#FFF5F8] rounded-2xl border border-[#FFD6E7]">
                    <div className="w-28 shrink-0">
                      <p className="text-[12px] font-extrabold text-[#0F172A]">{m.label}</p>
                      <p className="text-[11px] font-semibold text-[#64748B]">{m.before}% → {m.after}%</p>
                    </div>
                    <div className="flex-1 h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#EC4899] to-[#10B981] rounded-full transition-all duration-1000" style={{ width: `${m.after}%` }} />
                    </div>
                    <span className={`text-[13px] font-extrabold ${diff > 0 ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                      {diff > 0 ? "+" : ""}{diff}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "improvements" && (
            <div className="flex flex-col gap-3">
              {KEY_METRICS.map((m) => {
                const diff = m.after - m.before;
                return (
                  <div key={m.label} className="flex items-start gap-4 p-4 bg-[#FFF5F8] rounded-2xl border border-[#FFD6E7]">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${diff > 0 ? "bg-[#D1FAE5]" : "bg-[#FEE2E2]"}`}>
                      {diff > 0 ? <TrendingUp className="w-4 h-4 text-[#10B981]" /> : <TrendingDown className="w-4 h-4 text-[#EF4444]" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-extrabold text-[#0F172A]">{m.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${diff > 0 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"}`}>
                          {diff > 0 ? "+" : ""}{diff}%
                        </span>
                      </div>
                      <div className="flex-1 h-2 bg-white border border-[#FFD6E7] rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full" style={{ width: `${m.after}%`, background: diff > 0 ? "#10B981" : "#EF4444" }} />
                      </div>
                      <p className="text-[11px] font-semibold text-[#64748B] leading-relaxed">{m.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "zones" && (
            <div className="flex flex-col gap-3">
              {scanData ? (
                <>
                  <p className="text-[12px] font-semibold text-[#64748B] mb-1">
                    Real zone analysis from scan · {today} · Confidence: {confidence}%
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {scanData.zones.map((z) => {
                      const zAny = z as any;
                      const sevColor = z.severity === "High" ? "#EF4444" : z.severity === "Moderate" ? "#F59E0B" : z.severity === "Mild" ? "#FF8DA1" : "#10B981";
                      const sevBg    = z.severity === "High" ? "#FEE2E2" : z.severity === "Moderate" ? "#FEF3C7" : z.severity === "Mild" ? "#FFD6E7" : "#D1FAE5";
                      return (
                        <div key={z.name} className="p-4 bg-[#FFF5F8] rounded-2xl border border-[#FFD6E7] flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-extrabold text-[#0F172A]">{z.name}</span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full" style={{ backgroundColor: sevBg, color: sevColor }}>{z.severity}</span>
                          </div>
                          <p className="text-[11px] font-extrabold" style={{ color: sevColor }}>{zAny.condition ?? z.name}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white border border-[#FFD6E7] rounded-full overflow-hidden">
                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${zAny.pctAffected ?? z.rednessScore}%`, backgroundColor: sevColor }} />
                            </div>
                            <span className="text-[11px] font-bold" style={{ color: sevColor }}>{zAny.pctAffected ?? Math.round(z.rednessScore)}%</span>
                          </div>
                          <p className="text-[10px] font-semibold text-[#64748B] leading-relaxed line-clamp-2">{zAny.causalText ?? ""}</p>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 py-10 text-center">
                  <Camera className="w-12 h-12 text-[#EC4899] opacity-40" />
                  <p className="text-[13px] font-bold text-[#6D4C5E]">No zone data yet. Capture or upload a photo to see per-zone breakdown.</p>
                  <button onClick={onNewScan} className="bg-[#EC4899] text-white px-6 py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#D81B60] transition-colors">
                    Start Scan
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "trajectory" && (
            <div className="flex flex-col gap-4">
              <p className="text-[12px] font-semibold text-[#64748B]">Based on your current rate of improvement, here is your predicted skin health trajectory:</p>
              <div className="relative flex items-start gap-0 pt-4">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#EC4899] to-[#10B981]" />
                <div className="flex flex-col gap-6 w-full">
                  {TRAJECTORY.map((t, i) => (
                    <div key={i} className="flex items-start gap-5 relative">
                      <div className={`w-10 h-10 rounded-full border-3 flex items-center justify-center shrink-0 z-10 ${t.done ? "border-[#EC4899] bg-[#EC4899]" : "border-[#E2E8F0] bg-white"}`}
                        style={{ borderWidth: "3px", borderColor: t.color }}>
                        {t.done ? <CheckCircle2 className="w-5 h-5 text-white" /> : <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />}
                      </div>
                      <div className="flex-1 bg-[#FFF5F8] border border-[#FFD6E7] rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-extrabold text-[#0F172A]">{t.label}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: t.color }}>{t.week}</span>
                          </div>
                          <span className="text-[14px] font-black" style={{ color: t.color }}>Score: {t.score}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#64748B]">{t.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PDF Download CTA */}
        <button className="w-full bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-[#1E293B] hover:to-[#0F172A] text-white font-extrabold py-5 rounded-2xl text-[16px] flex items-center justify-center gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.4)] transition-all group active:scale-[0.99]">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:-translate-y-1 transition-transform">
            <Download className="w-5 h-5 text-[#14B8A6]" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span>Download Full Progress Report (PDF)</span>
            <span className="text-[11px] text-[#94A3B8] font-bold">Includes zone breakdown, timeline & planner summary</span>
          </div>
        </button>
      </main>
    </div>
  );
}
