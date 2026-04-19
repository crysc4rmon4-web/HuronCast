const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";

export type CityResult = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  countryCode: string;
};

function hasJapaneseCharacters(text: string) {
  return /[\u3040-\u30ff\u3400-\u9fff]/.test(text);
}

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, " ");
}

export async function searchCity(query: string): Promise<CityResult[]> {
  const normalized = normalizeQuery(query);

  if (normalized.length < 2) return [];

  const url = new URL(GEO_URL);
  url.searchParams.set("name", normalized);
  url.searchParams.set("count", "8");
  url.searchParams.set("format", "json");
  url.searchParams.set("language", hasJapaneseCharacters(normalized) ? "ja" : "en");

  const res = await fetch(url.toString());

  if (!res.ok) return [];

  const data = await res.json();

  if (!Array.isArray(data?.results)) return [];

  return data.results.map((item: any) => ({
    name: item.name,
    country: item.country,
    latitude: item.latitude,
    longitude: item.longitude,
    countryCode: item.country_code,
  }));
}

export async function resolveCity(query: string): Promise<CityResult | null> {
  const results = await searchCity(query);
  return results[0] ?? null;
}