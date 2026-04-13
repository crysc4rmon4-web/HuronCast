import { WeatherData } from "./schemas";

export type HuronMood =
  | "calor"
  | "frio"
  | "lluvia"
  | "viento"
  | "polen"
  | "nieve"
  | "perfecto";

export interface HuronResponse {
  mood: HuronMood;
  label: string;
  message: string;
  outfit: string;
  temperature: number;
  feelsLike: number;
  windSpeed: number;
  uvIndex: number;
  precipitation: number;
  snowfall: number;
  pollen: number;
  selectionLabel?: string;
}

function extractNumber(val: number | number[] | undefined | null): number {
  if (val === null || val === undefined) return 0;
  if (Array.isArray(val)) return typeof val[0] === "number" ? val[0] : 0;
  return typeof val === "number" ? val : 0;
}

export function getHuronAdvice(data: WeatherData): HuronResponse {
  const { current, daily } = data;

  const temperature = extractNumber(current.temperature_2m);
  const feelsLike = extractNumber(current.apparent_temperature);
  const uvFromCurrent = extractNumber(current.uv_index);
  const uvFromDaily = extractNumber(daily?.uv_index_max);
  const uvIndex = uvFromCurrent > 0 ? uvFromCurrent : uvFromDaily;

  const precipitation = extractNumber(current.precipitation);
  const snowfall = extractNumber(current.snowfall);
  const windSpeed = extractNumber(current.wind_speed_10m);

  const birch = extractNumber(current.birch_pollen);
  const grass = extractNumber(current.grass_pollen);
  const pollen = birch + grass;

  if (snowfall > 0) {
    if (snowfall > 5) {
      return {
        mood: "nieve",
        label: "Nieve fuerte",
        message: "Hoy pinta blanco. Abrígate a full y ve con calma.",
        outfit: "Anorak térmico, gorro y botas",
        temperature,
        feelsLike,
        windSpeed,
        uvIndex,
        precipitation,
        snowfall,
        pollen,
      };
    }

    return {
      mood: "nieve",
      label: "Nieve leve",
      message: "Caen copos. Abrigo serio y cuidado con el suelo.",
      outfit: "Abrigo cálido y botas",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (precipitation > 0) {
    if (precipitation > 10) {
      return {
        mood: "lluvia",
        label: "Lluvia fuerte",
        message: "Lluvia en modo jefe final. Paraguas sí o sí.",
        outfit: "Chubasquero, paraguas y zapatillas resistentes",
        temperature,
        feelsLike,
        windSpeed,
        uvIndex,
        precipitation,
        snowfall,
        pollen,
      };
    }

    return {
      mood: "lluvia",
      label: "Lluvia ligera",
      message: "Hoy mojarse es opción. Mejor sal con algo impermeable.",
      outfit: "Cortavientos ligero y paraguas",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (windSpeed >= 35) {
    return {
      mood: "viento",
      label: "Viento fuerte",
      message: "El viento viene con actitud. No lleves nada suelto.",
      outfit: "Chaqueta corta-viento",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (pollen >= 50) {
    return {
      mood: "polen",
      label: "Polen alto",
      message: "Polen en zona roja. Gafas y paciencia.",
      outfit: "Gafas, ropa ligera y pañuelos",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (uvIndex >= 7) {
    return {
      mood: "calor",
      label: "UV alto",
      message: "Día muy fuerte. Bloqueador, agua y sombra.",
      outfit: "Camiseta fresca, gorra y crema solar",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (feelsLike <= 5) {
    return {
      mood: "frio",
      label: "Frío intenso",
      message: "Hace fresco de verdad. Capas encima y listo.",
      outfit: "Abrigo, bufanda y gorro",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (feelsLike <= 15) {
    return {
      mood: "frio",
      label: "Frío suave",
      message: "Está templado tirando a fresco. Una capa extra no sobra.",
      outfit: "Sudadera o chaqueta ligera",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  if (feelsLike >= 30) {
    return {
      mood: "calor",
      label: "Calor fuerte",
      message: "Mucho calor. Modo verano activado.",
      outfit: "Ropa ligera, agua y bloqueador",
      temperature,
      feelsLike,
      windSpeed,
      uvIndex,
      precipitation,
      snowfall,
      pollen,
    };
  }

  return {
    mood: "perfecto",
    label: "Día top",
    message: "Día cómodo. Puedes salir sin pensar demasiado.",
    outfit: "Ropa casual y cómoda",
    temperature,
    feelsLike,
    windSpeed,
    uvIndex,
    precipitation,
    snowfall,
    pollen,
  };
}