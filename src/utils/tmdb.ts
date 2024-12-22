const TMDB_API_KEY = "59cddbb62ceaa5026246385b46dd867a";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

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
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return response.json();
}

export async function getMovieCredits(movieId: number): Promise<MovieCredits> {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return response.json();
}
export async function getSimilarMovies(movieId: number): Promise<any> {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&language=en-US`
  );
  return response.json();
}

export function getImageUrl(path: string, size: string = "original"): string {
  return `${IMAGE_BASE_URL}/${size}${path}`;
}
