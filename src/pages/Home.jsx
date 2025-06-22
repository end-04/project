import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, TrendingUp, Award, Calendar } from 'lucide-react';
import MovieList from '../components/MovieList';
import { useApp } from '../context/AppContext';
import TMDBService from '../services/tmdb';

const Home = () => {
  const navigate = useNavigate();
  const { theme, setGenres } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('trending');
  const [movieSections, setMovieSections] = useState({
    trending: [],
    popular: [],
    topRated: [],
    upcoming: []
  });

  const sections = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'popular', label: 'Popular', icon: Sparkles },
    { id: 'topRated', label: 'Top Rated', icon: Award },
    { id: 'upcoming', label: 'Upcoming', icon: Calendar }
  ];

  useEffect(() => {
    const loadMovieData = async () => {
      setLoading(true);
      try {
        const [trending, popular, topRated, upcoming, genresData] = await Promise.all([
          TMDBService.getTrending(),
          TMDBService.getPopular(),
          TMDBService.getTopRated(),
          TMDBService.getUpcoming(),
          TMDBService.getGenres()
        ]);

        setMovieSections({
          trending: trending.results || [],
          popular: popular.results || [],
          topRated: topRated.results || [],
          upcoming: upcoming.results || []
        });

        setGenres(genresData.genres || []);
      } catch (error) {
        console.error('Error loading movie data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovieData();
  }, []);

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}`, { state: { movie } });
  };

  const currentMovies = useMemo(() => {
    return movieSections[activeSection] || [];
  }, [movieSections, activeSection]);

  const currentSection = sections.find(section => section.id === activeSection);

  return (
    <div className={`min-h-screen pt-20 pb-8 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Discover The Newest
            <span className="block text-amber-500">Movies</span>
          </h1>
          <p className={`text-lg md:text-xl max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Explore trending movies, build your watchlist, and never miss a great film again
          </p>
        </div>

        {/* Section Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeSection === id
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : theme === 'dark'
                      ? 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 shadow-md'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeSection === id
                    ? 'bg-white/20 text-white'
                    : theme === 'dark'
                      ? 'bg-slate-700 text-gray-400'
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {movieSections[id]?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <div className="mb-8">
          <MovieList
            movies={currentMovies}
            title={`${currentSection?.label} Movies`}
            loading={loading}
            onMovieClick={handleMovieClick}
            showFilters={true}
          />
        </div>

        {/* Quick Stats */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            {sections.map(({ id, label, icon: Icon }) => (
              <div
                key={id}
                className={`p-6 rounded-xl ${
                  theme === 'dark' ? 'bg-slate-800' : 'bg-white'
                } shadow-lg hover:shadow-xl transition-shadow duration-200`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {label}
                    </h3>
                    <p className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {movieSections[id]?.length || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;