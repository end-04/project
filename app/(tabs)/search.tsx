import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
import SearchBar from '@/components/SearchBar';
import MovieList from '@/components/MovieList';
import { useApp } from '@/context/AppContext';
import { Movie } from '@/types/movie';

const Search = () => {
  const { theme } = useApp();
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchResults = (results: Movie[]) => {
    setSearchResults(results);
    setHasSearched(true);
    setSelectedGenre('all');
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  const handleMoviePress = (movie: Movie) => {
    router.push({
      pathname: '/movie/[id]',
      params: { id: movie.id.toString() }
    });
  };

  const handleGenreChange = (genreId: string) => {
    setSelectedGenre(genreId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Search Movies</Text>
          <Text style={styles.subtitle}>
            Find your next favorite movie from millions of titles
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar 
            onResults={handleSearchResults}
            onLoading={handleLoading}
          />
        </View>

        {/* Search Results */}
        {hasSearched && (
          <MovieList
            movies={searchResults}
            title={searchResults.length > 0 ? "Search Results" : undefined}
            loading={loading}
            onMoviePress={handleMoviePress}
            showFilters={searchResults.length > 0}
            selectedGenre={selectedGenre}
            onGenreChange={handleGenreChange}
          />
        )}

        {/* Empty State */}
        {!hasSearched && !loading && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyEmoji}>🎬</Text>
            </View>
            <Text style={styles.emptyTitle}>Start Your Movie Search</Text>
            <Text style={styles.emptySubtitle}>
              Enter a movie title, actor name, or keyword to discover amazing films
            </Text>
          </View>
        )}
      </View>
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
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 24,
  },
  searchContainer: {
    marginBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  },
});

export default Search;