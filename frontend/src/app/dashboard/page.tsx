"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, ShieldCheck, Database, FileText, Settings, LogOut, 
  Search, Bell, Fingerprint, History, User, CheckCircle2, XCircle,
  Key, Wallet, UploadCloud, Terminal, AlertCircle
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { icon: Activity, label: "Overview" },
  { icon: FileText, label: "Medical Records" },
  { icon: ShieldCheck, label: "Access Policies" },
  { icon: History, label: "Audit Logs" },
  { icon: Settings, label: "Settings" }
];

const mockRecords = [
  { id: "PHR-9923", type: "MRI Scan", date: "2026-03-24", doctor: "Dr. A. Schmidt", status: "Verified", hash: "QmHash2x9L..." },
  { id: "PHR-8812", type: "Blood Work", date: "2026-03-10", doctor: "Dr. K. Lee", status: "Verified", hash: "QmHash3fA1..." },
  { id: "PHR-7634", type: "Prescription", date: "2026-02-15", doctor: "Dr. A. Schmidt", status: "Verified", hash: "QmHash4zP0..." },
];

const mockPolicies = [
  { doctor: "Dr. A. Schmidt", specialty: "Neurology", wallet: "0x4Ac...9B12", granted: "2025-11-20", status: "Active" },
  { doctor: "Dr. K. Lee", specialty: "Pathology", wallet: "0x8Bd...33FF", granted: "2026-01-05", status: "Active" },
  { doctor: "Dr. M. Chen", specialty: "Cardiology", wallet: "0x2F1...CC89", granted: "2025-08-14", status: "Revoked" },
];

const mockLogs = [
  { tx: "0xabcd...1234", action: "GRANT_ACCESS", target: "0x4Ac...9B12", timestamp: "2026-03-24 14:22:11", status: "Success" },
  { tx: "0xbb12...88ff", action: "UPLOAD_PHR", target: "IPFS_QmHash2...", timestamp: "2026-03-24 10:15:00", status: "Success" },
  { tx: "0xcc34...99ea", action: "DECRYPT_ATTEMPT", target: "PHR-8812", timestamp: "2026-03-20 09:41:22", status: "Failed (Invalid Signature)" },
  { tx: "0xdd56...11bc", action: "REVOKE_ACCESS", target: "0x2F1...CC89", timestamp: "2026-03-18 16:05:55", status: "Success" },
  { tx: "0xee78...22cd", action: "KEY_ROTATION", target: "Kyber-1024", timestamp: "2026-03-01 00:00:00", status: "Success" },
];

export default function DashboardPage() {
  const [verifying, setVerifying] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [userEmail, setUserEmail] = useState("patient9238@aegis-phr.io");

  React.useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 2000);
    const email = localStorage.getItem("aegis_user_email");
    if (email) setUserEmail(email);
    return () => clearTimeout(timer);
  }, []);

  const handleNotification = () => alert("System Status: 0 active threats detected. Network is secure.");

  return (
    <div className="min-h-screen bg-white text-slate-600 flex overflow-hidden font-sans relative z-0">
      
      {/* Grid Background from Landing Page */}
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#0891b215_1px,transparent_1px),linear-gradient(to_bottom,#0891b215_1px,transparent_1px)] bg-[size:32px_32px]" />

      {/* Decorative floating blobs from Landing Page */}
      <div className="absolute top-24 left-1/4 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl pointer-events-none float-anim" />
      <div className="absolute top-40 right-1/4 w-56 h-56 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none float-anim" style={{ animationDelay: "1.5s" }} />

      {/* Sidebar */}
      <aside className="w-72 flex flex-col justify-between py-8 px-6 relative z-10 border-r border-slate-100 bg-white/90 backdrop-blur-3xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div>
          <div className="flex items-center gap-3 px-2 mb-12 group cursor-pointer">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-xl shadow-[0_8px_16px_-4px_rgba(8,145,178,0.4)] group-hover:scale-105 transition-transform float-anim">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-800">AEGIS<span className="text-cyan-500">.</span></span>
          </div>
          
          <nav className="space-y-3">
            {navItems.map((item, i) => {
              const isActive = activeTab === item.label;
              return (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
                    isActive ? "bg-cyan-50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-cyan-700 font-bold border border-cyan-100/50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium"
                  }`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-cyan-400 to-teal-400 rounded-r-full" />}
                  <item.icon className="w-5 h-5 z-10" />
                  <span className="z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="space-y-5">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="p-5 rounded-2xl bg-white border-2 border-slate-100 relative overflow-hidden group hover:shadow-xl hover:border-cyan-200 transition-all cursor-pointer shadow-sm"
          >
            <div className="absolute inset-0 bg-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest relative z-10">Node Link</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_theme(colors.emerald.400)] relative z-10" />
            </div>
            <p className="text-sm font-black text-slate-800 relative z-10">Ethereum Mainnet</p>
            <p className="text-xs text-slate-500 truncate mt-1 relative z-10 font-mono font-medium">Block: #1823901</p>
          </motion.div>
          
          <Link href="/" className="flex items-center justify-center gap-3 px-3 py-3 text-slate-500 font-bold hover:text-rose-600 transition-colors hover:bg-rose-50 rounded-xl border border-transparent hover:border-rose-100">
            <LogOut className="w-5 h-5" />
            <span>Terminate Session</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-20 h-screen overflow-y-auto w-full">
        {/* Header */}
        <header className="h-24 border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 bg-white/70 backdrop-blur-xl z-30 shadow-sm">
          <div className="relative w-[28rem] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
            <input 
              type="text" 
              placeholder={`Search across ${activeTab}...`}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-cyan-50 focus:border-cyan-300 transition-all shadow-sm font-semibold text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-8">
            <button onClick={handleNotification} className="relative text-cyan-600 hover:text-cyan-800 transition-all bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm hover:shadow-md hover:border-cyan-200 hover:-translate-y-0.5">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
            </button>
            <div className="flex items-center gap-4 pl-8 border-l-2 border-slate-100 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("Settings")}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 p-[2px] shadow-lg shadow-cyan-500/20 rotate-3 hover:rotate-6 transition-transform">
                <div className="w-full h-full bg-white rounded-xl flex items-center justify-center -rotate-3">
                  <User className="w-6 h-6 text-cyan-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-slate-800 tracking-tight">{userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)}</span>
                <span className="text-xs text-slate-400 font-mono font-bold tracking-wider">0x71C...49fA</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="p-10 max-w-[1400px] mx-auto w-full flex-1"
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-4xl font-black text-slate-800 mb-3 tracking-tight">{activeTab}</motion.h1>
                <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-500 font-medium text-lg leading-relaxed">
                  {activeTab === "Overview" && "Post-Quantum Lattice Decryption Active."}
                  {activeTab === "Medical Records" && "Your immutable health files stored via IPFS."}
                  {activeTab === "Access Policies" && "Manage cryptographic access mapped to doctor wallets."}
                  {activeTab === "Audit Logs" && "Immutable Ethereum transaction trails."}
                  {activeTab === "Settings" && "Configuration, keys, and profile preferences."}
                </motion.p>
              </div>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }} className={`px-5 py-2.5 rounded-2xl flex items-center gap-3 border shadow-sm bg-white ${verifying ? 'border-amber-200 text-amber-600' : 'border-emerald-200 text-emerald-600'} transition-colors duration-500`}>
                <div className={`p-1.5 rounded-full ${verifying ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                    <Fingerprint className={`w-5 h-5 ${verifying ? 'animate-pulse' : ''}`} />
                </div>
                <span className="text-sm font-black tracking-widest uppercase">{verifying ? 'Decrypting Blobs...' : 'Vault Verified Secure'}</span>
              </motion.div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "Overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  {[
                    { title: "Total Records", val: "14", trend: "+2 this month", textColor: "text-cyan-600", iconBg: "bg-gradient-to-br from-cyan-400 to-teal-500", borderTop: "border-t-4 border-t-cyan-400", shadow: "hover:shadow-cyan-100", barBg: "bg-gradient-to-r from-cyan-400 to-teal-400", icon: FileText, onClick: () => setActiveTab("Medical Records") },
                    { title: "Active Doctor Policies", val: "3", trend: "0 modified. Secure.", textColor: "text-violet-600", iconBg: "bg-gradient-to-br from-violet-400 to-purple-500", borderTop: "border-t-4 border-t-violet-400", shadow: "hover:shadow-violet-100", barBg: "bg-gradient-to-r from-violet-400 to-purple-400", icon: Key, onClick: () => setActiveTab("Access Policies") },
                    { title: "Blockchain Audits", val: "1,492", trend: "100% Integrity", textColor: "text-emerald-600", iconBg: "bg-gradient-to-br from-emerald-400 to-green-500", borderTop: "border-t-4 border-t-emerald-400", shadow: "hover:shadow-emerald-100", barBg: "bg-gradient-to-r from-emerald-400 to-green-400", icon: ShieldCheck, onClick: () => setActiveTab("Audit Logs") },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.02 }}
                      className={`card-3d gradient-border-card p-7 bg-white ${stat.borderTop} ${stat.shadow} hover:shadow-2xl transition-shadow cursor-pointer block`} 
                      onClick={stat.onClick}
                    >
                      <div className={`w-14 h-14 rounded-2xl ${stat.iconBg} flex items-center justify-center mb-6 text-white shadow-lg float-anim`} style={{ animationDelay: `${i * 0.4}s` }}>
                        <stat.icon className="w-7 h-7 drop-shadow-sm" />
                      </div>
                      <h3 className={`text-lg font-bold ${stat.textColor} mb-2 tracking-tight`}>{stat.title}</h3>
                      <p className="text-4xl md:text-5xl font-extrabold text-slate-800 mb-2 tracking-tight">{stat.val}</p>
                      <p className="text-slate-500 text-sm font-medium">{stat.trend}</p>
                      <div className={`mt-6 h-1 w-12 rounded-full ${stat.barBg} opacity-60`} />
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  className="card-3d gradient-border-card bg-white border-t-4 border-t-teal-400 hover:shadow-teal-100 hover:shadow-2xl transition-shadow"
                >
                  <div className="px-8 py-7 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-xl text-white shadow-md"><Database className="w-5 h-5" /></div> Recent Documents
                    </h2>
                    <button className="text-xs font-black tracking-widest uppercase text-teal-600 hover:bg-teal-50 px-4 py-2.5 rounded-xl transition-colors border-2 border-slate-100 bg-white shadow-sm" onClick={() => setActiveTab("Medical Records")}>
                      View All in Module
                    </button>
                  </div>
                  <div className="overflow-x-auto bg-white rounded-b-2xl">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-8 py-5 font-bold tracking-widest uppercase text-[11px] text-slate-400">Record ID</th>
                          <th className="px-8 py-5 font-bold tracking-widest uppercase text-[11px] text-slate-400">Type</th>
                          <th className="px-8 py-5 font-bold tracking-widest uppercase text-[11px] text-slate-400">Date</th>
                          <th className="px-8 py-5 font-bold tracking-widest uppercase text-[11px] text-slate-400">Integrity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mockRecords.slice(0, 3).map((record, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 transition-colors bg-white">
                            <td className="px-8 py-5 font-mono font-bold text-teal-600 tracking-wide text-sm">{record.id}</td>
                            <td className="px-8 py-5 text-slate-800 font-bold">{record.type}</td>
                            <td className="px-8 py-5 font-medium text-slate-500">{record.date}</td>
                            <td className="px-8 py-5">
                              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                <ShieldCheck className="w-4 h-4" /> Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}

            {/* MEDICAL RECORDS TAB */}
            {activeTab === "Medical Records" && (
              <div className="space-y-8">
                <div className="flex gap-4 mb-6">
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => alert("Initializing Post-Quantum IPFS Upload sequence...")} className="flex items-center gap-3 bg-gradient-to-r from-teal-400 to-emerald-500 text-white px-6 py-3.5 rounded-2xl font-bold tracking-wide transition-all shadow-[0_8px_20px_-4px_rgba(16,185,129,0.5)] border border-emerald-400/50">
                    <UploadCloud className="w-5 h-5" /> Upload New Record
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => alert("Filtering records by locally decrypted cache...")} className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 rounded-2xl font-bold tracking-wide transition-colors border-2 border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300">
                    Filter by Decrypted
                  </motion.button>
                </div>
                
                <motion.div 
                   className="card-3d gradient-border-card bg-white border-t-4 border-t-cyan-400 hover:shadow-cyan-100 hover:shadow-2xl transition-shadow"
                >
                  <table className="w-full text-left text-sm whitespace-nowrap bg-white rounded-2xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Record ID</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Type</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Date</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Authorized Doctor</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">IPFS Hash (Encrypted)</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {mockRecords.map((record, i) => (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * i }} key={i} className="hover:bg-slate-50/50 group transition-colors">
                            <td className="px-8 py-6 font-mono font-bold text-cyan-600 text-sm tracking-wide">{record.id}</td>
                            <td className="px-8 py-6 text-slate-800 font-bold text-base">{record.type}</td>
                            <td className="px-8 py-6 font-medium text-slate-500">{record.date}</td>
                            <td className="px-8 py-6 font-bold text-cyan-800 bg-cyan-50/30">{record.doctor}</td>
                            <td className="px-8 py-6 font-mono text-slate-400 text-[13px]">{record.hash}</td>
                            <td className="px-8 py-6 text-right">
                              <button className="text-white uppercase text-[10px] font-black tracking-widest bg-gradient-to-r from-cyan-400 to-teal-500 px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5" onClick={() => alert("Initiating Crystal-Kyber Decapsulation for " + record.id)}>
                                Decrypt & View
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                  <div className="h-1 w-16 mx-8 mb-8 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 opacity-60 mt-4" />
                </motion.div>
              </div>
            )}

            {/* ACCESS POLICIES TAB */}
            {activeTab === "Access Policies" && (
              <div className="space-y-8">
                <motion.div 
                  className="card-3d gradient-border-card bg-white border-t-4 border-t-violet-400 p-8 flex gap-6 items-start hover:shadow-violet-100 hover:shadow-2xl transition-shadow"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-violet-400 to-purple-500 rounded-2xl shadow-lg flex items-center justify-center shrink-0 float-anim">
                    <Key className="w-7 h-7 text-white drop-shadow-sm" />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-black mb-2 text-2xl tracking-tight">Smart Contract Access Control</h3>
                    <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-3xl">
                      Granting access delegates a post-quantum encrypted viewing key to the doctor&apos;s Ethereum public address.
                      Revoking access destroys the capability on-chain immutably.
                    </p>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="card-3d gradient-border-card bg-white border-t-4 border-t-violet-400 hover:shadow-violet-100 hover:shadow-2xl transition-shadow"
                >
                  <table className="w-full text-left text-sm whitespace-nowrap bg-white rounded-2xl overflow-hidden">
                    <thead className="bg-slate-50 text-slate-400 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Doctor Name</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Specialty</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Eth Wallet Address</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Date Granted</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px]">Status</th>
                        <th className="px-8 py-6 font-bold tracking-widest uppercase text-[11px] text-right">Revoke / Grant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockPolicies.map((pol, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 text-slate-800 font-bold text-base">{pol.doctor}</td>
                          <td className="px-8 py-6 font-medium text-slate-500">{pol.specialty}</td>
                          <td className="px-8 py-6 font-mono font-bold text-violet-500 text-[13px] tracking-wide">{pol.wallet}</td>
                          <td className="px-8 py-6 font-medium text-slate-500">{pol.granted}</td>
                          <td className="px-8 py-6">
                             {pol.status === "Active" ? (
                               <span className="flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-lg text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-bold shadow-sm"><CheckCircle2 className="w-4 h-4"/> Active</span>
                             ) : (
                               <span className="flex w-fit items-center gap-2 px-3.5 py-1.5 rounded-lg text-rose-700 bg-rose-50 border border-rose-200 text-xs font-bold shadow-sm"><XCircle className="w-4 h-4"/> Revoked</span>
                             )}
                          </td>
                          <td className="px-8 py-6 text-right">
                             {pol.status === "Active" ? (
                               <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 transition-all shadow-sm hover:shadow-md" onClick={() => alert("Executing Smart Contract Revocation...")}>Revoke</button>
                             ) : (
                               <button className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all shadow-sm hover:shadow-md" onClick={() => alert("Executing Smart Contract Grant...")}>Re-Grant</button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              </div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === "Audit Logs" && (
              <motion.div 
                className="card-3d gradient-border-card border-t-4 border-t-emerald-400 hover:shadow-emerald-100 hover:shadow-2xl transition-shadow bg-slate-900 overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-8 py-5 bg-black/40">
                  <h3 className="text-slate-200 font-mono font-bold flex items-center gap-3"><Terminal className="w-5 h-5 text-emerald-400"/> Blockchain Node Terminal</h3>
                  <div className="flex gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-rose-500 shadow-inner" />
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shadow-inner" />
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 shadow-inner" />
                  </div>
                </div>
                <div className="p-8 font-mono text-[13px] overflow-x-auto relative">
                  {/* Subtle terminal scanline effect */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:100%_4px] pointer-events-none opacity-20" />
                  
                  <table className="w-full text-left whitespace-nowrap border-collapse relative z-10">
                    <thead>
                      <tr className="text-slate-500 mb-6 border-b border-white/10 uppercase tracking-widest text-[11px] font-bold">
                        <th className="pb-5 pr-8">TIMESTAMP</th>
                        <th className="pb-5 pr-8">TX HASH</th>
                        <th className="pb-5 pr-8">ACTION</th>
                        <th className="pb-5 pr-8">TARGET / PARAMS</th>
                        <th className="pb-5">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {mockLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="py-4 pr-8 font-medium text-slate-500 group-hover:text-slate-400 transition-colors">{log.timestamp}</td>
                          <td className="py-4 pr-8 font-bold text-emerald-400">{log.tx}</td>
                          <td className="py-4 pr-8 font-bold text-cyan-400">{log.action}</td>
                          <td className="py-4 pr-8 text-slate-400">{log.target}</td>
                          <td className="py-4">
                            <span className={`font-bold ${log.status.includes('Success') ? 'text-emerald-500' : 'text-rose-500'}`}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "Settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <motion.div 
                    className="card-3d gradient-border-card bg-white p-10 border-t-4 border-t-cyan-400 hover:shadow-cyan-100 hover:shadow-2xl transition-shadow"
                  >
                    <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Patient Profile</h2>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Full Name</label>
                        <input type="text" defaultValue={userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-cyan-50 focus:border-cyan-400 transition-all placeholder:text-slate-400" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Date of Birth</label>
                        <input type="date" defaultValue="1990-05-15" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-cyan-50 focus:border-cyan-400 transition-all" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-3 uppercase tracking-widest">Email Address</label>
                        <input type="email" defaultValue={userEmail} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-800 font-bold focus:outline-none focus:ring-4 focus:ring-cyan-50 focus:border-cyan-400 transition-all" />
                      </div>
                    </div>
                    <div className="mt-10 flex justify-end">
                      <button className="bg-gradient-to-r from-cyan-400 to-teal-500 text-white px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all shadow-[0_8px_20px_-4px_rgba(8,145,178,0.4)] hover:shadow-lg hover:-translate-y-1" onClick={() => alert("Profile updated.")}>Save Changes</button>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="card-3d gradient-border-card p-10 bg-white border-t-4 border-t-rose-400 hover:shadow-rose-100 hover:shadow-2xl transition-shadow"
                  >
                    <h2 className="text-2xl font-black text-rose-600 mb-3 flex items-center gap-3">
                      <AlertCircle className="w-7 h-7"/> Danger Zone
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mb-8">Permanently revoke all doctor access and self-destruct decrypted data caches from the client.</p>
                    <button className="bg-white text-rose-600 hover:bg-rose-50 px-8 py-3.5 rounded-xl font-bold tracking-widest uppercase text-sm transition-all border-2 border-rose-100 shadow-sm hover:shadow-md" onClick={() => alert("Initiating emergency self-destruct...")}>Emergency Lockdown</button>
                  </motion.div>
                </div>

                <div className="space-y-8">
                  <motion.div 
                    className="card-3d gradient-border-card p-8 bg-white border-t-4 border-t-sky-400 hover:shadow-sky-100 hover:shadow-2xl transition-shadow"
                  >
                    <h3 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">Wallet Integration</h3>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6">
                      <Wallet className="w-7 h-7 text-sky-500 mb-4" />
                      <p className="text-xs font-bold text-sky-600 mb-1 uppercase tracking-widest">Connected Address</p>
                      <p className="text-sm font-mono font-bold text-slate-800 truncate tracking-wider">0x71C8F9...E49fA</p>
                    </div>
                    <button onClick={() => alert("Wallet successfully disconnected.")} className="w-full bg-white hover:bg-rose-50 text-rose-500 rounded-xl py-4 text-xs tracking-widest uppercase font-bold transition-all border-2 border-slate-100 hover:border-rose-200 shadow-sm">Disconnect Wallet</button>
                  </motion.div>
                  
                  <motion.div 
                    className="card-3d gradient-border-card p-8 bg-white border-t-4 border-t-emerald-400 hover:shadow-emerald-100 hover:shadow-2xl transition-shadow"
                  >
                    <h3 className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">Cryptography specs</h3>
                    <ul className="space-y-4 text-sm">
                      <li className="flex justify-between border-b border-slate-50 pb-4">
                        <span className="text-slate-500 font-medium">Algorithm</span>
                        <span className="text-cyan-700 font-mono font-bold bg-cyan-50 px-3 py-1 rounded-lg border border-cyan-100">Kyber-1024</span>
                      </li>
                      <li className="flex justify-between border-b border-slate-50 pb-4">
                        <span className="text-slate-500 font-medium">Node</span>
                        <span className="text-indigo-700 font-mono font-bold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">Infura/ETH</span>
                      </li>
                      <li className="flex justify-between pb-2">
                        <span className="text-slate-500 font-medium">Storage</span>
                        <span className="text-emerald-700 font-mono font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">IPFS (Pinata)</span>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
