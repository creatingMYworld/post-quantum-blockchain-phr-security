"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Database, FileText, Settings, LogOut, Search, Bell, Fingerprint, History, User } from "lucide-react";
import Link from "next/link";

const navItems = [
  { icon: Activity, label: "Overview", active: true },
  { icon: FileText, label: "Medical Records" },
  { icon: ShieldCheck, label: "Access Policies" },
  { icon: History, label: "Audit Logs" },
  { icon: Settings, label: "Settings" }
];

const mockRecords = [
  { id: "PHR-9923", type: "MRI Scan", date: "2026-03-24", doctor: "Dr. A. Schmidt", status: "Verified", hash: "QmHash2..." },
  { id: "PHR-8812", type: "Blood Work", date: "2026-03-10", doctor: "Dr. K. Lee", status: "Verified", hash: "QmHash3..." },
  { id: "PHR-7634", type: "Prescription", date: "2026-02-15", doctor: "Dr. A. Schmidt", status: "Verified", hash: "QmHash4..." },
];

export default function DashboardPage() {
  const [verifying, setVerifying] = useState(true);

  // Simulate quantum decryption delay
  React.useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 flex overflow-hidden font-sans">
      
      {/* Sidebar Background Mesh */}
      <div className="absolute top-0 left-0 w-64 h-full bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 z-0" />
      
      {/* Sidebar Content (z-10) */}
      <aside className="w-64 flex flex-col justify-between py-6 px-4 relative z-10 border-r border-white/5">
        <div>
          <div className="flex items-center gap-3 px-2 mb-10">
            <ShieldCheck className="w-8 h-8 text-sky-500" />
            <span className="text-xl font-bold tracking-wider text-white">AEGIS<span className="text-sky-500">.</span></span>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item, i) => (
              <a 
                key={i} 
                href="#"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  item.active ? "bg-sky-500/10 text-sky-400 border border-sky-500/20" : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Node Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_theme(colors.emerald.400)]" />
            </div>
            <p className="text-sm font-medium text-slate-200">Ethereum Mainnet</p>
            <p className="text-xs text-slate-500 truncate mt-1">Block: #1823901</p>
          </div>
          
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#030712]/80 backdrop-blur-lg z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search records by CID..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-sky-500 rounded-full border border-[#030712]" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 p-[1px]">
                <div className="w-full h-full bg-[#030712] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Patient #9238</span>
                <span className="text-xs text-slate-500 font-mono">0x71C...49fA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-7xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Health Overview</h1>
              <p className="text-slate-400">Post-Quantum Lattice Decryption Active.</p>
            </div>
            
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${verifying ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} transition-colors duration-500`}>
              <Fingerprint className={`w-4 h-4 ${verifying ? 'animate-pulse' : ''}`} />
              <span className="text-sm font-medium">{verifying ? 'Decrypting IPFS Blobs...' : 'Vault Verified Secure'}</span>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { title: "Total Records", val: "14", trend: "+2 this month", color: "sky" },
              { title: "Active Doctor Policies", val: "3", trend: "0 modified. Secure.", color: "indigo" },
              { title: "Blockchain Audits", val: "1,492", trend: "100% Integrity", color: "emerald" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="glass-panel p-6 rounded-2xl relative overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-all duration-500 group-hover:bg-${stat.color}-500/20`} />
                <h3 className="text-sm font-semibold text-slate-400 mb-1">{stat.title}</h3>
                <p className="text-4xl font-light text-white mb-3 tracking-tight">{stat.val}</p>
                <p className={`text-xs text-${stat.color}-400 font-medium`}>{stat.trend}</p>
              </motion.div>
            ))}
          </div>

          {/* Data Table Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-2xl overflow-hidden border border-white/5"
          >
            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-sky-400" />
                Decrypted Clinical Documents
              </h2>
              <button className="text-xs font-semibold uppercase tracking-wider text-sky-400 hover:text-sky-300 transition-colors">
                View All
              </button>
            </div>
            
            <div className="overflow-x-auto">
              {verifying ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm animate-pulse">Running Kyber Key Decapsulation...</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white/[0.01] text-slate-400 border-b border-white/5">
                    <tr>
                      <th className="px-6 py-4 font-medium tracking-wider">Record ID</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Type</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Authorized Given By</th>
                      <th className="px-6 py-4 font-medium tracking-wider">Integrity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {mockRecords.map((record, i) => (
                      <motion.tr 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ delay: 0.1 * i }}
                        key={i} 
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-sky-400">{record.id}</td>
                        <td className="px-6 py-4 text-white font-medium">{record.type}</td>
                        <td className="px-6 py-4 text-slate-400">{record.date}</td>
                        <td className="px-6 py-4 text-slate-300">{record.doctor}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {record.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
