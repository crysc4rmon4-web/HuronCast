"use client";

import { Share2 } from "lucide-react";
import { HuronResponse } from "../lib/engine";

export default function ShareButton({ advice }: { advice: HuronResponse }) {
  const text = `🦦 HuronCast dice:
${advice.message}

👕 Outfit: ${advice.outfit}
🌡 ${Math.round(advice.temperature)}° | 💨 ${Math.round(advice.windSpeed)} km/h

#HuronCast`;

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "HuronCast",
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Copiado al portapapeles 🚀");
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-white/30"
    >
      <Share2 size={14} />
      Compartir
    </button>
  );
}