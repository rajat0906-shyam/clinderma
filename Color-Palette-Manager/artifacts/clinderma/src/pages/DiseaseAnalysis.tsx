import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  AlertTriangle, Brain, Droplets, Activity, ChevronRight,
  Sparkles, Camera, Upload, FlaskConical, Stethoscope,
  Info, ArrowLeft, Zap, ShieldAlert, CheckCircle2, AlertCircle
} from "lucide-react";
import { DynamicScanResult, ZoneScore, ConditionName } from "@/lib/faceAnalysis";

// ─── Severity colour tokens ───────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  Low:      { border: "#10B981", bg: "#ECFDF5", badge: "#D1FAE5", text: "#065F46" },
  Mild:     { border: "#FF8DA1", bg: "#FFF5F8", badge: "#FFD6E7", text: "#9D174D" },
  Moderate: { border: "#F59E0B", bg: "#FFFBEB", badge: "#FEF3C7", text: "#92400E" },
  High:     { border: "#EF4444", bg: "#FEF2F2", badge: "#FEE2E2", text: "#991B1B" },
};

// Map severity to display label for Disease Analysis page
function toDisplaySeverity(sev: string): string {
  if (sev === "High") return "Severe";
  if (sev === "Low")  return "Mild";
  return sev;
}

// ─── Dynamic blood-test recommendations ──────────────────────────────────────

function buildBloodTests(zones: ZoneScore[]) {
  const conditions = zones.map(z => z.condition);
  const tests: { name: string; reason: string }[] = [];

  const hasAcne      = conditions.some(c => c === "Acne Vulgaris" || c === "Comedonal Acne");
  const hasRosacea   = conditions.some(c => c === "Rosacea");
  const hasAtopic    = conditions.some(c => c === "Atopic Dermatitis" || c === "Contact Dermatitis");
  const hasPigment   = conditions.some(c => c === "Hyperpigmentation" || c === "Melasma");
  const hasSebDerm   = conditions.some(c => c === "Seborrheic Dermatitis");
  const hasHighSev   = zones.some(z => z.severity === "High");

  if (hasAcne) {
    tests.push({ name: "Hormone Profile (DHEA-S, Testosterone)", reason: "Androgens are the primary driver of sebaceous gland overactivity and acne detected in your scan." });
    tests.push({ name: "CBC with Differential", reason: "Detects underlying infection or elevated inflammatory markers contributing to active lesions." });
  }
  if (hasRosacea) {
    tests.push({ name: "Antinuclear Antibody (ANA)", reason: "Rules out autoimmune triggers that can manifest as rosacea-pattern redness." });
    tests.push({ name: "Demodex Density Assessment", reason: "Demodex mite overpopulation is a known rosacea trigger in detected vascular patterns." });
  }
  if (hasAtopic) {
    tests.push({ name: "Total IgE & Specific Allergens", reason: "Elevated IgE confirms immune-mediated atopic dermatitis detected in barrier-compromised zones." });
    tests.push({ name: "Allergy Panel (Food & Environmental)", reason: "Identifies contact or ingested allergens contributing to detected inflammatory response." });
  }
  if (hasPigment) {
    tests.push({ name: "Thyroid Panel (TSH, T3, T4)", reason: "Thyroid dysfunction can drive melasma and hormonal pigmentation irregularities found in your scan." });
    tests.push({ name: "Vitamin D & Folate Levels", reason: "Deficiencies correlate with impaired melanin regulation and uneven pigmentation detected." });
  }
  if (hasSebDerm) {
    tests.push({ name: "Serum Zinc & Selenium", reason: "Micronutrient deficiencies are linked to seborrheic dermatitis and scalp/skin yeast overgrowth." });
  }
  if (hasHighSev && tests.length === 0) {
    tests.push({ name: "CBC (Complete Blood Count)", reason: "Severe condition detected — baseline inflammatory markers should be assessed by a physician." });
    tests.push({ name: "CRP / ESR (Inflammatory Markers)", reason: "Assesses systemic inflammation that may be contributing to severe skin findings." });
  }

  // Always add a skin-generic test if acne/pigment present
  if (hasAcne || hasPigment) {
    tests.push({ name: "Insulin Resistance (HbA1c, Fasting Glucose)", reason: "Insulin spikes drive excess sebum production and PIH (post-inflammatory hyperpigmentation) detected in your scan." });
  }

  // Fallback if nothing detected (all healthy)
  if (tests.length === 0) {
    tests.push({ name: "Annual Skin Baseline Panel", reason: "No active conditions detected. Annual monitoring is recommended to maintain healthy baseline metrics." });
  }

  return tests.slice(0, 5);
}

// ─── Dynamic AI questions ─────────────────────────────────────────────────────

function buildAIQuestions(zones: ZoneScore[]): string[] {
  const conditions = zones.map(z => z.condition);
  const q: string[] = [];

  if (conditions.some(c => c === "Acne Vulgaris" || c === "Comedonal Acne")) {
    q.push("How long have you had active breakouts?");
    q.push("Are breakouts worse around your menstrual cycle?");
  }
  if (conditions.some(c => c === "Rosacea")) {
    q.push("Do you experience frequent facial flushing or burning?");
    q.push("Are flare-ups triggered by heat, spice, or alcohol?");
  }
  if (conditions.some(c => c === "Hyperpigmentation" || c === "Melasma")) {
    q.push("Have you recently increased sun exposure?");
    q.push("Are you currently on hormonal contraceptives?");
  }
  if (conditions.some(c => c === "Atopic Dermatitis" || c === "Contact Dermatitis")) {
    q.push("Do you have known allergies or eczema history?");
    q.push("Did you recently change skincare or household products?");
  }
  // Generic fallbacks
  q.push("What skincare products are you currently using?");
  q.push("Any family history of skin conditions?");

  return Array.from(new Set(q)).slice(0, 6);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  scanData: DynamicScanResult | null;
  onNewScan: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DiseaseAnalysis({ scanData, onNewScan }: Props) {
  const [, navigate]  = useLocation();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // If no scan data, we show a clear "upload needed" screen
  if (!scanData) {
    return (
      <div className="min-h-screen bg-[#FFF5F8] font-sans flex flex-col">
        <header className="w-full flex items-center justify-between px-8 py-4 bg-[#FFF5F8] border-b border-[#FFD6E7] sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-[#EC4899] hover:text-[#D81B60] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold text-[14px] hidden sm:inline">Back to Dashboard</span>
            </button>
            <div className="w-px h-6 bg-[#FFD6E7]" />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#EC4899]" />
              <span className="font-extrabold text-xl text-[#0F172A]">Clinderma</span>
            </div>
          </div>
          <button onClick={onNewScan} className="flex items-center gap-2 bg-[#EC4899] hover:bg-[#D81B60] text-white px-5 py-2.5 rounded-full font-bold text-[14px] shadow-[0_4px_16px_rgba(236,72,153,0.3)] transition-all">
            <Camera className="w-4 h-4" /> New Scan
          </button>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 py-20 text-center">
          <div className="w-24 h-24 rounded-3xl bg-[#FFF0F5] border-2 border-[#FFD6E7] flex items-center justify-center">
            <Camera className="w-12 h-12 text-[#EC4899] opacity-60" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2">No Scan Data Available</h1>
            <p className="text-[15px] font-semibold text-[#6D4C5E] max-w-md leading-relaxed">
              Disease analysis is generated in real-time from your actual photo using MediaPipe facial landmark detection and per-zone pixel analysis. Upload or capture a photo to begin.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onNewScan} className="flex items-center gap-2 bg-[#EC4899] hover:bg-[#D81B60] text-white px-8 py-3.5 rounded-2xl font-bold text-[14px] shadow-[0_4px_16px_rgba(236,72,153,0.3)] transition-all">
              <Camera className="w-4 h-4" /> Open Camera
            </button>
            <button onClick={onNewScan} className="flex items-center gap-2 bg-white border-2 border-[#EC4899] text-[#EC4899] px-8 py-3.5 rounded-2xl font-bold text-[14px] hover:bg-[#FFF5F8] transition-all">
              <Upload className="w-4 h-4" /> Upload Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Data derived from real scan ─────────────────────────────────────────────
  const zones = scanData.zones;
  const hasSevere = zones.some(z => z.severity === "High" || z.severity === "Moderate");
  const hasCritical = zones.some(z => z.severity === "High");
  const bloodTests = buildBloodTests(zones);
  const aiQuestions = buildAIQuestions(zones);
  const lowConfidence = scanData.analysisConfidence < 70;

  return (
    <div className="min-h-screen bg-[#FFF5F8] font-sans flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-8 py-4 bg-[#FFF5F8] border-b border-[#FFD6E7] sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-[#EC4899] hover:text-[#D81B60] transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold text-[14px] hidden sm:inline">Back to Dashboard</span>
          </button>
          <div className="w-px h-6 bg-[#FFD6E7]" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EC4899]" />
            <span className="font-extrabold text-xl text-[#0F172A]">Clinderma</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: "Dashboard",        path: "/dashboard" },
            { label: "Disease Analysis", path: "/disease-analysis" },
            { label: "Progress",         path: "/progress" },
            { label: "Planner",          path: "/planner" },
          ].map(({ label, path }) => (
            <button key={label} onClick={() => navigate(path)}
              className={`text-[14px] font-bold pb-1 border-b-2 transition-all ${
                path === "/disease-analysis"
                  ? "text-[#EC4899] border-[#EC4899]"
                  : "text-[#0F172A] border-transparent hover:text-[#EC4899]"
              }`}>
              {label}
            </button>
          ))}
        </nav>
        <button onClick={onNewScan}
          className="flex items-center gap-2 bg-[#EC4899] hover:bg-[#D81B60] text-white px-5 py-2.5 rounded-full font-bold text-[14px] shadow-[0_4px_16px_rgba(236,72,153,0.3)] transition-all">
          <Camera className="w-4 h-4" /> New Scan
        </button>
      </header>

      {/* Page title */}
      <div className="px-8 pt-8 pb-4 max-w-[1500px] mx-auto w-full">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FFD6E7] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#EC4899]" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Disease Analysis Report</h1>
              <p className="text-[13px] font-bold text-[#EC4899]">
                Real-Time AI Analysis · {scanData.timestamp.toLocaleString()} · Confidence: {scanData.analysisConfidence}%
              </p>
            </div>
          </div>
          {/* Confidence badge */}
          {lowConfidence && (
            <div className="flex items-center gap-2 bg-[#FFFBEB] border border-[#F59E0B] rounded-2xl px-4 py-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <p className="text-[12px] font-bold text-[#92400E]">
                Low confidence scan ({scanData.analysisConfidence}%) — retake in better lighting for more accurate results.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <main className="flex-1 px-8 pb-10 max-w-[1500px] mx-auto w-full flex flex-col gap-6">

        {/* Critical warning banner */}
        {hasCritical && (
          <div className="bg-gradient-to-r from-[#FEF2F2] to-[#FFF5F8] border-2 border-[#EF4444] rounded-2xl px-6 py-4 flex items-start gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-extrabold text-[#991B1B] mb-1">⚠ Severe condition detected in your scan</p>
              <p className="text-[13px] font-bold text-[#991B1B]/80">
                Based on real analysis of your photo, we strongly recommend blood tests and immediate consultation with a dermatologist or physician. Do not self-medicate.
              </p>
            </div>
          </div>
        )}

        <div className="flex xl:flex-row flex-col gap-6">

          {/* Left: Face photo + zone overlays */}
          <div className="flex-1 bg-white rounded-[28px] border border-[#FFD6E7] shadow-[0_8px_30px_rgba(236,72,153,0.07)] p-6 flex flex-col">
            <h2 className="text-[16px] font-extrabold text-[#0F172A] mb-2">Detected Conditions on Your Skin</h2>
            <p className="text-[12px] font-semibold text-[#6D4C5E] mb-5">
              All zones, percentages, and conditions are computed from real pixel analysis of your uploaded photo using MediaPipe face landmark detection.
            </p>

            {/* Face viewport with real image + overlays */}
            <div className="relative flex-1 bg-[#0F172A] rounded-[20px] overflow-hidden min-h-[460px] flex items-center justify-center border-4 border-[#FFF5F8]">
              {/* Scan line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#14B8A6] to-transparent opacity-80 animate-[scan_3s_linear_infinite]"
                style={{ boxShadow: "0 4px 12px rgba(20,184,166,0.6)" }} />

              {/* Neural grid overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" width="100%" height="100%">
                <defs>
                  <radialGradient id="glowCenter2" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#EC4899" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="50%" cy="50%" rx="45%" ry="48%" fill="url(#glowCenter2)" />
                <circle cx="12%" cy="20%" r="3" fill="#10B981" opacity="0.6" />
                <circle cx="88%" cy="80%" r="3" fill="#14B8A6" opacity="0.6" />
              </svg>

              {/* Real user photo with dynamic zone overlays */}
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="relative" style={{ height: "100%", aspectRatio: `${scanData.imageWidth} / ${scanData.imageHeight}`, maxHeight: "500px" }}>
                  <img src={scanData.imageUrl} alt="User Face — Real Scan" className="w-full h-full object-contain rounded-xl" />

                  {/* Zone overlays – positioned from real landmark bounding boxes */}
                  {zones.map((z, idx) => {
                    if (!z.box) return null;
                    const c = SEVERITY_COLORS[z.severity];
                    return (
                      <div key={idx}
                        className="absolute cursor-pointer group"
                        style={{
                          top:    `${z.box.top}%`,
                          left:   `${z.box.left}%`,
                          width:  `${z.box.width}%`,
                          height: `${z.box.height}%`,
                          border: `2.5px solid ${c.border}`,
                          borderRadius: "35%",
                          background:  `${c.border}18`,
                          boxShadow:   `0 0 18px ${c.border}50, inset 0 0 12px ${c.border}15`,
                        }}
                        onMouseEnter={() => setHoveredIdx(idx)}
                        onMouseLeave={() => setHoveredIdx(null)}>
                        {/* Pulse dot */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full border-2 border-white animate-pulse"
                          style={{ backgroundColor: c.border }} />
                        {/* Hover tooltip */}
                        {hoveredIdx === idx && (
                          <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-[#0F172A]/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-2xl z-30 whitespace-nowrap">
                            <p className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">{z.name}</p>
                            <p className="text-[10px] font-bold" style={{ color: c.border }}>{z.condition}</p>
                            <p className="text-[10px] font-bold text-white/70">{toDisplaySeverity(z.severity)} · {z.pctAffected}% area affected</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Zone condition cards */}
            <div className="mt-5 flex flex-col gap-3">
              {zones.map((z, idx) => {
                const c = SEVERITY_COLORS[z.severity];
                const isExpanded = expandedIdx === idx;
                return (
                  <div key={idx}
                    className="flex flex-col p-3 rounded-2xl border transition-all cursor-pointer"
                    style={{ backgroundColor: hoveredIdx === idx || isExpanded ? c.bg : "white", borderColor: hoveredIdx === idx || isExpanded ? c.border : "#FFD6E7" }}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onClick={() => setExpandedIdx(isExpanded ? null : idx)}>
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full mt-1.5 shrink-0 shadow-sm"
                        style={{ backgroundColor: c.border, boxShadow: `0 0 6px ${c.border}` }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[13px] font-extrabold text-[#0F172A]">{z.condition}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold"
                            style={{ backgroundColor: c.badge, color: c.text }}>
                            {toDisplaySeverity(z.severity)}
                          </span>
                          <span className="text-[11px] font-bold text-[#64748B]">
                            {z.name} · {z.pctAffected}% affected
                          </span>
                        </div>
                        {/* Pixel metric mini-bars */}
                        <div className="mt-2 flex gap-3 flex-wrap">
                          {[
                            { label: "Redness",   val: z.metrics.rednessIndex },
                            { label: "Melanin",   val: z.metrics.melaninIndex },
                            { label: "Texture",   val: z.metrics.textureScore },
                            { label: "Oiliness",  val: z.metrics.saturationScore },
                          ].map(m => (
                            <div key={m.label} className="flex flex-col gap-0.5 min-w-[56px]">
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#6D4C5E]">{m.label}</span>
                              <div className="h-1 bg-[#FFD6E7] rounded-full overflow-hidden w-14">
                                <div className="h-full rounded-full" style={{ width: `${m.val}%`, backgroundColor: c.border }} />
                              </div>
                              <span className="text-[9px] font-bold text-[#6D4C5E]">{m.val.toFixed(0)}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Expanded causal explanation */}
                    {isExpanded && (
                      <div className="mt-2 ml-6 pl-2 border-l-2" style={{ borderColor: c.border }}>
                        <p className="text-[11px] font-semibold text-[#0F172A] leading-relaxed">{z.causalText}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              <p className="text-[10px] font-bold text-[#C9A8B8] text-center">Tap a zone card to view detailed causal explanation.</p>
            </div>

            {/* AI Questions */}
            <div className="mt-6 bg-[#FFF5F8] rounded-2xl border border-[#FFD6E7] p-5">
              <p className="text-[13px] font-extrabold text-[#0F172A] mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#EC4899]" /> AI would like to know more
              </p>
              <div className="flex flex-wrap gap-2">
                {aiQuestions.map((q) => (
                  <button key={q}
                    className="px-3 py-1.5 bg-white border border-[#FFD6E7] rounded-full text-[11px] font-bold text-[#0F172A] hover:border-[#EC4899] hover:text-[#EC4899] transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-full xl:w-[400px] shrink-0 flex flex-col gap-5">

            {/* AI Causal Analysis — real bullets */}
            <div className="bg-white rounded-[24px] border border-[#FFD6E7] shadow-sm p-6">
              <h3 className="text-[15px] font-extrabold text-[#0F172A] mb-1 flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#EC4899]" /> AI Causal Analysis
              </h3>
              <p className="text-[11px] font-semibold text-[#6D4C5E] mb-4">Generated from real pixel analysis of your photo.</p>
              <ul className="flex flex-col gap-3">
                {scanData.globalCausalBullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 bg-[#FFF5F8] p-3.5 rounded-2xl border border-[#FFD6E7]/50">
                    <Zap className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                    <p className="text-[12px] font-semibold text-[#0F172A] leading-relaxed">{b}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical condition panel */}
            {hasCritical && (
              <div className="bg-gradient-to-br from-[#FEF2F2] to-[#FFF5F8] border-2 border-[#EF4444] rounded-[24px] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                  <p className="text-[14px] font-extrabold text-[#991B1B]">Severe Condition in Your Scan</p>
                </div>
                <p className="text-[12px] font-semibold text-[#991B1B]/80 leading-relaxed">
                  High-severity markers were detected in your photo analysis. Immediate dermatologist consultation is strongly recommended. Do not self-medicate.
                </p>
              </div>
            )}

            {/* Dynamic Blood Tests */}
            <div className="bg-white rounded-[24px] border border-[#FFD6E7] shadow-sm p-6">
              <h3 className="text-[15px] font-extrabold text-[#0F172A] mb-1 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-[#14B8A6]" /> Recommended Blood Tests
              </h3>
              <p className="text-[11px] font-semibold text-[#6D4C5E] mb-4">Selected based on conditions detected in your actual scan.</p>
              <div className="flex flex-col gap-3">
                {bloodTests.map((t) => (
                  <div key={t.name} className="flex items-start gap-3 p-3 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1]">
                    <div className="w-7 h-7 rounded-xl bg-[#14B8A6]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FlaskConical className="w-3.5 h-3.5 text-[#14B8A6]" />
                    </div>
                    <div>
                      <p className="text-[13px] font-extrabold text-[#0F172A]">{t.name}</p>
                      <p className="text-[11px] font-medium text-[#64748B] leading-snug">{t.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone health overview */}
            <div className="bg-white rounded-[24px] border border-[#FFD6E7] shadow-sm p-6">
              <h3 className="text-[15px] font-extrabold text-[#0F172A] mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#EC4899]" /> Zone Health Overview
              </h3>
              <div className="flex flex-col gap-3">
                {zones.map((z, i) => {
                  const c = SEVERITY_COLORS[z.severity];
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.border }} />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-[12px] font-extrabold text-[#0F172A]">{z.name}</span>
                          <span className="text-[11px] font-bold" style={{ color: c.border }}>{z.pctAffected}%</span>
                        </div>
                        <div className="h-1.5 bg-[#FFD6E7] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${z.pctAffected}%`, backgroundColor: c.border }} />
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: c.badge, color: c.text }}>{toDisplaySeverity(z.severity)}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <button className="w-full bg-gradient-to-r from-[#EC4899] to-[#D81B60] hover:from-[#D81B60] hover:to-[#B31B5A] text-white font-extrabold py-4 rounded-2xl text-[15px] flex items-center justify-center gap-3 shadow-[0_6px_24px_rgba(236,72,153,0.35)] hover:shadow-[0_8px_32px_rgba(236,72,153,0.45)] transition-all active:scale-95">
              <Stethoscope className="w-5 h-5" />
              Consult a Dermatologist Now
              <ChevronRight className="w-5 h-5" />
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}
