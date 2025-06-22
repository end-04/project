import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import MovieList from '../components/MovieList';
import { useApp } from '../context/AppContext';

const Search = () => {
  const navigate = useNavigate();
  const { theme } = useApp();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setHasSearched(true);
    setSelectedGenre('all');
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  };

  const handleGenreChange = (genreId) => {
    setSelectedGenre(genreId);
  };

  return (
    <div className={`min-h-screen pt-20 pb-8 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl md:text-4xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Search Movies
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Find your next favorite movie from millions of titles
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar 
            onResults={handleSearchResults}
            onLoading={handleLoading}
          />
        </div>

        {/* Search Results */}
        {hasSearched && (
          <MovieList
            movies={searchResults}
            title={searchResults.length > 0 ? "Search Results" : null}
            loading={loading}
            onMovieClick={handleMovieClick}
            showFilters={searchResults.length > 0}
            selectedGenre={selectedGenre}
            onGenreChange={handleGenreChange}
          />
        )}

        {/* Empty State */}
        {!hasSearched && !loading && (
          <div className="text-center py-16">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <div className="text-6xl">🎬</div>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Start Your Movie Search
            </h3>
            <p className={`max-w-md mx-auto ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter a movie title, actor name, or keyword to discover amazing films
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;