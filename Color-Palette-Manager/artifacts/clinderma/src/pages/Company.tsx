import React from "react";
import { Navbar } from "../components/public/Navbar";
import { Footer } from "../components/public/Footer";
import { Globe2, Users2, Shield, HeartHandshake } from "lucide-react";

export default function Company() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-slate-900 text-white py-24 md:py-32 px-6 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 transform translate-x-1/2 -translate-y-1/2" />
           <div className="max-w-[1000px] mx-auto text-center relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Democratizing clinical-grade skin analysis</h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                We believe everyone deserves access to professional dermatological insights. Our mission is to bridge the gap between advanced ML algorithms and everyday skincare routines.
              </p>
           </div>
        </section>

        {/* Values */}
        <section className="py-24 px-6 max-w-[1200px] mx-auto">
           <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Core Values</h2>
              <p className="text-slate-600 max-w-lg mx-auto">The principles that guide our research and product development.</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Shield, title: "Uncompromising Privacy", desc: "Edge-based inference means user data never touches our servers. Pure privacy." },
                { icon: Globe2, title: "Inclusive Datasets", desc: "Trained on the most diverse dataset of skin tones (Fitzpatrick I-VI) to ensure reliable results for everyone." },
                { icon: Users2, title: "Expert Collaboration", desc: "Our algorithms are built alongside board-certified dermatologists and clinicians." },
                { icon: HeartHandshake, title: "Transparent AI", desc: "No black boxes. We show exactly why our ML model reached its conclusion via causal insights." }
              ].map((v, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm flex flex-col gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                    <v.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{v.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{v.desc}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
