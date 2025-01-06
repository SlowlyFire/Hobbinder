import React, { useState, useRef, useEffect, useContext, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import BottomNavigation from '../../components/BottomNavigation';
import { CLIENT_IP, PORT } from '@env';
import { AuthContext } from '../../context/AuthContext';
import { usePushNotifications } from '../../lib/pushNotifications';
import { ActionButtons } from '../../components/ActionButtons';
import CardStack from '../../components/CardStack';
import CalculatingMatchesModal from '../../components/CalculatingMatchesModal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 200;

const DiscoverScreen = ({ navigation, route }) => {
  const position = useRef(new Animated.ValueXY()).current;
  const { token, isAuthenticated, logout, username, setUsername } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isFocused = useIsFocused();
  const { expoPushToken, notification } = usePushNotifications(username);

  console.log("DiscoverScreen rendering");

    // Memoize handleLike
    const handleLike = useCallback(async (eventId) => {
      if (!isAuthenticated || !eventId) return;
  
      try {
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/events/${eventId}/liked`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            await logout();
            navigation.navigate('Login');
          }
          throw new Error('Failed to like event');
        }
      } catch (error) {
        console.error('Error liking event:', error);
      }
    }, [isAuthenticated, token, logout, navigation]);


  // Memoize card press handler
  const handleCardPress = useCallback((eventId) => {
    navigation.navigate('EventUserDetails', { eventId });
  }, [navigation]);


    // Memoize fetchEvents
    const fetchEvents = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
  
        if (!isAuthenticated) {
          throw new Error('Authentication required');
        }
  
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/matches/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
  
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            await logout();
            navigation.navigate('Login');
            throw new Error('Session expired');
          }
          throw new Error('Failed to fetch events');
        }
  
        const matchData = await response.json();

        if (matchData.length === 0) {
          // Handle the case where no events are available
          setEvents([]);
          return;
        }

        // Transform the matched events to fit existing events structure
        // Note: for RIGHT NOW we don't use it. it's only if we want to display the score or the features on screen (a feature for the future)
        const transformedEvents = matchData.map(match => ({
          ...match.event,
          matchScore: match.score, // Add the AI-calculated match score
          matchFeatures: match.features // Optional: store the features that led to this score
        }));

        setEvents(transformedEvents);
        console.log(`Loaded ${transformedEvents.length} events for display`);


      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
        if (error.message === 'Authentication required' || error.message === 'Session expired') {
          navigation.navigate('Login');
        }
      } finally {
        setLoading(false);
      }
    }, [isAuthenticated, token, logout, navigation, username]); // Only recreate when these dependencies change
  

    const handleSwipe = useCallback(async (direction) => {
      const isLike = direction === 'right';
      const currentEvent = events[0];
  
      try {
          // Record the swipe
          await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}/interactions`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                  eventId: currentEvent?.id,
                  isLike,
                  addToSwipedEvents: true  // New flag to indicate we should record the swipe
              })
          });
  
          // If it's a like, handle the existing like functionality
          if (isLike && currentEvent?.id) {
              await handleLike(currentEvent.id);
          }
  
      } catch (error) {
          console.error('Error handling swipe:', error);
      }
  }, [events, username, token, handleLike]);


  // Memoize all animation-related functions
  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
    }).start();
  }, [position]);


  const onSwipeComplete = useCallback(async (direction) => {
    if (events.length === 0) {
        console.log('No more events to process');
        return;
    }
    try {
        await handleSwipe(direction);
    } catch (err) {
        console.error('Error handling swipe:', err);
    } finally {
        setEvents(prev => prev.slice(1));
        requestAnimationFrame(() => {
            position.setValue({ x: 0, y: 0 });
        });
    }
}, [events, handleSwipe, position]);


  const forceSwipe = useCallback((direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  }, [position, onSwipeComplete]);

  // Memoize the onSwipeLeft and onSwipeRight callbacks
  const onSwipeLeft = useCallback(() => forceSwipe('left'), [forceSwipe]);
  const onSwipeRight = useCallback(() => forceSwipe('right'), [forceSwipe]);

  // Memoize panResponder creation
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => {
      const hasEvents = events.length > 0;
      console.log("PanResponder - Should set responder:", { hasEvents });
      return hasEvents;
    },
    onPanResponderMove: (_, gesture) => {
      position.setValue({ x: gesture.dx, y: gesture.dy });
    },
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx > SWIPE_THRESHOLD) {
        forceSwipe('right');
      } else if (gesture.dx < -SWIPE_THRESHOLD) {
        forceSwipe('left');
      } else {
        resetPosition();
      }
    },
  }), [events.length, forceSwipe, resetPosition, position]);

  // Memoize props for CardStack to prevent unnecessary re-renders
  const cardStackProps = useMemo(() => ({
    events,
    position,
    panResponder,
    navigation,
    onCardPress: handleCardPress
  }), [events, position, panResponder, navigation, handleCardPress]);



  // Effects section
  useEffect(() => {
    // Fetch username effect - only runs once on mount
    const fetchUsername = async () => {
      const storedUsername = await AsyncStorage.getItem('username');
      setUsername(storedUsername);
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    // Fetch events when screen comes into focus
    if (isFocused) {
      fetchEvents();
    }
  }, [isFocused, fetchEvents]); // Include fetchEvents since it's now memoized

  // Push notification monitoring
  useEffect(() => {
    if (expoPushToken) {
      console.log('Push token received:', expoPushToken);
    }
    if (notification) {
      console.log('Notification received:', notification);
    }
  }, [expoPushToken, notification]);


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ED784" />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchEvents}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Main render with memoized props
  return (
    <SafeAreaView style={styles.container}>
      <CalculatingMatchesModal visible={loading} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Discover New Friends</Text>
      </View>

      <View style={styles.cardContainer}>
        <CardStack {...cardStackProps} />
      </View>

      {events.length > 0 && (
      <ActionButtons
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
    />
      )}

      <BottomNavigation navigation={navigation} currentScreen="Discover" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: 30,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4F6F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6ED784',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH * 1.4,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    left: 20
  },
  noMoreCardsContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
    marginBottom: 10,
  },
  noMoreCardsSubText: {
    fontSize: 16,
    color: '#999',
  },
});


// Wrap the entire component in memo for an extra layer of optimization
export default React.memo(DiscoverScreen);