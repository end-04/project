import React, { useState, useRef, useEffect } from 'react';
import { Star, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const RatingModal = ({ movie, isOpen, onClose }) => {
  const { theme, updateMovieRating, watchlist } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const watchlistItem = watchlist.find(item => item.id === movie?.id);

  useEffect(() => {
    if (isOpen && watchlistItem) {
      setRating(watchlistItem.userRating || 0);
      setReview(watchlistItem.userReview || '');
    }
  }, [isOpen, watchlistItem]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (movie && rating > 0) {
      updateMovieRating(movie.id, rating, review.trim());
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className={`relative w-full max-w-md ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      } rounded-2xl shadow-2xl transform transition-all duration-300`}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            theme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-slate-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Rate & Review
            </h3>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {movie.title}
            </p>
          </div>

          {/* Star Rating */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your Rating
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform duration-150 hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 transition-colors duration-150 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-current'
                        : theme === 'dark'
                          ? 'text-gray-600'
                          : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className={`ml-2 text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {rating} / 5
                </span>
              )}
            </div>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Your Review (Optional)
            </label>
            <textarea
              ref={textareaRef}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this movie..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                theme === 'dark'
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              maxLength={500}
            />
            <div className={`text-xs mt-1 text-right ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {review.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                rating > 0
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : theme === 'dark'
                    ? 'bg-slate-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Rating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;