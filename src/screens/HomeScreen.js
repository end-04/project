import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import MovieCard from '../components/MovieCard';
import { useApp } from '../context/AppContext';
import TMDBService from '../services/tmdb';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { setGenres } = useApp();
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('trending');
  const [movieSections, setMovieSections] = useState({
    trending: [],
    popular: [],
    topRated: [],
    upcoming: []
  });

  const sections = [
    { id: 'trending', label: 'Trending', icon: 'trending-up' },
    { id: 'popular', label: 'Popular', icon: 'flame' },
    { id: 'topRated', label: 'Top Rated', icon: 'trophy' },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar' }
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
  }, []);

  const handleMoviePress = (movie) => {
    navigation.navigate('MovieDetails', { movie });
  };

  const currentMovies = movieSections[activeSection] || [];
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
          {sections.map(({ id, label, icon }) => (
            <TouchableOpacity
              key={id}
              onPress={() => setActiveSection(id)}
              style={[
                styles.sectionButton,
                activeSection === id && styles.sectionButtonActive
              ]}
            >
              <Ionicons 
                name={icon} 
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
          {sections.map(({ id, label, icon }) => (
            <View key={id} style={styles.statCard}>
              <View style={styles.statIcon}>
                <Ionicons name={icon} size={20} color="white" />
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
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  titleAccent: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
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
    fontWeight: '600',
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
    fontWeight: '600',
  },
  badgeTextActive: {
    color: 'white',
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontWeight: '600',
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});

export default HomeScreen;