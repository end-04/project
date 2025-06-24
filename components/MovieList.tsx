import React, { useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Filter } from 'lucide-react-native';
import MovieCard from './MovieCard';
import { useApp } from '@/context/AppContext';
import { Movie } from '@/types/movie';

interface MovieListProps {
  movies: Movie[];
  title?: string;
  loading: boolean;
  onMoviePress: (movie: Movie) => void;
  showFilters?: boolean;
  selectedGenre?: string;
  onGenreChange?: (genreId: string) => void;
  viewMode?: 'grid' | 'list';
}

const MovieList: React.FC<MovieListProps> = ({ 
  movies, 
  title, 
  loading, 
  onMoviePress, 
  showFilters = false,
  selectedGenre,
  onGenreChange,
  viewMode = 'grid'
}) => {
  const { genres } = useApp();

  const filteredMovies = useMemo(() => {
    if (!selectedGenre || selectedGenre === 'all') return movies;
    return movies.filter(movie => 
      movie.genre_ids && movie.genre_ids.includes(parseInt(selectedGenre))
    );
  }, [movies, selectedGenre]);

  const genreOptions = useMemo(() => {
    const movieGenres = new Set<number>();
    movies.forEach(movie => {
      if (movie.genre_ids) {
        movie.genre_ids.forEach(genreId => movieGenres.add(genreId));
      }
    });
    
    return genres.filter(genre => movieGenres.has(genre.id));
  }, [movies, genres]);

  if (loading) {
    return (
      <View style={styles.container}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
        )}
        <FlatList
          data={Array.from({ length: 12 })}
          numColumns={2}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => (
            <View style={styles.loadingCard} />
          )}
          contentContainerStyle={styles.loadingGrid}
        />
      </View>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIcon}>
          <Text style={styles.emptyEmoji}>🎬</Text>
        </View>
        <Text style={styles.emptyTitle}>No movies found</Text>
        <Text style={styles.emptySubtitle}>
          Try adjusting your search or filters
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      {title && (
        <View style={styles.header}>
          <Text style={styles.title}>
            {title}
            <Text style={styles.count}>
              {' '}({filteredMovies.length} {filteredMovies.length === 1 ? 'movie' : 'movies'})
            </Text>
          </Text>
        </View>
      )}

      {/* Movie Grid */}
      <FlatList
        data={filteredMovies}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <MovieCard
              movie={item}
              onPress={onMoviePress}
              size={viewMode === 'grid' ? 'normal' : 'small'}
            />
          </View>
        )}
        contentContainerStyle={styles.movieGrid}
        showsVerticalScrollIndicator={false}
      />

      {/* Results Summary */}
      {filteredMovies.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Showing {filteredMovies.length} of {movies.length} movies
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  count: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  movieGrid: {
    paddingBottom: 16,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 4,
  },
  loadingGrid: {
    paddingBottom: 16,
  },
  loadingCard: {
    flex: 1,
    aspectRatio: 2/3,
    backgroundColor: '#374151',
    borderRadius: 12,
    margin: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  summary: {
    alignItems: 'center',
    paddingTop: 16,
  },
  summaryText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
});

export default MovieList;