import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Star, X } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import { Movie } from '@/types/movie';

interface RatingModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const RatingModal: React.FC<RatingModalProps> = ({ movie, isOpen, onClose }) => {
  const { updateMovieRating, watchlist } = useApp();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const watchlistItem = watchlist.find(item => item.id === movie?.id);

  useEffect(() => {
    if (isOpen && watchlistItem) {
      setRating(watchlistItem.userRating || 0);
      setReview(watchlistItem.userReview || '');
    }
  }, [isOpen, watchlistItem]);

  useEffect(() => {
    if (isOpen && textInputRef.current) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (movie && rating > 0) {
      updateMovieRating(movie.id, rating, review.trim());
      onClose();
    }
  };

  if (!isOpen || !movie) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Close Button */}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rate & Review</Text>
            <Text style={styles.movieTitle}>{movie.title}</Text>
          </View>

          {/* Star Rating */}
          <View style={styles.ratingSection}>
            <Text style={styles.sectionLabel}>Your Rating</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starButton}
                >
                  <Star
                    size={24}
                    color={star <= rating ? '#F59E0B' : '#4B5563'}
                    fill={star <= rating ? '#F59E0B' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
              {rating > 0 && (
                <Text style={styles.ratingText}>{rating} / 10</Text>
              )}
            </View>
          </View>

          {/* Review Text */}
          <View style={styles.reviewSection}>
            <Text style={styles.sectionLabel}>Your Review (Optional)</Text>
            <TextInput
              ref={textInputRef}
              style={styles.reviewInput}
              value={review}
              onChangeText={setReview}
              placeholder="Share your thoughts about this movie..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{review.length}/500</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={rating === 0}
              style={[
                styles.saveButton,
                rating === 0 && styles.saveButtonDisabled
              ]}
            >
              <Text style={[
                styles.saveButtonText,
                rating === 0 && styles.saveButtonTextDisabled
              ]}>
                Save Rating
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    width: screenWidth - 32,
    maxWidth: 400,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  movieTitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D1D5DB',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starButton: {
    padding: 4,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#D1D5DB',
    marginLeft: 8,
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    height: 100,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#D1D5DB',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#4B5563',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default RatingModal;