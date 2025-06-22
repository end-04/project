import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Calendar, Clock, Plus, Check, Play, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TMDBService from '../services/tmdb';
import RatingModal from '../components/RatingModal';

const MovieDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();
  
  const [movie, setMovie] = useState(location.state?.movie || null);
  const [loading, setLoading] = useState(!movie);
  const [credits, setCredits] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;

  useEffect(() => {
    const loadMovieDetails = async () => {
      try {
        setLoading(true);
        const [movieDetails, movieCredits, similar] = await Promise.all([
          TMDBService.getMovieDetails(id),
          TMDBService.getMovieCredits(id),
          TMDBService.getSimilarMovies(id)
        ]);

        setMovie(movieDetails);
        setCredits(movieCredits);
        setSimilarMovies(similar.results?.slice(0, 6) || []);
      } catch (error) {
        console.error('Error loading movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!movie || movie.id !== parseInt(id)) {
      loadMovieDetails();
    }
  }, [id, movie]);

  const handleWatchlistToggle = () => {
    if (movie) {
      if (inWatchlist) {
        removeFromWatchlist(movie.id);
      } else {
        addToWatchlist(movie);
      }
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSimilarMovieClick = (similarMovie) => {
    navigate(`/movie/${similarMovie.id}`, { 
      state: { movie: similarMovie },
      replace: false 
    });
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className={`h-8 w-32 ${
              theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'
            } rounded mb-8`}></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className={`aspect-[2/3] ${
                theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'
              } rounded-xl`}></div>
              <div className="lg:col-span-2 space-y-4">
                <div className={`h-8 ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'
                } rounded`}></div>
                <div className={`h-6 w-3/4 ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'
                } rounded`}></div>
                <div className={`h-24 ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-gray-300'
                } rounded`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${
        theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Movie not found
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const backdropUrl = TMDBService.getBackdropUrl(movie.backdrop_path);
  const posterUrl = TMDBService.getImageUrl(movie.poster_path, 'w500');

  return (
    <div className={`min-h-screen ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      {/* Hero Section with Backdrop */}
      <div className="relative">
        {backdropUrl && (
          <div className="absolute inset-0 z-0">
            <img
              src={backdropUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-slate-900/30"></div>
          </div>
        )}
        
        <div className="relative z-10 pt-20 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center space-x-2 text-white hover:text-amber-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Movie Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Poster */}
              <div className="lg:order-1">
                <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
                  {posterUrl ? (
                    <img
                      src={posterUrl}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <div className="text-6xl">🎬</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-2 lg:order-2 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {movie.title}
                </h1>

                {movie.tagline && (
                  <p className="text-xl text-amber-400 italic mb-6">
                    "{movie.tagline}"
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 mb-6 text-gray-300">
                  {movie.release_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                  )}
                  {movie.runtime && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>{formatRuntime(movie.runtime)}</span>
                    </div>
                  )}
                  {movie.vote_average > 0 && (
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-amber-400 fill-current" />
                      <span>{movie.vote_average.toFixed(1)}/10</span>
                    </div>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres.map(genre => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                <p className="text-lg leading-relaxed mb-8 max-w-3xl">
                  {movie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleWatchlistToggle}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                      inWatchlist
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-amber-500 hover:bg-amber-600 text-white'
                    }`}
                  >
                    {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
                  </button>

                  {inWatchlist && (
                    <button
                      onClick={() => setRatingModalOpen(true)}
                      className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-all"
                    >
                      <Star className="w-5 h-5" />
                      <span>Rate Movie</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cast & Crew */}
          {credits && (
            <div className="lg:col-span-2">
              <h2 className={`text-2xl font-bold mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Cast & Crew
              </h2>
              
              {credits.cast && credits.cast.length > 0 && (
                <div className="mb-8">
                  <h3 className={`text-xl font-semibold mb-4 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Top Cast
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {credits.cast.slice(0, 8).map(person => (
                      <div key={person.id} className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                      } shadow-lg`}>
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-2 bg-amber-500 rounded-full flex items-center justify-center">
                            <Users className="w-8 h-8 text-white" />
                          </div>
                          <h4 className={`font-medium text-sm ${
                            theme === 'dark' ? 'text-white' : 'text-gray-900'
                          }`}>
                            {person.name}
                          </h4>
                          <p className={`text-xs ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {person.character}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Movie Stats */}
          <div>
            <h2 className={`text-2xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Movie Details
            </h2>
            
            <div className={`${
              theme === 'dark' ? 'bg-slate-800' : 'bg-white'
            } rounded-xl p-6 shadow-lg space-y-4`}>
              {movie.budget > 0 && (
                <div>
                  <h4 className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Budget
                  </h4>
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(movie.budget)}
                  </p>
                </div>
              )}
              
              {movie.revenue > 0 && (
                <div>
                  <h4 className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Revenue
                  </h4>
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {formatCurrency(movie.revenue)}
                  </p>
                </div>
              )}
              
              {movie.status && (
                <div>
                  <h4 className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Status
                  </h4>
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {movie.status}
                  </p>
                </div>
              )}
              
              {movie.original_language && (
                <div>
                  <h4 className={`font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Original Language
                  </h4>
                  <p className={`text-lg ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {movie.original_language.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <div className="mt-12">
            <h2 className={`text-2xl font-bold mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Similar Movies
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarMovies.map(similarMovie => (
                <div
                  key={similarMovie.id}
                  onClick={() => handleSimilarMovieClick(similarMovie)}
                  className="cursor-pointer group"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 hover:scale-105 transition-transform duration-200">
                    {TMDBService.getImageUrl(similarMovie.poster_path, 'w300') ? (
                      <img
                        src={TMDBService.getImageUrl(similarMovie.poster_path, 'w300')}
                        alt={similarMovie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-3xl">🎬</div>
                      </div>
                    )}
                  </div>
                  <h3 className={`mt-2 text-sm font-medium line-clamp-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {similarMovie.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        movie={movie}
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
      />
    </div>
  );
};

export default MovieDetails;