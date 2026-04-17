import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, AlertCircle, ArrowRight, Sparkles } from "lucide-react";

export default function Auth() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialMode = params.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const isLogin = mode === "login";

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setErrors({});
    setSubmitted(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  function validate() {
    const errs: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) {
      errs.password = "Password is required.";
    } else if (!isLogin && password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    }
    if (!isLogin && password !== confirmPassword) {
      errs.confirm = "Passwords do not match.";
    }
    return errs;
  }

  function handleSubmit() {
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
    <div className="min-h-screen flex items-stretch bg-slate-50 font-sans overflow-hidden">
      {/* ── Left panel: brand + decorative ── */}
      <div className="hidden lg:flex flex-col justify-between w-[52%] relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-16 py-12">
        {/* Decorative circles */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full bg-indigo-500/20 pointer-events-none" />
        <div className="absolute -bottom-24 left-24 w-[300px] h-[300px] rounded-full bg-blue-400/15 pointer-events-none" />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 cursor-pointer w-max"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">Clinderma</span>
        </motion.div>

        {/* Hero copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex flex-col gap-6 max-w-sm"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold w-max">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Next Generation Skin Intelligence
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">
            The Skincare&nbsp;AI<br />Platform for<br />Beauty Brands
          </h2>
          <p className="text-blue-200 text-base leading-relaxed">
            Empower your customers with instant, highly accurate visual skin
            assessments and personalised skincare journeys.
          </p>

          {/* Trust badges */}
          <div className="flex flex-col gap-3 mt-2">
            {[
              "Privacy-first · Data never leaves your device",
              "15+ clinical-grade skin metrics",
              "GDPR compliant edge-AI processing",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2.5 text-blue-100 text-sm">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer fine print */}
        <p className="text-blue-300/60 text-xs">© 2025 Clinderma Inc. All rights reserved.</p>
      </div>

      {/* ── Right panel: auth form ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-12 bg-white">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[420px] flex flex-col gap-8"
        >
          {/* Mobile logo */}
          <div
            className="flex lg:hidden items-center gap-2.5 cursor-pointer w-max"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Clinderma</span>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isLogin ? "Welcome back" : "Create an account"}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isLogin
                ? "Sign in to continue your skin health journey."
                : "Get started with Clinderma — it's free."}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="flex flex-col gap-5">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (submitted) setErrors((v) => ({ ...v, email: "" }));
                }}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 rounded-xl border outline-none text-slate-900 placeholder-slate-400 bg-white text-sm transition-all ${
                  errors.email
                    ? "border-red-400 focus:ring-2 focus:ring-red-200"
                    : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                }`}
              />
              {errors.email && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Password
                {!isLogin && (
                  <span className="text-slate-400 font-normal ml-1">(min. 8 characters)</span>
                )}
              </label>
              <div className="relative">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (submitted) setErrors((v) => ({ ...v, password: "" }));
                  }}
                  placeholder={isLogin ? "Your password" : "Create a strong password"}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border outline-none text-slate-900 placeholder-slate-400 bg-white text-sm transition-all ${
                    errors.password
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.password}
                </p>
              )}
            </div>

            {/* Confirm password — signup only */}
            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col gap-1.5 overflow-hidden"
                >
                  <label className="text-sm font-semibold text-slate-700">
                    Confirm password
                  </label>
                  <div className="relative">
                    <input
                      id="auth-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (submitted) setErrors((v) => ({ ...v, confirm: "" }));
                      }}
                      placeholder="Re-enter your password"
                      className={`w-full px-4 py-3 pr-12 rounded-xl border outline-none text-slate-900 placeholder-slate-400 bg-white text-sm transition-all ${
                        errors.confirm
                          ? "border-red-400 focus:ring-2 focus:ring-red-200"
                          : "border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm && (
                    <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.confirm}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot password — login only */}
            {isLogin && (
              <div className="flex justify-end -mt-2">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            id="auth-submit"
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold py-3.5 rounded-xl shadow-[0_4px_20px_rgba(37,99,235,0.30)] hover:shadow-[0_6px_28px_rgba(37,99,235,0.38)] transition-all text-base"
          >
            {isLogin ? "Log In" : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Switch mode link */}
          <p className="text-center text-sm text-slate-500">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(isLogin ? "signup" : "login")}
              className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
            >
              {isLogin ? "Sign up free" : "Log in"}
            </button>
          </p>

          {/* Fine print */}
          <p className="text-center text-xs text-slate-400 leading-relaxed -mt-2">
            Non-diagnostic · Privacy-first · Data never leaves your device
          </p>
        </motion.div>
      </div>
    </div>
  );
}
