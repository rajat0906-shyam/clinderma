import React, { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import { Sparkles, Upload, CheckCircle2, Moon, Droplets, Activity, Info, Star, UserCircle, TrendingDown, AlertCircle, Layers, Sun, Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScanModal from "@/components/ScanModal";
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  loadProfile, UserProfile, getInitials, getSkinTypeLabel,
  getSleepLabel, getWaterLabel, getExerciseLabel,
  generateInsights, generateZones, calculateScore,
  getLesionCount, getPigmentPct, getAcneSeverity,
} from "@/lib/profile";
import { DynamicScanResult } from "@/lib/faceAnalysis";

const queryClient = new QueryClient();

const DEFAULT_PROFILE: UserProfile = {
  name: "Sarah A.", age: "24", gender: "Female", skinType: "combination",
  concerns: ["Acne / Breakouts", "Hyperpigmentation"],
  otherConcern: "", sleep: "7-8", water: "2-3", diet: "Balanced", exercise: "3-4",
  stress: 3, hormonal: "Yes", hormonalDetail: "", cycle: "Regular", allergies: "",
  hadIssues: "Yes", duration: "1-2 years", treatments: ["Topical creams"],
  familyHistory: ["Acne"], preferCosmetic: true, preferNatural: true,
};

function useLesionData(lesions: number) {
  const start = Math.min(lesions + 6, 20);
  return [
    { day: "Day 1", count: start },
    { day: "Day 5", count: start - 1 },
    { day: "Day 10", count: Math.round(start * 0.85) },
    { day: "Day 15", count: Math.round(start * 0.75) },
    { day: "Day 20", count: Math.round(start * 0.65) },
    { day: "Day 25", count: lesions + 1 },
    { day: "Day 28", count: lesions },
  ];
}

function usePigmentData(pct: number) {
  const start = Math.min(pct + 8, 45);
  return [
    { day: "Day 1", percent: start },
    { day: "Day 7", percent: start - 1 },
    { day: "Day 14", percent: Math.round(start * 0.88) },
    { day: "Day 21", percent: Math.round(start * 0.80) },
    { day: "Day 28", percent: pct },
  ];
}

function useProfile(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile() ?? DEFAULT_PROFILE);
  useEffect(() => {
    const saved = loadProfile();
    if (saved) setProfile(saved);
  }, []);
  return profile;
}

function Header({ profile, onNewScan, lastScan }: { profile: UserProfile; onNewScan?: () => void; lastScan?: Date | null }) {
  const [, navigate] = useLocation();
  const initials = getInitials(profile.name) || "?";
  const skinLabel = getSkinTypeLabel(profile.skinType);
  const scanDate = lastScan ?? new Date();
  const today = scanDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const scanTime = scanDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="w-full flex items-center justify-between px-8 py-3.5 bg-white border-b border-[#FFD6E7] sticky top-0 z-50 shadow-[0_1px_8px_rgba(233,30,99,0.06)]">
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-[#E91E63] text-white px-4 py-2 rounded-2xl shadow-sm select-none">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold text-base tracking-tight">Clinderma</span>
        </div>
        <div className="h-6 w-px bg-[#FFD6E7]" />
        <div>
          <p className="text-[#2C0B1F] font-bold text-base leading-tight">AI Skin Health Dashboard</p>
          <p className="text-[#6D4C5E] text-xs">Last scan: {today} · {scanTime}</p>
        </div>
        <span className="text-[10px] font-semibold px-2.5 py-1 bg-[#FFF0F5] text-[#E91E63] rounded-full border border-[#FFD6E7] tracking-wide">NON-DIAGNOSTIC</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/onboarding")}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#FFD6E7] bg-white text-[#6D4C5E] text-sm font-medium hover:border-[#E91E63] hover:text-[#E91E63] transition-all"
        >
          <UserCircle className="w-4 h-4" />
          Edit Profile
        </button>
        <div className="flex items-center gap-2.5 pl-3 pr-4 py-2 bg-[#FFF0F5] rounded-full border border-[#FFD6E7]">
          <div className="w-7 h-7 rounded-full bg-[#E91E63] flex items-center justify-center text-white text-xs font-bold">{initials}</div>
          <div className="flex flex-col">
            <span className="text-[#2C0B1F] font-bold text-xs leading-tight">{profile.name}</span>
            <span className="text-[#6D4C5E] text-[10px]">{skinLabel} · Age {profile.age}</span>
          </div>
        </div>
        <button
          onClick={() => onNewScan?.()}
          className="flex items-center gap-2 bg-[#E91E63] hover:bg-[#D81B60] active:scale-95 transition-all text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-[0_4px_12px_rgba(233,30,99,0.25)] hover:shadow-[0_6px_16px_rgba(233,30,99,0.35)]"
        >
          <Upload className="w-4 h-4" />
          New Scan
        </button>
      </div>
    </header>
  );
}

function StatCards({ profile, scanResult }: { profile: UserProfile; scanResult: DynamicScanResult | null }) {
  const score = scanResult ? scanResult.overallScore : calculateScore(profile);
  const lesions = scanResult ? scanResult.activeLesionsEst : getLesionCount(profile);
  const pigment = scanResult ? scanResult.pigmentationEst : getPigmentPct(profile);
  const acne = getAcneSeverity(profile);
  const skinLabel = getSkinTypeLabel(profile.skinType);

  const stats = [
    {
      label: "Skin Health Score",
      value: String(score),
      unit: "/100",
      delta: score >= 75 ? "Great condition ✓" : score >= 55 ? "Room to improve" : "Needs attention",
      positive: score >= 75 ? true : score >= 55 ? null : false,
      color: "#E91E63",
      bg: "#FFF0F5",
      icon: Activity,
      bar: score,
    },
    {
      label: "Active Lesions",
      value: String(lesions),
      unit: "detected",
      delta: lesions === 0 ? "None detected ✓" : `Based on your ${profile.concerns.length} concern${profile.concerns.length > 1 ? "s" : ""}`,
      positive: lesions === 0 ? true : null,
      color: "#FF4081",
      bg: "#FFF5F8",
      icon: AlertCircle,
      bar: null,
    },
    {
      label: "Pigmentation",
      value: pigment > 0 ? `${pigment}%` : "None",
      unit: pigment > 0 ? "coverage" : "",
      delta: pigment === 0 ? "No pigmentation ✓" : "Fading with treatment",
      positive: pigment === 0 ? true : null,
      color: "#FF69B4",
      bg: "#FFF0F5",
      icon: Layers,
      bar: pigment > 0 ? pigment : null,
    },
    {
      label: "Skin Type",
      value: skinLabel,
      unit: "",
      delta: `Age ${profile.age} · ${profile.gender}`,
      positive: null,
      color: "#FF8DA1",
      bg: "#FFF5F8",
      icon: Sun,
      bar: null,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-[#FFD6E7] shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6D4C5E] uppercase tracking-wider">{s.label}</span>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <Icon className="w-4 h-4" style={{ color: s.color }} />
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black tracking-tight" style={{ color: s.color }}>{s.value}</span>
              {s.unit && <span className="text-sm font-medium text-[#6D4C5E]">{s.unit}</span>}
            </div>
            {s.bar !== null && (
              <div className="w-full bg-[#FFF0F5] h-1.5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${s.bar}%`, background: s.color }} />
              </div>
            )}
            <span className={`text-xs font-medium ${s.positive === true ? "text-emerald-500" : s.positive === false ? "text-red-400" : "text-[#6D4C5E]"}`}>
              {s.delta}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FaceScanPanel() {
  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Face Card */}
      <div className="flex-1 bg-white rounded-3xl border border-[#FFD6E7] shadow-sm overflow-hidden relative flex items-center justify-center" style={{ minHeight: 480 }}>
        {/* Subtle mesh bg */}
        <div className="absolute inset-0 face-mesh-overlay opacity-20 mix-blend-multiply pointer-events-none" />

        {/* Face SVG */}
        <svg viewBox="0 0 400 500" className="w-[68%] h-[88%] absolute z-0 drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="fg2" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#FDF3E8" />
              <stop offset="55%" stopColor="#F5E1D4" />
              <stop offset="100%" stopColor="#E9D0C0" />
            </radialGradient>
          </defs>
          <path d="M200,30 C290,30 350,120 350,250 C350,380 280,470 200,470 C120,470 50,380 50,250 C50,120 110,30 200,30 Z" fill="url(#fg2)" />
          <path d="M200,200 L200,310" stroke="rgba(200,160,140,0.08)" strokeWidth="22" strokeLinecap="round" />
        </svg>

        {/* Heatmap */}
        <div className="absolute w-[56%] h-[68%] top-[12%] left-[22%] z-10 skin-heatmap mix-blend-multiply rounded-full blur-2xl opacity-60 pointer-events-none" />

        {/* Zone overlays */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute top-[11%] left-[25%] w-[50%] h-[14%] border-2 border-dashed border-[#FF69B4]/60 rounded-[100%]">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#FF69B4] shadow-sm whitespace-nowrap">Forehead</span>
          </div>
          <div className="absolute top-[29%] left-[40%] w-[20%] h-[34%] border-2 border-dashed border-[#E91E63]/60 rounded-[100%]">
            <span className="absolute top-1/2 -right-2 translate-x-full -translate-y-1/2 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#E91E63] shadow-sm whitespace-nowrap">T-Zone · High Oil</span>
          </div>
          <div className="absolute top-[40%] left-[14%] w-[22%] h-[24%] border-2 border-dashed border-[#FF8DA1]/60 rounded-[100%]">
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#FF8DA1] shadow-sm whitespace-nowrap">Left Cheek</span>
          </div>
          <div className="absolute top-[40%] right-[14%] w-[22%] h-[24%] border-2 border-dashed border-[#FF8DA1]/60 rounded-[100%]">
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold text-[#FF8DA1] shadow-sm whitespace-nowrap">Right Cheek</span>
          </div>
          <div className="absolute bottom-[11%] left-[30%] w-[40%] h-[14%] border-2 border-dashed border-[#FF4081]/60 rounded-[100%]" />
        </div>

        {/* Lesion bounding boxes */}
        <div className="absolute inset-0 z-30 pointer-events-none">
          {[
            { top: "18%", left: "38%", size: "w-5 h-5", color: "#FF1493", label: "Comedonal 88%" },
            { top: "15%", left: "55%", size: "w-4 h-4", color: "#FF1493", label: "Comedonal 82%" },
            { top: "20%", left: "43%", size: "w-4 h-4", color: "#FF1493", label: "Comedonal 79%" },
            { bottom: "20%", left: "45%", size: "w-6 h-6", color: "#FF4081", label: "Inflammatory 92%" },
            { bottom: "16%", left: "53%", size: "w-5 h-5", color: "#FF4081", label: "Inflammatory 87%" },
            { top: "50%", left: "24%", size: "w-4 h-4", color: "#FF8DA1", label: "Lesion 76%" },
            { top: "45%", right: "21%", size: "w-5 h-5", color: "#FF8DA1", label: "Lesion 81%" },
          ].map((b, i) => (
            <div
              key={i}
              className={`absolute ${b.size} border-[2px] rounded-sm group pointer-events-auto`}
              style={{
                top: b.top, left: b.left, bottom: (b as any).bottom, right: (b as any).right,
                borderColor: b.color,
                background: b.color + "18",
              }}
            >
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded-lg text-[8px] font-bold shadow-md border border-[#FFD6E7] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50" style={{ color: b.color }}>{b.label}</div>
            </div>
          ))}
        </div>

        {/* Floating chin callout */}
        <div className="absolute bottom-[26%] right-[8%] bg-white px-3 py-2 rounded-2xl shadow-lg border border-[#FF4081] z-40 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#FF4081]/10 flex items-center justify-center">
            <Info className="w-3 h-3 text-[#FF4081]" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-[#2C0B1F] leading-tight">Chin Zone · 28% Affected</p>
            <p className="text-[9px] text-[#FF4081] font-medium">Likely Hormonal</p>
          </div>
        </div>

        {/* Processing badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 border border-[#FFD6E7] px-3 py-1.5 rounded-full shadow-sm z-40">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-[#6D4C5E]">Analysed · Lighting corrected</span>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl border border-[#FFD6E7] px-5 py-3.5 flex items-center justify-between shadow-sm">
        <span className="text-xs font-semibold text-[#6D4C5E]">Lesion types</span>
        <div className="flex items-center gap-5">
          {[
            { color: "#FF1493", label: "Comedonal" },
            { color: "#FF4081", label: "Inflammatory" },
            { color: "#FF8DA1", label: "Other" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm shadow-sm" style={{ background: l.color }} />
              <span className="text-xs font-medium text-[#6D4C5E]">{l.label}</span>
            </div>
          ))}
        </div>
        <CheckCircle2 className="w-4 h-4 text-[#FF69B4]" />
      </div>
    </div>
  );
}

function ZoneGrid({ scanResult }: { scanResult: DynamicScanResult | null }) {
  // Fallback to static mock if no real scan is provided yet
  const zones = scanResult ? scanResult.zones.map(z => ({
    name: z.name,
    severity: z.severity,
    pct: Math.round(z.textureVar), // Render texture variance as coverage %
    color: z.color
  })) : [
    { name: "Forehead", severity: "Mild", pct: 8, color: "#FF69B4" },
    { name: "T-Zone", severity: "High", pct: 38, color: "#E91E63" },
    { name: "Left Cheek", severity: "Low", pct: 5, color: "#FF8DA1" },
    { name: "Right Cheek", severity: "Low", pct: 4, color: "#FF8DA1" },
    { name: "Chin", severity: "Moderate", pct: 28, color: "#FF4081" },
    { name: "Nose", severity: "Moderate", pct: 22, color: "#FF4081" },
  ];
  return (
    <div className="bg-white rounded-2xl border border-[#FFD6E7] shadow-sm p-5">
      <h3 className="text-sm font-bold text-[#2C0B1F] mb-4">Zone Breakdown</h3>
      <div className="grid grid-cols-3 gap-3">
        {zones.map((z) => (
          <div key={z.name} className="bg-[#FFF0F5] rounded-xl px-3 py-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#2C0B1F]">{z.name}</span>
              <span className="text-[10px] font-bold" style={{ color: z.color }}>{z.severity}</span>
            </div>
            <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${z.pct}%`, background: z.color }} />
            </div>
            <span className="text-[10px] text-[#6D4C5E]">{z.pct}% affected</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIInsights({ profile, scanResult }: { profile: UserProfile; scanResult?: DynamicScanResult | null }) {
  // We can merge real ML insights with profile insights, but for now we fallback to profile generator
  const insights = generateInsights(profile);
  
  // If scanResult is present, prepend a dynamic insight
  if (scanResult && scanResult.activeLesionsEst > 0) {
    insights.unshift({
      text: "ML Analysis detected active lesions in high variance zones",
      cause: "Targetted treatment recommended",
      color: "#E91E63"
    });
  }

  return (
    <div className="bg-gradient-to-br from-[#FFF0F5] to-white rounded-2xl border border-[#FFD6E7] shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-lg bg-[#E91E63] flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-[#2C0B1F]">AI Causal Analysis</h3>
        <span className="ml-auto text-[10px] bg-[#E91E63]/10 text-[#E91E63] font-semibold px-2 py-0.5 rounded-full">{insights.length} insights</span>
      </div>
      <div className="flex flex-col gap-3">
        {insights.map((ins, i) => (
          <div key={i} className="bg-white rounded-xl p-3.5 border border-[#FFD6E7]/50 flex items-start gap-3 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: ins.color }} />
            <div>
              <p className="text-sm text-[#2C0B1F] font-medium leading-snug">{ins.text}</p>
              <p className="text-xs mt-0.5 font-semibold" style={{ color: ins.color }}>→ {ins.cause}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Recommendations({ scanResult, profile }: { scanResult: DynamicScanResult | null; profile: UserProfile }) {
  const [tab, setTab] = useState<"cosmetic" | "home">("cosmetic");

  // Base profile-driven or default recommendations
  let cosmetic = [
    { category: "For Acne", items: [
      { name: "Salicylic Acid 2%", desc: "Clears clogged pores, reduces blackheads", rating: 4.8 },
      { name: "Benzoyl Peroxide 5%", desc: "Kills acne bacteria, reduces inflammation", rating: 4.6 },
      { name: "Niacinamide 10%", desc: "Reduces inflammation, minimises pores", rating: 4.9 },
    ]},
    { category: "For Pigmentation", items: [
      { name: "Vitamin C Serum", desc: "Brightens skin, fades dark spots", rating: 4.7 },
      { name: "Alpha Arbutin", desc: "Targeted hyperpigmentation treatment", rating: 4.5 },
    ]},
  ];

  let home = [
    { name: "Turmeric (Haldi)", desc: "Anti-inflammatory, reduces redness" },
    { name: "Aloe Vera", desc: "Soothing & healing, calms irritation" },
    { name: "Lemon + Honey Mask", desc: "Brightening, fades pigmentation naturally" },
    { name: "Green Tea Toner", desc: "Antioxidant-rich, reduces sebum" },
  ];

  // Dynamically overwrite based on ML results if available
  if (scanResult) {
    const hasHighErythema = scanResult.zones.some(z => z.rednessScore > 50);
    const hasTexture = scanResult.zones.some(z => z.textureVar > 50);
    const hasLesions = scanResult.activeLesionsEst > 0;

    cosmetic = [];
    home = [];

    if (hasLesions || hasTexture) {
      cosmetic.push({ category: "Targeted Lesion Care", items: [
        { name: "Salicylic Acid 2% BHA", desc: "Recommended for high variance areas detected", rating: 4.8 },
        { name: "Azelaic Acid 10%", desc: "Addresses textural irregularities found in scan", rating: 4.9 }
      ]});
      home.push(
        { name: "Tea Tree Oil Extract", desc: "Diluted application on active scan zones" },
        { name: "Oatmeal Compress", desc: "Soothes textural bumps and irritation" }
      );
    }

    if (hasHighErythema) {
      cosmetic.push({ category: "Redness Relief", items: [
        { name: "Centella Asiatica Serum", desc: "Calms high erythema values mapped by AI", rating: 4.9 },
        { name: "Barrier Repair Cream", desc: "Supports compromised skin barriers", rating: 4.7 }
      ]});
      home.push(
        { name: "Cold Cucumber Slices", desc: "Cools the high redness zones detected" },
        { name: "Chamomile Tea Toner", desc: "Anti-inflammatory for sensitive areas" }
      );
    }

    if (!hasHighErythema && !hasLesions && !hasTexture) {
      cosmetic.push({ category: "Maintenance Routine", items: [
        { name: "Hyaluronic Acid", desc: "Skin is in great shape, maintain hydration!", rating: 4.9 },
        { name: "Vitamin C + E", desc: "Protects your healthy skin barrier", rating: 4.8 }
      ]});
      home.push(
        { name: "Rose Water Mist", desc: "Maintains optimal hydration" },
        { name: "Aloe Vera Gel", desc: "Universal lightweight hydration" }
      );
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#FFD6E7] shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#2C0B1F]">Recommendations</h3>
        <div className="flex bg-[#FFF0F5] p-1 rounded-full border border-[#FFD6E7]">
          {(["cosmetic", "home"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${tab === t ? "bg-[#E91E63] text-white shadow-sm" : "text-[#6D4C5E] hover:text-[#E91E63]"}`}
            >
              {t === "cosmetic" ? "Cosmetic" : "Home Remedies"}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tab === "cosmetic" ? (
          <motion.div key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-6 w-full max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {cosmetic.map((c) => (
              <div key={c.category} className="flex flex-col gap-2.5">
                <h4 className="text-xs font-bold text-[#6D4C5E] uppercase tracking-wider">{c.category}</h4>
                {c.items.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-xl border border-[#FFD6E7]/40 bg-[#FFF0F5]/50 group hover:border-[#FFD6E7] transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-[#FFD6E7] shadow-sm flex items-center justify-center shrink-0">
                        <Droplets className="w-4 h-4 text-[#FF69B4]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#2C0B1F] group-hover:text-[#E91E63] transition-colors">{item.name}</p>
                        <p className="text-[11px] text-[#6D4C5E] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                      <div className="flex items-center gap-1 text-[#E91E63] text-xs font-bold">
                        <Star className="w-3 h-3 fill-current" />{item.rating || "4.5"}
                      </div>
                      <button className="text-[10px] text-[#E91E63] font-bold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="w-3 h-3" />Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
            {home.map((item) => (
              <div key={item.name} className="p-3 bg-[#FFF0F5] rounded-xl border border-[#FFD6E7]/50">
                <p className="text-sm font-bold text-[#2C0B1F]">{item.name}</p>
                <p className="text-[11px] text-[#6D4C5E] mt-1">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProgressSection() {
  const [tf, setTf] = useState<"4w" | "12w">("4w");
  const profile = useProfile();
  const lesions = getLesionCount(profile);
  const pigment = getPigmentPct(profile);
  const lesionTrendData = useLesionData(lesions);
  const pigmentationTrendData = usePigmentData(pigment);

  return (
    <div className="bg-white rounded-3xl border border-[#FFD6E7] shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-[#2C0B1F]">Progress Tracking</h2>
          <p className="text-xs text-[#6D4C5E] mt-0.5">Tracking changes across your skin health journey</p>
        </div>
        <div className="flex bg-[#FFF0F5] p-1 rounded-full border border-[#FFD6E7]">
          {(["4w", "12w"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTf(t)}
              className={`px-5 py-1.5 text-xs font-bold rounded-full transition-all ${tf === t ? "bg-white text-[#E91E63] shadow-sm" : "text-[#6D4C5E] hover:text-[#E91E63]"}`}
            >
              {t === "4w" ? "4 Weeks" : "12 Weeks"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Lesion chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-[#2C0B1F]">Lesion Count</p>
              <p className="text-xs text-[#6D4C5E]">Active acne lesions over time</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-[#E91E63]">7</p>
              <p className="text-[10px] text-emerald-500 font-semibold">↓42% improved</p>
            </div>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lesionTrendData}>
                <defs>
                  <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E91E63" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#E91E63" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E7" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6D4C5E" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#6D4C5E" }} tickLine={false} axisLine={false} width={20} />
                <RechartsTooltip contentStyle={{ borderRadius: "10px", border: "1px solid #FFD6E7", fontSize: 11 }} />
                <Area type="monotone" dataKey="count" stroke="#E91E63" strokeWidth={2.5} fill="url(#lg1)" dot={{ r: 3, fill: "#E91E63", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pigmentation chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-[#2C0B1F]">Pigmentation %</p>
              <p className="text-xs text-[#6D4C5E]">Coverage area over time</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-[#FF69B4]">12%</p>
              <p className="text-[10px] text-emerald-500 font-semibold">↓33% improved</p>
            </div>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pigmentationTrendData}>
                <defs>
                  <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF69B4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF69B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E7" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#6D4C5E" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#6D4C5E" }} tickLine={false} axisLine={false} width={24} />
                <RechartsTooltip contentStyle={{ borderRadius: "10px", border: "1px solid #FFD6E7", fontSize: 11 }} />
                <Area type="monotone" dataKey="percent" stroke="#FF69B4" strokeWidth={2.5} fill="url(#lg2)" dot={{ r: 3, fill: "#FF69B4", stroke: "#fff", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Milestones */}
        <div>
          <p className="text-sm font-bold text-[#2C0B1F] mb-3">Recent Milestones</p>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: TrendingDown, label: "Chin lesion reduced 42%", sub: "4 weeks of routine", color: "#E91E63" },
              { icon: CheckCircle2, label: "Pigmentation fading on left cheek", sub: "Responding to Vit C", color: "#FF69B4" },
              { icon: Activity, label: "T-zone oil control improving", sub: "Better hydration", color: "#FF4081" },
              { icon: Sparkles, label: "Overall score up 3 pts", sub: "This week", color: "#FF8DA1" },
            ].map((m, i) => {
              const Icon = m.icon;
              return (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#FFF0F5] rounded-xl border border-[#FFD6E7]/50">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.color + "18" }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: m.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2C0B1F] leading-tight">{m.label}</p>
                    <p className="text-[10px] text-[#6D4C5E] mt-0.5">{m.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const profile = useProfile();
  const [scanOpen, setScanOpen] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [scanResult, setScanResult] = useState<DynamicScanResult | null>(null);

  const handleScanComplete = (result: DynamicScanResult) => {
    setScanResult(result);
    setLastScan(result.timestamp);
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col font-sans">
      <Header profile={profile} onNewScan={() => setScanOpen(true)} lastScan={lastScan} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-6 py-6 flex flex-col">
        <StatCards profile={profile} scanResult={scanResult} />

        {/* Main content */}
        <div className="flex gap-5 flex-1">
          {/* Left: Face scan (45%) */}
          <div className="w-[42%] shrink-0">
            <FaceScanPanel />
          </div>

          {/* Right: Insights + Recommendations (58%) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            <AIInsights profile={profile} scanResult={scanResult} />
            <ZoneGrid scanResult={scanResult} />
            <Recommendations scanResult={scanResult} profile={profile} />
          </div>
        </div>

        <ProgressSection />
      </main>

      <footer className="py-4 text-center border-t border-[#FFD6E7] bg-white mt-6">
        <p className="text-[#6D4C5E] text-xs font-medium">
          Non-diagnostic · Progress tracking only · All skin tones & lighting · Privacy-first — data never leaves your device
        </p>
      </footer>

      <AnimatePresence>
        {scanOpen && (
          <ScanModal
            onClose={() => setScanOpen(false)}
            onComplete={handleScanComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/auth" component={Auth} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/onboarding" component={Onboarding} />
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
