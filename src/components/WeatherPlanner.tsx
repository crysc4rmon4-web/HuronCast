"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
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

function toTimeInputValue(date: Date) {
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

type ForecastMode = "full-day" | "exact-time";

export default function WeatherPlanner() {
  const { data, loading, error, runForecast } = useWeather();

  const today = useMemo(() => new Date(), []);
  const [date, setDate] = useState(toDateInputValue(today));
  const [time, setTime] = useState(toTimeInputValue(today));
  const [mode, setMode] = useState<ForecastMode>("full-day");

  // Estados para búsqueda y debounce
  const [cityQuery, setCityQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityResult | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const didAutoLoad = useRef(false);

  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => toDateInputValue(addDays(new Date(), 16)), []);

  // 1. Carga inicial automática
  useEffect(() => {
    if (didAutoLoad.current) return;
    didAutoLoad.current = true;

    void runForecast({
      date: toDateInputValue(new Date()),
    });
  }, [runForecast]);

  // 2. Lógica de DEBOUNCE para búsqueda de ciudad
  useEffect(() => {
    // Si el query es corto o ya seleccionamos esta ciudad, no busques
    const cleaned = cityQuery.trim();
    if (cleaned.length < 2 || (selectedCity && cleaned === `${selectedCity.name}, ${selectedCity.country}`)) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchCity(cleaned);
        setResults(res);
      } catch (err) {
        console.error("Error buscando ciudad:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms de espera

    return () => clearTimeout(timer);
  }, [cityQuery, selectedCity]);

  // Manejador del cambio en el input
  function handleInputChange(value: string) {
    setCityQuery(value);
    setCityError(null);
    // Si el usuario borra o cambia el texto, quitamos la selección previa para permitir nueva búsqueda
    if (selectedCity && value !== `${selectedCity.name}, ${selectedCity.country}`) {
      setSelectedCity(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCityError(null);

    // 1. Declaramos la variable permitiendo que sea objeto o nulo
    let city: CityResult | null = selectedCity;

    if (!city && cityQuery.trim()) {
      const res = await searchCity(cityQuery);

      // 2. CORRECCIÓN PROFESIONAL:
      // res es CityResult[] (una lista).
      // city necesita ser CityResult (un solo item).
      // Accedemos al índice para extraer el objeto de la lista.
      city = (res && res.length > 0) ? res[0] : null;

      if (!city) {
        setCityError(
          `No encontramos una ciudad válida para "${cityQuery}". Prueba con otro nombre o selecciónala de la lista.`
        );
        return;
      }

      setSelectedCity(city);
      setCityQuery(`${city.name}, ${city.country}`);
      setResults([]);
    }

    // 3. Al pasar los datos, usamos encadenamiento opcional city?. para mayor seguridad
    await runForecast({
      date,
      time: mode === "exact-time" && time.trim() ? time : undefined,
      lat: city?.latitude,
      lon: city?.longitude,
    });
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-blue-700 to-slate-950 px-4 py-6 text-white sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <header className="text-center">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
            <Sparkles size={14} />
            Crys C4rmon4 • HuronCast
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            ¿Qué me pongo hoy?
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-100/75 sm:text-base">
            Elige fecha, modo y ciudad. El hurón te devuelve una recomendación clara, divertida y basada en clima real.
          </p>
        </header>

        <section className="overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl">
          <div className="grid lg:grid-cols-[0.98fr_1.02fr]">
            <div className="order-2 bg-slate-950/10 p-5 sm:p-7 lg:order-1">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black">Planifica tu salida</h2>
                  <p className="text-sm text-white/65">
                    Día completo por defecto. Si quieres precisión, activas hora exacta.
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
                      className="w-full appearance-none rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
                    />
                  </label>

                  <div className="space-y-2">
                    <span className="block text-sm font-semibold text-white/85">
                      Modo de tiempo
                    </span>

                    <div className="grid grid-cols-2 rounded-2xl border border-white/15 bg-white/10 p-1">
                      <button
                        type="button"
                        onClick={() => setMode("full-day")}
                        className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                          mode === "full-day"
                            ? "bg-yellow-400 text-slate-950 shadow-lg"
                            : "text-white/75 hover:bg-white/10"
                        }`}
                        aria-pressed={mode === "full-day"}
                      >
                        Día completo
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode("exact-time")}
                        className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                          mode === "exact-time"
                            ? "bg-yellow-400 text-slate-950 shadow-lg"
                            : "text-white/75 hover:bg-white/10"
                        }`}
                        aria-pressed={mode === "exact-time"}
                      >
                        Hora exacta
                      </button>
                    </div>
                  </div>
                </div>

                {mode === "exact-time" ? (
                  <label className="space-y-2">
                    <span className="block text-sm font-semibold text-white/85">
                      Hora
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
                        className="w-full appearance-none rounded-2xl border border-white/15 bg-white/10 py-3 pl-10 pr-4 text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
                      />
                    </div>
                  </label>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/20 p-4 text-sm text-white/75">
                    <div className="flex items-start gap-3">
                      <Clock3 size={16} className="mt-0.5 shrink-0 text-white/70" />
                      <p>
                        Estás en modo día completo. El hurón leerá el promedio del día y no una hora concreta.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-white/85">
                    Ciudad (opcional)
                  </span>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ej: Madrid"
                      value={cityQuery}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-white/30 focus:bg-white/15"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                         <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      </div>
                    )}
                  </div>

                  {cityError && (
                    <p className="text-sm font-semibold text-red-200">
                      {cityError}
                    </p>
                  )}

                  {results.length > 0 && (
                    <div className="max-h-44 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/60 backdrop-blur-xl">
                      {results.map((c) => (
                        <button
                          key={`${c.name}-${c.latitude}-${c.longitude}`}
                          type="button"
                          onClick={() => {
                            setSelectedCity(c);
                            setCityQuery(`${c.name}, ${c.country}`);
                            setResults([]);
                            setCityError(null);
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

            <div className="order-1 border-b border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 sm:p-6 lg:order-2 lg:border-b-0">
              {loading && (
                <div className="relative flex min-h-[440px] flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),transparent_55%)]" />
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Hoy ahora
                    </span>
                    <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold text-white/70">
                      HuronCast
                    </span>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center py-6">
                    <div className="relative h-[300px] w-full max-w-[380px]">
                      <Image
                        src="/huron/loading-huron.png"
                        alt="El hurón está mirando el cielo"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                    </div>
                  </div>

                  <div className="relative rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-black text-white">
                      El hurón está mirando el cielo
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      Calculando clima real y afinando tu outfit.
                    </p>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="relative flex min-h-[440px] flex-col overflow-hidden rounded-[2rem] border border-red-400/30 bg-red-500/15 p-5 shadow-xl">
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Oops
                    </span>
                    <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold text-white/70">
                      HuronCast
                    </span>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center py-6">
                    <div className="relative h-[300px] w-full max-w-[380px]">
                      <Image
                        src="/huron/home-hero.png"
                        alt="HuronCast"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                    </div>
                  </div>

                  <div className="relative rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-black text-white">
                      Algo se quedó a medias
                    </p>
                    <p className="mt-1 text-sm text-red-50/90">{error}</p>
                  </div>
                </div>
              )}

              {!loading && !error && data && <HuronDisplay advice={data} />}

              {!loading && !error && !data && (
                <div className="relative flex min-h-[440px] flex-col overflow-hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-xl">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
                      Listo
                    </span>
                    <span className="rounded-full bg-black/15 px-3 py-1 text-[11px] font-semibold text-white/70">
                      HuronCast
                    </span>
                  </div>

                  <div className="relative flex flex-1 items-center justify-center py-6">
                    <div className="relative h-[300px] w-full max-w-[380px]">
                      <Image
                        src="/huron/home-hero.png"
                        alt="HuronCast home hero"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain p-4"
                      />
                    </div>
                  </div>

                  <div className="relative rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
                    <p className="text-sm font-black text-white">
                      El hurón está listo para decidir
                    </p>
                    <p className="mt-1 text-sm text-white/75">
                      Elige fecha, modo o ciudad y te devuelve una respuesta clara al instante.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-xs text-blue-200/60">
          Built by Crys C4rmon4 • Fullstack Developer • AI-Driven Systems
        </footer>
      </div>
    </main>
  );
}