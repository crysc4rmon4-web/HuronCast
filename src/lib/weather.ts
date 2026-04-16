import { weatherSchema, type WeatherData } from "./schemas";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

function getHour(value: string) {
  return Number(value.slice(11, 13));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

function max(values: number[]) {
  if (!values.length) return 0;
  return Math.max(...values);
}

function mostFrequent(values: number[]) {
  if (!values.length) return 0;

  const counts = new Map<number, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  let bestValue = values[0];
  let bestCount = 0;

  for (const [value, count] of counts.entries()) {
    if (count > bestCount) {
      bestCount = count;
      bestValue = value;
    }
  }

  return bestValue;
}

function findExactIndex(times: string[], target: string) {
  return times.findIndex((time) => time === target);
}

function findClosestIndexInDay(times: string[], targetDate: string, targetHour: number) {
  const sameDayIndexes = times
    .map((time, index) => ({ time, index }))
    .filter(({ time }) => time.startsWith(targetDate));

  if (!sameDayIndexes.length) return -1;

  let closest = sameDayIndexes[0];
  let smallestDiff = Infinity;

  for (const item of sameDayIndexes) {
    const hour = getHour(item.time);
    const diff = Math.abs(hour - targetHour);

    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = item;
    }
  }

  return closest.index;
}

function buildDaySummary(data: any, date: string): WeatherData {
  const hourly = data?.hourly;
  const times: string[] = hourly?.time ?? [];

  const dayIndexes = times
    .map((time, index) => ({ time, index }))
    .filter(({ time }) => time.startsWith(date))
    .map(({ index }) => index);

  if (!dayIndexes.length) {
    throw new Error("No hay datos horarios disponibles para la fecha elegida.");
  }

  const temperatureValues = dayIndexes.map((i) => hourly.temperature_2m?.[i] ?? 0);
  const feelsLikeValues = dayIndexes.map((i) => hourly.apparent_temperature?.[i] ?? 0);
  const precipitationValues = dayIndexes.map((i) => hourly.precipitation?.[i] ?? 0);
  const snowfallValues = dayIndexes.map((i) => hourly.snowfall?.[i] ?? 0);
  const windValues = dayIndexes.map((i) => hourly.wind_speed_10m?.[i] ?? 0);
  const uvValues = dayIndexes.map((i) => hourly.uv_index?.[i] ?? 0);
  const weatherCodeValues = dayIndexes.map((i) => hourly.weather_code?.[i] ?? 0);

  return weatherSchema.parse({
    current: {
      temperature_2m: average(temperatureValues),
      apparent_temperature: average(feelsLikeValues),
      is_day: 1,
      precipitation: sum(precipitationValues),
      snowfall: sum(snowfallValues),
      weather_code: mostFrequent(weatherCodeValues),
      wind_speed_10m: max(windValues),
      uv_index: max(uvValues),
      birch_pollen: 0,
      grass_pollen: 0,
    },
    daily: {
      uv_index_max: [max(uvValues)],
    },
  });
}

function buildHourSummary(data: any, date: string, time: string): WeatherData {
  const hourly = data?.hourly;
  const times: string[] = hourly?.time ?? [];

  const selectedTimestamp = `${date}T${time}`;
  let index = findExactIndex(times, selectedTimestamp);

  if (index === -1) {
    index = findClosestIndexInDay(times, date, Number(time.slice(0, 2)));
  }

  if (index === -1) {
    throw new Error("No se pudo encontrar la hora elegida en el forecast.");
  }

  const uvAtIndex = hourly.uv_index?.[index] ?? 0;

  return weatherSchema.parse({
    current: {
      temperature_2m: hourly.temperature_2m?.[index] ?? 0,
      apparent_temperature: hourly.apparent_temperature?.[index] ?? 0,
      is_day: 1,
      precipitation: hourly.precipitation?.[index] ?? 0,
      snowfall: hourly.snowfall?.[index] ?? 0,
      weather_code: hourly.weather_code?.[index] ?? 0,
      wind_speed_10m: hourly.wind_speed_10m?.[index] ?? 0,
      uv_index: uvAtIndex,
      birch_pollen: 0,
      grass_pollen: 0,
    },
    daily: {
      uv_index_max: [uvAtIndex],
    },
  });
}

export async function getWeatherData(
  lat: number,
  lon: number,
  date: string,
  time?: string
): Promise<WeatherData> {
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,apparent_temperature,precipitation,snowfall,weather_code,wind_speed_10m,uv_index&daily=uv_index_max&forecast_days=16&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error al obtener clima");

    const data = await res.json();

    if (!data?.hourly?.time?.length) {
      throw new Error("La API no devolvió datos horarios.");
    }

    if (time && time.trim()) {
      return buildHourSummary(data, date, time);
    }

    return buildDaySummary(data, date);
  } catch (error) {
    console.error(error);
    throw new Error("Error obteniendo clima del hurón");
  }
}