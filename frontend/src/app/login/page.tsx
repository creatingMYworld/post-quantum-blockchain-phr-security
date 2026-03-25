"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ShieldCheck, Mail, Lock, Key, Smartphone, ArrowRight, Loader2, Cpu, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, googleProvider } from "../../lib/firebase";
import { signInWithPopup } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"LOGIN" | "PHONE_PROMPT" | "2FA" | "KEY_GEN">("LOGIN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      if (!auth) {
        throw new Error("Firebase configuration is missing. Please add credentials to .env.local.");
      }
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user.email) {
        setEmail(result.user.email);
      }
      setStep("PHONE_PROMPT");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone })
        });
        const data = await res.json();
        
        if (data.success || data.status === "pending") {
            setStep("2FA");
        } else {
            setError(data.error || "Failed to send OTP.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Network Error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (email && password && phone) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone })
        });
        const data = await res.json();
        
        if (data.success || data.status === "pending") {
            setStep("2FA");
        } else {
            setError(data.error || "Failed to send OTP.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Network Error");
      } finally {
        setLoading(false);
      }
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.length >= 4) {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, code })
        });
        const data = await res.json();

        if (data.success || data.status === "approved") {
            setStep("KEY_GEN");
            setTimeout(() => {
                localStorage.setItem("aegis_user_email", email);
                router.push("/dashboard");
            }, 4000);
        } else {
            setError(data.error || "Invalid OTP code.");
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Network Error");
      } finally {
        setLoading(false);
      }
    }
  };

  const inputClass = "w-full bg-cyan-50/50 border border-cyan-100 shadow-[inset_0_2px_4px_rgba(8,145,178,0.05)] rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 focus:bg-white focus:outline-none focus:border-cyan-400 focus:ring-[3px] focus:ring-cyan-100 transition-all text-sm font-bold placeholder-slate-500";
  const labelClass = "block text-[11px] font-extrabold text-teal-600/80 mb-2 uppercase tracking-widest";

  return (
    <div className="min-h-screen text-slate-700 flex flex-col pt-16 items-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f9feff 0%, #f0fafd 20%, #f5fdf9 60%, #fdfffe 100%)" }}>

      {/* Decorative blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-300/40 blur-[120px] pointer-events-none float-anim" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-300/30 blur-[120px] pointer-events-none float-anim" style={{ animationDelay: "2s" }} />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-sky-300/20 blur-[100px] pointer-events-none float-anim" style={{ animationDelay: "4s" }} />
      
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
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="card-3d gradient-border-card p-8 sm:p-10 rounded-[2rem] border border-white/60 shadow-[0_15px_60px_-15px_rgba(8,145,178,0.25)] relative overflow-hidden"
        >
          {/* Internal gradient mesh for card */}
          <div className="absolute inset-0 z-[-1] bg-gradient-to-b from-white to-cyan-50/30" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Subtle top highlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 rounded-b-full" />

          <AnimatePresence mode="wait">

            {step === "LOGIN" && (
              <motion.div key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                <div className="mb-8 text-center">
                  <h2 className="text-3xl font-black mb-2 inline-block text-cyan-900">
                    Welcome Back
                  </h2>
                  <p className="text-slate-500 text-sm mt-2 font-medium">Authenticate to access your encrypted PHR vault.</p>
                </div>

                {error && <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                      <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="patient@aegis-phr.io" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                      <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••••••" />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Phone Number (For 2FA)</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 group-focus-within:drop-shadow-sm transition-colors" />
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1234567890" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-white py-4 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_8px_16px_-4px_rgba(8,145,178,0.4)] hover:shadow-[0_12px_20px_-4px_rgba(8,145,178,0.5)] hover:-translate-y-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Authenticate Portal"} <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                <div className="mt-8 flex items-center gap-4">
                  <span className="flex-1 border-t border-cyan-100" />
                  <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest bg-cyan-50/80 px-3 rounded-full py-1">Or</span>
                  <span className="flex-1 border-t border-cyan-100" />
                </div>
                
                <button onClick={handleGoogleSignIn} disabled={loading} type="button"
                  className="w-full mt-6 bg-white hover:bg-cyan-50 text-teal-800 py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-50 border-2 border-cyan-100 shadow-sm hover:shadow-cyan-100 hover:border-cyan-300">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
                
                <div className="mt-8 text-center text-sm text-slate-500 font-medium">
                  Don&apos;t have an Identity? <Link href="/signup" className="text-cyan-600 hover:text-cyan-500 font-extrabold ml-1 underline decoration-cyan-300 underline-offset-4 pointer-events-auto">Register strictly</Link>
                </div>
              </motion.div>
            )}

            {step === "PHONE_PROMPT" && (
              <motion.div key="phone_prompt" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="text-center">
                <h2 className="text-3xl font-black text-cyan-900 mb-3 inline-block">Secure Action</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Google Sign-In successful. Link a trusted phone number to enable two-factor SMS validation.</p>
                {error && <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>}
                <form onSubmit={handlePhoneSubmit} className="space-y-4 text-left">
                  <div>
                    <label className={labelClass}>Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-[20px] h-[20px] text-teal-500 group-focus-within:text-cyan-500 transition-colors" />
                      <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+1234567890" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-white py-4 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_8px_16px_-4px_rgba(8,145,178,0.4)] hover:shadow-lg hover:-translate-y-1">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : "Dispatch OTP Security"} <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === "2FA" && (
              <motion.div key="2fa" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }} className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-100 to-teal-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-xl float-anim">
                  <Smartphone className="w-10 h-10 text-cyan-500 drop-shadow-md" />
                </div>
                <h2 className="text-3xl font-black text-cyan-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-teal-600">Two-Factor Auth</h2>
                <p className="text-cyan-900/60 text-sm mb-8 font-medium">Enter the verification code sent to <span className="font-bold text-cyan-700">{phone}</span>.</p>
                {error && <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">{error}</div>}
                <form onSubmit={handle2FASubmit} className="space-y-4 text-left">
                  <input
                    type="text" required maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-cyan-50/50 border-2 border-cyan-100 rounded-2xl py-4 text-center text-4xl tracking-[0.4em] font-black text-cyan-950 focus:outline-none focus:border-cyan-400 focus:bg-white focus:ring-[4px] focus:ring-cyan-100 transition-all font-mono shadow-[inset_0_2px_4px_rgba(8,145,178,0.05)] text-slate-800 placeholder-teal-400"
                    placeholder="000000"
                  />
                  <button type="submit" disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 disabled:opacity-50 text-white py-4 rounded-2xl font-extrabold transition-all flex items-center justify-center gap-2 shadow-[0_8px_16px_-4px_rgba(8,145,178,0.4)] mt-6 hover:-translate-y-1 relative overflow-hidden group">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <span className="relative z-10 text-base">Verify Device</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </>
                    )}
                  </button>
                </form>
                <button onClick={() => setStep("LOGIN")} className="mt-8 text-[13px] text-cyan-500 hover:text-cyan-600 transition-colors font-bold underline decoration-cyan-200 underline-offset-4">
                  ← Back to Login
                </button>
              </motion.div>
            )}

            {step === "KEY_GEN" && (
              <motion.div key="keygen" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="relative w-32 h-32 mx-auto mb-10 flex items-center justify-center">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" as const }}
                    className="absolute inset-0 border-[4px] border-dashed border-cyan-200 rounded-full" />
                  <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 12, ease: "linear" as const }}
                    className="absolute inset-5 border-[4px] border-dashed border-teal-200 rounded-full" />
                  <div className="absolute inset-9 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-300">
                    <Cpu className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.5 }} className="absolute -top-1 -right-1 bg-white p-2.5 rounded-full shadow-xl">
                   <Key className="w-6 h-6 text-emerald-500" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-5 bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-teal-600">Executing Cryptography</h2>
                <div className="bg-cyan-50/50 rounded-2xl p-6 border border-cyan-100 border-b-[3px] shadow-sm">
                  <div className="text-cyan-900 text-[13px] space-y-4 font-mono font-bold text-left">
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[11px] shadow-sm">✓</span> Dilithium Signature Secure</motion.p>
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }} className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[11px] shadow-sm">✓</span> Tunneling Kyber-1024 Node</motion.p>
                    <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 2.5 }} className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center text-[11px] shadow-sm">✓</span> Fabricating Patient Ephemerals</motion.p>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-center text-cyan-600 text-sm font-black tracking-widest uppercase gap-3">
                  <Loader2 className="w-5 h-5 animate-spin" /> Committing Handshake...
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
        
        <p className="text-center text-[11px] font-bold text-teal-600/50 mt-10 tracking-widest uppercase">
          🔒 End-to-End Post-Quantum Lattice Node
        </p>
      </div>
    </div>
  );
}
