import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Movie, Genre, User } from '@/types/movie';

interface AppState {
  watchlist: Movie[];
  theme: 'light' | 'dark';
  genres: Genre[];
  searchHistory: string[];
  user: User;
}

type AppAction =
  | { type: 'ADD_TO_WATCHLIST'; payload: Movie }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: number }
  | { type: 'UPDATE_MOVIE_RATING'; payload: { id: number; rating: number; review: string } }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_GENRES'; payload: Genre[] }
  | { type: 'ADD_TO_SEARCH_HISTORY'; payload: string }
  | { type: 'LOAD_STATE'; payload: Partial<AppState> }
  | { type: 'UPDATE_USER_PROFILE'; payload: Partial<User> };

interface AppContextType extends AppState {
  dispatch: React.Dispatch<AppAction>;
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  updateMovieRating: (movieId: number, rating: number, review: string) => void;
  toggleTheme: () => void;
  setGenres: (genres: Genre[]) => void;
  addToSearchHistory: (term: string) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  isInWatchlist: (movieId: number) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialState: AppState = {
  watchlist: [],
  theme: 'dark',
  genres: [],
  searchHistory: [],
  user: {
    name: 'Movie Lover',
    avatar: null,
    totalWatched: 0,
    favoriteGenres: []
  }
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'ADD_TO_WATCHLIST':
      return {
        ...state,
        watchlist: [...state.watchlist, { ...action.payload, addedAt: new Date().toISOString() }],
      };
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(movie => movie.id !== action.payload),
      };
    case 'UPDATE_MOVIE_RATING':
      return {
        ...state,
        watchlist: state.watchlist.map(movie =>
          movie.id === action.payload.id
            ? { ...movie, userRating: action.payload.rating, userReview: action.payload.review }
            : movie
        ),
      };
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light',
      };
    case 'SET_GENRES':
      return {
        ...state,
        genres: action.payload,
      };
    case 'ADD_TO_SEARCH_HISTORY':
      const newHistory = [action.payload, ...state.searchHistory.filter(term => term !== action.payload)].slice(0, 10);
      return {
        ...state,
        searchHistory: newHistory,
      };
    case 'LOAD_STATE':
      return {
        ...state,
        ...action.payload,
      };
    case 'UPDATE_USER_PROFILE':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('cinelistAppState');
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          dispatch({ type: 'LOAD_STATE', payload: parsedState });
        }
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem('cinelistAppState', JSON.stringify({
          watchlist: state.watchlist,
          theme: state.theme,
          searchHistory: state.searchHistory,
          user: state.user
        }));
      } catch (error) {
        console.error('Failed to save state:', error);
      }
    };
    saveState();
  }, [state.watchlist, state.theme, state.searchHistory, state.user]);

  const value: AppContextType = {
    ...state,
    dispatch,
    addToWatchlist: (movie) => dispatch({ type: 'ADD_TO_WATCHLIST', payload: movie }),
    removeFromWatchlist: (movieId) => dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movieId }),
    updateMovieRating: (movieId, rating, review) => dispatch({ 
      type: 'UPDATE_MOVIE_RATING', 
      payload: { id: movieId, rating, review } 
    }),
    toggleTheme: () => dispatch({ type: 'TOGGLE_THEME' }),
    setGenres: (genres) => dispatch({ type: 'SET_GENRES', payload: genres }),
    addToSearchHistory: (term) => dispatch({ type: 'ADD_TO_SEARCH_HISTORY', payload: term }),
    updateUserProfile: (updates) => dispatch({ type: 'UPDATE_USER_PROFILE', payload: updates }),
    isInWatchlist: (movieId) => state.watchlist.some(movie => movie.id === movieId),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};