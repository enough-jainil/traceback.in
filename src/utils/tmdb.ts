const TMDB_API_KEY = "59cddbb62ceaa5026246385b46dd867a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Cache interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Cache configuration
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour in milliseconds
const movieCache = new Map<string, CacheItem<any>>();

// Helper function to check if cache is valid
function isCacheValid(timestamp: number): boolean {
  return Date.now() - timestamp < CACHE_DURATION;
}

// Generic cache wrapper for API calls
async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cached = movieCache.get(key);

  if (cached && isCacheValid(cached.timestamp)) {
    console.log(`Cache hit for ${key}`);
    return cached.data;
  }

  console.log(`Cache miss for ${key}`);
  const data = await fetchFn();
  movieCache.set(key, { data, timestamp: Date.now() });
  return data;
}

export interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  tagline: string;
  release_date: string;
  runtime: number;
  popularity: number;
  poster_path: string;
  backdrop_path: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  production_companies: Array<{
    id: number;
    name: string;
    logo_path: string | null;
  }>;
  production_countries: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  budget: number;
  revenue: number;
}

export interface MovieCredits {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }>;
  crew: Array<{
    id: number;
    name: string;
    job: string;
    department: string;
  }>;
}

export async function getMovieDetails(movieId: number): Promise<MovieDetails> {
  return withCache(`movie-${movieId}`, async () => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  });
}

export async function getMovieCredits(movieId: number): Promise<MovieCredits> {
  return withCache(`credits-${movieId}`, async () => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  });
}

export async function getSimilarMovies(movieId: number): Promise<any> {
  return withCache(`similar-${movieId}`, async () => {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  });
}

export function getImageUrl(path: string, size: string = "original"): string {
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
// Clean up expired cache items periodically
setInterval(() => {
  for (const [key, value] of movieCache.entries()) {
    if (!isCacheValid(value.timestamp)) {
      movieCache.delete(key);
    }
  }
}, CACHE_DURATION);
