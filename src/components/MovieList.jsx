import React, { useMemo } from 'react';
import { Filter, Grid, List } from 'lucide-react';
import MovieCard from './MovieCard';
import { useApp } from '../context/AppContext';

const MovieList = ({ 
  movies, 
  title, 
  loading, 
  onMovieClick, 
  showFilters = false,
  selectedGenre,
  onGenreChange,
  viewMode = 'grid'
}) => {
  const { theme, genres } = useApp();

  const filteredMovies = useMemo(() => {
    if (!selectedGenre || selectedGenre === 'all') return movies;
    return movies.filter(movie => 
      movie.genre_ids && movie.genre_ids.includes(parseInt(selectedGenre))
    );
  }, [movies, selectedGenre]);

  const genreOptions = useMemo(() => {
    const movieGenres = new Set();
    movies.forEach(movie => {
      if (movie.genre_ids) {
        movie.genre_ids.forEach(genreId => movieGenres.add(genreId));
      }
    });
    
    return genres.filter(genre => movieGenres.has(genre.id));
  }, [movies, genres]);

  if (loading) {
    return (
      <div className="space-y-6">
        {title && (
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {title}
            </h2>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className={`aspect-[2/3] rounded-xl ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'
              } animate-pulse`}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
          <div className="text-4xl">🎬</div>
        </div>
        <h3 className={`text-xl font-semibold mb-2 ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          No movies found
        </h3>
        <p className={`${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {title && (
          <h2 className={`text-2xl font-bold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            {title}
            <span className={`ml-2 text-sm font-normal ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              ({filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'})
            </span>
          </h2>
        )}

        {/* Filters */}
        {showFilters && genreOptions.length > 0 && (
          <div className="flex items-center space-x-3">
            <Filter className={`w-5 h-5 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`} />
            <select
              value={selectedGenre || 'all'}
              onChange={(e) => onGenreChange(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                theme === 'dark'
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
            >
              <option value="all">All Genres</option>
              {genreOptions.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Movie Grid */}
      <div className={`grid gap-4 ${
        viewMode === 'grid'
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
          : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      }`}>
        {filteredMovies.map((movie) => (
          <MovieCard
            key={movie.id}
            movie={movie}
            onClick={onMovieClick}
            size={viewMode === 'grid' ? 'normal' : 'large'}
          />
        ))}
      </div>

      {/* Load More Button - can be added later for pagination */}
      {filteredMovies.length > 0 && (
        <div className="text-center pt-8">
          <p className={`text-sm ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Showing {filteredMovies.length} of {movies.length} movies
          </p>
        </div>
      )}
    </div>
  );
};

export default MovieList;