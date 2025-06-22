import React, { useState } from 'react';
import { Star, Plus, Check, Calendar, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TMDBService from '../services/tmdb';

const MovieCard = ({ movie, onClick, size = 'normal' }) => {
  const { theme, addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      if (inWatchlist) {
        removeFromWatchlist(movie.id);
      } else {
        addToWatchlist(movie);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).getFullYear();
  };

  const posterUrl = TMDBService.getImageUrl(movie.poster_path, size === 'small' ? 'w300' : 'w500');

  const cardClasses = `
    group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300
    ${size === 'small' ? 'aspect-[2/3]' : 'aspect-[2/3]'}
    ${theme === 'dark' 
      ? 'bg-slate-800 hover:bg-slate-700 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20' 
      : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20'
    }
    hover:scale-105 hover:-translate-y-2
  `;

  return (
    
   <div className={cardClasses} onClick={() => onClick(movie)}>
      {/* Movie Poster */}
      <div className="relative w-full h-full">
        {posterUrl ? (
          <>
            {!imageLoaded && (
              <div className={`absolute inset-0 ${
                theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'
              } animate-pulse flex items-center justify-center`}>
                <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img
              src={posterUrl}
              alt={movie.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center ${
            theme === 'dark' ? 'bg-slate-700 text-gray-400' : 'bg-gray-200 text-gray-500'
          }`}>
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm text-center px-4 font-medium">{movie.title}</p>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <div className="absolute top-3 left-3 flex items-center space-x-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="w-3 h-3 text-amber-400 fill-current" />
            <span className="text-white text-xs font-medium">
              {movie.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Watchlist Button */}
        <button
          onClick={handleWatchlistToggle}
          disabled={isLoading}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            inWatchlist 
              ? 'bg-amber-500 text-white shadow-lg' 
              : 'bg-black/70 text-white hover:bg-amber-500'
          } backdrop-blur-sm hover:scale-110 ${isLoading ? 'animate-pulse' : ''}`}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : inWatchlist ? (
            <Check className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </button>

        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-bold text-sm mb-1 line-clamp-2">
            {movie.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(movie.release_date)}</span>
            </span>
            {movie.popularity && (
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3" />
                <span>{Math.round(movie.popularity)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;