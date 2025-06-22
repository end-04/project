const API_KEY = '2c56234b12d13472a21e5909fa0473f3'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

class TMDBService {
  async fetchData(endpoint, params = {}) {
  try {
    const url = new URL(`${BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', API_KEY);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });

    console.log('Fetching:', url.toString()); // Add this line

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

  async getTrending() {
    return this.fetchData('/trending/movie/week');
  }

  async getPopular() {
    return this.fetchData('/movie/popular');
  }

  async getTopRated() {
    return this.fetchData('/movie/top_rated');
  }

  async getUpcoming() {
    return this.fetchData('/movie/upcoming');
  }

  async searchMovies(query, page = 1) {
    if (!query.trim()) return { results: [] };
    return this.fetchData('/search/movie', { query, page });
  }

  async getMovieDetails(movieId) {
    return this.fetchData(`/movie/${movieId}`);
  }

  async getMovieCredits(movieId) {
    return this.fetchData(`/movie/${movieId}/credits`);
  }

  async getGenres() {
    return this.fetchData('/genre/movie/list');
  }

  async getMoviesByGenre(genreId, page = 1) {
    return this.fetchData('/discover/movie', { with_genres: genreId, page });
  }

  async getSimilarMovies(movieId) {
    return this.fetchData(`/movie/${movieId}/similar`);
  }

  async getMovieReviews(movieId) {
    return this.fetchData(`/movie/${movieId}/reviews`);
  }

  getImageUrl(path, size = 'w500') {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }

  getBackdropUrl(path, size = 'w1280') {
    if (!path) return null;
    return `${IMAGE_BASE_URL}/${size}${path}`;
  }
}

export default new TMDBService();
