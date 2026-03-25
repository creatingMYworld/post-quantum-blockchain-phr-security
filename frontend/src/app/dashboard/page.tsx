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
  const [showAll, setShowAll] = useState(false);
  const [userEmail, setUserEmail] = useState("patient9238@aegis-phr.io");

  React.useEffect(() => {
    const timer = setTimeout(() => setVerifying(false), 2000);
    const email = localStorage.getItem("aegis_user_email");
    if (email) setUserEmail(email);
    return () => clearTimeout(timer);
  }, []);

  const handleNotification = () => alert("System Status: 0 active threats detected. Network is secure.");

  return (
    <div className="min-h-screen bg-[#030712] text-slate-300 flex overflow-hidden font-sans">
      {/* Sidebar Background Mesh */}
      <div className="absolute top-0 left-0 w-64 h-full bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 z-0" />
      
      {/* Sidebar */}
      <aside className="w-64 flex flex-col justify-between py-6 px-4 relative z-10 border-r border-white/5">
        <div>
          <div className="flex items-center gap-3 px-2 mb-10">
            <ShieldCheck className="w-8 h-8 text-sky-500" />
            <span className="text-xl font-bold tracking-wider text-white">AEGIS<span className="text-sky-500">.</span></span>
          </div>
          
          <nav className="space-y-2">
            {navItems.map((item, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activeTab === item.label ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-[inset_0_0_20px_rgba(14,165,233,0.1)]" : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 relative overflow-hidden group hover:bg-indigo-500/10 transition-colors cursor-pointer">
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto w-full">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#030712]/80 backdrop-blur-lg z-20">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={`Search in ${activeTab}...`}
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all hover:bg-white/10"
            />
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleNotification} className="relative text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-sky-500 rounded-full border border-[#030712]" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setActiveTab("Settings")}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 p-[1px]">
                <div className="w-full h-full bg-[#030712] rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)}</span>
                <span className="text-xs text-slate-500 font-mono">0x71C...49fA</span>
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
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="p-8 max-w-7xl mx-auto w-full flex-1"
          >
            <div className="flex items-end justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{activeTab}</h1>
                <p className="text-slate-400">
                  {activeTab === "Overview" && "Post-Quantum Lattice Decryption Active."}
                  {activeTab === "Medical Records" && "Your immutable health files stored via IPFS."}
                  {activeTab === "Access Policies" && "Manage cryptographic access mapped to doctor wallets."}
                  {activeTab === "Audit Logs" && "Immutable Ethereum transaction trails."}
                  {activeTab === "Settings" && "Configuration, keys, and profile preferences."}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${verifying ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'} transition-colors duration-500`}>
                <Fingerprint className={`w-4 h-4 ${verifying ? 'animate-pulse' : ''}`} />
                <span className="text-sm font-medium">{verifying ? 'Decrypting Blobs...' : 'Vault Verified Secure'}</span>
              </div>
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "Overview" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { title: "Total Records", val: "14", trend: "+2 this month", bg: "bg-sky-500/10", bgHover: "group-hover:bg-sky-500/20", text: "text-sky-400", onClick: () => setActiveTab("Medical Records") },
                    { title: "Active Doctor Policies", val: "3", trend: "0 modified. Secure.", bg: "bg-indigo-500/10", bgHover: "group-hover:bg-indigo-500/20", text: "text-indigo-400", onClick: () => setActiveTab("Access Policies") },
                    { title: "Blockchain Audits", val: "1,492", trend: "100% Integrity", bg: "bg-emerald-500/10", bgHover: "group-hover:bg-emerald-500/20", text: "text-emerald-400", onClick: () => setActiveTab("Audit Logs") },
                  ].map((stat, i) => (
                    <motion.div 
                      key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}
                      className="glass-panel p-6 rounded-2xl relative overflow-hidden group cursor-pointer" onClick={stat.onClick}
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} ${stat.bgHover} rounded-full blur-[40px] -mr-10 -mt-10 transition-all duration-500`} />
                      <h3 className="text-sm font-semibold text-slate-400 mb-1">{stat.title}</h3>
                      <p className="text-4xl font-light text-white mb-3">{stat.val}</p>
                      <p className={`text-xs ${stat.text} font-medium`}>{stat.trend}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                  <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Database className="w-5 h-5 text-sky-400" /> Recent Documents
                    </h2>
                    <button className="text-xs tracking-wider text-sky-400 hover:bg-sky-500/10 px-3 py-1 rounded transition-colors" onClick={() => setActiveTab("Medical Records")}>
                      View All in Module
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="bg-white/[0.01] text-slate-400 border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4 font-medium">Record ID</th>
                          <th className="px-6 py-4 font-medium">Type</th>
                          <th className="px-6 py-4 font-medium">Date</th>
                          <th className="px-6 py-4 font-medium">Integrity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {mockRecords.slice(0, 3).map((record, i) => (
                          <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 font-mono text-sky-400">{record.id}</td>
                            <td className="px-6 py-4 text-white font-medium">{record.type}</td>
                            <td className="px-6 py-4 text-slate-400">{record.date}</td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <ShieldCheck className="w-3.5 h-3.5" /> Verified
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* MEDICAL RECORDS TAB */}
            {activeTab === "Medical Records" && (
              <div className="space-y-6">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => alert("Initializing Post-Quantum IPFS Upload sequence...")} className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-sky-400/50 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                    <UploadCloud className="w-5 h-5" /> Upload New Record
                  </button>
                  <button onClick={() => alert("Filtering records by locally decrypted cache...")} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-lg font-medium transition-colors border border-white/10">
                    Filter by Decrypted
                  </button>
                </div>
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/[0.02] text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 font-medium">Record ID</th>
                        <th className="px-6 py-4 font-medium">Type</th>
                        <th className="px-6 py-4 font-medium">Date</th>
                        <th className="px-6 py-4 font-medium">Authorized Doctor</th>
                        <th className="px-6 py-4 font-medium">IPFS Hash (Encrypted)</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {mockRecords.map((record, i) => (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 * i }} key={i} className="hover:bg-white/[0.02] group">
                            <td className="px-6 py-4 font-mono text-sky-400">{record.id}</td>
                            <td className="px-6 py-4 text-white font-medium">{record.type}</td>
                            <td className="px-6 py-4 text-slate-400">{record.date}</td>
                            <td className="px-6 py-4 text-slate-300">{record.doctor}</td>
                            <td className="px-6 py-4 font-mono text-slate-500 text-xs">{record.hash}</td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-sky-400 uppercase text-xs font-bold tracking-wider hover:text-white transition-colors" onClick={() => alert("Initiating Crystal-Kyber Decapsulation for " + record.id)}>
                                Decrypt & View
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ACCESS POLICIES TAB */}
            {activeTab === "Access Policies" && (
              <div className="space-y-6">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-4 items-start">
                  <Key className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-medium mb-1">Smart Contract Access Control</h3>
                    <p className="text-sm text-indigo-200/70">
                      Granting access delegates a post-quantum encrypted viewing key to the doctor's Ethereum public address.
                      Revoking access destroys the capability on-chain immutably.
                    </p>
                  </div>
                </div>
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-white/[0.02] text-slate-400 border-b border-white/5">
                      <tr>
                        <th className="px-6 py-4 font-medium">Doctor Name</th>
                        <th className="px-6 py-4 font-medium">Specialty</th>
                        <th className="px-6 py-4 font-medium">Eth Wallet Address</th>
                        <th className="px-6 py-4 font-medium">Date Granted</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Revoke / Grant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mockPolicies.map((pol, i) => (
                        <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-medium">{pol.doctor}</td>
                          <td className="px-6 py-4 text-slate-400">{pol.specialty}</td>
                          <td className="px-6 py-4 font-mono text-indigo-400">{pol.wallet}</td>
                          <td className="px-6 py-4 text-slate-400">{pol.granted}</td>
                          <td className="px-6 py-4">
                             {pol.status === "Active" ? (
                               <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium"><CheckCircle2 className="w-4 h-4"/> Active</span>
                             ) : (
                               <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium"><XCircle className="w-4 h-4"/> Revoked</span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {pol.status === "Active" ? (
                               <button className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors" onClick={() => alert("Executing Smart Contract Revocation...")}>Revoke</button>
                             ) : (
                               <button className="text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors" onClick={() => alert("Executing Smart Contract Grant...")}>Re-Grant</button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* AUDIT LOGS TAB */}
            {activeTab === "Audit Logs" && (
              <div className="glass-panel rounded-2xl border border-white/5 bg-[#0a0a0a]">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-black/40">
                  <h3 className="text-white font-mono flex items-center gap-2"><Terminal className="w-4 h-4 text-emerald-400"/> Blockchain Node Terminal</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                </div>
                <div className="p-6 font-mono text-xs sm:text-sm overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap border-collapse">
                    <thead>
                      <tr className="text-slate-500 mb-4 border-b border-white/5">
                        <th className="pb-3 font-medium">TIMESTAMP</th>
                        <th className="pb-3 font-medium">TX HASH</th>
                        <th className="pb-3 font-medium">ACTION</th>
                        <th className="pb-3 font-medium">TARGET / PARAMS</th>
                        <th className="pb-3 font-medium">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {mockLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-3 pr-6 text-slate-500">{log.timestamp}</td>
                          <td className="py-3 pr-6 text-indigo-400">{log.tx}</td>
                          <td className="py-3 pr-6 text-sky-400">{log.action}</td>
                          <td className="py-3 pr-6 text-slate-400">{log.target}</td>
                          <td className="py-3 pr-6">
                            <span className={log.status.includes('Success') ? 'text-emerald-400' : 'text-rose-400'}>{log.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "Settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="glass-panel rounded-2xl p-6 border border-white/5">
                    <h2 className="text-xl font-semibold text-white mb-6">Patient Profile</h2>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Full Name</label>
                        <input type="text" defaultValue={userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Date of Birth</label>
                        <input type="date" defaultValue="1990-05-15" className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Email Address</label>
                        <input type="email" defaultValue={userEmail} className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-colors" />
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button className="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded-lg font-medium transition-colors" onClick={() => alert("Profile updated.")}>Save Changes</button>
                    </div>
                  </div>

                  <div className="glass-panel rounded-2xl p-6 border border-white/5 border-l-4 border-l-amber-500">
                    <h2 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500"/> Danger Zone
                    </h2>
                    <p className="text-sm text-slate-400 mb-6">Permanently revoke all doctor access and self-destruct decrypted data caches from the client.</p>
                    <button className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-6 py-2 rounded-lg font-medium transition-colors border border-rose-500/20" onClick={() => alert("Initiating emergency self-destruct...")}>Emergency Lockdown</button>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass-panel rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Wallet Integration</h3>
                    <div className="bg-black/20 border border-white/10 rounded-lg p-4 mb-4">
                      <Wallet className="w-6 h-6 text-sky-400 mb-2" />
                      <p className="text-xs text-slate-400 mb-1">Connected Address</p>
                      <p className="text-sm font-mono text-white truncate">0x71C8F9...E49fA</p>
                    </div>
                    <button onClick={() => alert("Wallet successfully disconnected.")} className="w-full bg-white/5 hover:bg-white/10 text-white rounded-lg py-2 text-sm font-medium transition-colors">Disconnect Wallet</button>
                  </div>
                  
                  <div className="glass-panel rounded-2xl p-6 border border-white/5">
                    <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Cryptography specs</h3>
                    <ul className="space-y-3 text-sm">
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Algorithm</span>
                        <span className="text-sky-400 font-mono">Kyber-1024</span>
                      </li>
                      <li className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-slate-400">Node</span>
                        <span className="text-indigo-400 font-mono">Infura/ETH</span>
                      </li>
                      <li className="flex justify-between pb-2">
                        <span className="text-slate-400">Storage</span>
                        <span className="text-emerald-400 font-mono">IPFS (Pinata)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
