import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Star, Plus, Check } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import TMDBService from '@/services/tmdb';
import { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  onPress: (movie: Movie) => void;
  size?: 'normal' | 'small';
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onPress, size = 'normal' }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();
  const [isLoading, setIsLoading] = useState(false);

  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlistToggle = async () => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).getFullYear();
  };

  const posterUrl = TMDBService.getImageUrl(movie.poster_path, size === 'small' ? 'w300' : 'w500');

  return (
    <TouchableOpacity 
      style={[styles.container, size === 'small' && styles.smallContainer]} 
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {posterUrl ? (
          <Image
            source={{ uri: posterUrl }}
            style={styles.poster}
            contentFit="cover"
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderEmoji}>🎬</Text>
            <Text style={styles.placeholderText}>{movie.title}</Text>
          </View>
        )}

        {/* Rating Badge */}
        {movie.vote_average > 0 && (
          <View style={styles.ratingBadge}>
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.ratingText}>
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
        )}

        {/* Watchlist Button */}
        <TouchableOpacity
          onPress={handleWatchlistToggle}
          style={[
            styles.watchlistButton,
            inWatchlist && styles.watchlistButtonActive
          ]}
          disabled={isLoading}
        >
          {inWatchlist ? (
            <Check size={16} color="white" />
          ) : (
            <Plus size={16} color="white" />
          )}
        </TouchableOpacity>

        {/* Movie Info Overlay */}
        <View style={styles.overlay}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {movie.title}
          </Text>
          <Text style={styles.movieYear}>
            {formatDate(movie.release_date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 150,
    marginRight: 12,
    marginBottom: 16,
  },
  smallContainer: {
    width: 120,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 2/3,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#374151',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  placeholderEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 2,
  },
  watchlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchlistButtonActive: {
    backgroundColor: '#F59E0B',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 8,
  },
  movieTitle: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    marginBottom: 2,
  },
  movieYear: {
    color: '#D1D5DB',
    fontSize: 10,
    fontFamily: 'Inter-Regular',
  },
});

export default MovieCard;