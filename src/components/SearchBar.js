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
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import TMDBService from '../services/tmdb';

const SearchBar = ({ onResults, onLoading }) => {
  const { searchHistory, addToSearchHistory } = useApp();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      onResults([]);
      return;
    }

    setIsSearching(true);
    onLoading(true);

    try {
      const response = await TMDBService.searchMovies(searchQuery);
      onResults(response.results || []);
      addToSearchHistory(searchQuery.trim());
    } catch (error) {
      console.error('Search error:', error);
      onResults([]);
    } finally {
      setIsSearching(false);
      onLoading(false);
    }
  };

  const debouncedSearch = (searchQuery) => {
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

  const handleSuggestionPress = (suggestion) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    onResults([]);
  };

  const filteredHistory = searchHistory.filter(term => 
    term.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color="#9CA3AF" 
          style={styles.searchIcon} 
        />
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
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Suggestions Modal */}
      <Modal
        visible={showSuggestions && (filteredHistory.length > 0 || query.trim())}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          onPress={() => setShowSuggestions(false)}
        >
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsHeader}>Recent Searches</Text>
            <FlatList
              data={filteredHistory}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.suggestionItem}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                  <Text style={styles.suggestionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
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
  },
  clearButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
  },
  suggestionsContainer: {
    backgroundColor: '#374151',
    marginHorizontal: 16,
    borderRadius: 12,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  suggestionsHeader: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
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
    marginLeft: 12,
  },
});

export default SearchBar;