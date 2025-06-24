import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet,
  FlatList,
  Modal
} from 'react-native';
import { Search, X, Clock, TrendingUp } from 'lucide-react-native';
import { useApp } from '@/context/AppContext';
import TMDBService from '@/services/tmdb';
import { Movie } from '@/types/movie';

interface SearchBarProps {
  onResults: (results: Movie[]) => void;
  onLoading: (loading: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResults, onLoading }) => {
  const { searchHistory, addToSearchHistory } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      onResults([]);
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      const response = await TMDBService.searchMovies(searchQuery);
      setSearchResults(response.results || []);
      onResults(response.results || []);
      addToSearchHistory(searchQuery.trim());
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const debouncedSearch = (searchQuery: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
  };

  useEffect(() => {
    debouncedSearch(query);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSuggestionPress = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    setSearchResults([]);
    onResults([]);
  };

  const filteredHistory = searchHistory.filter(term => 
    term.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search for movies..."
          placeholderTextColor="#9CA3AF"
          returnKeyType="search"
          onSubmitEditing={() => {
            setShowSuggestions(false);
            handleSearch(query);
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Suggestions Modal */}
      <Modal
        visible={showSuggestions && (filteredHistory.length > 0 || query.trim().length > 0)}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.suggestionsContainer}>
            {filteredHistory.length > 0 && (
              <>
                <Text style={styles.suggestionsHeader}>Recent Searches</Text>
                <FlatList
                  data={filteredHistory}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(item)}
                    >
                      <Clock size={16} color="#9CA3AF" />
                      <Text style={styles.suggestionText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}

            {query.trim().length > 0 && searchResults.length > 0 && (
              <>
                {filteredHistory.length > 0 && <View style={styles.separator} />}
                <Text style={styles.suggestionsHeader}>Quick Results</Text>
                <FlatList
                  data={searchResults.slice(0, 3)}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(item.title)}
                    >
                      <View style={styles.movieIcon}>
                        <Text style={styles.movieEmoji}>🎬</Text>
                      </View>
                      <View style={styles.movieInfo}>
                        <Text style={styles.suggestionText}>{item.title}</Text>
                        <Text style={styles.movieYear}>
                          {item.release_date ? new Date(item.release_date).getFullYear() : 'TBA'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 120,
  },
  suggestionsContainer: {
    backgroundColor: '#374151',
    marginHorizontal: 16,
    borderRadius: 12,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  suggestionsHeader: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    textTransform: 'uppercase',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4B5563',
  },
  suggestionText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginLeft: 12,
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#4B5563',
  },
  movieIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieEmoji: {
    fontSize: 12,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
  },
  movieYear: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
});

export default SearchBar;