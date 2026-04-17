import React from "react";
import { useLocation } from "wouter";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { ArrowLeft } from "lucide-react";

export default function GenericPage({ title, description }: { title: string, description?: string }) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
        <div className="bg-white px-12 py-16 rounded-[40px] border border-slate-200/50 shadow-sm max-w-2xl w-full">
           <h1 className="text-4xl font-bold text-slate-900 mb-4">{title}</h1>
           <p className="text-lg text-slate-500 mb-10">
             {description || "This page mirrors the exact structure of Haut.ai. Content goes here."}
           </p>
           
           <button 
             onClick={() => navigate("/")}
             className="px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors inline-flex items-center gap-2"
           >
             <ArrowLeft className="w-4 h-4" />
             Back to Homepage
           </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
