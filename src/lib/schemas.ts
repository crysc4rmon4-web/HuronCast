import { z } from "zod";

const currentSchema = z.object({
  temperature_2m: z.number().optional().default(0),
  apparent_temperature: z.number().optional().default(0),
  is_day: z.number().optional().default(1),
  precipitation: z.number().optional().default(0),
  snowfall: z.number().optional().default(0),
  weather_code: z.number().optional().default(0),
  wind_speed_10m: z.number().optional().default(0),
  uv_index: z.number().optional().default(0),
  birch_pollen: z.number().optional().default(0),
  grass_pollen: z.number().optional().default(0),
});

export const weatherSchema = z.object({
  current: currentSchema,
  daily: z
    .object({
      uv_index_max: z.array(z.number()).optional().default([]),
    })
    .optional(),
});

export type WeatherData = z.infer<typeof weatherSchema>;