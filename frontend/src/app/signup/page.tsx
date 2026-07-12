"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Mail, Lock, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, getIdToken } from "firebase/auth";
import { exchangeFirebaseToken } from "../../lib/session";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!auth) {
      setError("Firebase configuration is missing. Please add credentials to .env.local.");
      return;
    }

    try {
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const idToken = await getIdToken(result.user, true);
      const session = await exchangeFirebaseToken(idToken);
      if (result.user.email) {
        localStorage.setItem("aegis_user_email", result.user.email);
      }
      localStorage.setItem("aegis_role", session.role);
      localStorage.setItem("aegis_access_token", session.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-cyan-50/50 border border-cyan-100 shadow-[inset_0_2px_4px_rgba(8,145,178,0.05)] rounded-2xl py-3.5 pl-12 pr-4 text-black focus:bg-white focus:outline-none focus:border-cyan-400 focus:ring-[3px] focus:ring-cyan-100 transition-all text-sm font-bold placeholder-slate-500";
  const labelClass = "block text-[11px] font-extrabold text-teal-600/80 mb-2 uppercase tracking-widest";

  return (
    <div className="min-h-screen text-slate-700 flex flex-col pt-16 items-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f9feff 0%, #f0fafd 20%, #f5fdf9 60%, #fdfffe 100%)" }}>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-300/40 blur-[120px] pointer-events-none float-anim" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/30 blur-[120px] pointer-events-none float-anim" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] rounded-full bg-sky-300/20 blur-[100px] pointer-events-none float-anim" style={{ animationDelay: "3s" }} />

      {/* Background Grid */}
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#0891b20a_1px,transparent_1px),linear-gradient(to_bottom,#0891b20a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 hover:opacity-80 transition-opacity">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-200">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 drop-shadow-sm">
            AEGIS
          </span>
        </Link>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="card-3d gradient-border-card p-8 sm:p-10 rounded-[2rem] border border-white/60 shadow-[0_15px_60px_-15px_rgba(8,145,178,0.25)] relative overflow-hidden"
        >
          {/* Internal gradient mesh for card */}
          <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white to-cyan-50/30" />
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Subtle top highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 rounded-b-full" />

          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black mb-2 inline-block text-cyan-900">
              Register Node
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-medium">Issue your cryptographic key identity.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {error && <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>}
            <div>
              <label className={labelClass}>Authorized Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="Patient Record" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email Envelope</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="patient@aegis-phr.io" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Hash Protocol</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className={inputClass} placeholder="••••••••••••" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Verify Signature</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                <input type="password" required value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} className={inputClass} placeholder="••••••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white py-4 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_8px_16px_-4px_rgba(8,145,178,0.4)] hover:shadow-[0_12px_20px_-4px_rgba(8,145,178,0.5)] hover:-translate-y-1">
              {loading ? "Creating Account..." : "Initialize Keys"} <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Keys existing locally? <Link href="/login" className="text-cyan-600 hover:text-cyan-500 font-extrabold ml-1 underline decoration-cyan-300 underline-offset-4 pointer-events-auto">Establish secure link</Link>
          </div>
        </motion.div>

        <p className="text-center text-[11px] font-bold text-teal-600/50 mt-10 tracking-widest uppercase">
          🔒 End-to-End Post-Quantum Lattice Node
        </p>
      </div>
    </div>
  );
}
