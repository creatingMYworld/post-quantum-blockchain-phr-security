"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lock, Cpu, Database, Network } from "lucide-react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Animated grid background effect */}
        <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <motion.div 
          className="text-center max-w-5xl mx-auto"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            Kyber-1024 Post-Quantum Encryption Active
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            <span className="block text-white">Immutable Health Data.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-500 pb-2">
              Quantum Secure.
            </span>
          </motion.h1>
          
          <motion.p variants={item} className="mt-4 text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            The world's first Personal Health Record (PHR) platform utilizing lattice-based cryptography and decentralized ledger technology to secure medical data against quantum computing threats.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard" className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors w-full sm:w-auto text-center shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Access Patient Portal
            </Link>
            <Link href="#" className="px-8 py-4 bg-transparent border border-white/20 text-white font-semibold rounded-lg hover:bg-white/5 transition-colors w-full sm:w-auto text-center relative overflow-hidden group">
              <span className="relative z-10">Read The Whitepaper</span>
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Stats/Features Section */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32 max-w-7xl mx-auto w-full"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {[
            { icon: Lock, title: "Lattice Cryptography", desc: "Immune to Shor's algorithm running on future quantum hardware." },
            { icon: Database, title: "IPFS Storage", desc: "Decentralized, encrypted fragments prevent single points of failure." },
            { icon: Network, title: "Smart Contracts", desc: "Immutable access logs audited natively on the Ethereum VM." },
            { icon: Cpu, title: "AI Diagnostic Ready", desc: "Securely share strictly permissioned datasets with AI models." }
          ].map((feature, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className="glass-panel p-6 rounded-2xl hover:border-sky-500/50 transition-colors group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-12 h-12 rounded-lg bg-sky-500/10 flex items-center justify-center mb-6 text-sky-400 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </>
  );
}
