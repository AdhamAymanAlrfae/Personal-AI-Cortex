'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShieldCheck, Sparkles, Activity, CheckCircle2, Cpu, Globe, Award } from 'lucide-react';

export default function ProfileHologramCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full max-w-sm mx-auto group"
    >
      {/* Outer Holographic Ambient Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-emerald-500/20 to-violet-500/30 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Main Glassmorphic Container */}
      <div className="relative rounded-3xl bg-surface-100/90 border border-white/10 backdrop-blur-xl p-5 sm:p-6 shadow-2xl overflow-hidden transition-all duration-300 group-hover:border-cyan-500/50">
        {/* Top Hologram Status Header */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              Clinical AI Verified
            </span>
          </div>

          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
            ID: ADHAM_ALREFAI
          </span>
        </div>

        {/* Profile Image with Cybernetic Frame */}
        <div className="relative mx-auto w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden mb-5 border-2 border-cyan-500/40 shadow-xl group-hover:border-cyan-400 transition-colors">
          <img
            src="/images/avatar.png"
            alt="Adham Alrefai"
            className="w-full h-full object-cover object-top filter brightness-105 group-hover:scale-105 transition-transform duration-500"
          />

          {/* Hologram Scan Line Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-surface-100/40 pointer-events-none" />

          {/* Floating Verified Badge */}
          <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-surface-50/90 border border-white/10 backdrop-blur-sm text-cyan-400 shadow-md">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
        </div>

        {/* Credentials & Telemetry Micro-Pills */}
        <div className="space-y-2">
          <div className="p-2.5 rounded-xl bg-surface-200/70 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Grad Project Acc:
            </span>
            <span className="font-bold text-emerald-400 text-[11px] font-mono">
              99.99% Test / 95% Smear
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-200/70 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              AI Research Intern:
            </span>
            <span className="font-semibold text-cyan-300 text-[11px] font-mono">
              MedStar-Georgetown
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-200/70 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              Accreditations:
            </span>
            <span className="font-semibold text-violet-300 text-[11px] font-mono">
              9 Verified Credentials
            </span>
          </div>
        </div>

        {/* Bottom Micro Status */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>// STATUS: READY</span>
          <span className="text-cyan-400">KUWAIT • WORLDWIDE</span>
        </div>
      </div>
    </div>
  );
}
