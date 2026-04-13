import { useState } from "react";
import { getWeatherData } from "../lib/weather";
import { getHuronAdvice, type HuronResponse } from "../lib/engine";

type ForecastRequest = {
  date: string;
  time?: string;
};

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

export function useWeather() {
  const [data, setData] = useState<HuronResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runForecast = async ({ date, time }: ForecastRequest) => {
    setLoading(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error("Tu navegador no soporta geolocalización.");
      }

      const position = await getPosition();
      const { latitude, longitude } = position.coords;

      const weatherRaw = await getWeatherData(latitude, longitude);
      const advice = getHuronAdvice(weatherRaw);

      setData(advice);
    } catch (err) {
      setError("No pudimos calcular el clima.");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, runForecast };
}