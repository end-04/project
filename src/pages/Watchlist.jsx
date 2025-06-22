import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, Filter, SortAsc, SortDesc } from 'lucide-react';
import MovieList from '../components/MovieList';
import RatingModal from '../components/RatingModal';
import { useApp } from '../context/AppContext';

const Watchlist = () => {
  const navigate = useNavigate();
  const { theme, watchlist, removeFromWatchlist } = useApp();
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('addedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const sortOptions = [
    { value: 'addedAt', label: 'Date Added' },
    { value: 'title', label: 'Title' },
    { value: 'release_date', label: 'Release Date' },
    { value: 'vote_average', label: 'TMDB Rating' },
    { value: 'userRating', label: 'Your Rating' }
  ];

  const sortedAndFilteredMovies = useMemo(() => {
    let filtered = [...watchlist];

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie => 
        movie.genre_ids && movie.genre_ids.includes(parseInt(selectedGenre))
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      if (sortBy === 'addedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'release_date') {
        aValue = new Date(aValue || '1900-01-01');
        bValue = new Date(bValue || '1900-01-01');
      } else if (sortBy === 'title') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortBy === 'userRating') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [watchlist, selectedGenre, sortBy, sortOrder]);

  const watchlistStats = useMemo(() => {
    const totalMovies = watchlist.length;
    const ratedMovies = watchlist.filter(movie => movie.userRating).length;
    const averageRating = ratedMovies > 0 
      ? watchlist.reduce((sum, movie) => sum + (movie.userRating || 0), 0) / ratedMovies
      : 0;
    const totalRuntime = watchlist.reduce((sum, movie) => sum + (movie.runtime || 120), 0);

    return {
      totalMovies,
      ratedMovies,
      averageRating: averageRating.toFixed(1),
      totalHours: Math.round(totalRuntime / 60)
    };
  }, [watchlist]);

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  };

  const handleRateMovie = (movie) => {
    setSelectedMovie(movie);
    setRatingModalOpen(true);
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className={`min-h-screen pt-20 pb-8 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            My Watchlist
          </h1>
          <p className={`text-lg ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Your personal collection of movies to watch
          </p>
        </div>

        {/* Stats Cards */}
        {watchlist.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            } shadow-lg`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {watchlistStats.totalMovies}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Movies
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            } shadow-lg`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {watchlistStats.ratedMovies}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Rated Movies
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            } shadow-lg`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold flex items-center justify-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  <Star className="w-5 h-5 text-amber-400 fill-current mr-1" />
                  {watchlistStats.averageRating}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Avg Rating
                </p>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            } shadow-lg`}>
              <div className="text-center">
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {watchlistStats.totalHours}h
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Runtime
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Sorting */}
        {watchlist.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className={`w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`} />
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-slate-800 border-slate-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={toggleSortOrder}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-slate-800'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
                title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Movie List */}
        <MovieList
          movies={sortedAndFilteredMovies}
          loading={false}
          onMovieClick={handleMovieClick}
          showFilters={watchlist.length > 0}
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
        />

        {/* Empty State */}
        {watchlist.length === 0 && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <div className="text-6xl">📋</div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Your Watchlist is Empty
            </h3>
            <p className={`max-w-md mx-auto mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Start building your collection by adding movies you want to watch
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
            >
              Discover Movies
            </button>
          </div>
        )}

        {/* Rating Modal */}
        <RatingModal
          movie={selectedMovie}
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedMovie(null);
          }}
        />
      </div>
    </div>
  );
};

export default Watchlist;