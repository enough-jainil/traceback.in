import { Redis } from "@upstash/redis";

const TMDB_API_KEY = import.meta.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Cache configuration
const CACHE_DURATION = 60 * 60; // 1 hour in seconds

// In-memory fallback cache
const memoryCache = new Map<string, { data: any; timestamp: number }>();

// Redis client initialization with proper error handling
let redis: Redis | null = null;
try {
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
}

// Generic cache wrapper with Redis and memory fallback
async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = `tmdb:${key}`;

  try {
    // Try Redis first if available
    if (redis) {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Redis cache hit for ${key}`);
        return JSON.parse(cachedData as string);
      }
    }

    // Check memory cache if Redis fails or is unavailable
    const memoryCached = memoryCache.get(cacheKey);
    if (
      memoryCached &&
      Date.now() - memoryCached.timestamp < CACHE_DURATION * 1000
    ) {
      console.log(`Memory cache hit for ${key}`);
      return memoryCached.data;
    }

    // Fetch fresh data if no cache hit
    console.log(`Cache miss for ${key}`);
    const data = await fetchFn();

    // Store in both caches
    try {
      if (redis) {
        await redis.setex(cacheKey, CACHE_DURATION, JSON.stringify(data));
      }
      memoryCache.set(cacheKey, { data, timestamp: Date.now() });
    } catch (error) {
      console.error("Cache storage error:", error);
    }

    return data;
  } catch (error) {
    console.error("Cache error:", error);
    // Final fallback: direct API call
    return fetchFn();
  }
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

// The following functions also store cache for TV show data
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

export interface TVShowDetails {
  id: number;
  name: string;
  overview: string;
  tagline: string;
  first_air_date: string;
  last_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time: number[];
  status: string;
  poster_path: string;
  backdrop_path: string;
  genres: Array<{
    id: number;
    name: string;
  }>;
  networks: Array<{
    id: number;
    name: string;
    logo_path: string;
  }>;
  created_by: Array<{
    id: number;
    name: string;
    profile_path: string;
  }>;
  vote_average: number;
  vote_count: number;
}

export async function getTVShowDetails(tvId: number): Promise<TVShowDetails> {
  return withCache(`tv-${tvId}`, async () => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  });
}

export async function getTVShowCredits(tvId: number): Promise<MovieCredits> {
  return withCache(`tv-credits-${tvId}`, async () => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  });
}

export async function getSimilarTVShows(tvId: number): Promise<any> {
  return withCache(`tv-similar-${tvId}`, async () => {
    const response = await fetch(
      `${BASE_URL}/tv/${tvId}/similar?api_key=${TMDB_API_KEY}&language=en-US`
    );
    return response.json();
  });
}
