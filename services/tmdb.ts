const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '2c56234b12d13472a21e5909fa0473f3';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

import { Movie, MovieDetails, Credits, TMDBResponse, Genre } from '@/types/movie';

class TMDBService {
  async fetchData<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const url = new URL(`${BASE_URL}${endpoint}`);
      url.searchParams.append('api_key', API_KEY);

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('TMDB API Error:', error);
      throw error;
    }
  }

  async getTrending(): Promise<TMDBResponse<Movie>> {
    return this.fetchData<TMDBResponse<Movie>>('/trending/movie/week');
  }

  async getPopular(): Promise<TMDBResponse<Movie>> {
    return this.fetchData<TMDBResponse<Movie>>('/movie/popular');
  }

  async getTopRated(): Promise<TMDBResponse<Movie>> {
    return this.fetchData<TMDBResponse<Movie>>('/movie/top_rated');
  }

  async getUpcoming(): Promise<TMDBResponse<Movie>> {
    return this.fetchData<TMDBResponse<Movie>>('/movie/upcoming');
  }

  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    if (!query.trim()) return { page: 1, results: [], total_pages: 0, total_results: 0 };
    return this.fetchData<TMDBResponse<Movie>>('/search/movie', { query, page });
  }

  async getMovieDetails(movieId: number): Promise<MovieDetails> {
    return this.fetchData<MovieDetails>(`/movie/${movieId}`);
  }

  async getMovieCredits(movieId: number): Promise<Credits> {
    return this.fetchData<Credits>(`/movie/${movieId}/credits`);
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchData<{ genres: Genre[] }>('/genre/movie/list');
  }

  async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> {
    return this.fetchData<TMDBResponse<Movie>>('/discover/movie', { with_genres: genreId, page });
  }

  async getSimilarMovies(movieId: number): Promise<TMDBResponse<Movie>> {
    return this.fetchData<TMDBResponse<Movie>>(`/movie/${movieId}/similar`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path: string | null, size: string = 'w1280'): string | null {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }
}

export default new TMDBService();