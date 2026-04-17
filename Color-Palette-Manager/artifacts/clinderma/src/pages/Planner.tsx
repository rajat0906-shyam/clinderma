import React, { useState } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, Camera, AlertCircle, Stethoscope, Leaf, Sun,
  Droplets, Shield, Apple, Flame, Fish, Milk, Pill, ChevronRight,
  Moon, CheckCircle2, Info, Zap, Upload
} from "lucide-react";
import { DynamicScanResult, ZoneScore, ConditionName } from "@/lib/faceAnalysis";

interface Props {
  scanData: DynamicScanResult | null;
  onNewScan: () => void;
}

type TimingTab = "Daily" | "Weekly" | "Monthly";

// ─── Condition-based routine builder ─────────────────────────────────────────

type Step = { icon: React.ElementType; name: string; time: string; color: string; reason: string; ointment: string };

function buildSkincareRoutine(zones: ZoneScore[]): { AM: Step[]; PM: Step[] } {
  const conditions = zones.map(z => z.condition);
  const hasAcne       = conditions.some(c => c === "Acne Vulgaris" || c === "Comedonal Acne");
  const hasRosacea    = conditions.some(c => c === "Rosacea");
  const hasAtopic     = conditions.some(c => c === "Atopic Dermatitis" || c === "Contact Dermatitis");
  const hasPigment    = conditions.some(c => c === "Hyperpigmentation" || c === "Melasma");
  const hasSebDerm    = conditions.some(c => c === "Seborrheic Dermatitis");
  const hasOily       = conditions.some(c => c === "Oily / Sebaceous Activity");
  const hasPores      = conditions.some(c => c === "Enlarged Pores");
  const isHealthy     = conditions.every(c => c === "Healthy / No Concern" || c === "Mild Redness");

  const AM: Step[] = [];
  const PM: Step[] = [];

  // AM — always start with cleanser
  if (hasRosacea || hasAtopic) {
    AM.push({ icon: Droplets, name: "Ultra-Gentle Micellar Cleanser", time: "AM", color: "#14B8A6", reason: "Barrier-safe cleanse for rosacea/atopic skin detected. Avoids surfactant-induced redness flares.", ointment: "La Roche-Posay Toleriane Hydrating Gentle Cleanser" });
  } else if (hasAcne || hasOily || hasSebDerm) {
    AM.push({ icon: Droplets, name: "Salicylic Acid 0.5% Face Wash", time: "AM", color: "#14B8A6", reason: "BHA cleanser targets detected acne/seborrheic activity. Clears congested pores without over-drying.", ointment: "CeraVe SA Cleanser" });
  } else {
    AM.push({ icon: Droplets, name: "Gentle Foaming Cleanser", time: "AM", color: "#14B8A6", reason: "Removes overnight sebum without disrupting your healthy baseline detected in scan zones.", ointment: "CeraVe Foaming Facial Cleanser" });
  }

  // AM — treatment layer
  if (hasAcne) {
    AM.push({ icon: Zap, name: "Niacinamide 10% + Zinc 1% Serum", time: "AM", color: "#EC4899", reason: `Targets sebum overproduction detected in acne zones. Reduces post-inflammatory marks and pore size.`, ointment: "The Ordinary Niacinamide 10% + Zinc 1%" });
  } else if (hasPigment) {
    AM.push({ icon: Zap, name: "Vitamin C 15% Serum (L-Ascorbic Acid)", time: "AM", color: "#F59E0B", reason: "Melanin index elevation detected in your scan. Vitamin C inhibits tyrosinase and fades dark spots.", ointment: "TruSkin Vitamin C Serum" });
  } else if (hasRosacea) {
    AM.push({ icon: Zap, name: "Azelaic Acid 10% Serum", time: "AM", color: "#EC4899", reason: "Azelaic acid calms vascular reactivity pattern detected in rosacea zones. Anti-inflammatory.", ointment: "The Ordinary Azelaic Acid Suspension 10%" });
  } else if (hasSebDerm) {
    AM.push({ icon: Zap, name: "Zinc Pyrithione Serum / Spray", time: "AM", color: "#EC4899", reason: "Targets Malassezia-driven seborrheic dermatitis detected in your oily zones.", ointment: "DHS Zinc Shampoo (dual-use on face)" });
  }

  // AM — moisturiser
  if (hasAtopic || hasRosacea) {
    AM.push({ icon: Droplets, name: "Ceramide-Rich Barrier Cream", time: "AM", color: "#14B8A6", reason: "Barrier dysfunction detected in your sensitive zones. Ceramides restore trans-epidermal water loss (TEWL).", ointment: "CeraVe Moisturising Cream" });
  } else if (hasAcne || hasOily) {
    AM.push({ icon: Shield, name: "Oil-Free Gel Moisturiser", time: "AM", color: "#10B981", reason: "Non-comedogenic hydration for acne/oily-prone skin detected. Prevents compensatory sebum production.", ointment: "Neutrogena Hydro Boost Water Gel" });
  } else {
    AM.push({ icon: Droplets, name: "Lightweight Hydrating Moisturiser", time: "AM", color: "#14B8A6", reason: "Maintains healthy baseline hydration across zones detected in your scan.", ointment: "Cetaphil Daily Hydrating Lotion" });
  }

  // AM — SPF always
  if (hasRosacea || hasPigment) {
    AM.push({ icon: Sun, name: "Mineral SPF 50+ (Zinc/Titanium)", time: "AM", color: "#F59E0B", reason: "Mineral filters reduce UV-triggered vascular flushing (rosacea) and melanin production (pigmentation detected).", ointment: "La Roche-Posay Anthelios Mineral SPF 50" });
  } else {
    AM.push({ icon: Sun, name: "Chemical-Free SPF 30+", time: "AM", color: "#F59E0B", reason: "Daily UV protection prevents worsening of any detected conditions and maintains skin health.", ointment: "EltaMD UV Clear Broad-Spectrum SPF 46" });
  }

  // PM — double cleanse
  PM.push({ icon: Droplets, name: "Oil / Balm Cleanser (First Cleanse)", time: "PM", color: "#14B8A6", reason: "Dissolves SPF and pollutants accumulated during the day before active treatment application.", ointment: "Clinique Take The Day Off Cleansing Balm" });

  // PM — exfoliant
  if (hasAcne || hasPores || hasSebDerm) {
    PM.push({ icon: Leaf, name: "BHA (Salicylic Acid 2%) Exfoliant", time: "PM", color: "#10B981", reason: "Deep pore cleansing targets sebum-congested zones and comedones detected in your scan analysis.", ointment: "Paula's Choice Skin Perfecting 2% BHA Liquid" });
  } else if (hasPigment) {
    PM.push({ icon: Leaf, name: "AHA (Glycolic Acid 7%) Exfoliant", time: "PM", color: "#8B5CF6", reason: "Promotes cell turnover to fade hyperpigmentation detected. Accelerates melanin dispersal.", ointment: "The Ordinary Glycolic Acid 7% Toning Solution" });
  } else if (!isHealthy) {
    PM.push({ icon: Leaf, name: "Gentle PHA Exfoliant", time: "PM", color: "#10B981", reason: "Mild polyhydroxy acid exfoliation for overall texture improvement without triggering sensitivity.", ointment: "NeoStrata Restore PHA Facial Cleanser" });
  }

  // PM — retinoid
  if (hasAcne && !hasRosacea && !hasAtopic) {
    PM.push({ icon: Zap, name: "Adapalene 0.1% (Retinoid)", time: "PM", color: "#7C3AED", reason: "Prevents new comedone formation. Accelerates cell turnover to clear acne zones detected in your scan.", ointment: "Differin Gel 0.1% — requires patch test" });
  } else if (hasPigment && !hasAtopic) {
    PM.push({ icon: Zap, name: "Retinol 0.5% Night Serum", time: "PM", color: "#7C3AED", reason: "Retinol accelerates pigment dispersal and promotes collagen synthesis for detected pigmentation zones.", ointment: "RoC Retinol Correxion Line Smoothing Serum" });
  }

  // PM — barrier/overnight
  if (hasAtopic || hasRosacea) {
    PM.push({ icon: Shield, name: "Ceramide Barrier Repair (Overnight)", time: "PM", color: "#14B8A6", reason: "Intensive overnight barrier restoration for atopic/rosacea zones detected. Minimises TEWL during sleep.", ointment: "Dr. Jart+ Ceramidin Cream" });
  } else if (hasAcne) {
    PM.push({ icon: Shield, name: "Benzoyl Peroxide 2.5% Spot Treatment", time: "PM", color: "#EC4899", reason: "Targets active P. acnes bacteria in detected inflammatory lesion zones. Spot application only.", ointment: "PanOxyl Acne Foaming Wash 4%" });
  } else {
    PM.push({ icon: Shield, name: "Overnight Hydrating Sleeping Mask", time: "PM", color: "#14B8A6", reason: "Locks in moisture and active ingredients applied PM for maximum overnight repair.", ointment: "Laneige Water Sleeping Mask" });
  }

  return { AM, PM };
}

function buildHomeRemedies(zones: ZoneScore[]): { name: string; benefit: string; icon: React.ElementType }[] {
  const conditions = zones.map(z => z.condition);
  const items: { name: string; benefit: string; icon: React.ElementType }[] = [];

  if (conditions.some(c => c === "Rosacea" || c === "Mild Redness")) {
    items.push({ name: "Chilled Aloe Vera Gel", benefit: "Calms detected vascular redness and lowers skin surface temperature in rosacea zones", icon: Leaf });
    items.push({ name: "Green Tea Cold Compress", benefit: "EGCG in green tea reduces inflammatory cytokines linked to detected redness patterns", icon: Leaf });
  }
  if (conditions.some(c => c === "Acne Vulgaris" || c === "Comedonal Acne")) {
    items.push({ name: "Raw Honey Spot Treatment", benefit: "Natural antibacterial (hydrogen peroxide release) targets bacteria driving detected inflammatory acne", icon: Droplets });
    items.push({ name: "Ice Rolling (2–3 mins)", benefit: "Reduces swelling and redness in active acne lesion zones detected in your scan", icon: Leaf });
  }
  if (conditions.some(c => c === "Hyperpigmentation" || c === "Melasma")) {
    items.push({ name: "Diluted Lemon Juice (1:3 water)", benefit: "Natural AHA activity helps lighten detected pigmentation spots — use with SPF only", icon: Apple });
    items.push({ name: "Rose Hip Seed Oil (PM)", benefit: "High in trans-retinoic acid analogue — fades melanin irregularities detected in pigmented zones", icon: Leaf });
  }
  if (conditions.some(c => c === "Atopic Dermatitis" || c === "Contact Dermatitis")) {
    items.push({ name: "Colloidal Oatmeal Paste", benefit: "Anti-pruritic relief for barrier dysfunction detected. Reduces itching and TEWL", icon: Leaf });
  }
  if (items.length === 0) {
    items.push({ name: "Facial Gua Sha Massage", benefit: "Promotes lymphatic drainage and blood circulation for healthy skin baseline maintenance", icon: Leaf });
    items.push({ name: "Chamomile Tea Steam", benefit: "Opens pores gently and soothes skin — ideal for maintenance of healthy detected zones", icon: Droplets });
  }
  return items.slice(0, 3);
}

function buildMedications(zones: ZoneScore[]): { name: string; use: string }[] {
  const conditions = zones.map(z => z.condition);
  const meds: { name: string; use: string }[] = [];

  if (conditions.some(c => c === "Acne Vulgaris")) {
    meds.push({ name: "Clindamycin 1% Gel (Topical)", use: "Targets P. acnes bacteria in inflammatory acne zones detected. Apply thin layer each evening after cleansing." });
    meds.push({ name: "Benzoyl Peroxide 2.5% Cream", use: "Oxidative treatment that eliminates bacteria in active lesion zones. Spot-apply only. Patch-test first." });
  }
  if (conditions.some(c => c === "Rosacea")) {
    meds.push({ name: "Metronidazole 0.75% Gel (Topical)", use: "First-line treatment for rosacea. Reduces inflammatory papules and diffuse redness detected in your scan." });
    meds.push({ name: "Azelaic Acid 15% Gel (Topical)", use: "Reduces rosacea redness and erythema. Apply twice daily after moisturiser. Prescription-strength." });
  }
  if (conditions.some(c => c === "Atopic Dermatitis" || c === "Contact Dermatitis")) {
    meds.push({ name: "Hydrocortisone 1% Cream (Topical)", use: "Short-term anti-inflammatory for atopic/contact dermatitis flare in detected zones. Max 5 days continuous use." });
  }
  if (conditions.some(c => c === "Hyperpigmentation" || c === "Melasma")) {
    meds.push({ name: "Tranexamic Acid 5% Serum", use: "Inhibits plasmin-dependent melanogenesis. Prescription-grade treatment for detected melasma/hyperpigmentation." });
  }
  if (conditions.some(c => c === "Seborrheic Dermatitis")) {
    meds.push({ name: "Ketoconazole 2% Cream (Topical)", use: "Antifungal targeting Malassezia overgrowth causing seborrheic patterns detected in your scan. Apply twice daily." });
  }
  if (meds.length === 0) {
    meds.push({ name: "Panthenol (Vitamin B5) Cream", use: "Maintenance-level hydration and barrier support for your healthy baseline skin detected in all zones." });
  }
  return meds.slice(0, 3);
}

function buildFoodPlan(zones: ZoneScore[]): { name: string; benefit: string; icon: React.ElementType; category: string; avoid: boolean }[] {
  const conditions = zones.map(z => z.condition);
  const hasAcne       = conditions.some(c => c === "Acne Vulgaris" || c === "Comedonal Acne");
  const hasRosacea    = conditions.some(c => c === "Rosacea");
  const hasAtopic     = conditions.some(c => c === "Atopic Dermatitis" || c === "Contact Dermatitis");
  const hasPigment    = conditions.some(c => c === "Hyperpigmentation" || c === "Melasma");

  const plan: { name: string; benefit: string; icon: React.ElementType; category: string; avoid: boolean }[] = [];

  // Universal benefits
  plan.push({ name: "Omega-3 (Salmon, Flaxseed, Walnuts)", benefit: "Essential fatty acids reduce systemic inflammation — key driver of all detected inflammatory conditions", icon: Fish, category: "anti-inflammatory", avoid: false });
  plan.push({ name: "Probiotic Foods (Kefir, Yogurt, Kimchi)", benefit: "Gut-skin axis balance reduces immune-mediated skin flares. Supports barrier function recovery", icon: Apple, category: "gut-skin", avoid: false });

  if (hasAcne) {
    plan.push({ name: "Zinc-Rich Foods (Pumpkin Seeds, Oysters)", benefit: "Zinc regulates sebum production and suppresses androgen-driven acne detected in your scan", icon: Leaf, category: "oil-control", avoid: false });
    plan.push({ name: "Dairy Products (Milk, Cheese, Whey)", benefit: "IGF-1 in dairy directly stimulates sebaceous glands — worsens acne vulgaris detected in your zones", icon: Milk, category: "avoid", avoid: true });
    plan.push({ name: "High-GI Foods (White Rice, Bread, Sugar)", benefit: "Rapid insulin spikes upregulate androgen and sebum production — directly worsens detected acne", icon: Flame, category: "avoid", avoid: true });
  }
  if (hasRosacea) {
    plan.push({ name: "Turmeric + Ginger Tea", benefit: "Curcumin suppresses NF-κB inflammatory pathway — reduces vascular reactivity detected in rosacea zones", icon: Flame, category: "anti-inflammatory", avoid: false });
    plan.push({ name: "Spicy Foods, Alcohol, Hot Drinks", benefit: "Vasodilators that directly trigger rosacea flare — avoid to calm detected facial redness", icon: Flame, category: "avoid", avoid: true });
  }
  if (hasAtopic) {
    plan.push({ name: "Quercetin Foods (Apples, Onions, Berries)", benefit: "Natural antihistamine effect reduces IgE-mediated atopic dermatitis response detected in barrier zones", icon: Apple, category: "anti-inflammatory", avoid: false });
  }
  if (hasPigment) {
    plan.push({ name: "Vitamin C Rich Foods (Citrus, Bell Peppers)", benefit: "Ascorbic acid inhibits melanin synthesis — directly targets pigmentation irregularities detected in your scan", icon: Apple, category: "antioxidant", avoid: false });
  }
  if (!hasAcne && !hasRosacea) {
    plan.push({ name: "Green Leafy Veg (Spinach, Kale)", benefit: "Folate and vitamin K support collagen synthesis and maintain healthy skin baseline detected in your zones", icon: Leaf, category: "healing", avoid: false });
  }
  return plan.slice(0, 8);
}



export default function Planner({ scanData, onNewScan }: Props) {
  const [, navigate] = useLocation();
  const [timing, setTiming] = useState<TimingTab>("Daily");
  const [allergyInput, setAllergyInput] = useState("");
  const [checkedAllergies, setCheckedAllergies] = useState<Record<string, boolean>>({ Dairy: true, Gluten: false, Nuts: false, Soy: false });

  const toggleAllergy = (key: string) => setCheckedAllergies(prev => ({ ...prev, [key]: !prev[key] }));

  // Build dynamic routine from real scan data
  const zones = scanData?.zones ?? [];
  const SKINCARE_STEPS = scanData ? buildSkincareRoutine(zones) : { AM: [], PM: [] };
  const HOME_REMEDIES  = buildHomeRemedies(zones);
  const MEDICATIONS    = buildMedications(zones);
  const FOOD_PLAN      = buildFoodPlan(zones);

  const CATEGORY_COLORS: Record<string, string> = {
    "anti-inflammatory": "#EF4444",
    "barrier-repair": "#14B8A6",
    "antioxidant": "#8B5CF6",
    "oil-control": "#F59E0B",
    "gut-skin": "#EC4899",
    "healing": "#10B981",
    "avoid": "#64748B",
  };

  // Determine overall severity label for planner badge
  const highestSev = zones.some(z => z.severity === "High") ? "Severe Conditions Detected" :
    zones.some(z => z.severity === "Moderate") ? "Moderate Conditions Detected" :
    zones.some(z => z.severity === "Mild") ? "Mild Conditions Detected" :
    "Healthy Baseline";

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
              className={`text-[14px] font-bold pb-1 border-b-2 transition-all ${path === "/planner" ? "text-[#EC4899] border-[#EC4899]" : "text-[#0F172A] border-transparent hover:text-[#EC4899]"}`}>
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Personalized Skin Recovery Planner</h1>
            <p className="text-[14px] font-semibold text-[#64748B] mt-1">
              {scanData
                ? `Generated from your real scan · ${highestSev} · Confidence: ${scanData.analysisConfidence}%`
                : "Upload your photo to generate a personalized plan based on your actual skin conditions"}
            </p>
          </div>
          {!scanData && (
            <div className="flex gap-2">
              <button onClick={onNewScan} className="flex items-center gap-2 bg-[#EC4899] text-white px-5 py-2.5 rounded-full font-bold text-[13px] shadow-[0_4px_12px_rgba(236,72,153,0.3)] hover:bg-[#D81B60] transition-all">
                <Camera className="w-4 h-4" /> Scan Now
              </button>
              <button onClick={onNewScan} className="flex items-center gap-2 bg-white border-2 border-[#EC4899] text-[#EC4899] px-5 py-2.5 rounded-full font-bold text-[13px] hover:bg-[#FFF5F8] transition-all">
                <Upload className="w-4 h-4" /> Upload Photo
              </button>
            </div>
          )}
        </div>

        {/* Timing tabs */}
        <div className="flex gap-2">
          {(["Daily", "Weekly", "Monthly"] as TimingTab[]).map((t) => (
            <button key={t} onClick={() => setTiming(t)}
              className={`px-5 py-2.5 rounded-full font-extrabold text-[13px] transition-all border ${timing === t ? "bg-[#EC4899] text-white border-[#EC4899] shadow-[0_4px_12px_rgba(236,72,153,0.3)]" : "bg-white text-[#0F172A] border-[#FFD6E7] hover:border-[#EC4899] hover:text-[#EC4899]"}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex xl:flex-row flex-col gap-6">
          {/* Left main content */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Section A: Skincare Planner */}
            <div className="bg-white rounded-[28px] border border-[#FFD6E7] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FFF5F8] to-[#FFD6E7] flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-[#EC4899]" />
                </div>
                <div>
                  <h2 className="text-[17px] font-extrabold text-[#0F172A]">Skincare Planner</h2>
                  <span className="px-2.5 py-0.5 bg-[#FEF3C7] text-[#92400E] font-extrabold text-[10px] rounded-full border border-[#FDE68A]">
                    {scanData ? `Tailored for: ${highestSev}` : "Upload photo to personalize routine"}
                  </span>
                </div>
              </div>
              {!scanData && (
                <div className="bg-[#FFF5F8] border border-[#FFD6E7] rounded-2xl p-4 flex items-start gap-3 mb-5">
                  <Info className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                  <p className="text-[12px] font-semibold text-[#6D4C5E]">Showing a generic baseline routine. Upload your photo to get a routine precisely tailored to your detected skin conditions.</p>
                </div>
              )}

              {/* AM Routine */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-[14px] font-extrabold text-[#0F172A]">AM Routine</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {SKINCARE_STEPS.AM.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-[#FFF5F8] rounded-2xl border border-[#FFD6E7] hover:border-[#EC4899] transition-colors group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: `${step.color}20` }}>
                        <step.icon className="w-5 h-5" style={{ color: step.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-[13px] font-extrabold text-[#0F172A]">Step {i + 1}: {step.name}</p>
                            <p className="text-[11px] font-bold text-[#64748B] italic">{step.ointment}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#FFF5F8] border border-[#FFD6E7] text-[#0F172A] font-extrabold text-[10px] rounded-md shrink-0">{step.time}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#64748B] mt-2 leading-relaxed">{step.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PM Routine */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-4 h-4 text-[#7C3AED]" />
                  <h3 className="text-[14px] font-extrabold text-[#0F172A]">PM Routine</h3>
                </div>
                <div className="flex flex-col gap-3">
                  {SKINCARE_STEPS.PM.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-[#F5F3FF] rounded-2xl border border-[#DDD6FE] hover:border-[#7C3AED] transition-colors group">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${step.color}20` }}>
                        <step.icon className="w-5 h-5" style={{ color: step.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <p className="text-[13px] font-extrabold text-[#0F172A]">Step {i + 1}: {step.name}</p>
                            <p className="text-[11px] font-bold text-[#64748B] italic">{step.ointment}</p>
                          </div>
                          <span className="px-2 py-0.5 bg-[#EDE9FE] border border-[#DDD6FE] text-[#5B21B6] font-extrabold text-[10px] rounded-md shrink-0">{step.time}</span>
                        </div>
                        <p className="text-[11px] font-semibold text-[#64748B] mt-2 leading-relaxed">{step.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Home Remedies */}
              <div className="bg-[#F0FDF4] rounded-2xl border border-[#6EE7B7] p-4">
                <h4 className="text-[13px] font-extrabold text-[#065F46] mb-3 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#10B981]" /> Gentle Home Remedies
                </h4>
                <div className="flex flex-col gap-2">
                  {HOME_REMEDIES.map((r, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#6EE7B7]/30">
                      <r.icon className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-extrabold text-[#065F46]">{r.name}</p>
                        <p className="text-[11px] font-semibold text-[#64748B]">{r.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Section B: Food & Diet Planner */}
            <div className="bg-white rounded-[28px] border border-[#FFD6E7] shadow-sm p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-[#D1FAE5] flex items-center justify-center">
                  <Apple className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <h2 className="text-[17px] font-extrabold text-[#0F172A]">Healing Food & Diet Planner</h2>
                  <span className="px-2.5 py-0.5 bg-[#D1FAE5] text-[#065F46] font-extrabold text-[10px] rounded-full border border-[#6EE7B7]">Healing Nutrition · {timing}</span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                {FOOD_PLAN.filter(f => !f.avoid).map((food, i) => {
                  const color = CATEGORY_COLORS[food.category] ?? "#EC4899";
                  return (
                    <div key={i} className="flex flex-col gap-2 p-4 rounded-2xl border bg-[#FFF5F8] border-[#FFD6E7] hover:border-current transition-all" style={{ borderColor: `${color}40` }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                        <food.icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <p className="text-[12px] font-extrabold text-[#0F172A]">{food.name}</p>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md w-fit" style={{ backgroundColor: `${color}20`, color }}>{food.category.replace("-", " ")}</span>
                      <p className="text-[10px] font-semibold text-[#64748B] leading-relaxed">{food.benefit}</p>
                    </div>
                  );
                })}
              </div>

              {/* Foods to avoid */}
              <div className="bg-[#FEF2F2] rounded-2xl border border-[#FCA5A5] p-4">
                <h4 className="text-[13px] font-extrabold text-[#991B1B] mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#EF4444]" /> Foods to Avoid / Limit
                </h4>
                <div className="flex flex-col gap-2">
                  {FOOD_PLAN.filter(f => f.avoid).map((food, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-[#FCA5A5]/30">
                      <food.icon className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[12px] font-extrabold text-[#991B1B]">{food.name}</p>
                        <p className="text-[11px] font-semibold text-[#64748B]">{food.benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-full xl:w-[340px] shrink-0 flex flex-col gap-4">
            {/* Food Allergy */}
            <div className="bg-white rounded-[24px] border border-[#FFD6E7] shadow-sm p-5">
              <h3 className="text-[14px] font-extrabold text-[#0F172A] mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#F59E0B]" /> Food Allergy Integration
              </h3>
              <p className="text-[12px] font-bold text-[#64748B] mb-3">Do you have any food allergies?</p>
              <div className="flex flex-col gap-2 mb-3">
                {Object.keys(checkedAllergies).map((a) => (
                  <label key={a} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => toggleAllergy(a)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${checkedAllergies[a] ? "border-[#EC4899] bg-[#EC4899]" : "border-[#FFD6E7] bg-white"}`}>
                      {checkedAllergies[a] && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-[12px] font-bold text-[#0F172A]">{a}</span>
                  </label>
                ))}
              </div>
              <input type="text" value={allergyInput} onChange={e => setAllergyInput(e.target.value)}
                placeholder="Other allergies (e.g. shellfish, eggs)..."
                className="w-full bg-[#FFF5F8] border border-[#FFD6E7] px-3 py-2.5 rounded-xl text-[12px] font-bold focus:outline-none focus:border-[#EC4899] transition-colors" />
            </div>

            {/* Medication Suggestions */}
            <div className="bg-white rounded-[24px] border border-[#FFD6E7] shadow-sm p-5">
              <h3 className="text-[14px] font-extrabold text-[#0F172A] mb-3 flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#EC4899]" /> Medication Suggestions
              </h3>
              <div className="flex flex-col gap-2 mb-3">
                {MEDICATIONS.map((m, i) => (
                  <div key={i} className="bg-[#FFF5F8] border border-[#FFD6E7] p-3 rounded-xl">
                    <p className="text-[12px] font-extrabold text-[#0F172A]">{m.name}</p>
                    <p className="text-[11px] font-semibold text-[#64748B] mt-0.5 leading-snug">{m.use}</p>
                  </div>
                ))}
              </div>
              {/* Disclaimer */}
              <div className="bg-[#FFFBEB] border-2 border-[#FCD34D] rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-extrabold text-[#92400E] mb-0.5">⚠ Medical Disclaimer</p>
                    <p className="text-[10px] font-semibold text-[#92400E] leading-relaxed">All medications must be prescribed by a licensed doctor. A skin patch test is compulsory before use. Do not self-medicate based on AI suggestions.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confidence info */}
            {scanData && scanData.analysisConfidence < 70 && (
              <div className="bg-[#FFFBEB] rounded-2xl border border-[#F59E0B] p-4 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-[#92400E]">Scan confidence was {scanData.analysisConfidence}%. Retake in better lighting for a more precise treatment plan.</p>
              </div>
            )}
            {!scanData && (
              <div className="bg-[#FFF5F8] rounded-2xl border border-[#FFD6E7] p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-[#EC4899] shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-[#6D4C5E]">Upload your photo for a fully personalized planner tailored to your real detected conditions.</p>
              </div>
            )}

            {/* Consult CTA */}
            <button className="w-full bg-gradient-to-r from-[#EC4899] to-[#D81B60] hover:from-[#D81B60] hover:to-[#B31B5A] text-white font-extrabold py-4 rounded-2xl text-[14px] flex items-center justify-center gap-3 shadow-[0_6px_24px_rgba(236,72,153,0.35)] hover:shadow-[0_8px_32px_rgba(236,72,153,0.45)] transition-all active:scale-95">
              <Stethoscope className="w-5 h-5" />
              Consult a Dermatologist
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Set reminder */}
            <button className="w-full bg-white border-2 border-[#EC4899] text-[#EC4899] hover:bg-[#FFF5F8] font-extrabold py-3.5 rounded-2xl text-[14px] flex items-center justify-center gap-2 transition-colors">
              Set Daily Reminder 🔔
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
