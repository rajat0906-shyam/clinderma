import { FaceLandmarker, FilesetResolver, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { UserProfile } from "./profile";

// Zone definitions mapping specific Face Mesh landmarks 
// For simplicity, we create rough polygons
export const ZONES = {
  Forehead: [10, 109, 67, 103, 332, 297, 338],
  "Left Cheek": [127, 234, 132, 58, 172, 136, 150, 149],  
  "Right Cheek": [356, 454, 361, 288, 397, 365, 379, 378],
  Nose: [8, 411, 275, 4, 45, 187],
  Chin: [150, 149, 176, 148, 152, 377, 400, 378, 379]
} as const;

export type ZoneName = keyof typeof ZONES;

export interface ZoneScore {
  name: ZoneName;
  rednessScore: number;     // 0-100 derived from Red/Green ratio variance
  textureVar: number;       // 0-100 derived from luminance standard deviation
  severity: "Low" | "Mild" | "Moderate" | "High";
  color: string;            // UI hex color based on severity
}

export interface DynamicScanResult {
  timestamp: Date;
  overallScore: number;
  activeLesionsEst: number;
  pigmentationEst: number;
  zones: ZoneScore[];
}

let landmarker: FaceLandmarker | null = null;

export async function initFaceLandmarker() {
  if (landmarker) return landmarker;
  
  // Use public unpkg CDN for the wasm files, required by mediapipe
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
  );
  
  landmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU"
    },
    outputFaceBlendshapes: false,
    runningMode: "IMAGE",
    numFaces: 1
  });
  
  return landmarker;
}

// Extract the pixel data inside the polygon area mapped by landmarks
function extractZonePixels(
  ctx: CanvasRenderingContext2D,
  imgData: ImageData,
  landmarks: NormalizedLandmark[],
  indices: number[]
) {
  const w = imgData.width;
  const h = imgData.height;
  
  const polygon = indices.map(i => {
    const lm = landmarks[i];
    return { x: lm.x * w, y: lm.y * h };
  });

  // Calculate bounding box for the polygon
  let minX = w, minY = h, maxX = 0, maxY = 0;
  polygon.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  });

  minX = Math.floor(Math.max(0, minX));
  minY = Math.floor(Math.max(0, minY));
  maxX = Math.ceil(Math.min(w, maxX));
  maxY = Math.ceil(Math.min(h, maxY));

  // Not mathematically perfect polygon clipping in a loop due to performance,
  // simply grabbing the bounding box of the zone and extracting pixels
  const rawIdx = [];
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const idx = (y * w + x) * 4;
      // skip completely transparent if any
      if (imgData.data[idx+3] > 0) {
         rawIdx.push(idx);
      }
    }
  }
  return { pixelIndices: rawIdx, data: imgData.data };
}

// Calculate heuristics:
// Redness = Average (R / (G + 1))
// Luminance Var = StdDev of (0.299*R + 0.587*G + 0.114*B)
function analyzeZone(pixels: number[], data: Uint8ClampedArray) {
  if (pixels.length === 0) return { redness: 0, variance: 0 };
  
  let totalLuminance = 0;
  let totalRedRatio = 0;
  const luminances = [];

  for (const idx of pixels) {
    const r = data[idx];
    const g = data[idx+1];
    const b = data[idx+2];
    
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    luminances.push(lum);
    totalLuminance += lum;
    
    // redness ratio
    totalRedRatio += r / (g || 1);
  }

  const avgLum = totalLuminance / pixels.length;
  const avgRedRatio = totalRedRatio / pixels.length;

  let varSum = 0;
  for (const lum of luminances) {
    varSum += Math.pow(lum - avgLum, 2);
  }
  
  const variance = Math.sqrt(varSum / pixels.length);
  
  return { redness: avgRedRatio, variance };
}

export async function processImageFrame(
  imageSource: HTMLImageElement | HTMLVideoElement,
  profile: UserProfile
): Promise<DynamicScanResult> {
  const lm = await initFaceLandmarker();
  
  // Set up canvas to draw the image and extract pixels
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  
  if (!ctx) throw new Error("Could not get 2d context");

  const isVideo = imageSource instanceof HTMLVideoElement;
  canvas.width = isVideo ? imageSource.videoWidth : (imageSource as HTMLImageElement).width;
  canvas.height = isVideo ? imageSource.videoHeight : (imageSource as HTMLImageElement).height;
  
  ctx.drawImage(imageSource, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const results = lm.detect(imageSource);
  
  // Default fallback if no face detected
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
     throw new Error("No face detected in the image/feed");
  }

  const face = results.faceLandmarks[0];
  const zoneScores: ZoneScore[] = [];
  
  let totalVar = 0;
  let totalRed = 0;

  for (const [zoneName, indices] of Object.entries(ZONES)) {
    const { pixelIndices, data } = extractZonePixels(ctx, imgData, face, indices);
    const { redness, variance } = analyzeZone(pixelIndices, data);
    
    totalVar += variance;
    totalRed += redness;

    // Normalization heuristics (roughly tuned for webcam data)
    // Redness ratio is usually 1.1 to 1.8. 
    // Variance is usually 5 to 30.
    const normRedness = Math.min(100, Math.max(0, (redness - 1.2) * 200));
    const normVar = Math.min(100, (variance / 30) * 100);
    
    // Combine to establish a severity score based on the image features PLUS profile age/type
    let severityValue = (normRedness * 0.4) + (normVar * 0.6);
    
    // Heuristic: Oily skin increases likelihood of higher texture readouts being severe
    if (profile.skinType === "oily" || profile.skinType === "combination") severityValue *= 1.15;
    
    let severity: "Low" | "Mild" | "Moderate" | "High" = "Low";
    let color = "#FF8DA1";
    
    if (severityValue > 65) { severity = "High"; color = "#E91E63"; }
    else if (severityValue > 40) { severity = "Moderate"; color = "#FF4081"; }
    else if (severityValue > 20) { severity = "Mild"; color = "#FF8DA1"; }
    
    zoneScores.push({
      name: zoneName as ZoneName,
      rednessScore: normRedness,
      textureVar: normVar,
      severity,
      color
    });
  }

  // Calculate global dashboard metrics from the heuristic averages
  const avgVar = totalVar / 5;
  const avgRed = totalRed / 5;

  // Derive lesions count from texture variance
  const estimatedLesions = Math.floor(Math.max(0, (avgVar - 8) / 2));
  
  // Derive pigmentation from redness variance and baseline logic
  const estimatedPigment = Math.floor(Math.min(45, (avgRed - 1.2) * 50));

  let score = 100;
  score -= estimatedLesions * 4;
  score -= estimatedPigment * 0.5;
  score = Math.max(25, Math.min(98, score));

  return {
    timestamp: new Date(),
    overallScore: Math.round(score),
    activeLesionsEst: estimatedLesions,
    pigmentationEst: Math.max(0, estimatedPigment),
    zones: zoneScores
  };
}
