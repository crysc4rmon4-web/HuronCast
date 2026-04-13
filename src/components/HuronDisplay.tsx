"use client";

import { motion, Variants } from "framer-motion";
import { HuronResponse } from "../lib/engine";
import { Info } from "lucide-react";

export default function HuronDisplay({ advice }: { advice: HuronResponse }) {

  const huronVariants: Variants = {
    calor: {
      y: [0, -15, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    },
    frio: {
      x: [-3, 3, -3, 3],
      transition: { duration: 0.2, repeat: Infinity, ease: "linear" }
    },
    lluvia: {
      rotate: [-8, 8, -8],
      transition: { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
    },
    viento: {
      x: [0, 20, 0],
      skewX: [0, 5, -5, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
    },
    perfecto: {
      rotate: [0, 360],
      transition: { duration: 20, repeat: Infinity, ease: "linear" }
    },
    nieve: {
      y: [0, 12, 0],
      opacity: [1, 0.7, 1],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/10 backdrop-blur-lg rounded-[2.5rem] border border-white/20 shadow-2xl max-w-sm w-full">

      {/* HURÓN */}
      <motion.div
        variants={huronVariants}
        animate={advice.mood}
        className="text-9xl mb-8 select-none"
        style={{ display: "inline-block" }}
      >
        🦦
      </motion.div>

      {/* CONTENIDO */}
      <div className="text-center space-y-4">

        <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-widest">
          {advice.label}
        </span>

        <h2 className="text-3xl font-black text-white leading-tight">
          "{advice.message}"
        </h2>

        <div className="pt-2">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-yellow-400 text-blue-900 rounded-2xl text-sm font-black shadow-lg">
            👔 {advice.outfit}
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between w-full mt-10 pt-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-tighter">
          <Info size={12} />
          <span>HuronCast v1.0 • Codespace Build</span>
        </div>
      </div>

    </div>
  );
}