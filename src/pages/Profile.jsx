import React, { useState, useRef } from 'react';
import { User, Edit3, Star, Calendar, TrendingUp, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Profile = () => {
  const { theme, user, updateUserProfile, watchlist } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(user);
  const fileInputRef = useRef(null);

  const handleSave = () => {
    updateUserProfile(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(user);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditedUser({ ...editedUser, avatar: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const stats = {
    totalMovies: watchlist.length,
    watchedMovies: watchlist.filter(movie => movie.userRating).length,
    averageRating: watchlist.length > 0 
      ? (watchlist.reduce((sum, movie) => sum + (movie.userRating || 0), 0) / watchlist.filter(movie => movie.userRating).length || 0).toFixed(1)
      : 0,
    favoriteYear: watchlist.length > 0 
      ? watchlist.reduce((acc, movie) => {
          const year = new Date(movie.release_date).getFullYear();
          acc[year] = (acc[year] || 0) + 1;
          return acc;
        }, {})
      : {}
  };

  const mostPopularYear = Object.keys(stats.favoriteYear).reduce((a, b) => 
    stats.favoriteYear[a] > stats.favoriteYear[b] ? a : b, 0
  );

  return (
    <div className={`min-h-screen pt-20 pb-8 ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className={`${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } rounded-2xl shadow-xl p-8 mb-8`}>
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Avatar */}
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full overflow-hidden ${
                  isEditing ? 'cursor-pointer ring-4 ring-amber-500' : ''
                } ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-200'} flex items-center justify-center`}
                onClick={handleAvatarClick}
              >
                {editedUser.avatar ? (
                  <img
                    src={editedUser.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className={`w-16 h-16 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                )}
              </div>
              {isEditing && (
                <>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editedUser.name}
                    onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                    className={`text-2xl font-bold w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Your name"
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className={`text-3xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {user.name}
                  </h1>
                  <p className={`text-lg mb-4 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Movie Enthusiast & Collector
                  </p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } rounded-xl shadow-lg p-6`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.totalMovies}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Movies in Watchlist
                </p>
              </div>
            </div>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } rounded-xl shadow-lg p-6`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.watchedMovies}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Movies Rated
                </p>
              </div>
            </div>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } rounded-xl shadow-lg p-6`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-500 rounded-lg">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {stats.averageRating}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Average Rating
                </p>
              </div>
            </div>
          </div>

          <div className={`${
            theme === 'dark' ? 'bg-slate-800' : 'bg-white'
          } rounded-xl shadow-lg p-6`}>
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {mostPopularYear || 'N/A'}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Favorite Year
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${
          theme === 'dark' ? 'bg-slate-800' : 'bg-white'
        } rounded-2xl shadow-lg p-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Activity
          </h2>
          
          {watchlist.length > 0 ? (
            <div className="space-y-4">
              {watchlist.slice(0, 5).map(movie => (
                <div key={movie.id} className={`flex items-center space-x-4 p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'
                }`}>
                  <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg">🎬</span>
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      {movie.title}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Added {new Date(movie.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  {movie.userRating && (
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {movie.userRating}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className={`w-8 h-8 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
              </div>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                No activity yet. Start building your watchlist!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;