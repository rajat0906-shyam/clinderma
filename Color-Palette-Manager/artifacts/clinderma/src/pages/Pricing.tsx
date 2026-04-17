import React from "react";
import { useLocation } from "wouter";
import { Navbar } from "../components/public/Navbar";
import { Footer } from "../components/public/Footer";
import { Check } from "lucide-react";

export default function Pricing() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">Simple, transparent pricing</h1>
          <p className="text-lg text-slate-600">Start for free, then scale as your brand grows. No hidden fees or surprise overages.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
            <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-6">Perfect for independent clinics and small brands testing AI integration.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-slate-900">$0</span>
              <span className="text-slate-500"> /mo</span>
            </div>
            
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                Up to 500 scans per month
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                Standard 15 metrics
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                Basic API access
              </li>
            </ul>

            <button onClick={() => navigate("/dashboard")} className="w-full py-3 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:border-slate-300 transition-colors">
              Start Free
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-blue-600 rounded-3xl p-8 border border-blue-500 shadow-2xl shadow-blue-600/20 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
            <p className="text-sm text-blue-200 mb-6 border-b border-blue-500/50 pb-6">For growing platforms needing high-volume reliable inference.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">$499</span>
              <span className="text-blue-200"> /mo</span>
            </div>
            
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-white">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                Up to 25,000 scans per month
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                Advanced Causal Insights API
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                Remove watermarks
              </li>
              <li className="flex items-start gap-3 text-sm text-white">
                <Check className="w-5 h-5 text-cyan-400 shrink-0" />
                Dedicated Account Manager
              </li>
            </ul>

            <button className="w-full py-3 rounded-full bg-white text-blue-600 font-bold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all">
              Start 14-day Trial
            </button>
          </div>

          {/* Enterprise */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
            <p className="text-sm text-slate-500 mb-6 border-b border-slate-100 pb-6">Custom models and dedicated infrastructure for global beauty brands.</p>
            <div className="mb-8 mt-2">
              <span className="text-3xl font-black text-slate-900">Custom</span>
            </div>
            
            <ul className="flex flex-col gap-4 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                Unlimited volume
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                Custom model training
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                On-premise deployment options
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
                SLA & 24/7 Priority Support
              </li>
            </ul>

            <button className="w-full py-3 rounded-full border-2 border-slate-200 text-slate-900 font-bold hover:border-slate-300 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
