import React from "react";
import { Sparkles, Linkedin, Twitter, Instagram } from "lucide-react";
import { useLocation } from "wouter";

export function Footer() {
  const [, navigate] = useLocation();
  return (
    <footer className="w-full bg-[#0F172A] text-slate-400 py-16 px-8 mt-auto">
      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white">
            <div className="flex items-center justify-center p-1.5 rounded-lg bg-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold text-xl tracking-tight">Clinderma</span>
          </div>
          <p className="text-sm text-slate-400 max-w-[200px] leading-relaxed">
            The Skincare AI Platform for Beauty Brands & Professionals
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Linkedin className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Twitter className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
            <Instagram className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Products</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li onClick={() => navigate("/product/ai-skin-analysis")} className="hover:text-blue-400 cursor-pointer transition-colors">AI Skin Analysis</li>
            <li onClick={() => navigate("/product/skinchat")} className="hover:text-blue-400 cursor-pointer transition-colors">Skin.Chat</li>
            <li onClick={() => navigate("/product/skingpt")} className="hover:text-blue-400 cursor-pointer transition-colors">SkinGPT</li>
            <li onClick={() => navigate("/product/face-skin-analysis")} className="hover:text-blue-400 cursor-pointer transition-colors">Face Analysis 3.0</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Resources</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li onClick={() => navigate("/research/all")} className="hover:text-blue-400 cursor-pointer transition-colors">Research Papers</li>
            <li onClick={() => navigate("/blog/all")} className="hover:text-blue-400 cursor-pointer transition-colors">Blogs & News</li>
            <li onClick={() => navigate("/projects")} className="hover:text-blue-400 cursor-pointer transition-colors">Content & Project Hub</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4">Company</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li onClick={() => navigate("/company")} className="hover:text-blue-400 cursor-pointer transition-colors">About Us</li>
            <li onClick={() => navigate("/company/careers")} className="hover:text-blue-400 cursor-pointer transition-colors">Careers</li>
            <li onClick={() => navigate("/partners")} className="hover:text-blue-400 cursor-pointer transition-colors">Partners</li>
            <li onClick={() => navigate("/contacts")} className="hover:text-blue-400 cursor-pointer transition-colors">Contacts</li>
          </ul>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-slate-800 text-sm flex flex-col md:flex-row items-center justify-between">
        <p>© 2026 Clinderma. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Non-diagnostic • Educational & aesthetic purposes only</p>
      </div>
    </footer>
  );
}
