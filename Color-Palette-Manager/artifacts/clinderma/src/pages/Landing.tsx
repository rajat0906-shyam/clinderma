import React from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Zap, Heart } from "lucide-react";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center justify-center relative overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#FFD6E7] opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#FFB3CC] opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 rounded-full bg-[#FFF0F5] opacity-60 blur-2xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-10 z-10 w-full max-w-md px-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex items-center gap-3 bg-[#E91E63] text-white px-7 py-4 rounded-3xl shadow-[0_8px_32px_rgba(233,30,99,0.30)]"
          >
            <Sparkles className="w-7 h-7" />
            <span className="font-bold text-3xl tracking-tight">Clinderma</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="text-center"
          >
            <p className="text-[#2C0B1F] font-semibold text-lg tracking-tight">
              AI-Powered Facial Skin Health Screening
            </p>
            <p className="text-[#6D4C5E] text-sm mt-1">
              Intelligent skin analysis, personalised for you
            </p>
          </motion.div>
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {[
            { icon: Zap, label: "AI Analysis" },
            { icon: Shield, label: "Privacy-First" },
            { icon: Heart, label: "Personalised Care" },
          ].map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-full border border-[#FFD6E7] text-[#6D4C5E] text-xs font-medium shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-[#E91E63]" />
              {label}
            </span>
          ))}
        </motion.div>

        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(233,30,99,0.12)] border border-[#FFD6E7] p-8 flex flex-col gap-4"
        >
          <button
            onClick={() => navigate("/auth?mode=login")}
            className="w-full flex items-center justify-center gap-2 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold py-4 rounded-2xl shadow-[0_4px_16px_rgba(233,30,99,0.28)] hover:shadow-[0_6px_20px_rgba(233,30,99,0.38)] transition-all text-base"
          >
            Log In
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate("/auth?mode=signup")}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#FFF0F5] text-[#E91E63] font-semibold py-4 rounded-2xl border-2 border-[#E91E63] hover:border-[#D81B60] transition-all text-base"
          >
            Create Account
          </button>

          <p className="text-center text-xs text-[#6D4C5E] mt-1">
            Non-diagnostic • For skin tracking only • Not a medical service
          </p>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-[#C9A8B8] text-xs text-center"
        >
          Privacy-first — your data never leaves your device
        </motion.p>
      </motion.div>
    </div>
  );
}
