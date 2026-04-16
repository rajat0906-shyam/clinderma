export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  skinType: string;
  concerns: string[];
  otherConcern: string;
  sleep: string;
  water: string;
  diet: string;
  exercise: string;
  stress: number;
  hormonal: string;
  hormonalDetail: string;
  cycle: string;
  allergies: string;
  hadIssues: string;
  duration: string;
  treatments: string[];
  familyHistory: string[];
  preferCosmetic: boolean;
  preferNatural: boolean;
}

const KEY = "clinderma_profile";

export function saveProfile(raw: {
  name: string; age: string; gender: string; skinType: string;
  concerns: Set<string>; otherConcern: string;
  sleep: string; water: string; diet: string; exercise: string; stress: number;
  hormonal: string; hormonalDetail: string; cycle: string; allergies: string;
  hadIssues: string; duration: string;
  treatments: Set<string>; familyHistory: Set<string>;
  preferCosmetic: boolean; preferNatural: boolean;
  consentNonDiagnostic: boolean; consentData: boolean;
}) {
  const profile: UserProfile = {
    name: raw.name,
    age: raw.age,
    gender: raw.gender,
    skinType: raw.skinType,
    concerns: [...raw.concerns],
    otherConcern: raw.otherConcern,
    sleep: raw.sleep,
    water: raw.water,
    diet: raw.diet,
    exercise: raw.exercise,
    stress: raw.stress,
    hormonal: raw.hormonal,
    hormonalDetail: raw.hormonalDetail,
    cycle: raw.cycle,
    allergies: raw.allergies,
    hadIssues: raw.hadIssues,
    duration: raw.duration,
    treatments: [...raw.treatments],
    familyHistory: [...raw.familyHistory],
    preferCosmetic: raw.preferCosmetic,
    preferNatural: raw.preferNatural,
  };
  localStorage.setItem(KEY, JSON.stringify(profile));
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function getSkinTypeLabel(id: string): string {
  const map: Record<string, string> = {
    oily: "Oily",
    dry: "Dry",
    combination: "Combination",
    sensitive: "Sensitive",
    normal: "Normal",
  };
  return map[id] ?? id;
}

export function getSleepLabel(id: string): string {
  const map: Record<string, string> = {
    "less-5": "<5h",
    "5-6": "5–6h",
    "7-8": "7–8h",
    "more-8": "8h+",
  };
  return map[id] ?? id;
}

export function getWaterLabel(id: string): string {
  const map: Record<string, string> = {
    "less-1": "<1L",
    "1-2": "1–2L",
    "2-3": "2–3L",
    "more-3": "3L+",
  };
  return map[id] ?? id;
}

export function getExerciseLabel(id: string): string {
  const map: Record<string, string> = {
    none: "None",
    "1-2": "1–2×/wk",
    "3-4": "3–4×/wk",
    daily: "Daily",
  };
  return map[id] ?? id;
}

interface ProductRec { name: string; desc: string; rating: number; }
interface RemedyRec { name: string; desc: string; }

interface ConcernMap {
  category: string;
  products: ProductRec[];
  remedies: RemedyRec[];
}

const CONCERN_DATA: Record<string, ConcernMap> = {
  "Acne / Breakouts": {
    category: "For Acne",
    products: [
      { name: "Salicylic Acid 2%", desc: "Unclogs pores, reduces blackheads & whiteheads", rating: 4.8 },
      { name: "Benzoyl Peroxide 5%", desc: "Kills acne-causing bacteria, calms inflammation", rating: 4.6 },
      { name: "Niacinamide 10%", desc: "Reduces sebum, minimises pore appearance", rating: 4.9 },
    ],
    remedies: [
      { name: "Turmeric (Haldi) Mask", desc: "Anti-inflammatory, targets active breakouts" },
      { name: "Tea Tree Oil (diluted)", desc: "Natural antibacterial for spot treatment" },
    ],
  },
  "Hyperpigmentation": {
    category: "For Pigmentation",
    products: [
      { name: "Vitamin C Serum 20%", desc: "Brightens skin, fades post-acne dark spots", rating: 4.7 },
      { name: "Alpha Arbutin 2%", desc: "Targets hyperpigmentation at the melanin level", rating: 4.5 },
      { name: "Kojic Acid + Niacinamide", desc: "Dual-action brightening and tone-evening", rating: 4.4 },
    ],
    remedies: [
      { name: "Lemon + Honey Mask", desc: "Natural brightening, fades spots over time" },
      { name: "Papaya Enzyme Paste", desc: "Gentle exfoliation, reveals brighter skin" },
    ],
  },
  "Redness": {
    category: "For Redness & Irritation",
    products: [
      { name: "Azelaic Acid 10%", desc: "Calms redness, treats rosacea & post-inflammatory marks", rating: 4.6 },
      { name: "Centella Asiatica Serum", desc: "Soothing, barrier-strengthening botanical", rating: 4.8 },
    ],
    remedies: [
      { name: "Cucumber Slices", desc: "Cooling, reduces redness and puffiness" },
      { name: "Chamomile Tea Toner", desc: "Soothing antioxidant, calms reactive skin" },
    ],
  },
  "Uneven skin tone": {
    category: "For Even Tone",
    products: [
      { name: "Tranexamic Acid 5%", desc: "Evens tone, reduces discolouration clusters", rating: 4.7 },
      { name: "Glycolic Acid 7% Toner", desc: "Exfoliates dead cells, brightens overall tone", rating: 4.5 },
    ],
    remedies: [
      { name: "Rose Water Toner", desc: "Gentle pH balancing, evens complexion" },
      { name: "Oat Milk Compress", desc: "Soothing, reduces uneven texture" },
    ],
  },
  "Dullness": {
    category: "For Radiance",
    products: [
      { name: "Vitamin C + E Serum", desc: "Antioxidant glow booster for dull skin", rating: 4.8 },
      { name: "AHA/BHA Exfoliant 8%", desc: "Removes dull surface cells, reveals glow", rating: 4.6 },
    ],
    remedies: [
      { name: "Turmeric + Yogurt Mask", desc: "Brightening, adds instant radiance" },
      { name: "Green Tea Face Mist", desc: "Antioxidant-rich, energises tired skin" },
    ],
  },
  "Scarring": {
    category: "For Scars & Texture",
    products: [
      { name: "Retinol 0.5% Serum", desc: "Speeds cell turnover, fades acne scars", rating: 4.7 },
      { name: "Niacinamide 10%", desc: "Improves texture, reduces scar visibility", rating: 4.9 },
    ],
    remedies: [
      { name: "Aloe Vera Gel", desc: "Healing, reduces scar depth over time" },
      { name: "Rosehip Seed Oil", desc: "Rich in Vitamin A, fades scars naturally" },
    ],
  },
  "Dark circles": {
    category: "For Dark Circles",
    products: [
      { name: "Caffeine Eye Serum", desc: "Depuffs and lightens dark under-eye circles", rating: 4.7 },
      { name: "Peptide Eye Cream", desc: "Firms and brightens the delicate eye area", rating: 4.5 },
    ],
    remedies: [
      { name: "Cold Cucumber Slices", desc: "Reduces puffiness and dark circles" },
      { name: "Potato Juice Compress", desc: "Natural bleaching agent for dark circles" },
    ],
  },
  "Large pores": {
    category: "For Pore Minimising",
    products: [
      { name: "Niacinamide 10%", desc: "Reduces pore size and excess oil", rating: 4.9 },
      { name: "Salicylic Acid 1% Toner", desc: "Clears pore lining, reduces appearance", rating: 4.6 },
    ],
    remedies: [
      { name: "Clay Mask (Kaolin)", desc: "Draws out impurities, tightens pores" },
      { name: "Ice Cube Massage", desc: "Temporarily tightens and closes pores" },
    ],
  },
  "Wrinkles": {
    category: "For Anti-Ageing",
    products: [
      { name: "Retinol 1% Night Serum", desc: "Reduces fine lines, boosts collagen", rating: 4.8 },
      { name: "Peptide Complex Serum", desc: "Firms skin, smooths wrinkle depth", rating: 4.7 },
    ],
    remedies: [
      { name: "Rosehip + Argan Oil", desc: "Antioxidant-rich facial oil for fine lines" },
      { name: "Facial Massage (Gua Sha)", desc: "Improves circulation, firms and lifts" },
    ],
  },
  "Others": {
    category: "For General Skin Health",
    products: [
      { name: "Hyaluronic Acid Serum", desc: "Deep hydration for all skin concerns", rating: 4.9 },
      { name: "Ceramide Moisturiser", desc: "Restores barrier, suits all skin types", rating: 4.8 },
    ],
    remedies: [
      { name: "Aloe Vera Gel", desc: "Universal soother and hydrator" },
      { name: "Oatmeal Mask", desc: "Gentle, calms and repairs the skin barrier" },
    ],
  },
};

interface Insight { text: string; cause: string; color: string; }

export function generateInsights(profile: UserProfile): Insight[] {
  const insights: Insight[] = [];
  const hasConcern = (c: string) => profile.concerns.includes(c);

  if (hasConcern("Acne / Breakouts") && profile.hormonal === "Yes") {
    insights.push({ text: "Inflammatory acne concentrated on chin & jawline", cause: "Likely hormonal trigger — consider hormonal work-up", color: "#FF4081" });
  } else if (hasConcern("Acne / Breakouts") && (profile.skinType === "oily" || profile.skinType === "combination")) {
    insights.push({ text: "Active breakouts in T-zone and forehead", cause: "Excess sebum + clogged pores from oily skin", color: "#E91E63" });
  } else if (hasConcern("Acne / Breakouts")) {
    insights.push({ text: "Recurring breakouts detected across multiple zones", cause: "Possible stress or diet correlation", color: "#FF4081" });
  }

  if (hasConcern("Hyperpigmentation") || hasConcern("Uneven skin tone")) {
    insights.push({ text: "Post-inflammatory hyperpigmentation on cheeks", cause: "Responding to targeted brightening routine", color: "#FF69B4" });
  }

  if (hasConcern("Redness") || profile.skinType === "sensitive") {
    insights.push({ text: "Skin barrier sensitivity detected across cheeks", cause: "Reactive skin — fragrance-free routine recommended", color: "#FF8DA1" });
  }

  if (hasConcern("Large pores") || profile.skinType === "oily") {
    insights.push({ text: "Enlarged pores in nose and T-zone area", cause: "Excess sebum production — clay & niacinamide help", color: "#E91E63" });
  }

  if (profile.sleep === "less-5" || profile.sleep === "5-6") {
    insights.push({ text: "Skin recovery compromised by short sleep duration", cause: "Cell repair peaks at night — aim for 7–8h", color: "#FF8DA1" });
  }

  if (profile.water === "less-1" || profile.water === "1-2") {
    insights.push({ text: "Dehydration lines visible around eye area", cause: "Low water intake affecting skin plumpness", color: "#FF69B4" });
  }

  if (insights.length === 0) {
    insights.push({ text: "Skin appears in relatively good overall condition", cause: "Maintain current routine and regular scans", color: "#FF69B4" });
  }

  return insights.slice(0, 4);
}

interface ZoneData { name: string; severity: string; pct: number; color: string; }

export function generateZones(profile: UserProfile): ZoneData[] {
  const hasConcern = (c: string) => profile.concerns.includes(c);
  const isOily = profile.skinType === "oily" || profile.skinType === "combination";
  const hasAcne = hasConcern("Acne / Breakouts");
  const hasPigment = hasConcern("Hyperpigmentation") || hasConcern("Uneven skin tone");
  const hasRedness = hasConcern("Redness");

  return [
    {
      name: "Forehead",
      severity: hasAcne && isOily ? "Moderate" : hasAcne ? "Mild" : "Low",
      pct: hasAcne && isOily ? 22 : hasAcne ? 12 : 4,
      color: hasAcne && isOily ? "#FF4081" : "#FF8DA1",
    },
    {
      name: "T-Zone",
      severity: isOily ? "High" : hasAcne ? "Moderate" : "Low",
      pct: isOily ? 38 : hasAcne ? 24 : 6,
      color: isOily ? "#E91E63" : hasAcne ? "#FF4081" : "#FF8DA1",
    },
    {
      name: "Left Cheek",
      severity: hasPigment ? "Moderate" : hasRedness ? "Mild" : "Low",
      pct: hasPigment ? 18 : hasRedness ? 10 : 4,
      color: hasPigment ? "#FF4081" : "#FF8DA1",
    },
    {
      name: "Right Cheek",
      severity: hasPigment ? "Moderate" : hasRedness ? "Mild" : "Low",
      pct: hasPigment ? 16 : hasRedness ? 8 : 3,
      color: hasPigment ? "#FF4081" : "#FF8DA1",
    },
    {
      name: "Chin",
      severity: profile.hormonal === "Yes" && hasAcne ? "High" : hasAcne ? "Moderate" : "Low",
      pct: profile.hormonal === "Yes" && hasAcne ? 32 : hasAcne ? 18 : 5,
      color: profile.hormonal === "Yes" && hasAcne ? "#E91E63" : hasAcne ? "#FF4081" : "#FF8DA1",
    },
    {
      name: "Nose",
      severity: isOily || hasConcern("Large pores") ? "Moderate" : "Low",
      pct: isOily || hasConcern("Large pores") ? 20 : 5,
      color: isOily ? "#FF4081" : "#FF8DA1",
    },
  ];
}

export function calculateScore(profile: UserProfile): number {
  let score = 100;
  score -= profile.concerns.length * 5;
  if (profile.sleep === "less-5") score -= 8;
  else if (profile.sleep === "5-6") score -= 4;
  if (profile.water === "less-1") score -= 6;
  else if (profile.water === "1-2") score -= 3;
  if (profile.exercise === "none") score -= 4;
  if (profile.hormonal === "Yes") score -= 5;
  if (profile.skinType === "sensitive") score -= 3;
  return Math.max(38, Math.min(95, score));
}

export function getLesionCount(profile: UserProfile): number {
  const hasConcern = (c: string) => profile.concerns.includes(c);
  let count = 0;
  if (hasConcern("Acne / Breakouts")) count += 4;
  if (profile.hormonal === "Yes") count += 2;
  if (profile.skinType === "oily" || profile.skinType === "combination") count += 2;
  if (hasConcern("Large pores")) count += 1;
  return Math.min(20, Math.max(0, count));
}

export function getPigmentPct(profile: UserProfile): number {
  const hasConcern = (c: string) => profile.concerns.includes(c);
  let pct = 0;
  if (hasConcern("Hyperpigmentation")) pct += 14;
  if (hasConcern("Uneven skin tone")) pct += 8;
  if (hasConcern("Scarring")) pct += 5;
  if (hasConcern("Dullness")) pct += 4;
  return Math.min(45, pct);
}

export function getAcneSeverity(profile: UserProfile): { label: string; bar: number } {
  const hasAcne = profile.concerns.includes("Acne / Breakouts");
  if (!hasAcne) return { label: "Clear", bar: 5 };
  if (profile.hormonal === "Yes" && (profile.skinType === "oily" || profile.skinType === "combination")) return { label: "Severe", bar: 90 };
  if (profile.hormonal === "Yes" || profile.skinType === "oily") return { label: "Moderate", bar: 55 };
  return { label: "Mild", bar: 25 };
}

export function getRecommendations(profile: UserProfile) {
  const cosmetic: { category: string; items: ProductRec[] }[] = [];
  const remedies: RemedyRec[] = [];

  const seen = new Set<string>();
  profile.concerns.forEach((concern) => {
    const data = CONCERN_DATA[concern];
    if (!data) return;
    if (!seen.has(data.category)) {
      seen.add(data.category);
      if (profile.preferCosmetic) cosmetic.push({ category: data.category, items: data.products });
      if (profile.preferNatural) remedies.push(...data.remedies);
    }
  });

  if (cosmetic.length === 0 && profile.preferCosmetic) {
    cosmetic.push({ category: "General Skin Health", items: CONCERN_DATA["Others"].products });
  }
  if (remedies.length === 0 && profile.preferNatural) {
    remedies.push(...CONCERN_DATA["Others"].remedies);
  }

  return { cosmetic, remedies };
}
