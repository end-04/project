import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import TMDBService from '../services/tmdb';

const SearchBar = ({ onResults, onLoading }) => {
  const { theme, searchHistory, addToSearchHistory } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const filteredHistory = useMemo(() => {
    if (!query.trim()) return searchHistory.slice(0, 5);
    return searchHistory.filter(term => 
      term.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
  }, [query, searchHistory]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      onResults([]);
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      const response = await TMDBService.searchMovies(searchQuery);
      setSearchResults(response.results || []);
      onResults(response.results || []);
      addToSearchHistory(searchQuery.trim());
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const debouncedSearch = (searchQuery) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
  };

  useEffect(() => {
    debouncedSearch(query);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
    inputRef.current?.blur();
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setShowSuggestions(false);
    onResults([]);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    handleSearch(query);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center ${
          theme === 'dark' 
            ? 'bg-slate-800 border-slate-600' 
            : 'bg-white border-gray-300'
        } border rounded-xl shadow-lg transition-all duration-200 focus-within:shadow-xl focus-within:border-amber-500`}>
          
          {/* Search Icon */}
          <div className="absolute left-4 flex items-center">
            {isSearching ? (
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className={`w-5 h-5 ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`} />
            )}
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="Search for movies..."
            className={`w-full pl-12 pr-12 py-4 ${
              theme === 'dark' 
                ? 'bg-transparent text-white placeholder-gray-400' 
                : 'bg-transparent text-gray-900 placeholder-gray-500'
            } rounded-xl focus:outline-none text-lg`}
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className={`absolute right-4 p-1 rounded-full transition-colors duration-200 ${
                theme === 'dark'
                  ? 'text-gray-400 hover:text-white hover:bg-slate-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && (filteredHistory.length > 0 || query.trim()) && (
          <div className={`absolute top-full left-0 right-0 mt-2 ${
            theme === 'dark' 
              ? 'bg-slate-800 border-slate-600' 
              : 'bg-white border-gray-200'
          } border rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto`}>
            
            {/* Search History */}
            {filteredHistory.length > 0 && (
              <div className="p-2">
                <div className={`px-3 py-2 text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wide`}>
                  Recent Searches
                </div>
                {filteredHistory.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-150 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Clock className="w-4 h-4 opacity-60" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Search Results Preview */}
            {query.trim() && searchResults.length > 0 && (
              <div className="border-t border-gray-200 dark:border-slate-600 p-2">
                <div className={`px-3 py-2 text-xs font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                } uppercase tracking-wide flex items-center space-x-1`}>
                  <TrendingUp className="w-3 h-3" />
                  <span>Quick Results</span>
                </div>
                {searchResults.slice(0, 3).map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSuggestionClick(movie.title)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors duration-150 ${
                      theme === 'dark'
                        ? 'text-gray-300 hover:bg-slate-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">🎬</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{movie.title}</div>
                      <div className="text-xs opacity-60 truncate">
                        {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default SearchBar;