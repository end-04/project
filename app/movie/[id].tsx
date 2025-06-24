import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Star, Calendar, Clock, Plus, Check, Users } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import TMDBService from '@/services/tmdb';
import RatingModal from '@/components/RatingModal';
import { Movie, MovieDetails as MovieDetailsType, Credits } from '@/types/movie';

const { width: screenWidth } = Dimensions.get('window');

const MovieDetails = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useApp();
  
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;

  useEffect(() => {
    const loadMovieDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [movieDetails, movieCredits, similar] = await Promise.all([
          TMDBService.getMovieDetails(parseInt(id)),
          TMDBService.getMovieCredits(parseInt(id)),
          TMDBService.getSimilarMovies(parseInt(id))
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

    loadMovieDetails();
  }, [id]);

  const handleWatchlistToggle = () => {
    if (movie) {
      if (inWatchlist) {
        removeFromWatchlist(movie.id);
      } else {
        addToWatchlist(movie as Movie);
      }
    }
  };

  const formatRuntime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSimilarMoviePress = (similarMovie: Movie) => {
    router.push({
      pathname: '/movie/[id]',
      params: { id: similarMovie.id.toString() }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading movie details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!movie) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Movie not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const backdropUrl = TMDBService.getBackdropUrl(movie.backdrop_path);
  const posterUrl = TMDBService.getImageUrl(movie.poster_path, 'w500');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section with Backdrop */}
        <View style={styles.heroSection}>
          {backdropUrl && (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.backdrop}
              contentFit="cover"
            />
          )}
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.6)', 'rgba(15, 23, 42, 0.9)']}
            style={styles.gradient}
          />
          
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonOverlay}
          >
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>

          {/* Movie Info */}
          <View style={styles.movieInfo}>
            {/* Poster */}
            <View style={styles.posterContainer}>
              {posterUrl ? (
                <Image
                  source={{ uri: posterUrl }}
                  style={styles.poster}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.posterPlaceholder}>
                  <Text style={styles.posterEmoji}>🎬</Text>
                </View>
              )}
            </View>

            {/* Details */}
            <View style={styles.movieDetails}>
              <Text style={styles.movieTitle}>{movie.title}</Text>

              {movie.tagline && (
                <Text style={styles.tagline}>"{movie.tagline}"</Text>
              )}

              {/* Meta Info */}
              <View style={styles.metaInfo}>
                {movie.release_date && (
                  <View style={styles.metaItem}>
                    <Calendar size={16} color="#D1D5DB" />
                    <Text style={styles.metaText}>
                      {new Date(movie.release_date).getFullYear()}
                    </Text>
                  </View>
                )}
                {movie.runtime && (
                  <View style={styles.metaItem}>
                    <Clock size={16} color="#D1D5DB" />
                    <Text style={styles.metaText}>{formatRuntime(movie.runtime)}</Text>
                  </View>
                )}
                {movie.vote_average > 0 && (
                  <View style={styles.metaItem}>
                    <Star size={16} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.metaText}>{movie.vote_average.toFixed(1)}/10</Text>
                  </View>
                )}
              </View>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <View style={styles.genresContainer}>
                  {movie.genres.map(genre => (
                    <View key={genre.id} style={styles.genreTag}>
                      <Text style={styles.genreText}>{genre.name}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={handleWatchlistToggle}
                  style={[
                    styles.watchlistButton,
                    inWatchlist && styles.watchlistButtonActive
                  ]}
                >
                  {inWatchlist ? (
                    <Check size={20} color="white" />
                  ) : (
                    <Plus size={20} color="white" />
                  )}
                  <Text style={styles.watchlistButtonText}>
                    {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                  </Text>
                </TouchableOpacity>

                {inWatchlist && (
                  <TouchableOpacity
                    onPress={() => setRatingModalOpen(true)}
                    style={styles.rateButton}
                  >
                    <Star size={20} color="white" />
                    <Text style={styles.rateButtonText}>Rate Movie</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        {/* Cast & Crew */}
        {credits && credits.cast && credits.cast.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.castContainer}>
                {credits.cast.slice(0, 8).map(person => (
                  <View key={person.id} style={styles.castCard}>
                    <View style={styles.castAvatar}>
                      <Users size={24} color="white" />
                    </View>
                    <Text style={styles.castName}>{person.name}</Text>
                    <Text style={styles.castCharacter}>{person.character}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Movie Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Movie Details</Text>
          <View style={styles.statsContainer}>
            {movie.budget > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Budget</Text>
                <Text style={styles.statValue}>{formatCurrency(movie.budget)}</Text>
              </View>
            )}
            {movie.revenue > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statValue}>{formatCurrency(movie.revenue)}</Text>
              </View>
            )}
            {movie.status && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Status</Text>
                <Text style={styles.statValue}>{movie.status}</Text>
              </View>
            )}
            {movie.original_language && (
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Original Language</Text>
                <Text style={styles.statValue}>{movie.original_language.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Similar Movies */}
        {similarMovies.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Similar Movies</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.similarContainer}>
                {similarMovies.map(similarMovie => (
                  <TouchableOpacity
                    key={similarMovie.id}
                    onPress={() => handleSimilarMoviePress(similarMovie)}
                    style={styles.similarCard}
                  >
                    {TMDBService.getImageUrl(similarMovie.poster_path, 'w300') ? (
                      <Image
                        source={{ uri: TMDBService.getImageUrl(similarMovie.poster_path, 'w300')! }}
                        style={styles.similarPoster}
                        contentFit="cover"
                      />
                    ) : (
                      <View style={styles.similarPosterPlaceholder}>
                        <Text style={styles.similarPosterEmoji}>🎬</Text>
                      </View>
                    )}
                    <Text style={styles.similarTitle}>{similarMovie.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
      </ScrollView>

      {/* Rating Modal */}
      <RatingModal
        movie={movie as Movie}
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  heroSection: {
    position: 'relative',
    height: 400,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backButtonOverlay: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
  },
  posterContainer: {
    marginRight: 16,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
  },
  posterPlaceholder: {
    width: 120,
    height: 180,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterEmoji: {
    fontSize: 48,
  },
  movieDetails: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  movieTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F59E0B',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  genreTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  genreText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  watchlistButtonActive: {
    backgroundColor: '#10B981',
  },
  watchlistButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  overview: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 24,
  },
  castContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  castCard: {
    alignItems: 'center',
    width: 80,
  },
  castAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  castName: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 4,
  },
  castCharacter: {
    fontSize: 10,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  statsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  similarContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingRight: 16,
  },
  similarCard: {
    width: 100,
  },
  similarPoster: {
    width: 100,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarPosterPlaceholder: {
    width: 100,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  similarPosterEmoji: {
    fontSize: 24,
  },
  similarTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'white',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default MovieDetails;