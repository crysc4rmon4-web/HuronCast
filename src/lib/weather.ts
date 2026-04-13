import { weatherSchema, type WeatherData } from "./schemas";

const BASE_URL_WEATHER = "https://api.open-meteo.com/v1/forecast";
const BASE_URL_AIR = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  // Construimos las URLs con los parámetros que pide tu esquema
  const weatherUrl = `${BASE_URL_WEATHER}?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,is_day,precipitation,snowfall,weather_code,wind_speed_10m&daily=uv_index_max&timezone=auto`;
  
  const airUrl = `${BASE_URL_AIR}?latitude=${lat}&longitude=${lon}&current=birch_pollen,grass_pollen&timezone=auto`;

  try {
    // Disparamos ambas peticiones a la vez (Performance ++)
    const [weatherRes, airRes] = await Promise.all([
      fetch(weatherUrl),
      fetch(airUrl)
    ]);

    if (!weatherRes.ok || !airRes.ok) throw new Error("Error al obtener datos del servidor");

    const weatherData = await weatherRes.json();
    const airData = await airRes.json();

    // Combinamos los datos en un solo objeto que encaje con nuestro Zod
    const combinedData = {
      ...weatherData,
      daily: {
        ...weatherData.daily,
        birch_pollen: [airData.current.birch_pollen],
        grass_pollen: [airData.current.grass_pollen],
      }
    };

    // Validamos con Zod. Si la API manda basura, aquí saltará el error.
    return weatherSchema.parse(combinedData);
    
  } catch (error) {
    console.error("Fallo en HuronCast Engine:", error);
    throw new Error("No pudimos conectar con el satélite del Hurón.");
  }
}