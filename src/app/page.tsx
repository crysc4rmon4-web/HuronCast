"use client";

import { useWeather } from "../hooks/useWeather";
import HuronDisplay from "../components/HuronDisplay";

export default function Home() {
  const { data, loading, error } = useWeather();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-900 flex flex-col items-center justify-center p-4">

      <h1 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase">
        HuronCast
      </h1>

      {loading && (
        <div className="text-white animate-pulse flex flex-col items-center gap-4">
          <span className="text-6xl">🦦</span>
          <p>El hurón está mirando por la ventana...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-xl text-center">
          <p>{error}</p>
        </div>
      )}

      {data && <HuronDisplay advice={data} />}

      <footer className="mt-12 text-blue-300/50 text-xs">
        © 2026 Student Project • Sin AI Traces
      </footer>

    </main>
  );
}