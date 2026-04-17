import React, { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [, navigate] = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const products = [
    { title: "AI Skin Analysis", link: "/product/ai-skin-analysis" },
    { title: "Skin.Chat", link: "/product/skinchat" },
    { title: "SkinGPT", link: "/product/skingpt" },
    { title: "Face Analysis 3.0", link: "/product/face-skin-analysis" },
  ];

  const resources = [
    { title: "Research Papers", link: "/research/all" },
    { title: "Blogs & News", link: "/blog/all" },
    { title: "Content & Project Hub", link: "/projects" },
  ];

  const company = [
    { title: "Careers", link: "/company/careers" },
    { title: "Partners", link: "/partners" },
  ];

  const DropdownPanel = ({ items, isOpen }: { items: {title: string, link: string}[], isOpen: boolean }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-12 left-0 w-64 bg-white border border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.08)] rounded-2xl py-2 z-50"
        >
          {items.map((item) => (
            <div
              key={item.title}
              onClick={() => {
                navigate(item.link);
                setActiveDropdown(null);
              }}
              className="px-5 py-3 hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-medium cursor-pointer transition-colors"
            >
              {item.title}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <nav className="w-full flex items-center justify-between px-8 py-5 bg-white sticky top-0 z-50 border-b border-gray-100/50">
      <div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="flex items-center justify-center p-2 rounded-xl bg-blue-600 text-white shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">Clinderma</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        
        {/* Products */}
        <div 
          className="relative flex items-center gap-1 cursor-pointer text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm group h-full py-2"
          onMouseEnter={() => setActiveDropdown('products')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          Products <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'products' ? 'rotate-180' : ''}`} />
          <DropdownPanel items={products} isOpen={activeDropdown === 'products'} />
        </div>

        {/* Pricing */}
        <div 
          onClick={() => navigate("/pricing")}
          className="cursor-pointer text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm py-2"
        >
          Pricing
        </div>

        {/* Resources */}
        <div 
          className="relative flex items-center gap-1 cursor-pointer text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm group h-full py-2"
          onMouseEnter={() => setActiveDropdown('resources')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          Resources <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
          <DropdownPanel items={resources} isOpen={activeDropdown === 'resources'} />
        </div>

        {/* Company */}
        <div 
          className="relative flex items-center gap-1 cursor-pointer text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm group h-full py-2"
          onMouseEnter={() => setActiveDropdown('company')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          Company <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
          <DropdownPanel items={company} isOpen={activeDropdown === 'company'} />
        </div>

        {/* Contacts */}
        <div 
           onClick={() => navigate("/contacts")}
           className="cursor-pointer text-slate-600 hover:text-blue-600 transition-colors font-medium text-sm py-2"
        >
          Contacts
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate("/auth?mode=login")}
          className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
        >
          Log in
        </button>
        <button 
          onClick={() => navigate("/dashboard")}
          className="px-5 py-2.5 rounded-full border border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition-colors shadow-sm"
        >
          Book a demo
        </button>
      </div>
    </nav>
  );
}
