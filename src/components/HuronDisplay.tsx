"use client";

import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { Info, Droplets, SunMedium, Thermometer, Wind } from "lucide-react";
import { HuronResponse } from "../lib/engine";
import ShareButton from "./ShareButton";

const moodToImage: Record<string, string> = {
  calor: "/huron/calor.png",
  frio: "/huron/frio.png",
  lluvia: "/huron/lluvia.png",
  viento: "/huron/viento.png",
  polen: "/huron/polen.png",
  nieve: "/huron/nieve.png",
  perfecto: "/huron/perfecto.png",
};

const moodTheme: Record<
  string,
  {
    shell: string;
    badge: string;
    accent: string;
  }
> = {
  calor: {
    shell: "from-amber-400/20 via-orange-400/10 to-slate-950/10",
    badge: "bg-amber-300 text-amber-950",
    accent: "bg-amber-400",
  },
  frio: {
    shell: "from-sky-300/20 via-indigo-300/10 to-slate-950/10",
    badge: "bg-sky-200 text-sky-950",
    accent: "bg-sky-400",
  },
  lluvia: {
    shell: "from-slate-500/20 via-blue-400/10 to-slate-950/10",
    badge: "bg-blue-200 text-blue-950",
    accent: "bg-blue-400",
  },
  viento: {
    shell: "from-cyan-300/20 via-sky-200/10 to-slate-950/10",
    badge: "bg-cyan-200 text-cyan-950",
    accent: "bg-cyan-400",
  },
  polen: {
    shell: "from-lime-300/20 via-emerald-200/10 to-slate-950/10",
    badge: "bg-lime-200 text-lime-950",
    accent: "bg-lime-400",
  },
  nieve: {
    shell: "from-white/20 via-blue-100/10 to-slate-950/10",
    badge: "bg-white text-slate-950",
    accent: "bg-white",
  },
  perfecto: {
    shell: "from-indigo-300/20 via-blue-300/10 to-slate-950/10",
    badge: "bg-indigo-200 text-indigo-950",
    accent: "bg-indigo-400",
  },
};

export default function HuronDisplay({ advice }: { advice: HuronResponse }) {
  const huronVariants: Variants = {
    calor: {
      y: [0, -10, 0],
      scale: [1, 1.04, 1],
      rotate: [-1, 1, 0],
      transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
    },
    frio: {
      x: [-2, 2, -2, 2],
      transition: { duration: 0.8, repeat: Infinity, ease: "linear" },
    },
    lluvia: {
      rotate: [-4, 4, -4],
      y: [0, 2, 0],
      transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
    },
    viento: {
      x: [0, 14, -8, 0],
      skewX: [0, 5, -5, 0],
      transition: { duration: 1.6, repeat: Infinity, ease: "linear" },
    },
    perfecto: {
      y: [0, -6, 0],
      rotate: [0, 4, -4, 0],
      transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" },
    },
    nieve: {
      y: [0, 8, 0],
      transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" },
    },
    polen: {
      x: [0, 3, 0],
      y: [0, -3, 0],
      transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" },
    },
  };

  const metrics = [
    {
      label: "Temp",
      value: `${Math.round(advice.temperature)}°`,
      icon: Thermometer,
    },
    {
      label: "Sensación",
      value: `${Math.round(advice.feelsLike)}°`,
      icon: Thermometer,
    },
    {
      label: "UV",
      value: `${Math.round(advice.uvIndex)}`,
      icon: SunMedium,
    },
    {
      label: "Viento",
      value: `${Math.round(advice.windSpeed)} km/h`,
      icon: Wind,
    },
    {
      label: "Lluvia",
      value: `${advice.precipitation.toFixed(1)} mm`,
      icon: Droplets,
    },
  ];

  const imageSrc = moodToImage[advice.mood] ?? moodToImage.perfecto;
  const theme = moodTheme[advice.mood] ?? moodTheme.perfecto;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br ${theme.shell} shadow-2xl backdrop-blur-xl`}
    >
      <div className="grid min-h-[440px] lg:grid-rows-[1fr_auto]">
        <div className="relative flex items-center justify-center px-5 pt-6 sm:px-8 sm:pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />

          <motion.div
            variants={huronVariants}
            animate={advice.mood}
            className="relative w-full max-w-[360px]"
          >
            <div className="absolute -inset-8 rounded-full bg-white/10 blur-3xl" />
            <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 shadow-xl">
              <Image
                src={imageSrc}
                alt={`HuronCast ${advice.mood}`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4 sm:p-6"
              />
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/10 bg-slate-950/10 p-5 sm:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              {advice.selectionLabel && (
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                  {advice.selectionLabel}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-widest ${theme.badge}`}>
                {advice.label}
              </span>
              <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-slate-950 ${theme.accent}`}>
                AI-driven weather fit
              </span>
            </div>

            <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">
              {advice.message}
            </h2>

            <div className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg">
              👔 {advice.outfit}
            </div>

            <ShareButton advice={advice} />

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              {metrics.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-white/10 p-3 text-left text-white shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-white/70">
                      <Icon size={12} />
                      <span>{item.label}</span>
                    </div>
                    <div className="mt-1 text-sm font-black">{item.value}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
            <p className="font-semibold text-white/90">Lectura rápida</p>
            <p className="mt-1 leading-relaxed">
              La app traduce clima real en una decisión simple: qué ponerse, sin ruido y sin fricción.
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-tighter text-white/50">
            <div className="flex items-center gap-2">
              <Info size={12} />
              <span>Built by Crys C4rmon4</span>
            </div>
            <span>AI-Driven Fullstack</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}