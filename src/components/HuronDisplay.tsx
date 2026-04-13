"use client";

import { motion, Variants } from "framer-motion";
import { Info, Droplets, SunMedium, Thermometer, Wind } from "lucide-react";
import { HuronResponse } from "../lib/engine";

export default function HuronDisplay({ advice }: { advice: HuronResponse }) {
  const huronVariants: Variants = {
    calor: {
      y: [0, -15, 0],
      scale: [1, 1.08, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" },
    },
    frio: {
      x: [-3, 3, -3, 3],
      transition: { duration: 0.6, repeat: Infinity, ease: "linear" },
    },
    lluvia: {
      rotate: [-8, 8, -8],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" },
    },
    viento: {
      x: [0, 20, 0],
      skewX: [0, 5, -5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" },
    },
    perfecto: {
      rotate: [0, 360],
      transition: { duration: 20, repeat: Infinity, ease: "linear" },
    },
    nieve: {
      y: [0, 12, 0],
      opacity: [1, 0.7, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
    polen: {
      y: [0, -6, 0],
      x: [0, 4, 0],
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

  return (
    <div className="w-full max-w-lg rounded-[2.5rem] border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-lg">
      <div className="flex flex-col items-center">
        <motion.div
          variants={huronVariants}
          animate={advice.mood}
          className="mb-6 select-none text-9xl"
          style={{ display: "inline-block" }}
        >
          🦦
        </motion.div>

        <div className="text-center space-y-4">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            {advice.label}
          </span>

          <h2 className="text-3xl font-black leading-tight text-white">
            {advice.message}
          </h2>

          <div className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-5 py-2 text-sm font-black text-blue-950 shadow-lg">
            👔 {advice.outfit}
          </div>
        </div>

        <div className="mt-8 grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
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

        <div className="mt-10 flex w-full items-center justify-between border-t border-white/10 pt-6">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-white/50">
            <Info size={12} />
            <span>Built by Crys C4rmon4</span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-tighter text-white/40">
            AI-Driven Fullstack
          </div>
        </div>
      </div>
    </div>
  );
}