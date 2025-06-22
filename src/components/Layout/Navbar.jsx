import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Home, Search, Bookmark, User, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme, watchlist } = useApp();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/watchlist', icon: Bookmark, label: 'Watchlist', badge: watchlist.length },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 ${
      theme === 'dark' 
        ? 'bg-slate-900/95 border-slate-700' 
        : 'bg-white/95 border-gray-200'
    } backdrop-blur-sm border-b transition-colors duration-200`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className={`p-2 rounded-lg ${
              theme === 'dark' ? 'bg-amber-500' : 'bg-amber-500'
            } group-hover:scale-110 transition-transform duration-200`}>
              <Film className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              MovieSafe
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, icon: Icon, label, badge }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(path)
                    ? theme === 'dark'
                      ? 'bg-amber-500 text-white shadow-lg'
                      : 'bg-amber-500 text-white shadow-lg'
                    : theme === 'dark'
                      ? 'text-gray-300 hover:text-white hover:bg-slate-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Theme Toggle */} 
          {/*
<button
  onClick={toggleTheme}
  className={`p-2 rounded-lg transition-colors duration-200 ${
    theme === 'dark'
      ? 'text-gray-300 hover:text-white hover:bg-slate-800'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
  }`}
  aria-label="Toggle theme"
>
  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
</button>
*/}
        </div> 

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-gray-200 dark:border-slate-700">
          {navItems.map(({ path, icon: Icon, label, badge }) => (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors duration-200 ${
                isActive(path)
                  ? 'text-amber-500'
                  : theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
              {badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;