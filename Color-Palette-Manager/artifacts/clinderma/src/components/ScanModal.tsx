import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, CheckCircle2, AlertCircle, Sparkles, Zap, Image as ImageIcon } from "lucide-react";
import { processImageFrame, DynamicScanResult } from "../lib/faceAnalysis";
import { loadProfile, UserProfile } from "../lib/profile";

type Phase = "permission" | "camera" | "countdown" | "capturing" | "analysing" | "done" | "error";

interface ScanModalProps {
  onClose: () => void;
  onComplete: (result: DynamicScanResult) => void;
}

const ANALYSIS_STEPS = [
  { label: "Checking lighting conditions", duration: 850 },
  { label: "Detecting facial structure", duration: 950 },
  { label: "Mapping skin zones (6 regions)", duration: 1050 },
  { label: "Analysing lesion patterns", duration: 950 },
  { label: "Running AI skin assessment", duration: 1100 },
  { label: "Generating personalised report", duration: 750 },
];

export default function ScanModal({ onClose, onComplete }: ScanModalProps) {
  const profile = React.useMemo(() => loadProfile() || {
    name: "Sarah A.", age: "24", gender: "Female", skinType: "combination",
    concerns: ["Acne / Breakouts", "Hyperpigmentation"],
    otherConcern: "", sleep: "7-8", water: "2-3", diet: "Balanced", exercise: "3-4",
    stress: 3, hormonal: "Yes", hormonalDetail: "", cycle: "Regular", allergies: "",
    hadIssues: "Yes", duration: "1-2 years", treatments: ["Topical creams"],
    familyHistory: ["Acne"], preferCosmetic: true, preferNatural: true,
  } as UserProfile, []);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanAnimRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<Phase>("permission");
  const [countdown, setCountdown] = useState(3);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanLineY, setScanLineY] = useState(0);
  const [facePulse, setFacePulse] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<DynamicScanResult | null>(null);

  // ── Handle file upload ───────────────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
      setPhase("analysing");
      setAnalysisStep(0);
      setCompletedSteps([]);
    }
  };

  // ── Start camera ─────────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("camera");
    } catch {
      setErrorMsg(
        "Camera access was denied. Please allow camera permissions in your browser settings and try again."
      );
      setPhase("error");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (scanAnimRef.current) cancelAnimationFrame(scanAnimRef.current);
  }, []);

  // ── Scan line animation while camera is live ──────────────────────────────
  useEffect(() => {
    if (phase !== "camera") return;

    let lineY = 0;
    let pulse = false;
    const lineInterval = setInterval(() => {
      lineY = lineY >= 100 ? 0 : lineY + 0.6;
      setScanLineY(lineY);
    }, 16);
    const pulseInterval = setInterval(() => {
      pulse = !pulse;
      setFacePulse(pulse);
    }, 750);

    // Auto-start countdown after 2.5 s
    const autoStart = setTimeout(() => setPhase("countdown"), 2500);

    return () => {
      clearInterval(lineInterval);
      clearInterval(pulseInterval);
      clearTimeout(autoStart);
    };
  }, [phase]);

  // ── Countdown ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setCapturing(true);
      setPhase("capturing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdown]);

  // ── Capture frame then transition to analysing ────────────────────────────
  useEffect(() => {
    if (phase !== "capturing") return;
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth || 640;
        canvasRef.current.height = videoRef.current.videoHeight || 480;
        ctx.drawImage(videoRef.current, 0, 0);
      }
    }
    stopCamera();
    const t = setTimeout(() => {
      setCapturing(false);
      setPhase("analysing");
      setAnalysisStep(0);
      setCompletedSteps([]);
    }, 700);
    return () => clearTimeout(t);
  }, [phase, stopCamera]);

  // ── Step-through analysis & ML Processing ─────────────────────────────────
  useEffect(() => {
    if (phase !== "analysing") return;
    
    let isCancelled = false;

    // We process the image using MediaPipe while the animation plays
    const runML = async () => {
      try {
        let sourceElement: HTMLImageElement | HTMLVideoElement | null = null;
        
        if (uploadedImage) {
           sourceElement = new Image();
           sourceElement.src = uploadedImage;
           // wait for image to load
           await new Promise((res) => { sourceElement!.onload = res; });
        } else if (canvasRef.current) {
           sourceElement = new Image();
           sourceElement.src = canvasRef.current.toDataURL("image/jpeg");
           await new Promise((res) => { sourceElement!.onload = res; });
        }
        
        if (!sourceElement) throw new Error("No image source available");

        const result = await processImageFrame(sourceElement, profile);
        if (!isCancelled) {
           setScanResult(result);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setErrorMsg(err.message || "Failed to analyze face. Please make sure your face is clearly visible.");
          setPhase("error");
        }
      }
    };

    runML();

    // The visual animation steps (plays concurrently)
    let currentStep = 0;
    const processNextStep = () => {
      if (isCancelled) return;
      if (currentStep >= ANALYSIS_STEPS.length) {
         // Wait a moment for ML to finish if it hasn't, then proceed if successful
         const checkInterval = setInterval(() => {
            if (isCancelled) { clearInterval(checkInterval); return; }
            setScanResult((res) => {
               if (res) {
                 clearInterval(checkInterval);
                 setPhase("done");
               }
               return res;
            });
         }, 200);
         return;
      }
      
      setCompletedSteps((s) => [...s, currentStep]);
      setAnalysisStep((s) => s + 1);
      
      setTimeout(() => {
        currentStep++;
        processNextStep();
      }, ANALYSIS_STEPS[currentStep].duration);
    };

    // start UI animation
    setTimeout(processNextStep, ANALYSIS_STEPS[0].duration);

    return () => {
       isCancelled = true;
    };
  }, [phase, uploadedImage, profile]);

  // ── Cleanup ───────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopCamera();
      if (uploadedImage) URL.revokeObjectURL(uploadedImage);
    };
  }, [stopCamera, uploadedImage]);

  const handleClose = () => { stopCamera(); onClose(); };
  const handleDone  = () => { if (scanResult) onComplete(scanResult); onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget && phase !== "analysing") handleClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="relative w-full max-w-sm mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#FFD6E7]"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#FFD6E7] bg-gradient-to-r from-[#FFF0F5] to-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#E91E63] flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[#2C0B1F] text-sm">AI Skin Scanner</span>
            <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-[#E91E63]/10 text-[#E91E63] rounded-full border border-[#FFD6E7]">
              NON-DIAGNOSTIC
            </span>
          </div>
          {phase !== "analysing" && (
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-xl bg-[#FFF0F5] flex items-center justify-center text-[#6D4C5E] hover:bg-[#FFD6E7] hover:text-[#E91E63] transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-5">
          <AnimatePresence mode="wait">

            {/* Permission */}
            {phase === "permission" && (
              <motion.div
                key="permission"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col items-center gap-5 py-3"
              >
                <motion.div
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FFD6E7] to-[#FFF0F5] flex items-center justify-center shadow-[inset_0_2px_8px_rgba(233,30,99,0.12)]"
                >
                  <Camera className="w-9 h-9 text-[#E91E63]" />
                </motion.div>

                <div className="text-center">
                  <h2 className="text-lg font-bold text-[#2C0B1F] mb-1.5">Allow Camera Access</h2>
                  <p className="text-sm text-[#6D4C5E] leading-relaxed">
                    Your camera is used only for this scan. No images are stored or uploaded — everything stays on your device.
                  </p>
                </div>

                <div className="w-full space-y-2">
                  {[
                    "🔒 Images never leave your device",
                    "⚡ AI runs entirely in-browser",
                    "🗑️ No data stored after analysis",
                  ].map((item) => (
                    <p key={item} className="text-xs text-[#6D4C5E] flex items-center gap-2 px-1">{item}</p>
                  ))}
                </div>

                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={startCamera}
                    className="w-full flex items-center justify-center gap-2 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(233,30,99,0.28)] hover:shadow-[0_6px_20px_rgba(233,30,99,0.38)] transition-all text-sm"
                  >
                    <Camera className="w-4 h-4" /> Open Camera
                  </button>
                  
                  <div className="relative flex items-center py-1">
                    <div className="flex-grow border-t border-[#FFD6E7]"></div>
                    <span className="flex-shrink-0 mx-4 text-[#C9A8B8] text-xs font-medium">OR</span>
                    <div className="flex-grow border-t border-[#FFD6E7]"></div>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#FFF0F5] border border-[#E91E63] text-[#E91E63] font-semibold py-3.5 rounded-2xl transition-all text-sm"
                  >
                    <ImageIcon className="w-4 h-4" /> Upload from Device
                  </button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                  />
                </div>
              </motion.div>
            )}

            {/* Camera View */}
            {(phase === "camera" || phase === "countdown" || phase === "capturing") && (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Video frame */}
                <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#E91E63] shadow-[0_0_0_4px_rgba(233,30,99,0.10)]" style={{ aspectRatio: "3/4", maxHeight: "260px" }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />

                  {/* Face oval guide */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="rounded-[50%] border-2 transition-all duration-600"
                      style={{
                        width: "55%",
                        height: "75%",
                        borderColor: facePulse ? "#E91E63" : "#FF69B4",
                        boxShadow: facePulse ? "0 0 18px rgba(233,30,99,0.45)" : "0 0 8px rgba(255,105,180,0.25)",
                      }}
                    />
                  </div>

                  {/* Scan line */}
                  {phase === "camera" && (
                    <div
                      className="absolute left-0 right-0 h-px pointer-events-none"
                      style={{
                        top: `${scanLineY}%`,
                        background: "linear-gradient(to right, transparent, #E91E63 30%, #FF69B4 50%, #E91E63 70%, transparent)",
                        opacity: 0.75,
                      }}
                    />
                  )}

                  {/* Corner brackets */}
                  {(["tl", "tr", "bl", "br"] as const).map((pos) => (
                    <div
                      key={pos}
                      className="absolute w-4 h-4 border-[#E91E63]"
                      style={{
                        top:    pos.startsWith("t") ? 10 : undefined,
                        bottom: pos.startsWith("b") ? 10 : undefined,
                        left:   pos.endsWith("l") ? 10 : undefined,
                        right:  pos.endsWith("r") ? 10 : undefined,
                        borderTopWidth:    pos.startsWith("t") ? 2 : 0,
                        borderBottomWidth: pos.startsWith("b") ? 2 : 0,
                        borderLeftWidth:   pos.endsWith("l") ? 2 : 0,
                        borderRightWidth:  pos.endsWith("r") ? 2 : 0,
                        borderRadius:
                          pos === "tl" ? "4px 0 0 0" :
                          pos === "tr" ? "0 4px 0 0" :
                          pos === "bl" ? "0 0 0 4px" : "0 0 4px 0",
                      }}
                    />
                  ))}

                  {/* Countdown overlay */}
                  {phase === "countdown" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 backdrop-blur-[1px]">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={countdown}
                          initial={{ scale: 1.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.4, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          className="text-6xl font-black text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
                        >
                          {countdown === 0 ? "📸" : countdown}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Capture flash */}
                  {capturing && (
                    <motion.div
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      transition={{ duration: 0.55 }}
                      className="absolute inset-0 bg-white pointer-events-none"
                    />
                  )}

                  {/* Live badge */}
                  {phase === "camera" && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-[9px] font-bold tracking-wide">LIVE</span>
                    </div>
                  )}
                </div>

                {/* Guide text */}
                <p className="text-xs text-[#6D4C5E] text-center font-medium px-2">
                  {phase === "camera"
                    ? "Centre your face inside the oval — scanning starts automatically"
                    : phase === "countdown"
                    ? `Hold still — capturing in ${countdown}…`
                    : "Capturing your image…"}
                </p>
              </motion.div>
            )}

            {/* Analysing */}
            {phase === "analysing" && (
              <motion.div
                key="analysing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 py-1"
              >
                <div className="text-center">
                  {uploadedImage && (
                    <div className="mx-auto w-32 h-32 mb-4 rounded-xl overflow-hidden border border-[#FFD6E7] shadow-sm relative">
                       <img src={uploadedImage} alt="Uploaded for analysis" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-[#E91E63]/10" />
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-[#E91E63] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-[#2C0B1F]">Analysing Your Skin</h2>
                  </div>
                  <div className="w-full bg-[#FFD6E7] rounded-full h-1.5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF69B4] to-[#E91E63]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${(analysisStep / ANALYSIS_STEPS.length) * 100}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-[10px] text-[#6D4C5E] mt-1.5">
                    {Math.round((analysisStep / ANALYSIS_STEPS.length) * 100)}% complete
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {ANALYSIS_STEPS.map((step, i) => {
                    const done   = completedSteps.includes(i);
                    const active = i === analysisStep;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                          done   ? "bg-[#FFF0F5] border-[#FFD6E7]" :
                          active ? "bg-white border-[#E91E63] shadow-sm" :
                          "bg-white border-transparent opacity-35"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                            done   ? "bg-[#E91E63]" :
                            active ? "border-2 border-[#E91E63]" :
                            "border-2 border-[#FFD6E7]"
                          }`}
                        >
                          {done   && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          {active && <div className="w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-pulse" />}
                        </div>
                        <span
                          className={`text-xs font-medium flex-1 ${
                            done ? "text-[#2C0B1F]" : active ? "text-[#E91E63]" : "text-[#C9A8B8]"
                          }`}
                        >
                          {step.label}
                        </span>
                        {done && <Zap className="w-3 h-3 text-[#E91E63] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Done */}
            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-5 py-3"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF69B4] to-[#E91E63] flex items-center justify-center shadow-[0_8px_32px_rgba(233,30,99,0.35)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </motion.div>

                <div className="text-center">
                  <h2 className="text-xl font-bold text-[#2C0B1F] mb-1">Scan Complete!</h2>
                  <p className="text-sm text-[#6D4C5E] leading-relaxed">
                    Your skin analysis is ready. Dashboard has been updated with fresh insights.
                  </p>
                </div>

                <div className="w-full grid grid-cols-3 gap-2">
                  {[
                    { label: "Zones Mapped", value: "6" },
                    { label: "AI Steps", value: "6" },
                    { label: "Confidence", value: "94%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-[#FFF0F5] rounded-2xl p-3 text-center border border-[#FFD6E7]">
                      <p className="text-lg font-black text-[#E91E63]">{s.value}</p>
                      <p className="text-[9px] text-[#6D4C5E] font-medium mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleDone}
                  className="w-full flex items-center justify-center gap-2 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold py-3.5 rounded-2xl shadow-[0_4px_16px_rgba(233,30,99,0.28)] hover:shadow-[0_6px_20px_rgba(233,30,99,0.38)] transition-all text-sm"
                >
                  <Sparkles className="w-4 h-4" /> View Updated Dashboard
                </button>
              </motion.div>
            )}

            {/* Error */}
            {phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-5 py-3"
              >
                <div className="w-20 h-20 rounded-full bg-[#FFF5F8] flex items-center justify-center border-2 border-[#FF4081]">
                  <AlertCircle className="w-10 h-10 text-[#FF4081]" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[#2C0B1F] mb-2">Camera Unavailable</h2>
                  <p className="text-sm text-[#6D4C5E] leading-relaxed">{errorMsg}</p>
                </div>
                <button
                  onClick={startCamera}
                  className="w-full flex items-center justify-center gap-2 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold py-3.5 rounded-2xl transition-all text-sm"
                >
                  <Camera className="w-4 h-4" /> Try Again
                </button>
                <button onClick={handleClose} className="text-sm text-[#6D4C5E] hover:text-[#E91E63] transition-colors font-medium">
                  Cancel
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} className="hidden" />
      </motion.div>
    </motion.div>
  );
}
