import { weatherSchema, type WeatherData } from "./schemas";

const BASE_URL_WEATHER = "https://api.open-meteo.com/v1/forecast";
const BASE_URL_AIR = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  const weatherUrl = new URL(BASE_URL_WEATHER);
  weatherUrl.searchParams.set("latitude", String(lat));
  weatherUrl.searchParams.set("longitude", String(lon));
  weatherUrl.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,is_day,precipitation,snowfall,weather_code,wind_speed_10m,uv_index"
  );
  weatherUrl.searchParams.set("daily", "uv_index_max");
  weatherUrl.searchParams.set("forecast_days", "7");
  weatherUrl.searchParams.set("timezone", "auto");

  const airUrl = new URL(BASE_URL_AIR);
  airUrl.searchParams.set("latitude", String(lat));
  airUrl.searchParams.set("longitude", String(lon));
  airUrl.searchParams.set("current", "birch_pollen,grass_pollen");
  airUrl.searchParams.set("timezone", "auto");

  try {
    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl.toString()),
      fetch(airUrl.toString()),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status}`);
    }

    if (!airRes.ok) {
      throw new Error(`Air quality API error: ${airRes.status}`);
    }

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    const combinedData = {
      ...weatherData,
      current: {
        ...weatherData.current,
        birch_pollen: airData?.current?.birch_pollen ?? 0,
        grass_pollen: airData?.current?.grass_pollen ?? 0,
      },
    };

    return weatherSchema.parse(combinedData);
  } catch (error) {
    console.error("Fallo en HuronCast Engine:", error);
    throw new Error("No pudimos conectar con el clima del hurón.");
  }
}