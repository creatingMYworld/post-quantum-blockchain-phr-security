"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Menu, X, Hexagon } from "lucide-react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/50 backdrop-blur-lg border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-10 h-10">
              <Hexagon className="absolute text-sky-500 w-full h-full animate-[spin_10s_linear_infinite]" strokeWidth={1} />
              <Shield className="relative text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-widest text-[#f8fafc]">
              AEGIS<span className="text-sky-500">.</span>PHR
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {['Technology', 'Platform', 'Security', 'Company'].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium text-sm transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-sky-500 transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:block">
            <Link 
              href="/login"
              className="relative inline-flex h-10 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-6 py-1 text-sm font-medium text-white backdrop-blur-3xl transition-all hover:bg-slate-900">
                Launch App
              </span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-400 hover:text-white focus:outline-none p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-[#030712] border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {['Technology', 'Platform', 'Security', 'Company'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              >
                {item}
              </Link>
            ))}
            <Link 
              href="/login"
              className="block w-full text-center mt-4 bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 rounded-md transition-colors"
            >
              Launch App
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
