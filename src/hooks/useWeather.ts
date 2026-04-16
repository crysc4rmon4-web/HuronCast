import { useState } from "react";
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
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

export function useWeather() {
  const [data, setData] = useState<HuronResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runForecast = async ({ date, time, lat, lon }: ForecastRequest) => {
  setLoading(true);
  setError(null);

  try {
    let latitude = lat;
    let longitude = lon;

    // fallback GPS si no hay ciudad
    if (!latitude || !longitude) {
      const position = await getPosition();
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    }

    const weatherRaw = await getWeatherData(
      latitude!,
      longitude!,
      date,
      time
    );

    const advice = getHuronAdvice(weatherRaw);

    setData({
      ...advice,
      selectionLabel: time
        ? `${date} • ${time}`
        : `${date} • día completo`,
    });
  } catch (err) {
    setError("No pudimos obtener el clima.");
  } finally {
    setLoading(false);
  }
};

  return { data, loading, error, runForecast };
}