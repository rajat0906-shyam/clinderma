import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Sparkles, ArrowLeft, ArrowRight, CheckCircle2, Lock,
  Sun, Droplets, Moon, Activity, Leaf, ShoppingBag,
  User, Heart, Zap, Shield
} from "lucide-react";

const STEPS = [
  { label: "Profile", icon: User },
  { label: "Concerns", icon: Heart },
  { label: "Lifestyle", icon: Activity },
  { label: "Health", icon: Shield },
  { label: "History", icon: Zap },
  { label: "Preferences", icon: Leaf },
];

const SKIN_TYPES = [
  { id: "oily", label: "Oily", desc: "Shiny, prone to breakouts", icon: "💧" },
  { id: "dry", label: "Dry", desc: "Tight, flaky, dull", icon: "🌵" },
  { id: "combination", label: "Combination", desc: "Oily T-zone, dry cheeks", icon: "☯" },
  { id: "sensitive", label: "Sensitive", desc: "Easily irritated, reactive", icon: "🌸" },
];

const CONCERNS = [
  "Acne / Breakouts", "Hyperpigmentation", "Redness", "Uneven skin tone",
  "Dullness", "Scarring", "Dark circles", "Large pores", "Wrinkles", "Others",
];

const DIET_TYPES = [
  { id: "healthy", label: "Mostly Healthy", desc: "Veggies, proteins, minimal junk" },
  { id: "balanced", label: "Balanced", desc: "Mix of everything" },
  { id: "junk", label: "High in Junk Food", desc: "Frequent fast food, sugar" },
  { id: "vegan", label: "Plant-Based", desc: "Vegan or vegetarian diet" },
];

const TREATMENTS = [
  "Topical creams", "Oral medication", "Home remedies", "Dermatologist visits",
  "Chemical peels", "Laser treatment", "Natural oils",
];

const FAMILY_CONDITIONS = [
  "Acne", "Rosacea", "Eczema", "Psoriasis", "Hyperpigmentation", "None",
];

// -------------------------
// Step 1: Basic Information
// -------------------------
function Step1({ data, setData }: any) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#2C0B1F] mb-1">Tell us about yourself</h2>
        <p className="text-[#6D4C5E] text-sm">This helps us personalise your skin analysis results.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">Full Name</label>
          <input
            type="text"
            value={data.name}
            onChange={e => setData({ ...data, name: e.target.value })}
            placeholder="e.g. Sarah Ahmed"
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">Age</label>
          <input
            type="number"
            value={data.age}
            onChange={e => setData({ ...data, age: e.target.value })}
            placeholder="24"
            min={10} max={100}
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white transition-colors text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Gender</label>
        <div className="flex gap-3">
          {["Female", "Male", "Prefer not to say"].map(g => (
            <button
              key={g}
              onClick={() => setData({ ...data, gender: g })}
              className={`flex-1 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                data.gender === g
                  ? "border-[#E91E63] bg-[#E91E63] text-white shadow-[0_4px_12px_rgba(233,30,99,0.25)]"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Skin Type</label>
        <div className="grid grid-cols-4 gap-3">
          {SKIN_TYPES.map(st => (
            <button
              key={st.id}
              onClick={() => setData({ ...data, skinType: st.id })}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all text-center ${
                data.skinType === st.id
                  ? "border-[#E91E63] bg-[#FFF0F5] shadow-[0_4px_16px_rgba(233,30,99,0.18)]"
                  : "border-[#FFD6E7] bg-white hover:border-[#FF69B4]"
              }`}
            >
              <span className="text-2xl">{st.icon}</span>
              <span className={`text-sm font-bold ${data.skinType === st.id ? "text-[#E91E63]" : "text-[#2C0B1F]"}`}>{st.label}</span>
              <span className="text-xs text-[#6D4C5E] leading-tight">{st.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------
// Step 2: Skin Concerns
// -------------------------
function Step2({ data, setData }: any) {
  const toggle = (c: string) => {
    const set = new Set(data.concerns);
    set.has(c) ? set.delete(c) : set.add(c);
    setData({ ...data, concerns: set });
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#2C0B1F] mb-1">What are your main skin concerns?</h2>
        <p className="text-[#6D4C5E] text-sm">Select all that apply — we'll tailor your analysis around these.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {CONCERNS.map(c => {
          const selected = data.concerns.has(c);
          return (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`px-5 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                selected
                  ? "border-[#E91E63] bg-[#E91E63] text-white shadow-[0_4px_12px_rgba(233,30,99,0.20)]"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4] hover:text-[#E91E63]"
              }`}
            >
              {selected && <span className="mr-1.5">✓</span>}
              {c}
            </button>
          );
        })}
      </div>

      {data.concerns.has("Others") && (
        <div>
          <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">Describe your other concerns</label>
          <textarea
            value={data.otherConcern}
            onChange={e => setData({ ...data, otherConcern: e.target.value })}
            rows={3}
            placeholder="Tell us more..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white resize-none transition-colors text-sm"
          />
        </div>
      )}

      {data.concerns.size > 0 && (
        <div className="p-4 bg-[#FFF0F5] rounded-2xl border border-[#FFD6E7]">
          <p className="text-xs font-semibold text-[#E91E63] mb-2">{data.concerns.size} concern{data.concerns.size > 1 ? "s" : ""} selected</p>
          <div className="flex flex-wrap gap-2">
            {[...data.concerns].map(c => (
              <span key={c} className="text-xs px-3 py-1 bg-[#E91E63] text-white rounded-full">{c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// -------------------------
// Step 3: Lifestyle
// -------------------------
function Step3({ data, setData }: any) {
  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-[#2C0B1F]">Help us understand your lifestyle</h2>
          <span className="text-xs font-medium px-2.5 py-1 bg-[#FFF0F5] text-[#6D4C5E] rounded-full border border-[#FFD6E7]">Optional</span>
        </div>
        <p className="text-[#6D4C5E] text-sm">Lifestyle factors have a significant impact on your skin health.</p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold text-[#2C0B1F] mb-2 flex items-center gap-2">
            <Moon className="w-4 h-4 text-[#E91E63]" /> Average Sleep (hours/night)
          </label>
          <select
            value={data.sleep}
            onChange={e => setData({ ...data, sleep: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] bg-white appearance-none transition-colors text-sm"
          >
            <option value="">Select hours</option>
            {["Less than 5h", "5–6h", "6–7h", "7–8h", "More than 8h"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#2C0B1F] mb-2 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#E91E63]" /> Daily Water Intake
          </label>
          <select
            value={data.water}
            onChange={e => setData({ ...data, water: e.target.value })}
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] bg-white appearance-none transition-colors text-sm"
          >
            <option value="">Select intake</option>
            {["Less than 1L", "1–2L", "2–3L", "More than 3L"].map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Diet Type</label>
        <div className="grid grid-cols-4 gap-3">
          {DIET_TYPES.map(dt => (
            <button
              key={dt.id}
              onClick={() => setData({ ...data, diet: dt.id })}
              className={`flex flex-col gap-1.5 p-4 rounded-2xl border-2 transition-all text-left ${
                data.diet === dt.id
                  ? "border-[#E91E63] bg-[#FFF0F5] shadow-[0_4px_16px_rgba(233,30,99,0.15)]"
                  : "border-[#FFD6E7] bg-white hover:border-[#FF69B4]"
              }`}
            >
              <span className={`text-sm font-bold ${data.diet === dt.id ? "text-[#E91E63]" : "text-[#2C0B1F]"}`}>{dt.label}</span>
              <span className="text-xs text-[#6D4C5E] leading-tight">{dt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#E91E63]" /> Stress Level
        </label>
        <div className="flex items-center gap-4">
          <span className="text-xs text-[#6D4C5E] w-8 text-right">Low</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min={1} max={5}
              value={data.stress}
              onChange={e => setData({ ...data, stress: Number(e.target.value) })}
              className="w-full h-2 rounded-full appearance-none cursor-pointer accent-[#E91E63]"
              style={{ background: `linear-gradient(to right, #E91E63 0%, #E91E63 ${(data.stress - 1) * 25}%, #FFD6E7 ${(data.stress - 1) * 25}%, #FFD6E7 100%)` }}
            />
            <div className="flex justify-between mt-1.5">
              {["Very Low", "Low", "Medium", "High", "Very High"].map((l, i) => (
                <span key={l} className={`text-xs ${data.stress === i + 1 ? "text-[#E91E63] font-bold" : "text-[#C9A8B8]"}`}>{l}</span>
              ))}
            </div>
          </div>
          <span className="text-xs text-[#6D4C5E] w-8">High</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Exercise Frequency</label>
        <div className="flex gap-3 flex-wrap">
          {["Never", "1–2x / week", "3–4x / week", "5+ / week", "Daily"].map(ex => (
            <button
              key={ex}
              onClick={() => setData({ ...data, exercise: ex })}
              className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                data.exercise === ex
                  ? "border-[#E91E63] bg-[#E91E63] text-white"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------
// Step 4: Health & Hormonal
// -------------------------
function Step4({ data, setData }: any) {
  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-[#2C0B1F]">Health & Hormonal Information</h2>
          <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 bg-[#FFF0F5] text-[#6D4C5E] rounded-full border border-[#FFD6E7]">
            <Lock className="w-3 h-3" /> Optional & Private
          </span>
        </div>
        <p className="text-[#6D4C5E] text-sm">All information is kept completely private and helps improve your personalised analysis.</p>
      </div>

      <div className="p-4 bg-[#FFF0F5] rounded-2xl border border-[#FFD6E7] flex items-start gap-3">
        <Lock className="w-4 h-4 text-[#E91E63] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#6D4C5E]">Your health data is never shared, sold, or stored on external servers. It is used solely to enhance your skin analysis accuracy.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Do you have any hormonal conditions?</label>
        <div className="flex gap-3 mb-3">
          {["Yes", "No", "Unsure"].map(v => (
            <button
              key={v}
              onClick={() => setData({ ...data, hormonal: v })}
              className={`px-6 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                data.hormonal === v
                  ? "border-[#E91E63] bg-[#E91E63] text-white"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        {data.hormonal === "Yes" && (
          <input
            type="text"
            value={data.hormonalDetail}
            onChange={e => setData({ ...data, hormonalDetail: e.target.value })}
            placeholder="Please specify (e.g. PCOS, thyroid, etc.)"
            className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white text-sm transition-colors"
          />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Menstrual Cycle (if applicable)</label>
        <div className="flex gap-3 flex-wrap">
          {["Regular", "Irregular", "PCOS", "Menopause", "Not applicable"].map(v => (
            <button
              key={v}
              onClick={() => setData({ ...data, cycle: v })}
              className={`px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all ${
                data.cycle === v
                  ? "border-[#E91E63] bg-[#E91E63] text-white"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">Known Skincare Allergies</label>
        <textarea
          value={data.allergies}
          onChange={e => setData({ ...data, allergies: e.target.value })}
          rows={3}
          placeholder="e.g. Benzoyl peroxide, fragrances, essential oils... (leave blank if none)"
          className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white resize-none transition-colors text-sm"
        />
      </div>
    </div>
  );
}

// -------------------------
// Step 5: Skin History
// -------------------------
function Step5({ data, setData }: any) {
  const toggleTreatment = (t: string) => {
    const set = new Set(data.treatments);
    set.has(t) ? set.delete(t) : set.add(t);
    setData({ ...data, treatments: set });
  };
  const toggleFamily = (f: string) => {
    const set = new Set(data.familyHistory);
    set.has(f) ? set.delete(f) : set.add(f);
    setData({ ...data, familyHistory: set });
  };

  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#2C0B1F] mb-1">Tell us about your skin journey</h2>
        <p className="text-[#6D4C5E] text-sm">Understanding your history helps us give more accurate insights.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Have you had recurring skin issues before?</label>
        <div className="flex gap-3">
          {["Yes", "No"].map(v => (
            <button
              key={v}
              onClick={() => setData({ ...data, hadIssues: v })}
              className={`px-8 py-3 rounded-full border-2 text-sm font-medium transition-all ${
                data.hadIssues === v
                  ? "border-[#E91E63] bg-[#E91E63] text-white shadow-[0_4px_12px_rgba(233,30,99,0.20)]"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {data.hadIssues === "Yes" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">How long have you had these issues?</label>
            <select
              value={data.duration}
              onChange={e => setData({ ...data, duration: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-[#FFD6E7] focus:border-[#E91E63] outline-none text-[#2C0B1F] bg-white appearance-none text-sm transition-colors"
            >
              <option value="">Select duration</option>
              {["Less than 6 months", "6–12 months", "1–3 years", "3–5 years", "More than 5 years"].map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Treatments you have tried</label>
            <div className="flex flex-wrap gap-2">
              {TREATMENTS.map(t => (
                <button
                  key={t}
                  onClick={() => toggleTreatment(t)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    data.treatments.has(t)
                      ? "border-[#E91E63] bg-[#E91E63] text-white"
                      : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
                  }`}
                >
                  {data.treatments.has(t) && <span className="mr-1">✓</span>}
                  {t}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Family history of skin conditions</label>
        <div className="grid grid-cols-3 gap-3">
          {FAMILY_CONDITIONS.map(f => (
            <button
              key={f}
              onClick={() => toggleFamily(f)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                data.familyHistory.has(f)
                  ? "border-[#E91E63] bg-[#FFF0F5] text-[#E91E63]"
                  : "border-[#FFD6E7] bg-white text-[#6D4C5E] hover:border-[#FF69B4]"
              }`}
            >
              {data.familyHistory.has(f) && <CheckCircle2 className="w-4 h-4 flex-shrink-0" />}
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------
// Step 6: Preferences & Consent
// -------------------------
function Step6({ data, setData }: any) {
  return (
    <div className="space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-[#2C0B1F] mb-1">Your Preferences</h2>
        <p className="text-[#6D4C5E] text-sm">Almost there — one last step to customise your experience.</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#2C0B1F] mb-3">Preferred solution type</label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setData({ ...data, preferCosmetic: !data.preferCosmetic })}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
              data.preferCosmetic
                ? "border-[#E91E63] bg-[#FFF0F5] shadow-[0_6px_20px_rgba(233,30,99,0.18)]"
                : "border-[#FFD6E7] bg-white hover:border-[#FF69B4]"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.preferCosmetic ? "bg-[#E91E63]" : "bg-[#FFF0F5]"}`}>
              <ShoppingBag className={`w-6 h-6 ${data.preferCosmetic ? "text-white" : "text-[#E91E63]"}`} />
            </div>
            <div>
              <p className={`font-bold text-sm ${data.preferCosmetic ? "text-[#E91E63]" : "text-[#2C0B1F]"}`}>Cosmetic Products</p>
              <p className="text-xs text-[#6D4C5E] mt-0.5">Clinically formulated skincare</p>
            </div>
            {data.preferCosmetic && (
              <span className="text-xs px-2.5 py-1 bg-[#E91E63] text-white rounded-full font-medium">Selected</span>
            )}
          </button>

          <button
            onClick={() => setData({ ...data, preferNatural: !data.preferNatural })}
            className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all ${
              data.preferNatural
                ? "border-[#E91E63] bg-[#FFF0F5] shadow-[0_6px_20px_rgba(233,30,99,0.18)]"
                : "border-[#FFD6E7] bg-white hover:border-[#FF69B4]"
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${data.preferNatural ? "bg-[#E91E63]" : "bg-[#FFF0F5]"}`}>
              <Leaf className={`w-6 h-6 ${data.preferNatural ? "text-white" : "text-[#E91E63]"}`} />
            </div>
            <div>
              <p className={`font-bold text-sm ${data.preferNatural ? "text-[#E91E63]" : "text-[#2C0B1F]"}`}>Natural Home Remedies</p>
              <p className="text-xs text-[#6D4C5E] mt-0.5">Gentle, plant-based treatments</p>
            </div>
            {data.preferNatural && (
              <span className="text-xs px-2.5 py-1 bg-[#E91E63] text-white rounded-full font-medium">Selected</span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#2C0B1F]">Consent & Privacy</h3>

        {[
          { key: "consentNonDiagnostic", label: "I understand this is for educational purposes only and not a medical diagnosis" },
          { key: "consentData", label: "I agree to my data being used securely to improve my skin analysis (never shared or sold)" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setData({ ...data, [key]: !data[key] })}
            className={`w-full flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
              data[key]
                ? "border-[#E91E63] bg-[#FFF0F5]"
                : "border-[#FFD6E7] bg-white hover:border-[#FF69B4]"
            }`}
          >
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
              data[key] ? "border-[#E91E63] bg-[#E91E63]" : "border-[#FFD6E7]"
            }`}>
              {data[key] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-sm text-[#2C0B1F] leading-relaxed">{label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 bg-[#FFF0F5] rounded-2xl border border-[#FFD6E7] flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#E91E63] mt-0.5 flex-shrink-0" />
        <p className="text-xs text-[#6D4C5E]">
          Your data is encrypted, never sold, and stays on-device. Clinderma is a screening tool — it is not a replacement for professional medical advice.
        </p>
      </div>
    </div>
  );
}

// -------------------------
// Main Onboarding Wizard
// -------------------------
export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    // Step 1
    name: "", age: "", gender: "", skinType: "",
    // Step 2
    concerns: new Set<string>(), otherConcern: "",
    // Step 3
    sleep: "", water: "", diet: "", stress: 3, exercise: "",
    // Step 4
    hormonal: "", hormonalDetail: "", cycle: "", allergies: "",
    // Step 5
    hadIssues: "", duration: "", treatments: new Set<string>(), familyHistory: new Set<string>(),
    // Step 6
    preferCosmetic: true, preferNatural: true, consentNonDiagnostic: false, consentData: false,
  });

  const [stepError, setStepError] = useState("");

  function validateStep(s: number): string {
    switch (s) {
      case 1:
        if (!data.name.trim()) return "Full name is required.";
        if (!data.age) return "Age is required.";
        if (!data.gender) return "Please select your gender.";
        if (!data.skinType) return "Please select your skin type.";
        return "";
      case 2:
        if (data.concerns.size === 0) return "Please select at least one skin concern.";
        return "";
      case 3:
        if (!data.sleep) return "Please select your average sleep hours.";
        if (!data.water) return "Please select your daily water intake.";
        if (!data.diet) return "Please select your diet type.";
        if (!data.exercise) return "Please select your exercise frequency.";
        return "";
      case 4:
        if (!data.hormonal) return "Please indicate if you have hormonal conditions.";
        if (!data.cycle) return "Please select your menstrual cycle type.";
        return "";
      case 5:
        if (!data.hadIssues) return "Please indicate if you have had recurring skin issues.";
        if (data.hadIssues === "Yes" && !data.duration) return "Please select how long you have had skin issues.";
        if (data.hadIssues === "Yes" && data.treatments.size === 0) return "Please select at least one treatment you have tried.";
        if (data.familyHistory.size === 0) return "Please select at least one option for family history (choose 'None' if not applicable).";
        return "";
      case 6:
        if (!data.preferCosmetic && !data.preferNatural) return "Please select at least one preferred solution type.";
        if (!data.consentNonDiagnostic) return "Please confirm you understand this is non-diagnostic.";
        if (!data.consentData) return "Please agree to the data usage policy.";
        return "";
      default:
        return "";
    }
  }

  function handleContinue() {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError("");
    if (step < STEPS.length) {
      setStep(s => s + 1);
    } else {
      import("../lib/profile").then(({ saveProfile }) => saveProfile(data));
      navigate("/dashboard");
    }
  }

  const canComplete = data.consentNonDiagnostic && data.consentData && (data.preferCosmetic || data.preferNatural);

  const stepComponents: Record<number, React.ReactNode> = {
    1: <Step1 data={data} setData={setData} />,
    2: <Step2 data={data} setData={setData} />,
    3: <Step3 data={data} setData={setData} />,
    4: <Step4 data={data} setData={setData} />,
    5: <Step5 data={data} setData={setData} />,
    6: <Step6 data={data} setData={setData} />,
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-[#FFD6E7] px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2 bg-[#E91E63] text-white px-4 py-2 rounded-2xl shadow-sm">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-lg tracking-tight">Clinderma</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-[#6D4C5E] font-medium">Step {step} of {STEPS.length}</span>
          <span className="text-sm font-bold text-[#E91E63]">{STEPS[step - 1].label}</span>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="text-sm text-[#6D4C5E] hover:text-[#E91E63] transition-colors font-medium"
        >
          Skip to Dashboard
        </button>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[#FFD6E7] px-8 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const num = i + 1;
              const done = num < step;
              const current = num === step;
              const Icon = s.icon;
              return (
                <React.Fragment key={num}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      done ? "bg-[#E91E63] border-[#E91E63]"
                      : current ? "bg-white border-[#E91E63] shadow-[0_0_0_4px_rgba(233,30,99,0.12)]"
                      : "bg-white border-[#FFD6E7]"
                    }`}>
                      {done
                        ? <CheckCircle2 className="w-5 h-5 text-white" />
                        : <Icon className={`w-4 h-4 ${current ? "text-[#E91E63]" : "text-[#C9A8B8]"}`} />
                      }
                    </div>
                    <span className={`text-xs font-medium ${current ? "text-[#E91E63]" : done ? "text-[#E91E63]" : "text-[#C9A8B8]"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mb-5 rounded-full transition-all ${num < step ? "bg-[#E91E63]" : "bg-[#FFD6E7]"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="bg-white rounded-3xl shadow-[0_8px_32px_rgba(233,30,99,0.10)] border border-[#FFD6E7] p-8"
            >
              {stepComponents[step]}
            </motion.div>
          </AnimatePresence>

          {/* Validation error */}
          <AnimatePresence>
            {stepError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 mt-5 px-4 py-3 bg-[#FFF0F5] border border-[#FF4081] rounded-2xl text-sm text-[#FF4081] font-medium"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-[#FF4081] text-white flex items-center justify-center text-xs font-bold">!</span>
                {stepError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 px-1">
            <button
              onClick={() => { setStepError(""); step > 1 ? setStep(s => s - 1) : navigate("/"); }}
              className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-[#FFD6E7] bg-white text-[#6D4C5E] text-sm font-medium hover:border-[#FF69B4] hover:text-[#E91E63] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              {step > 1 ? "Back" : "Back to Home"}
            </button>

            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#E91E63] text-white text-sm font-semibold hover:bg-[#D81B60] shadow-[0_4px_16px_rgba(233,30,99,0.30)] hover:shadow-[0_6px_20px_rgba(233,30,99,0.40)] transition-all"
            >
              {step < STEPS.length ? (
                <>Continue <ArrowRight className="w-4 h-4" /></>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Complete My Profile</>
              )}
            </button>
          </div>

          {/* Step dots indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i + 1 === step ? "w-6 h-2 bg-[#E91E63]" : i + 1 < step ? "w-2 h-2 bg-[#FF69B4]" : "w-2 h-2 bg-[#FFD6E7]"
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      <footer className="py-5 text-center">
        <p className="text-[#6D4C5E] text-xs">Non-diagnostic • Privacy-first • Data stays on your device</p>
      </footer>
    </div>
  );
}
