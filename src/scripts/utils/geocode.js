import CONFIG from "../config";

const GEOCODE_API_URL = "https://api.maptiler.com/geocoding";
const API_KEY = CONFIG.MAP_API_KEY;
const geocodeCache = new Map();

export async function reverseGeocode(lat, lon) {
  const cacheKey = `${lat},${lon}`;
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey); // Return cached result
  }

  try {
    const response = await fetch(
      `${GEOCODE_API_URL}/${lon},${lat}.json?key=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }
    const data = await response.json();

    // Extract city and country from the response
    const place = data.features.find((feature) =>
      feature.place_type.includes("place")
    );
    const country = data.features.find((feature) =>
      feature.place_type.includes("country")
    );

    const city = place ? place.text : "Unknown City";
    const countryName = country ? country.text : "Unknown Country";
    const location = `${city}, ${countryName}`;

    geocodeCache.set(cacheKey, location); // Cache the result
    return location;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return "Unknown Location";
  }
}