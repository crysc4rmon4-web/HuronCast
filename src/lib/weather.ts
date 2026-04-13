import { weatherSchema, type WeatherData } from "./schemas";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

function findClosestIndex(times: string[], target: string) {
  const targetTime = new Date(target).getTime();

  let closestIndex = 0;
  let smallestDiff = Infinity;

  times.forEach((time, i) => {
    const current = new Date(time).getTime();
    const diff = Math.abs(current - targetTime);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = i;
    }
  });

  return closestIndex;
}

export async function getWeatherData(
  lat: number,
  lon: number,
  date: string,
  time?: string
): Promise<WeatherData> {
  const selectedTime = `${date}T${time || "12:00"}`;

  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,snowfall,weather_code,wind_speed_10m,uv_index&daily=uv_index_max&forecast_days=16&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener clima");

    const data = await res.json();

    const index = findClosestIndex(data.hourly.time, selectedTime);

    const current = {
      temperature_2m: data.hourly.temperature_2m[index],
      apparent_temperature: data.hourly.apparent_temperature[index],
      is_day: 1,
      precipitation: data.hourly.precipitation[index],
      snowfall: data.hourly.snowfall[index],
      weather_code: data.hourly.weather_code[index],
      wind_speed_10m: data.hourly.wind_speed_10m[index],
      uv_index: data.hourly.uv_index[index],
      birch_pollen: 0,
      grass_pollen: 0,
    };

    const combined = {
      current,
      daily: {
        uv_index_max: data.daily.uv_index_max || [],
      },
    };

    return weatherSchema.parse(combined);
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo clima del hurón");
  }
}