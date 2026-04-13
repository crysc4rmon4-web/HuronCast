import { z } from "zod";

export const weatherSchema = z.object({
  // Datos actuales para el "ahora mismo"
  current: z.object({
    temperature_2m: z.number(),
    apparent_temperature: z.number(), // Para frío/calor real
    is_day: z.number(),
    precipitation: z.number(),      // Lluvia total
    snowfall: z.number(),           // Nieve
    weather_code: z.number(),       // Código WMO (despejado, nubes, etc.)
    wind_speed_10m: z.number(),     // Viento
  }),
  // Datos diarios para el UV y Polen (suelen venir por día)
  daily: z.object({
    uv_index_max: z.array(z.number()),
    // El polen lo sacaremos de la API de Air Quality, 
    // pero lo validaremos aquí cuando unamos los datos
    birch_pollen: z.array(z.number()).optional(), 
    grass_pollen: z.array(z.number()).optional(),
  }).optional(),
});

export type WeatherData = z.infer<typeof weatherSchema>;