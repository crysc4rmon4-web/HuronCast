import { useCallback, useState } from "react";
import { getWeatherData } from "../lib/weather";
import { getHuronAdvice, type HuronResponse } from "../lib/engine";

type ForecastRequest = {
  date: string;
  time?: string;
  lat?: number;
  lon?: number;
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

  const runForecast = useCallback(async ({ date, time, lat, lon }: ForecastRequest) => {
    setLoading(true);
    setError(null);

    try {
      let latitude = lat;
      let longitude = lon;

      if (latitude == null || longitude == null) {
        try {
          const position = await getPosition();
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch {
          throw new Error("No pudimos usar tu ubicación. Escribe una ciudad para continuar.");
        }
      }

      const weatherRaw = await getWeatherData(latitude, longitude, date, time);
      const advice = getHuronAdvice(weatherRaw);

      setData({
        ...advice,
        selectionLabel: time ? `${date} • ${time}` : `${date} • día completo`,
      });
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error ? err.message : "No pudimos obtener el clima."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, runForecast };
}