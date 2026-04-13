import { useState, useEffect } from 'react';
// Usamos rutas relativas para saltarnos cualquier error de configuración del alias @
import { getWeatherData } from '../lib/weather';
import { getHuronAdvice, type HuronResponse } from '../lib/engine';

export function useWeather() {
  const [data, setData] = useState<HuronResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización, bro.");
      setLoading(false);
      return;
    }

    const fetchHuronData = async () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherRaw = await getWeatherData(latitude, longitude);
            const advice = getHuronAdvice(weatherRaw);
            
            setData(advice);
            setError(null);
          } catch (err) {
            setError("No pude conectar con el satélite del Hurón.");
          } finally {
            setLoading(false);
          }
        },
        (geoError) => {
          const msg = geoError.code === 1 
            ? "Dame permiso para el GPS, si no, el hurón no sabe dónde estás." 
            : "Error obteniendo ubicación.";
          setError(msg);
          setLoading(false);
        },
        { timeout: 10000 }
      );
    };

    fetchHuronData();
  }, []);

  return { data, loading, error };
}