import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { Star, Filter, ArrowUpDown } from 'lucide-react-native';
import MovieList from '@/components/MovieList';
import RatingModal from '@/components/RatingModal';
import { useApp } from '@/context/AppContext';
import { Movie } from '@/types/movie';

type SortOption = 'addedAt' | 'title' | 'release_date' | 'vote_average' | 'userRating';

const Watchlist = () => {
  const { watchlist } = useApp();
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('addedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const sortOptions = [
    { value: 'addedAt' as const, label: 'Date Added' },
    { value: 'title' as const, label: 'Title' },
    { value: 'release_date' as const, label: 'Release Date' },
    { value: 'vote_average' as const, label: 'TMDB Rating' },
    { value: 'userRating' as const, label: 'Your Rating' }
  ];

  const sortedAndFilteredMovies = useMemo(() => {
    let filtered = [...watchlist];

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie => 
        movie.genre_ids && movie.genre_ids.includes(parseInt(selectedGenre))
      );
    }

    // Sort movies
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      // Handle special cases
      if (sortBy === 'addedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'release_date') {
        aValue = new Date(aValue || '1900-01-01');
        bValue = new Date(bValue || '1900-01-01');
      } else if (sortBy === 'title') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      } else if (sortBy === 'userRating') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [watchlist, selectedGenre, sortBy, sortOrder]);

  const watchlistStats = useMemo(() => {
    const totalMovies = watchlist.length;
    const ratedMovies = watchlist.filter(movie => movie.userRating).length;
    const averageRating = ratedMovies > 0 
      ? watchlist.reduce((sum, movie) => sum + (movie.userRating || 0), 0) / ratedMovies
      : 0;
    const totalRuntime = watchlist.reduce((sum, movie) => sum + (movie.runtime || 120), 0);

    return {
      totalMovies,
      ratedMovies,
      averageRating: averageRating.toFixed(1),
      totalHours: Math.round(totalRuntime / 60)
    };
  }, [watchlist]);

  const handleMoviePress = (movie: Movie) => {
    router.push({
      pathname: '/movie/[id]',
      params: { id: movie.id.toString() }
    });
  };

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Watchlist</Text>
          <Text style={styles.subtitle}>
            Your personal collection of movies to watch
          </Text>
        </View>

        {/* Stats Cards */}
        {watchlist.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{watchlistStats.totalMovies}</Text>
              <Text style={styles.statLabel}>Total Movies</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{watchlistStats.ratedMovies}</Text>
              <Text style={styles.statLabel}>Rated Movies</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statValueWithIcon}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.statValue}>{watchlistStats.averageRating}</Text>
              </View>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{watchlistStats.totalHours}h</Text>
              <Text style={styles.statLabel}>Total Runtime</Text>
            </View>
          </View>
        )}

        {/* Movie List */}
        <MovieList
          movies={sortedAndFilteredMovies}
          loading={false}
          onMoviePress={handleMoviePress}
          showFilters={watchlist.length > 0}
          selectedGenre={selectedGenre}
          onGenreChange={handleGenreChange}
        />

        {/* Empty State */}
        {watchlist.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>📋</Text>
            </View>
            <Text style={styles.emptyTitle}>Your Watchlist is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Start building your collection by adding movies you want to watch
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={styles.discoverButton}
            >
              <Text style={styles.discoverButtonText}>Discover Movies</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rating Modal */}
        <RatingModal
          movie={selectedMovie}
          isOpen={ratingModalOpen}
          onClose={() => {
            setRatingModalOpen(false);
            setSelectedMovie(null);
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  statValueWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  discoverButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});

export default Watchlist;