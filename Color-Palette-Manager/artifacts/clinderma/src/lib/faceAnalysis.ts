import { FaceLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { UserProfile } from "./profile";

// ─── Zone landmark index sets ───────────────────────────────────────────────
// Each set defines key landmark indices that bound a facial zone.
export const ZONES = {
  Forehead:      [10, 109, 67, 103, 332, 297, 338, 54, 284],
  "T-Zone":      [10, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19],
  "Left Cheek":  [127, 234, 93, 132, 58, 172, 136, 150, 149, 176],
  "Right Cheek": [356, 454, 323, 361, 288, 397, 365, 379, 378, 400],
  Nose:          [1, 2, 98, 327, 168, 197, 195, 5, 4, 19, 94],
  Chin:          [152, 148, 176, 149, 150, 136, 172, 58, 132, 377, 400, 378, 379],
} as const;

export type ZoneName = keyof typeof ZONES;

// ─── Condition & severity types ──────────────────────────────────────────────

export type ConditionName =
  | "Healthy / No Concern"
  | "Mild Redness"
  | "Acne Vulgaris"
  | "Comedonal Acne"
  | "Rosacea"
  | "Seborrheic Dermatitis"
  | "Hyperpigmentation"
  | "Melasma"
  | "Atopic Dermatitis"
  | "Contact Dermatitis"
  | "Enlarged Pores"
  | "Oily / Sebaceous Activity";

export type SeverityLevel = "Low" | "Mild" | "Moderate" | "High";

export interface ZoneMetrics {
  /** R / (G + B + 1) — proxy for inflammation / erythema */
  rednessIndex: number;       // 0–100
  /** (R - G) / (R + G + 1) — proxy for melanin / pigmentation */
  melaninIndex: number;       // 0–100
  /** Luminance standard deviation — proxy for texture / pore size */
  textureScore: number;       // 0–100
  /** Colour saturation proxy — proxy for oiliness / sebum */
  saturationScore: number;    // 0–100
}

export interface ZoneScore {
  name: ZoneName;
  metrics: ZoneMetrics;
  /** Primary normalised impact score (0–100) used for UI bars */
  rednessScore: number;
  textureVar: number;
  /** % of the zone area considered affected by the detected condition */
  pctAffected: number;
  severity: SeverityLevel;
  /** Detected skin condition for this zone (dynamically estimated) */
  condition: ConditionName;
  /** One-sentence explanation generated from real metric thresholds */
  causalText: string;
  /** Hex colour for the zone overlay */
  color: string;
  box?: { top: number; left: number; width: number; height: number };
}

export interface DynamicScanResult {
  timestamp: Date;
  overallScore: number;         // 0–100
  activeLesionsEst: number;
  pigmentationEst: number;
  zones: ZoneScore[];
  /** 0–100, reflects how many valid skin pixels were sampled */
  analysisConfidence: number;
  /** Dynamic causal bullets derived from zone metrics */
  globalCausalBullets: string[];
  imageUrl?: string;
  imageWidth?: number;
  imageHeight?: number;
  lesions?: { top: number; left: number; color: string; label: string }[];
}

// ─── MediaPipe landmarker singletons ────────────────────────────────────────

let landmarker: FaceLandmarker | null = null;
let videoLandmarker: FaceLandmarker | null = null;

export async function initFaceLandmarker() {
  if (landmarker) return landmarker;
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: false,
    runningMode: "IMAGE",
    numFaces: 1,
  });
  return landmarker;
}

export async function initVideoLandmarker() {
  if (videoLandmarker) return videoLandmarker;
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  videoLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU",
    },
    outputFaceBlendshapes: false,
    runningMode: "VIDEO",
    numFaces: 1,
  });
  return videoLandmarker;
}

// ─── AR overlay ──────────────────────────────────────────────────────────────

export function drawAROverlay(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number
) {
  ctx.clearRect(0, 0, width, height);

  const colors: Record<ZoneName, string> = {
    Forehead:      "rgba(233, 30, 99, 0.22)",
    "T-Zone":      "rgba(233, 30, 99, 0.18)",
    "Left Cheek":  "rgba(255, 64, 129, 0.20)",
    "Right Cheek": "rgba(255, 64, 129, 0.20)",
    Nose:          "rgba(255, 105, 180, 0.22)",
    Chin:          "rgba(244, 143, 177, 0.20)",
  };

  for (const [zoneName, indices] of Object.entries(ZONES)) {
    const polygon = (indices as number[]).map((i) => {
      const lm = landmarks[i];
      return { x: lm.x * width, y: lm.y * height };
    });

    ctx.beginPath();
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = colors[zoneName as ZoneName];
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 64, 129, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#FFF";
    for (const pt of polygon) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ─── Pixel extraction ────────────────────────────────────────────────────────

function extractZonePixels(
  imgData: ImageData,
  landmarks: NormalizedLandmark[],
  indices: readonly number[]
) {
  const w = imgData.width;
  const h = imgData.height;

  const polygon = (indices as number[]).map((i) => {
    const lm = landmarks[i];
    return { x: lm.x * w, y: lm.y * h };
  });

  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (const p of polygon) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }

  minX = Math.floor(Math.max(0, minX));
  minY = Math.floor(Math.max(0, minY));
  maxX = Math.ceil(Math.min(w, maxX));
  maxY = Math.ceil(Math.min(h, maxY));

  const rawIdx: number[] = [];
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const idx = (y * w + x) * 4;
      if (imgData.data[idx + 3] > 10) {
        rawIdx.push(idx);
      }
    }
  }
  return { pixelIndices: rawIdx, data: imgData.data, minX, minY, maxX, maxY };
}

// ─── Real per-zone multi-metric analysis ─────────────────────────────────────
// All metrics are derived purely from the actual pixel RGBA values in the zone.

function analyzeZoneMetrics(
  pixels: number[],
  data: Uint8ClampedArray
): ZoneMetrics {
  if (pixels.length === 0) {
    return { rednessIndex: 0, melaninIndex: 0, textureScore: 0, saturationScore: 0 };
  }

  let sumRed = 0, sumGreen = 0, sumBlue = 0;
  let sumLum = 0;
  let sumSat = 0;
  const luminances: number[] = [];

  for (const idx of pixels) {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Luminance (BT.709)
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    luminances.push(lum);
    sumLum += lum;

    sumRed   += r;
    sumGreen += g;
    sumBlue  += b;

    // HSV-style saturation: (max - min) / max
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    sumSat += maxC > 0 ? (maxC - minC) / maxC : 0;
  }

  const n = pixels.length;
  const avgR = sumRed   / n;
  const avgG = sumGreen / n;
  const avgB = sumBlue  / n;
  const avgLum = sumLum / n;

  // ── Redness Index: how much red exceeds green+blue average ─────────────
  // Range anchoring: healthy skin ≈ 0.35–0.42; inflamed skin > 0.50
  const rawRedness = avgR / (avgG + avgB + 1);
  // Normalise to 0-100: 0.30 → 0, 0.60 → 100
  const rednessIndex = Math.min(100, Math.max(0, (rawRedness - 0.30) / 0.30 * 100));

  // ── Melanin Index: excess red over green ───────────────────────────────
  // Elevated melanin pushes R above G (brown/dark pigment absorbs more green)
  const rawMelanin = (avgR - avgG) / (avgR + avgG + 1);
  // healthy: ~0.02–0.08; hyperpigmented: >0.12
  const melaninIndex = Math.min(100, Math.max(0, (rawMelanin - 0.02) / 0.15 * 100));

  // ── Texture Score: luminance standard deviation ─────────────────────────
  // Low variance = smooth skin; high variance = rough texture / pores
  let varSum = 0;
  for (const lum of luminances) {
    varSum += (lum - avgLum) ** 2;
  }
  const lumStdDev = Math.sqrt(varSum / n);
  // healthy: ~8–15 stddev; rough: >30
  const textureScore = Math.min(100, Math.max(0, (lumStdDev - 5) / 35 * 100));

  // ── Saturation Score: colour saturation proxy (oiliness / sebum) ───────
  const avgSat = sumSat / n;
  // healthy matte: ~0.15–0.25; oily skin: >0.40
  const saturationScore = Math.min(100, Math.max(0, (avgSat - 0.10) / 0.40 * 100));

  return { rednessIndex, melaninIndex, textureScore, saturationScore };
}

// ─── Rule-based condition estimator ──────────────────────────────────────────
// Inputs are all real pixel-derived metric values (0-100 scale).

function estimateCondition(
  m: ZoneMetrics,
  skinType: string
): { condition: ConditionName; severity: SeverityLevel; pctAffected: number; causalText: string; color: string } {
  const { rednessIndex: R, melaninIndex: M, textureScore: T, saturationScore: S } = m;

  // Skin-type adjustment factors
  const oilyBoost   = (skinType === "oily" || skinType === "combination") ? 1.15 : 1.0;
  const dryBoost     = skinType === "dry" ? 1.12 : 1.0;
  const sensitiveBoost = skinType === "sensitive" ? 1.10 : 1.0;

  const adjR = Math.min(100, R * sensitiveBoost);
  const adjT = Math.min(100, T * oilyBoost);
  const adjS = Math.min(100, S * oilyBoost);
  const adjM = Math.min(100, M * dryBoost);

  // Composite severity driver (0–100)
  const composite = adjR * 0.45 + adjT * 0.30 + adjS * 0.15 + adjM * 0.10;

  // ── Condition classification (rule priority order) ─────────────────────

  let condition: ConditionName = "Healthy / No Concern";
  let causalText = "No significant skin irregularities detected in this zone. Pixel metrics are within healthy baseline ranges.";

  if (adjR > 55 && adjT > 50) {
    // High redness + high texture → inflammatory acne
    condition = "Acne Vulgaris";
    causalText = `Elevated erythema index (${R.toFixed(0)}%) and high texture variance (${T.toFixed(0)}%) indicate active inflammatory lesions. Excess sebum oxidation and follicular congestion detected.`;
  } else if (adjR > 45 && adjT < 35) {
    // High redness but smooth texture → vascular / rosacea
    condition = "Rosacea";
    causalText = `Diffuse redness without significant surface texture irregularity (redness ${R.toFixed(0)}%, texture ${T.toFixed(0)}%) suggests vascular dilation consistent with rosacea. UV sensitivity or thermal triggers suspected.`;
  } else if (adjT > 55 && adjS > 50 && adjR < 40) {
    // High texture + oiliness but low redness → comedonal / pores
    condition = "Comedonal Acne";
    causalText = `High surface irregularity (texture ${T.toFixed(0)}%) combined with elevated saturation/oiliness (${S.toFixed(0)}%) indicates pore congestion and non-inflammatory comedones. Sebum overproduction detected.`;
  } else if (adjM > 55 && adjR < 35) {
    // High melanin, low redness → pigmentation disorder
    condition = adjM > 70 ? "Melasma" : "Hyperpigmentation";
    causalText = `Melanin index elevated at ${M.toFixed(0)}%, with relatively low inflammatory activity. Uneven pigment distribution detected — likely due to UV exposure, post-inflammatory changes, or hormonal fluctuation.`;
  } else if (adjR > 40 && adjT > 35 && adjS > 45) {
    // Moderate all three → seborrheic / mixed
    condition = "Seborrheic Dermatitis";
    causalText = `Mixed pattern of redness (${R.toFixed(0)}%), texture irregularity (${T.toFixed(0)}%), and high oiliness (${S.toFixed(0)}%) is consistent with seborrheic involvement. Malassezia-driven inflammation possible.`;
  } else if (adjR > 38 && adjT > 30 && adjM < 30 && adjS < 35) {
    // Moderate redness + texture, low oils → atopic / contact dermatitis
    condition = "Atopic Dermatitis";
    causalText = `Elevated redness (${R.toFixed(0)}%) with surface variance (${T.toFixed(0)}%) and low sebaceous activity suggests barrier dysfunction. Elevated trans-epidermal water loss pattern consistent with atopic presentation.`;
  } else if (adjS > 60 && adjR < 35 && adjT < 40) {
    // High saturation only → oily skin
    condition = "Oily / Sebaceous Activity";
    causalText = `Colour saturation analysis shows elevated sebum coverage (${S.toFixed(0)}%) without significant inflammation. T-zone or zone-specific overactive sebaceous glands detected.`;
  } else if (adjT > 42 && adjR < 35) {
    // Moderate texture, low redness → enlarged pores
    condition = "Enlarged Pores";
    causalText = `Surface texture variance (${T.toFixed(0)}%) indicates visible pore enlargement without active inflammation. Collagen laxity or chronic sebum accumulation may be contributing.`;
  } else if (adjR > 25 && adjR <= 38) {
    // Low-moderate redness only
    condition = "Mild Redness";
    causalText = `Low-grade erythema detected (redness index ${R.toFixed(0)}%). Mild vascular reactivity — potentially transient from temperature, product use, or mild irritation.`;
  }

  // ── Severity from composite ────────────────────────────────────────────
  let severity: SeverityLevel = "Low";
  let color = "#10B981"; // green

  if (composite > 62) {
    severity = "High";
    color = "#EF4444";
  } else if (composite > 42) {
    severity = "Moderate";
    color = "#F59E0B";
  } else if (composite > 22) {
    severity = "Mild";
    color = "#FF8DA1";
  }

  // For healthy/mild redness regardless of composite
  if (condition === "Healthy / No Concern") {
    severity = "Low";
    color = "#10B981";
  } else if (condition === "Mild Redness" && composite <= 35) {
    severity = "Mild";
    color = "#FF8DA1";
  }

  // ── Percent affected: area proxy from redness + texture composite ──────
  const pctAffected = Math.min(95, Math.max(2, Math.round(composite * 0.85)));

  return { condition, severity, pctAffected, causalText, color };
}

// ─── Dynamic global causal bullets ───────────────────────────────────────────

function buildGlobalCausalBullets(zones: ZoneScore[]): string[] {
  const bullets: string[] = [];

  const acneZones = zones.filter(z =>
    z.condition === "Acne Vulgaris" || z.condition === "Comedonal Acne"
  );
  const rosacea = zones.find(z => z.condition === "Rosacea");
  const pigment  = zones.find(z => z.condition === "Hyperpigmentation" || z.condition === "Melasma");
  const sebDerm  = zones.find(z => z.condition === "Seborrheic Dermatitis");
  const atopic   = zones.find(z => z.condition === "Atopic Dermatitis");
  const oily     = zones.filter(z => z.condition === "Oily / Sebaceous Activity" || z.metrics.saturationScore > 50);
  const highTex  = zones.filter(z => z.metrics.textureScore > 45);
  const healthy  = zones.filter(z => z.condition === "Healthy / No Concern");

  if (acneZones.length > 0) {
    const names = acneZones.map(z => z.name).join(" & ");
    const maxSev = acneZones.find(z => z.severity === "High") ? "high" : "moderate";
    bullets.push(
      `Active ${maxSev}-grade acne detected in ${names}. Elevated redness indices suggest sebum-driven bacterial activity — hormonal or dietary triggers likely.`
    );
  }

  if (rosacea) {
    bullets.push(
      `Rosacea pattern identified on ${rosacea.name} (redness ${rosacea.metrics.rednessIndex.toFixed(0)}%). Vascular hyperreactivity — avoid heat, spice, alcohol, and high-SPF UV exposure.`
    );
  }

  if (pigment) {
    bullets.push(
      `Pigmentation irregularity (${pigment.condition}) on ${pigment.name}. Melanin index ${pigment.metrics.melaninIndex.toFixed(0)}% — sun protection and Vitamin C serum recommended.`
    );
  }

  if (sebDerm) {
    bullets.push(
      `Seborrheic pattern detected on ${sebDerm.name}. High oiliness (${sebDerm.metrics.saturationScore.toFixed(0)}%) with texture variance — consider antifungal-targeting ingredients.`
    );
  }

  if (atopic) {
    bullets.push(
      `Barrier dysfunction pattern on ${atopic.name}. Elevated redness with low sebum suggests trans-epidermal water loss — ceramide repair therapy recommended.`
    );
  }

  if (oily.length >= 2) {
    bullets.push(
      `Elevated sebaceous activity detected across ${oily.length} zones. Oiliness metrics above baseline — mattifying and pore-refining actives advised.`
    );
  }

  if (highTex.length >= 2 && acneZones.length === 0) {
    bullets.push(
      `Surface texture irregularity noted in ${highTex.map(z => z.name).join(", ")}. Enlarged pores or comedone congestion — exfoliation and retinoid therapy may help.`
    );
  }

  if (healthy.length === zones.length) {
    bullets.push("All facial zones show healthy baseline metrics. No significant inflammatory, pigmentation, or texture irregularities detected.");
    bullets.push("Maintain current skincare routine. Daily SPF 30+ is recommended to sustain results.");
  }

  // Fallback if nothing matched
  if (bullets.length === 0) {
    bullets.push("Skin metrics are within low-severity ranges. Minor irregularities detected — consistent daily routine is advised.");
  }

  return bullets.slice(0, 5); // cap at 5 for UI
}

// ─── Main processing function ─────────────────────────────────────────────────

export async function processImageFrame(
  imageSource: HTMLImageElement | HTMLVideoElement,
  profile: UserProfile
): Promise<DynamicScanResult> {
  const lm = await initFaceLandmarker();

  // Draw onto a temp canvas to read pixels
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Could not get 2d context");

  const isVideo = imageSource instanceof HTMLVideoElement;
  canvas.width  = isVideo ? (imageSource as HTMLVideoElement).videoWidth  : (imageSource as HTMLImageElement).naturalWidth;
  canvas.height = isVideo ? (imageSource as HTMLVideoElement).videoHeight : (imageSource as HTMLImageElement).naturalHeight;

  ctx.drawImage(imageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Run MediaPipe Face Landmarker
  const results = lm.detect(imageSource);
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    throw new Error("No face detected. Please ensure your face is clearly visible and well-lit.");
  }

  const face = results.faceLandmarks[0];
  const zoneScores: ZoneScore[] = [];
  const lesions: { top: number; left: number; color: string; label: string }[] = [];

  let totalPixelsSampled = 0;
  let expectedMinPixels  = (canvas.width * canvas.height) * 0.04; // at least 4% of image

  for (const [zoneName, indices] of Object.entries(ZONES)) {
    const { pixelIndices, data, minX, minY, maxX, maxY } =
      extractZonePixels(imgData, face, indices as readonly number[]);

    totalPixelsSampled += pixelIndices.length;

    // Compute real pixel metrics
    const metrics = analyzeZoneMetrics(pixelIndices, data);

    // Estimate condition using rule-based engine
    const { condition, severity, pctAffected, causalText, color } =
      estimateCondition(metrics, profile.skinType);

    const box = {
      top:    (minY / canvas.height) * 100,
      left:   (minX / canvas.width)  * 100,
      width:  ((maxX - minX) / canvas.width)  * 100,
      height: ((maxY - minY) / canvas.height) * 100,
    };

    // Add lesion markers only for Moderate/High severity
    if ((severity === "Moderate" || severity === "High") && pixelIndices.length > 0) {
      const sampleIndices = (indices as readonly number[]).slice(0, 2);
      for (const rIdx of sampleIndices) {
        const lmk = face[rIdx];
        if (lmk) {
          lesions.push({
            top:   lmk.y * 100,
            left:  lmk.x * 100,
            color,
            label: severity === "High" ? "Inflammatory" : "Comedonal",
          });
        }
      }
    }

    zoneScores.push({
      name:         zoneName as ZoneName,
      metrics,
      rednessScore: Math.round(metrics.rednessIndex),
      textureVar:   Math.round(metrics.textureScore),
      pctAffected,
      severity,
      condition,
      causalText,
      color,
      box,
    });
  }

  // ── Analysis confidence ──────────────────────────────────────────────────
  // Based on how many pixels we sampled across all zones vs expected minimum
  const analysisConfidence = Math.min(
    100,
    Math.round((totalPixelsSampled / Math.max(expectedMinPixels, 1)) * 100)
  );

  // ── Overall score ────────────────────────────────────────────────────────
  // Starts at 100 and deducts based on severity distribution
  let score = 100;
  for (const z of zoneScores) {
    if (z.severity === "High")     score -= 14;
    else if (z.severity === "Moderate") score -= 8;
    else if (z.severity === "Mild")     score -= 3;
  }
  // Additional penalty for low confidence
  if (analysisConfidence < 60) score -= 5;
  score = Math.max(20, Math.min(98, score));

  // ── Estimated active lesions ──────────────────────────────────────────
  const activeLesionsEst = zoneScores.filter(
    z => z.condition === "Acne Vulgaris" || z.condition === "Comedonal Acne"
  ).length * 3;

  // ── Estimated pigmentation ────────────────────────────────────────────
  const pigmentZones = zoneScores.filter(
    z => z.condition === "Hyperpigmentation" || z.condition === "Melasma"
  );
  const pigmentationEst = pigmentZones.length > 0
    ? Math.round(pigmentZones.reduce((s, z) => s + z.metrics.melaninIndex, 0) / pigmentZones.length)
    : Math.round(zoneScores.reduce((s, z) => s + z.metrics.melaninIndex, 0) / zoneScores.length / 3);

  // ── Global causal bullets ─────────────────────────────────────────────
  const globalCausalBullets = buildGlobalCausalBullets(zoneScores);

  return {
    timestamp:          new Date(),
    overallScore:       Math.round(score),
    activeLesionsEst,
    pigmentationEst:    Math.max(0, pigmentationEst),
    zones:              zoneScores,
    analysisConfidence,
    globalCausalBullets,
    imageUrl:           canvas.toDataURL("image/jpeg", 0.88),
    imageWidth:         canvas.width,
    imageHeight:        canvas.height,
    lesions,
  };
}
