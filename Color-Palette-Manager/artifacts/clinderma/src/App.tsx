import React, { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/Onboarding";
import Landing from "@/pages/Landing";
import Pricing from "@/pages/Pricing";
import Company from "@/pages/Company";
import Auth from "@/pages/Auth";
import DiseaseAnalysis from "@/pages/DiseaseAnalysis";
import ProgressReport from "@/pages/ProgressReport";
import Planner from "@/pages/Planner";
import { Sparkles, Upload, CheckCircle2, Moon, Droplets, Activity, Info, Star, UserCircle, AlertCircle, Layers, Sun, Download, Camera, Shield, FileText, ArrowRight, Video, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ScanModal from "@/components/ScanModal";
import {
  loadProfile, UserProfile, getInitials, getSkinTypeLabel,
  calculateScore,
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

function useProfile(): UserProfile {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile() ?? DEFAULT_PROFILE);
  useEffect(() => {
    const handleStorage = () => {
      const saved = loadProfile();
      if (saved) setProfile(saved);
    };
    window.addEventListener("profileUpdated", handleStorage);
    return () => window.removeEventListener("profileUpdated", handleStorage);
  }, []);
  return profile;
}

function Header({ profile, onNewScan }: { profile: UserProfile; onNewScan?: () => void; }) {
  const [location, navigate] = useLocation();
  
  const NAV_ITEMS = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Disease Analysis", path: "/disease-analysis" },
    { label: "Progress", path: "/progress" },
    { label: "Planner", path: "/planner" },
  ];

  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-[#FFF5F8] border-b border-[#FFD6E7] sticky top-0 z-50 shadow-sm font-sans">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2 text-[#EC4899] px-2 py-2 select-none cursor-pointer" onClick={() => navigate("/")}>
          <Sparkles className="w-6 h-6 flex-shrink-0" />
          <span className="font-extrabold text-2xl tracking-tight text-[#0F172A]">Clinderma</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map(({ label, path }) => (
            <button 
              key={label}
              onClick={() => navigate(path)}
              className={`text-[15px] font-bold transition-all border-b-2 pb-1 pt-1 ${
                location === path || (path === "/dashboard" && location === "/product/ai-skin-analysis")
                  ? "text-[#EC4899] border-[#EC4899]" 
                  : "text-[#0F172A] border-transparent hover:text-[#EC4899]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-5">
        <button className="text-[15px] font-bold text-[#0F172A] hover:text-[#EC4899] transition-colors hidden sm:block">
          Log In
        </button>
        <button
          onClick={() => onNewScan?.()}
          className="flex items-center gap-2.5 bg-[#EC4899] hover:bg-[#D81B60] active:scale-95 transition-all text-white px-6 py-3 rounded-full text-[15px] font-bold shadow-[0_4px_16px_rgba(236,72,153,0.3)] hover:shadow-[0_6px_24px_rgba(236,72,153,0.4)]"
        >
          <Camera className="w-4 h-4 text-white" />
          <span className="hidden sm:inline">New Scan</span>
        </button>
      </div>
    </header>
  );
}

function GuidedPhotoCapture({ onScanClick }: { onScanClick: () => void }) {
  return (
    <div className="bg-white rounded-[24px] border border-[#FFD6E7] shadow-[0_8px_30px_rgba(236,72,153,0.06)] p-6 relative flex flex-col h-full">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FFD6E7] flex items-center justify-center shadow-inner">
          <Camera className="w-6 h-6 text-[#EC4899]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] leading-tight tracking-tight">Camera Access</h2>
          <p className="text-[13px] font-bold text-[#EC4899]">Ready for scanning</p>
        </div>
      </div>

      <div className="bg-[#FFF5F8] border border-[#FFD6E7] rounded-2xl p-4 flex flex-col gap-3 mb-5">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-[#14B8A6]" />
          <p className="text-[13px] font-bold text-[#0F172A]">Images never leave your device</p>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-[#14B8A6]" />
          <p className="text-[13px] font-bold text-[#0F172A]">AI runs entirely in-browser</p>
        </div>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#14B8A6]" />
          <p className="text-[13px] font-bold text-[#0F172A]">No data stored after scan</p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white border border-[#FFD6E7] p-4 rounded-2xl mb-8 shadow-sm">
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-[#E6FFFA] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <span className="text-[10px] font-bold text-[#0F172A]">Lighting</span>
        </div>
        <div className="w-px h-8 bg-[#FFD6E7]"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-[#E6FFFA] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <span className="text-[10px] font-bold text-[#0F172A]">Position</span>
        </div>
        <div className="w-px h-8 bg-[#FFD6E7]"></div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-7 h-7 rounded-full bg-[#E6FFFA] flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          </div>
          <span className="text-[10px] font-bold text-[#0F172A]">Focus</span>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3">
        <button
          onClick={onScanClick}
          className="w-full flex items-center justify-center gap-2 bg-[#EC4899] hover:bg-[#D81B60] text-white font-extrabold py-4 rounded-2xl shadow-[0_4px_20px_rgba(236,72,153,0.3)] transition-all text-[15px]"
        >
          <Video className="w-5 h-5" /> Open Camera
        </button>
        <button
          onClick={onScanClick}
          className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#FFF5F8] border-2 border-[#EC4899] text-[#EC4899] font-extrabold py-4 rounded-2xl transition-all text-[15px]"
        >
          <Upload className="w-5 h-5" /> Upload from Device
        </button>
      </div>
    </div>
  );
}

function MainAnalysisDashboard({ scanData }: { scanData: DynamicScanResult | null }) {
  return (
    <div className="bg-white rounded-[32px] border border-[#FFD6E7] shadow-[0_12px_40px_rgba(236,72,153,0.08)] p-6 relative overflow-hidden flex flex-col h-full w-full">
      {/* Background Neural Lines / Scanning Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <svg className="w-full h-full" width="100%" height="100%">
            <path d="M-50,100 C150,200 300,-50 500,100 S700,200 900,50" stroke="#14B8A6" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="6 6" className="animate-pulse" />
            <path d="M-50,250 C200,100 400,300 600,150 S800,50 1000,250" stroke="#EC4899" strokeWidth="1.5" fill="none" opacity="0.3" strokeDasharray="4 8" />
            <circle cx="20%" cy="40%" r="4" fill="#10B981" className="animate-ping" />
            <circle cx="85%" cy="30%" r="5" fill="#14B8A6" opacity="0.5" />
         </svg>
      </div>

      <div className="flex items-center justify-between z-10 mb-6 shrink-0 flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FFF5F8] border border-[#FFD6E7] text-[#EC4899] rounded-full">
          <Sparkles className="w-4 h-4" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest">Live Analysis Dashboard</span>
        </div>
        {scanData && (
          <div className="flex items-center gap-2">
            {scanData.analysisConfidence < 70 && (
              <div className="bg-[#FFFBEB] border border-[#F59E0B] px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[11px] font-bold text-[#92400E]">Low confidence ({scanData.analysisConfidence}%) — retake in better lighting</span>
              </div>
            )}
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 border border-[#FFD6E7] rounded-full flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="text-[12px] font-bold text-[#0F172A]">Confidence: {scanData.analysisConfidence}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Face Card with Overlays */}
      <div className="flex-1 relative z-10 min-h-0 bg-[#0F172A] rounded-[24px] overflow-hidden border-4 border-[#FFF5F8] shadow-[0_8px_32px_rgba(236,72,153,0.15)] flex items-center justify-center p-2">
        {!scanData ? (
           <div className="flex flex-col items-center gap-4 text-center z-10 p-8 pt-12">
               <Camera className="w-16 h-16 text-[#EC4899] opacity-40 mb-2 animate-[pulse_2s_infinite]" />
               <h3 className="text-xl font-bold text-white">Awaiting Neural Link</h3>
               <p className="text-[#94A3B8] max-w-sm">Capture or upload a photo in the side panel to initiate real-time AI mapping directly onto your actual face. No dummy models or stock photos used.</p>
           </div>
        ) : (
           <div className="relative w-full h-full flex items-center justify-center">
               <div className="relative max-w-full max-h-full" style={{ aspectRatio: `${scanData.imageWidth} / ${scanData.imageHeight}`, height: "100%" }}>
                 <img src={scanData.imageUrl} alt="Actual User Face" className="w-full h-full object-contain rounded-xl shadow-[0_0_40px_rgba(236,72,153,0.2)]" />
                 
                 {/* Live scanning dots overlay on the image */}
                 <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden border border-[#EC4899]/30">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#14B8A6] to-transparent animate-[scan_3s_linear_infinite]" style={{ boxShadow: '0 4px 10px rgba(20,184,166,0.5)' }}></div>
                    <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#EC4899] rounded-full blur-sm opacity-50 animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-[#14B8A6] rounded-full blur-sm opacity-50 animate-pulse delay-75"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-[#F59E0B] rounded-full blur-sm opacity-50 animate-pulse delay-150"></div>
                 </div>

                 {/* Glowing outlines based on bounding boxes */}
                 {scanData.zones.map((zone, idx) => {
                   if (!zone.box) return null;
                   const isSevere = zone.severity === 'Severe' || zone.severity === 'High';
                   return (
                     <div 
                       key={idx} 
                       className="absolute flex flex-col items-center justify-center group"
                       style={{ 
                         top: `${zone.box.top}%`, 
                         left: `${zone.box.left}%`, 
                         width: `${zone.box.width}%`, 
                         height: `${zone.box.height}%`,
                         border: `2.5px ${isSevere ? 'solid' : 'dashed'} ${zone.color}`,
                         borderRadius: '35%', 
                         boxShadow: `0 0 16px ${zone.color}40, inset 0 0 16px ${zone.color}20`,
                         background: `${zone.color}15`,
                         transition: 'all 0.3s ease'
                       }}
                     >
                        <div className="absolute -top-2 -right-2 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center animate-pulse" style={{ backgroundColor: zone.color }}>
                           <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                        {/* Hover detailed overlay */}
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-16 left-1/2 -translate-x-1/2 bg-[#0F172A]/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20 whitespace-nowrap shadow-xl transition-opacity pointer-events-none z-30 flex flex-col items-center">
                            <p className="text-[10px] font-black uppercase tracking-wider text-white mb-0.5">{zone.name}</p>
                            <p className="text-[11px] font-extrabold" style={{ color: zone.color }}>{(zone as any).condition ?? zone.name}</p>
                            <p className="text-[10px] font-bold text-white/70">{zone.severity} · {(zone as any).pctAffected ?? Math.round(zone.rednessScore)}% affected</p>
                         </div>
                     </div>
                   );
                 })}

                 {/* Floating Labels dynamically positioned — show real condition */}
                 {scanData.zones.slice(0,3).map((zone, idx) => {
                    if (!zone.box) return null;
                    const isLeft = (zone.box.left + zone.box.width/2) < 50;
                    const zoneAny = zone as any;
                    return (
                      <div key={'label-'+idx} className={`absolute z-20 hidden md:block`} style={{ top: `${zone.box.top + zone.box.height/2}%`, [isLeft ? 'right' : 'left']: '101%' }}>
                        <div className={`relative transform ${isLeft ? '' : ''}`}>
                           <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-[16px] shadow-xl border border-[#FFD6E7] min-w-[185px]">
                              <div className="flex justify-between items-start mb-1.5">
                                 <h3 className="text-[12px] font-black text-[#0F172A]">{zone.name}</h3>
                                 <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold border" style={{ backgroundColor: `${zone.color}20`, color: zone.color, borderColor: `${zone.color}40` }}>{zone.severity}</span>
                              </div>
                              <p className="text-[11px] font-extrabold mb-1" style={{ color: zone.color }}>{zoneAny.condition ?? zone.name}</p>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-[16px] font-black" style={{ color: zone.color }}>{zoneAny.pctAffected ?? Math.round(zone.rednessScore)}%</span>
                                 <span className="text-[11px] font-bold text-[#6D4C5E]">area affected</span>
                              </div>
                           </div>
                           <div className={`absolute top-1/2 ${isLeft ? '-right-8 border-r-0' : '-left-8 border-l-0'} w-8 h-px border-t border-dashed`} style={{ borderColor: zone.color }} />
                        </div>
                      </div>
                    );
                 })}
               </div>
           </div>
        )}
      </div>
    </div>
  );
}

function RightSidePanel({ scanData }: { scanData: DynamicScanResult | null }) {
  const circumference = 2 * Math.PI * 50;
  const score = scanData ? scanData.overallScore : 0;

  return (
    <div className="flex flex-col gap-6 h-full w-full">
      {/* Top Banner indicating auto-correction */}
      <div className="bg-white px-4 py-3 border border-[#FFD6E7] rounded-2xl flex items-center gap-3 shadow-sm shrink-0">
        {scanData ? (
          <>
             <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse shrink-0" />
             <span className="text-[13px] font-bold text-[#0F172A]">Score & Metrics Dynamically Calculated</span>
          </>
        ) : (
          <>
             <div className="w-2.5 h-2.5 rounded-full bg-[#94A3B8] shadow-sm shrink-0" />
             <span className="text-[13px] font-bold text-[#64748b]">Awaiting Skin Analysis Metrics</span>
          </>
        )}
      </div>

      {/* Main Score Card */}
      <div className="bg-white rounded-[32px] border border-[#FFD6E7] p-6 shadow-sm flex flex-col items-center shrink-0">
        <h3 className="text-[15px] font-extrabold text-[#0F172A] tracking-wide mb-4">Overall Health Score</h3>
        <div className="relative flex items-center justify-center w-[160px] h-[160px]">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg">
              <circle cx="80" cy="80" r="70" stroke="#FFF5F8" strokeWidth="14" fill="none" />
              <circle 
                cx="80" cy="80" r="70" 
                stroke="url(#gradientScore)" 
                strokeWidth="14" 
                strokeLinecap="round" 
                fill="none" 
                strokeDasharray={439.8}
                strokeDashoffset={439.8 - (score / 100) * 439.8}
                className="transition-all duration-1500 ease-out"
              />
              <defs>
                <linearGradient id="gradientScore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EC4899" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#0F172A] leading-none mb-1">{score > 0 ? score : '--'}</span>
              <span className="text-[11px] font-bold text-[#6D4C5E] uppercase tracking-widest bg-[#FFF5F8] px-2.5 py-0.5 rounded-full">/ 100</span>
            </div>
        </div>
      </div>

      {/* AI Causal Analysis — real dynamic bullets from scan */}
      <div className="bg-[#FFF5F8] rounded-[32px] border border-[#FFD6E7] p-6 shadow-sm shrink-0">
        <h3 className="text-[14px] font-extrabold text-[#0F172A] tracking-wide mb-1">Live Causal Analysis</h3>
        <p className="text-[10px] font-semibold text-[#6D4C5E] mb-4">Derived from real pixel analysis of your photo.</p>
        <ul className="flex flex-col gap-3">
          {scanData ? scanData.globalCausalBullets.map((bullet, idx) => (
             <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-[#FFD6E7]/50 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EC4899]" />
                <p className="text-[11px] font-semibold text-[#0F172A] leading-relaxed pl-1">{bullet}</p>
             </li>
          )) : (
             <li className="flex items-center gap-3 justify-center text-center p-4">
                <p className="text-[12px] font-bold text-[#6D4C5E]">Upload or capture an image to generate personalized AI insights.</p>
             </li>
          )}
        </ul>
      </div>

      {/* Zone Breakdown Footer Card — shows real condition per zone */}
      <div className="bg-white border border-[#FFD6E7] rounded-[32px] p-6 shadow-sm flex-1 flex flex-col justify-center min-h-0">
        <h3 className="text-[14px] font-extrabold text-[#0F172A] mb-4">Facial Zone Summary</h3>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
          {scanData ? scanData.zones.map((z, idx) => {
            const zAny = z as any;
            return (
            <div key={idx} className="border border-[#FFD6E7]/50 p-3 rounded-2xl flex flex-col items-center" style={{ backgroundColor: `${z.color}15` }}>
              <span className="text-[11px] font-black text-[#0F172A] mb-0.5 text-center">{z.name}</span>
              <span className="text-[8px] font-extrabold text-center leading-tight mb-1 px-1" style={{ color: z.color }}>{zAny.condition ?? z.name}</span>
              <span className="text-[18px] font-black" style={{ color: z.color }}>{zAny.pctAffected ?? Math.round(z.rednessScore)}%</span>
              <div className="w-full h-1.5 bg-white border border-[#FFD6E7]/30 rounded-full mt-1.5 mb-1.5 overflow-hidden shadow-inner">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${zAny.pctAffected ?? z.rednessScore}%`, backgroundColor: z.color }} />
              </div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider" style={{ color: z.color }}>{z.severity}</span>
            </div>
            );
          }) : (
             <div className="col-span-2 text-center p-4"><span className="text-xs font-bold text-[#6D4C5E]">No data to display.</span></div>
          )}
        </div>
      </div>
    </div>
  );
}

// Keep RecoveryPlanner and ProgressReportElements in file but not actively rendered in Dashboard
function RecoveryPlanner({ scanData }: { scanData?: DynamicScanResult | null }) {
  const [tab, setTab] = useState("Daily");
  return (
    <div className="bg-white rounded-[32px] border border-[#FFD6E7] shadow-[0_12px_40px_rgba(236,72,153,0.08)] p-6 relative flex flex-col h-full w-full max-w-[400px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E6FFFA] to-[#CCFBF1] flex items-center justify-center shadow-sm">
          <Activity className="w-6 h-6 text-[#14B8A6]" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] leading-tight tracking-tight">Recovery Planner</h2>
          <p className="text-[13px] font-bold text-[#14B8A6]">Severity-based routine</p>
        </div>
      </div>
      <div className="flex bg-[#FFF5F8] p-1.5 rounded-2xl border border-[#FFD6E7] mb-6">
        {["Daily", "Weekly", "Monthly"].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 text-[13px] font-extrabold rounded-xl transition-all ${tab === t ? "bg-[#0F172A] text-white shadow-md" : "text-[#0F172A] hover:bg-[#FFD6E7]/50"}`}>{t}</button>
        ))}
      </div>
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
        {[{ icon: Droplets, name: "Gentle Cleanser", time: "AM / PM", desc: "Non-stripping hydrating base" }, { icon: Sparkles, name: "Salicylic Acid 2%", time: "PM Only", desc: "Clear T-Zone congestion" }, { icon: Layers, name: "Ceramide Cream", time: "AM / PM", desc: "Repair cheek barrier" }, { icon: Sun, name: "Mineral SPF 50+", time: "AM Only", desc: "Protect from UV" }].map((s, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-2xl border border-[#FFD6E7] hover:border-[#EC4899] bg-white shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl bg-[#FFF5F8] group-hover:bg-[#EC4899] flex items-center justify-center text-[#EC4899] group-hover:text-white transition-all shrink-0"><s.icon className="w-5 h-5" /></div>
            <div className="flex-1"><div className="flex justify-between items-start mb-0.5"><span className="font-extrabold text-[14px] text-[#0F172A]">{s.name}</span><span className="text-[10px] font-extrabold bg-[#F1F5F9] text-[#64748b] px-2 py-0.5 rounded-md border border-[#E2E8F0]">{s.time}</span></div><p className="text-[11px] font-bold text-[#6D4C5E]">{s.desc}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-[#FFD6E7]">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 relative overflow-hidden"><div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F59E0B]" /><h4 className="text-[12px] font-extrabold text-[#0F172A] mb-1.5 flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-[#F59E0B]" /> Food Allergy Integration</h4><p className="text-[11px] font-bold text-[#64748b] mb-2">Do you have any food allergies?</p><input type="text" placeholder="e.g. Dairy, nuts, gluten..." className="w-full bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-[12px] font-bold focus:outline-none focus:border-[#F59E0B]" /></div>
        <div className="bg-gradient-to-br from-[#FFF5F8] to-white border border-[#FFD6E7] rounded-2xl p-4 shadow-sm"><h4 className="text-[12px] font-extrabold text-[#0F172A] mb-3 flex items-center gap-1.5"><FileText className="w-4 h-4 text-[#EC4899]" /> Medication Suggestions</h4><ul className="flex flex-col gap-1.5 mb-3"><li className="text-[11px] font-bold text-[#0F172A] bg-white p-2 rounded-lg border border-[#FFD6E7]/50 shadow-sm flex gap-2"><span className="text-[#EC4899]">•</span> Clindamycin 1% Gel</li><li className="text-[11px] font-bold text-[#0F172A] bg-white p-2 rounded-lg border border-[#FFD6E7]/50 shadow-sm flex gap-2"><span className="text-[#EC4899]">•</span> Adapalene 0.1%</li></ul><div className="bg-[#FFF5F8] border border-[#FFD6E7] p-2.5 rounded-xl border-dashed"><p className="text-[9px] font-bold text-[#6D4C5E] leading-relaxed"><span className="font-extrabold text-[#EC4899] uppercase pr-1">Disclaimer:</span>All medications must be prescribed by a doctor. Skin patch test is compulsory before use.</p></div></div>
      </div>
    </div>
  );
}

function ProgressReportElements({ scanData }: { scanData?: DynamicScanResult | null }) {
  return (
    <div className="bg-gradient-to-br from-[#F8FAFC] to-white rounded-[32px] border border-[#E2E8F0] shadow-sm p-8 col-span-full font-sans flex lg:flex-row flex-col gap-10 lg:items-center">
      <div className="flex-1"><h3 className="text-xl font-extrabold text-[#0F172A] mb-8">Progress Trajectory Timeline</h3><div className="relative flex justify-between items-center px-4"><div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-[#E2E8F0] rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#EC4899] to-[#14B8A6] w-[50%] shadow-[0_0_8px_#EC4899]" /></div><div className="relative z-10 flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-[#EC4899] border-[3px] border-white shadow-md flex items-center justify-center text-white"><CheckCircle2 className="w-4 h-4" /></div><span className="text-[12px] font-extrabold text-[#0F172A]">Current Status</span><span className="text-[10px] font-bold text-[#6D4C5E]">Baseline Scan</span></div><div className="relative z-10 flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#14B8A6] shadow-md flex items-center justify-center"><div className="w-2.5 h-2.5 rounded-full bg-[#14B8A6] animate-pulse" /></div><span className="text-[12px] font-extrabold text-[#0F172A]">Barrier Repair</span><span className="text-[10px] font-bold text-[#6D4C5E]">in 2 weeks</span></div><div className="relative z-10 flex flex-col items-center gap-2"><div className="w-8 h-8 rounded-full bg-white border-[3px] border-[#E2E8F0] shadow-sm flex items-center justify-center"></div><span className="text-[12px] font-extrabold text-[#64748b]">Clear Complexion</span><span className="text-[10px] font-bold text-[#94A3B8]">Target Goal</span></div></div></div>
      <div className="w-px h-24 bg-[#E2E8F0] hidden lg:block"></div>
      <div className="flex-1 flex flex-col items-center"><h3 className="text-[14px] font-extrabold text-[#0F172A] mb-4">Predicted Improvement</h3><div className="flex items-center gap-6"><div className="relative"><div className="w-[100px] h-[120px] rounded-[30px] border-[3px] border-[#FFD6E7] bg-[#FFF5F8] overflow-hidden flex items-center justify-center shadow-inner">{scanData ? <img src={scanData.imageUrl} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-[#FFD6E7]" />}</div><span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-[#FFD6E7] px-3 py-1 rounded-full text-[10px] font-extrabold text-[#0F172A] shadow-sm">Current</span></div><ArrowRight className="w-6 h-6 text-[#14B8A6]" /><div className="relative"><div className="w-[100px] h-[120px] rounded-[30px] border-[3px] border-[#E6FFFA] bg-[#F0FDF4] overflow-hidden flex items-center justify-center shadow-[0_4px_20px_rgba(20,184,166,0.15)]">{scanData ? <img src={scanData.imageUrl} className="w-full h-full object-cover saturate-[1.2] opacity-90 contrast-[1.05]" style={{ filter: 'brightness(1.05) saturate(1.1) contrast(1.05)' }} /> : <Sparkles className="w-8 h-8 text-[#CCFBF1]" />}</div><span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#14B8A6] border-none px-3 py-1 rounded-full text-[10px] font-extrabold text-white shadow-sm shadow-[#14B8A6]/40">Predicted</span></div></div></div>
      <div className="w-px h-24 bg-[#E2E8F0] hidden lg:block"></div>
      <div className="flex-1 flex justify-center"><button className="bg-[#0F172A] hover:bg-black text-white px-8 py-5 rounded-3xl font-extrabold text-[15px] flex items-center gap-4 shadow-[0_8px_30px_rgba(15,23,42,0.25)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.4)] transition-all group w-full justify-center max-w-[300px]"><div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:-translate-y-1 transition-transform"><Download className="w-5 h-5 text-[#14B8A6]" /></div><div className="flex flex-col items-start leading-tight"><span>Download PDF</span><span className="text-[10px] text-[#94A3B8] font-bold">Includes full smart outline & planner</span></div></button></div>
    </div>
  );
}

function Dashboard({ scanData, onNewScan }: { scanData: DynamicScanResult | null; onNewScan: () => void }) {
  const profile = useProfile();
  const [, navigate] = useLocation();

  const hasSevereZone = scanData?.zones.some(z => z.severity === "High") ?? false;

  return (
    <div className="min-h-screen bg-[#FFF5F8] flex flex-col font-sans">
      <Header profile={profile} onNewScan={onNewScan} />

      <main className="flex-1 w-full max-w-[1500px] mx-auto px-6 py-8 flex flex-col gap-6">
        
        {/* Severe zone alert banner */}
        {hasSevereZone && (
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-[#FEF2F2] to-[#FFF5F8] border-2 border-[#EF4444] rounded-2xl px-6 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#EF4444] shrink-0" />
              <p className="text-[13px] font-extrabold text-[#991B1B]">
                ⚠ Some zones show severe condition.
                <span className="font-semibold text-[#991B1B]/80 ml-1">Click to view detailed Disease Analysis.</span>
              </p>
            </div>
            <button
              onClick={() => navigate("/disease-analysis")}
              className="flex items-center gap-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-2 rounded-xl font-extrabold text-[12px] transition-colors shrink-0"
            >
              Go to Disease Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Section 3-column Layout */}
        <div className="flex xl:flex-row flex-col gap-6 h-[850px] items-stretch">
          
          {/* Left Column: Photo Capture */}
          <div className="w-full xl:w-[320px] shrink-0 h-full">
            <GuidedPhotoCapture onScanClick={onNewScan} />
          </div>

          {/* Center Column: Main Analysis Dashboard */}
          <div className="flex-1 min-w-0 h-full">
            <MainAnalysisDashboard scanData={scanData} />
          </div>

          {/* Right Column: Score, AI Causal Analysis & Zone Breakdown Summary */}
          <div className="w-full xl:w-[380px] shrink-0 h-full">
            <RightSidePanel scanData={scanData} />
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center flex flex-col items-center shrink-0">
        <p className="text-[12px] font-extrabold text-[#6D4C5E] uppercase tracking-widest mb-2 bg-white/60 px-4 py-1.5 rounded-full border border-[#FFD6E7]">
          Privacy-First • Data Never Leaves Your Device • NON-DIAGNOSTIC
        </p>
        <p className="text-[11px] font-bold text-[#A0AEC0]">
          © 2026 Clinderma - AI Skin Intelligence Platform
        </p>
      </footer>
    </div>
  );
}

function App() {
  const [scanOpen, setScanOpen] = useState(false);
  const [scanData, setScanData] = useState<DynamicScanResult | null>(null);

  const handleNewScan = () => setScanOpen(true);
  const handleScanComplete = (res: DynamicScanResult) => {
    setScanData(res);
    setScanOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/" component={Landing} />
            <Route path="/pricing" component={Pricing} />
            <Route path="/company" component={Company} />
            <Route path="/auth" component={Auth} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/dashboard">
              {() => <Dashboard scanData={scanData} onNewScan={handleNewScan} />}
            </Route>
            <Route path="/product/ai-skin-analysis">
              {() => <Dashboard scanData={scanData} onNewScan={handleNewScan} />}
            </Route>
            <Route path="/disease-analysis">
              {() => <DiseaseAnalysis scanData={scanData} onNewScan={handleNewScan} />}
            </Route>
            <Route path="/progress">
              {() => <ProgressReport scanData={scanData} onNewScan={handleNewScan} />}
            </Route>
            <Route path="/planner">
              {() => <Planner scanData={scanData} onNewScan={handleNewScan} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
          <AnimatePresence>
            {scanOpen && <ScanModal onClose={() => setScanOpen(false)} onComplete={handleScanComplete} />}
          </AnimatePresence>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
