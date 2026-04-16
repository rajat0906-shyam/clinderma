import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowLeft, ArrowRight, Mail, Phone, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function Auth() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const mode = params.get("mode") === "login" ? "login" : "signup";

  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isLogin = mode === "login";

  function validate() {
    const errs: Record<string, string> = {};

    if (method === "email") {
      if (!email.trim()) {
        errs.email = "Email address is required.";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errs.email = "Please enter a valid email address.";
      }
    } else {
      if (!phone.trim()) {
        errs.phone = "Phone number is required.";
      } else if (!/^\+?[\d\s\-]{7,15}$/.test(phone.trim())) {
        errs.phone = "Please enter a valid phone number.";
      }
    }

    if (!password) {
      errs.password = "Password is required.";
    } else if (!isLogin && password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }

    return errs;
  }

  function handleContinue() {
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (isLogin) {
      navigate("/dashboard");
    } else {
      navigate("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF0F5] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[#FFD6E7] opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-[#FFB3CC] opacity-30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md px-6 flex flex-col items-center gap-8"
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 bg-[#E91E63] text-white px-6 py-3 rounded-2xl shadow-[0_6px_24px_rgba(233,30,99,0.28)] cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-xl tracking-tight">Clinderma</span>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(233,30,99,0.12)] border border-[#FFD6E7] p-8 flex flex-col gap-6">

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-[#2C0B1F]">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-[#6D4C5E] text-sm mt-1">
              {isLogin
                ? "Log in to continue your skin health journey."
                : "Enter your details to get started. All fields are required."}
            </p>
          </div>

          {/* Method toggle */}
          <div className="flex rounded-2xl border-2 border-[#FFD6E7] overflow-hidden">
            <button
              onClick={() => { setMethod("email"); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
                method === "email"
                  ? "bg-[#E91E63] text-white"
                  : "bg-white text-[#6D4C5E] hover:bg-[#FFF0F5]"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => { setMethod("phone"); setErrors({}); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
                method === "phone"
                  ? "bg-[#E91E63] text-white"
                  : "bg-white text-[#6D4C5E] hover:bg-[#FFF0F5]"
              }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {method === "email" ? (
                <motion.div
                  key="email"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">
                    Email address <span className="text-[#E91E63]">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); if (submitted) setErrors(v => ({ ...v, email: "" })); }}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-2xl border-2 outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white transition-colors text-sm ${
                      errors.email ? "border-[#FF4081] bg-[#FFF5F8]" : "border-[#FFD6E7] focus:border-[#E91E63]"
                    }`}
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1.5 text-xs text-[#FF4081] mt-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                    </p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">
                    Phone number <span className="text-[#E91E63]">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 rounded-2xl border-2 border-[#FFD6E7] bg-white text-sm text-[#6D4C5E] font-medium whitespace-nowrap">
                      +1
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); if (submitted) setErrors(v => ({ ...v, phone: "" })); }}
                      placeholder="555 000 0000"
                      className={`flex-1 px-4 py-3 rounded-2xl border-2 outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white transition-colors text-sm ${
                        errors.phone ? "border-[#FF4081] bg-[#FFF5F8]" : "border-[#FFD6E7] focus:border-[#E91E63]"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <p className="flex items-center gap-1.5 text-xs text-[#FF4081] mt-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.phone}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2C0B1F] mb-2">
                Password <span className="text-[#E91E63]">*</span>
                {!isLogin && <span className="text-[#6D4C5E] font-normal ml-1">(min. 8 characters)</span>}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (submitted) setErrors(v => ({ ...v, password: "" })); }}
                  placeholder={isLogin ? "Your password" : "Create a strong password"}
                  className={`w-full px-4 py-3 pr-12 rounded-2xl border-2 outline-none text-[#2C0B1F] placeholder-[#C9A8B8] bg-white transition-colors text-sm ${
                    errors.password ? "border-[#FF4081] bg-[#FFF5F8]" : "border-[#FFD6E7] focus:border-[#E91E63]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9A8B8] hover:text-[#E91E63] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-[#FF4081] mt-1.5 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Next step hint */}
          {!isLogin && (
            <div className="flex items-center gap-2 p-3 bg-[#FFF0F5] rounded-2xl border border-[#FFD6E7]">
              <span className="text-xs text-[#6D4C5E]">
                Next: complete your skin profile to personalise your analysis
              </span>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleContinue}
            className="w-full flex items-center justify-center gap-2 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold py-4 rounded-2xl shadow-[0_4px_16px_rgba(233,30,99,0.28)] hover:shadow-[0_6px_20px_rgba(233,30,99,0.38)] transition-all text-base"
          >
            {isLogin ? "Log In" : "Continue to Profile"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Switch mode */}
          <p className="text-center text-sm text-[#6D4C5E]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => navigate(`/auth?mode=${isLogin ? "signup" : "login"}`)}
              className="text-[#E91E63] font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        {/* Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-[#6D4C5E] hover:text-[#E91E63] transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </button>

        <p className="text-[#C9A8B8] text-xs text-center -mt-4">
          Non-diagnostic • Privacy-first • Data never leaves your device
        </p>
      </motion.div>
    </div>
  );
}
