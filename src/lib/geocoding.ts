const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

export type CityResult = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export async function searchCity(query: string): Promise<CityResult[]> {
  if (!query || query.length < 2) return [];

  const res = await fetch(
    `${GEO_URL}?name=${encodeURIComponent(query)}&count=5&language=es&format=json`
  );

  if (!res.ok) return [];

  const data = await res.json();

  if (!data.results) return [];

  return data.results.map((c: any) => ({
    name: c.name,
    country: c.country,
    latitude: c.latitude,
    longitude: c.longitude,
  }));
}