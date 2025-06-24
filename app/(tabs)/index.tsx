import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { TrendingUp, Sparkles, Award, Calendar } from 'lucide-react-native';
import MovieCard from '@/components/MovieCard';
import { useApp } from '@/context/AppContext';
import TMDBService from '@/services/tmdb';
import { Movie } from '@/types/movie';

interface MovieSections {
  trending: Movie[];
  popular: Movie[];
  topRated: Movie[];
  upcoming: Movie[];
}

const Home = () => {
  const { setGenres } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<keyof MovieSections>('trending');
  const [movieSections, setMovieSections] = useState<MovieSections>({
    trending: [],
    popular: [],
    topRated: [],
    upcoming: []
  });

  const sections = [
    { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
    { id: 'popular' as const, label: 'Popular', icon: Sparkles },
    { id: 'topRated' as const, label: 'Top Rated', icon: Award },
    { id: 'upcoming' as const, label: 'Upcoming', icon: Calendar }
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
  }, [setGenres]);

  const handleMoviePress = (movie: Movie) => {
    router.push({
      pathname: '/movie/[id]',
      params: { id: movie.id.toString() }
    });
  };

  const currentMovies = useMemo(() => {
    return movieSections[activeSection] || [];
  }, [movieSections, activeSection]);

  const currentSection = sections.find(section => section.id === activeSection);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading movies...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover The Newest</Text>
          <Text style={styles.titleAccent}>Movies</Text>
          <Text style={styles.subtitle}>
            Explore trending movies, build your watchlist, and never miss a great film again
          </Text>
        </View>

        {/* Section Navigation */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sectionNav}
          contentContainerStyle={styles.sectionNavContent}
        >
          {sections.map(({ id, label, icon: Icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveSection(id)}
              style={[
                styles.sectionButton,
                activeSection === id && styles.sectionButtonActive
              ]}
            >
              <Icon 
                size={16} 
                color={activeSection === id ? 'white' : '#9CA3AF'} 
              />
              <Text style={[
                styles.sectionButtonText,
                activeSection === id && styles.sectionButtonTextActive
              ]}>
                {label}
              </Text>
              <View style={[
                styles.badge,
                activeSection === id && styles.badgeActive
              ]}>
                <Text style={[
                  styles.badgeText,
                  activeSection === id && styles.badgeTextActive
                ]}>
                  {movieSections[id]?.length || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {currentSection?.label} Movies
          </Text>
          <FlatList
            data={currentMovies}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <MovieCard movie={item} onPress={handleMoviePress} />
            )}
            contentContainerStyle={styles.movieList}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {sections.map(({ id, label, icon: Icon }) => (
            <View key={id} style={styles.statCard}>
              <View style={styles.statIcon}>
                <Icon size={20} color="white" />
              </View>
              <Text style={styles.statLabel}>{label}</Text>
              <Text style={styles.statValue}>
                {movieSections[id]?.length || 0}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#D1D5DB',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 24,
  },
  sectionNav: {
    marginVertical: 16,
  },
  sectionNavContent: {
    paddingHorizontal: 16,
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#374151',
  },
  sectionButtonActive: {
    backgroundColor: '#F59E0B',
  },
  sectionButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  sectionButtonTextActive: {
    color: 'white',
  },
  badge: {
    backgroundColor: '#4B5563',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  badgeText: {
    color: '#9CA3AF',
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
  },
  badgeTextActive: {
    color: 'white',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginLeft: 16,
    marginBottom: 12,
  },
  movieList: {
    paddingLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    marginTop: 4,
  },
});

export default Home;