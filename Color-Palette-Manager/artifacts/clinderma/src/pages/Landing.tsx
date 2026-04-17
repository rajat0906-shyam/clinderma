import React from "react";
import { useLocation } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Box, BarChart3, ShieldCheck, Cpu } from "lucide-react";
import { Navbar } from "../components/public/Navbar";
import { Footer } from "../components/public/Footer";

export default function Landing() {
  const [, navigate] = useLocation();
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="w-full relative px-6 pt-16 pb-24 md:pt-32 md:pb-40 overflow-hidden bg-slate-50">
          <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col gap-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 text-blue-700 text-sm font-semibold border border-blue-200/50 w-max">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                Next Generation Skin Intelligence
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                The Skincare AI Platform for Beauty Brands
              </h1>
              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg mt-2">
                Empower your customers with instant, highly accurate visual skin assessments. Enhance digital experiences and personalize skincare journeys.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
                <button 
                  onClick={() => navigate("/dashboard")}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all shadow-[0_8px_24px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 group"
                >
                  Try Live Demo
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => navigate("/pricing")}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 font-semibold text-lg transition-all shadow-sm"
                >
                  View Pricing
                </button>
              </div>
            </motion.div>

            {/* Hero Image / Visualization */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative h-[500px] w-full rounded-[40px] shadow-2xl relative bg-gradient-to-br from-blue-100 to-indigo-50 border border-white/60 overflow-hidden flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-blue-500/10 mix-blend-multiply" />
              
              {/* Dynamic decorative blobs */}
              <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-blue-400 blur-3xl opacity-30 animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-indigo-400 blur-3xl opacity-20" />

              <motion.div style={{ y }} className="relative z-10 w-full h-full flex items-center justify-center">
                 {/* Fake Face / Graphic to simulate Haut.ai hero */}
                 <div className="w-[60%] h-[75%] bg-white/40 backdrop-blur-md rounded-[100px] border border-white/50 shadow-xl relative flex items-center justify-center">
                    <div className="w-[85%] h-[90%] bg-gradient-to-b from-[#F5E1D4] to-[#E9D0C0] rounded-[80px] shadow-inner relative overflow-hidden">
                       {/* Face scanning lines */}
                       <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50 blur-sm animate-scan" style={{
                         animation: 'scan 3s ease-in-out infinite',
                       }} />
                       <style dangerouslySetInnerHTML={{__html: `
                          @keyframes scan {
                            0% { transform: translateY(0); }
                            50% { transform: translateY(300px); }
                            100% { transform: translateY(0); }
                          }
                       `}} />
                    </div>

                    {/* Glassmorphism Chips */}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 }}
                      className="absolute top-16 -left-12 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg border border-white/50"
                    >
                      <p className="text-xs text-slate-500 font-semibold mb-1">Redness</p>
                      <div className="flex items-end gap-2">
                         <span className="text-2xl font-black text-slate-900 leading-none">85</span>
                         <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold mb-0.5">Good</span>
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.2 }}
                      className="absolute bottom-20 -right-12 bg-white/80 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-lg border border-white/50"
                    >
                      <p className="text-xs text-slate-500 font-semibold mb-1">Pores</p>
                      <div className="flex items-end gap-2">
                         <span className="text-2xl font-black text-slate-900 leading-none">91</span>
                         <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold mb-0.5">Excellent</span>
                      </div>
                    </motion.div>
                 </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* BRANDS / TRUST SECTION */}
        <section className="w-full py-10 bg-white border-y border-slate-200/50">
          <div className="max-w-[1200px] mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-slate-400 mb-6 uppercase tracking-wider">Trusted by industry leaders</p>
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20 opacity-50 grayscale">
              <div className="text-xl font-black font-serif">L'OREAL</div>
              <div className="text-xl font-bold tracking-widest text-slate-800">BEIERSDORF</div>
              <div className="text-lg font-black italic">CLARKS</div>
              <div className="text-xl font-bold font-serif">Ulta Beauty</div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section className="w-full py-32 bg-slate-50">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Cutting-edge algorithms, seamlessly integrated</h2>
              <p className="text-lg text-slate-600">Give your users clinical-level insights directly from their smartphone camera. Our API pipeline does the heavy lifting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { icon: BarChart3, title: "15+ Skin Metrics", desc: "Detect redness, pigmentation, pores, hydration levels and fine lines simultaneously." },
                { icon: Cpu, title: "On-Device Processing", desc: "Optimised Edge AI ensures rapid inference times without immense server costs." },
                { icon: ShieldCheck, title: "Privacy-First GDPR", desc: "Image arrays never leave the user's browser, maintaining total data sovereignty." }
              ].map((f, i) => (
                <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200/60 shadow-sm hover:shadow-xl transition-shadow group">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="w-full py-32 bg-blue-600 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full border-[100px] border-white translate-x-1/3 -translate-y-1/3" />
           </div>
           <div className="max-w-[1200px] mx-auto px-6 relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to upgrade your digital experience?</h2>
              <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join the ecosystem of brands leveraging Clinderma's vision algorithms to drive 3x higher product engagement.</p>
              <button 
                onClick={() => navigate("/dashboard")}
                className="px-8 py-4 rounded-full bg-white text-blue-600 font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-2 mx-auto"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5" />
              </button>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
