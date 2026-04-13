import { WeatherData } from "./schemas";

export type HuronMood = "calor" | "frio" | "lluvia" | "viento" | "polen" | "nieve" | "perfecto";

export interface HuronResponse {
  mood: HuronMood;
  label: string;
  message: string;
  outfit: string;
}

/**
 * Utilidad para extraer el primer valor numérico de un posible array o número.
 * Blindado para producción: maneja undefined, null, arrays vacíos y números puros.
 */
function extractNumber(val: number | number[] | undefined | null): number {
  if (val === null || val === undefined) return 0;
  if (Array.isArray(val)) {
    return typeof val === 'number' ? val : 0;
  }
  return typeof val === 'number' ? val : 0;
}

export function getHuronAdvice(data: WeatherData): HuronResponse {
  const { current, daily } = data;
  
  // --- EXTRACCIÓN SEGURA ---
  const birch = extractNumber(daily?.birch_pollen);
  const grass = extractNumber(daily?.grass_pollen);
  const polenTotal = birch + grass;

  const uv = extractNumber(daily?.uv_index_max);
  
  const lluvia = current.precipitation ?? 0;
  const nieve = current.snowfall ?? 0;
  const viento = current.wind_speed_10m ?? 0;
  const sensacion = current.apparent_temperature ?? 0;

  // --- LÓGICA DE PRIORIDADES ---

  // 1. Nieve
  if (nieve > 0) {
    if (nieve > 5) return { mood: "nieve", label: "Nieve Extrema", message: "¡Bro, saca el trineo y el anorak térmico!", outfit: "Anorak de expedición" };
    return { mood: "nieve", label: "Nieve Leve", message: "Cae algo de nieve, ponte botas que resbala.", outfit: "Botas y abrigo" };
  }

  // 2. Lluvia
  if (lluvia > 0) {
    if (lluvia > 10) return { mood: "lluvia", label: "Lluvia Fuerte", message: "Está cayendo el diluvio, quédate en la cueva.", outfit: "Chubasquero y paraguas" };
    return { mood: "lluvia", label: "Lluvia Débil", message: "Chirimiri... una gorrita y vas que chutas.", outfit: "Gorra o cortavientos" };
  }

  // 3. Viento
  if (viento > 40) return { mood: "viento", label: "Viento Fuerte", message: "Cuidado que sales volando como una cometa.", outfit: "Cortavientos ajustado" };

  // 4. Polen
  if (polenTotal > 50) return { mood: "polen", label: "Polen Extremo", message: "Hey, tus ojos van a sufrir. ¡Lleva pañuelos y gafas!", outfit: "Gafas de sol y antihistamínico" };

  // 5. Sol y UV
  if (uv > 7) return { mood: "calor", label: "Sol Extremo", message: "El sol pica. Ponte crema o serás un hurón frito.", outfit: "Crema solar y gorra" };

  // 6. Frío vs Calor
  if (sensacion < 5) return { mood: "frio", label: "Frío Extremo", message: "Nivel pingüino. Abrígate hasta las orejas.", outfit: "Bufanda, gorro y plumas" };
  if (sensacion < 15) return { mood: "frio", label: "Frío Leve", message: "Refresca un poco, una rebequita no sobra.", outfit: "Sudadera o chaqueta" };
  
  if (sensacion > 30) return { mood: "calor", label: "Calor Fuerte", message: "Bro, hace un calor de locos. Busca una sombra.", outfit: "Bermudas y camiseta" };

  // 7. Por defecto
  return { 
    mood: "perfecto", 
    label: "Día Top", 
    message: "Día perfecto para pasear. ¡Ni frío ni calor!", 
    outfit: "Ropa cómoda" 
  };
}