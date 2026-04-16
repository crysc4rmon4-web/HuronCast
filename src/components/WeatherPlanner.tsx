"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clock3, Sparkles, MapPin } from "lucide-react";
import { useWeather } from "../hooks/useWeather";
import HuronDisplay from "./HuronDisplay";
import { searchCity, type CityResult } from "../lib/geocoding";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export default function WeatherPlanner() {
  const { data, loading, error, runForecast } = useWeather();

  const today = useMemo(() => new Date(), []);
  const [date, setDate] = useState(toDateInputValue(today));
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);

  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => toDateInputValue(addDays(new Date(), 16)), []);

  async function handleCitySearch(value: string) {
    setCityQuery(value);
    setSelectedCity(null);

    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    const res = await searchCity(value);
    setResults(res);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await runForecast({
      date,
      time: time.trim() ? time : undefined,
      lat: selectedCity?.latitude,
      lon: selectedCity?.longitude,
    });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            <Sparkles size={14} />
            Crys C4rmon4 • HuronCast
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            ¿Qué me pongo hoy?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-100/75 sm:text-base">
            Elige fecha, hora y ciudad. El hurón te devuelve una recomendación clara, divertida y basada en clima real.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                <CalendarDays size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black">Planifica tu salida</h2>
                <p className="text-sm text-white/65">
                  La hora es opcional. Si la dejas vacía, usamos una lectura general del día.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="block text-sm font-semibold text-white/85">
                    Fecha
                  </span>
                  <input
                    type="date"
                    required
                    value={date}
                    min={minDate}
                    max={maxDate}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
                  />
                </label>

                <label className="space-y-2">
                  <span className="block text-sm font-semibold text-white/85">
                    Hora opcional
                  </span>
                  <div className="relative">
                    <Clock3
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
                    />
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <span className="block text-sm font-semibold text-white/85">
                  Ciudad (opcional)
                </span>

                <input
                  type="text"
                  placeholder="Ej: Madrid"
                  value={cityQuery}
                  onChange={(e) => handleCitySearch(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
                />

                {results.length > 0 && (
                  <div className="max-h-44 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60">
                    {results.map((c) => (
                      <button
                        key={`${c.name}-${c.latitude}-${c.longitude}`}
                        type="button"
                        onClick={() => {
                          setSelectedCity(c);
                          setCityQuery(`${c.name}, ${c.country}`);
                          setResults([]);
                        }}
                        className="w-full border-b border-white/5 px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/10 last:border-b-0"
                      >
                        {c.name}, {c.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-white/75">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-white/70" />
                  <p>
                    Si no eliges ciudad, usamos tu ubicación del navegador. Si eliges una ciudad, el hurón trabaja con esa referencia.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-5 py-3 font-black text-slate-950 shadow-lg transition hover:scale-[1.01] hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Sparkles size={18} />
                {loading ? "Calculando..." : "Ver outfit del hurón"}
              </button>
            </form>
          </div>

          <div className="flex w-full justify-center">
            {loading && (
              <div className="flex w-full max-w-lg flex-col items-center justify-center rounded-[2rem] border border-white/15 bg-white/10 p-10 text-center shadow-2xl backdrop-blur-lg">
                <span className="mb-4 text-7xl">🦦</span>
                <h3 className="text-2xl font-black">
                  El hurón está analizando el clima...
                </h3>
                <p className="mt-2 text-sm text-white/70">
                  Mirando temperatura, viento, lluvia y todo lo que hace falta para salir bien vestido.
                </p>
              </div>
            )}

            {!loading && error && (
              <div className="w-full max-w-lg rounded-[2rem] border border-red-400/30 bg-red-500/15 p-6 text-center shadow-2xl">
                <h3 className="text-xl font-black">Algo se quedó a medias</h3>
                <p className="mt-2 text-sm text-red-50/90">{error}</p>
              </div>
            )}

            {!loading && !error && data && <HuronDisplay advice={data} />}
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-blue-200/60">
          Built by Crys C4rmon4 • Fullstack Developer • AI-Driven Systems
        </footer>
      </div>
    </main>
  );
}