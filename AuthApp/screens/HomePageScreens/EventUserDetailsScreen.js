import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';
import dateParser from '../../lib/dateParser';
import BottomNavigation from '../../components/BottomNavigation';

const SCREEN_WIDTH = Dimensions.get('window').width;

const EventUserDetailsScreen = ({ route, navigation }) => {
  const { eventId } = route.params;
  const { token } = useContext(AuthContext);
  const [eventDetails, setEventDetails] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch event details
      const eventResponse = await fetch(`http://${CLIENT_IP}:${PORT}/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!eventResponse.ok) {
        throw new Error('Failed to fetch event details');
      }

      const eventData = await eventResponse.json();
      setEventDetails(eventData);

      // Fetch user profile using the event creator's username
      const userResponse = await fetch(`http://${CLIENT_IP}:${PORT}/users/${eventData.uploader.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const userData = await userResponse.json();
      setUserProfile(userData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const renderPhotoItem = ({ item: photo }) => (
    <View style={styles.photoCard}>
      <Image source={{ uri: photo }} style={styles.photoCardImage} />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ED784" />
          <Text style={styles.loadingText}>Loading details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Event Section */}
        <View style={styles.eventSection}>
          <View style={styles.imageContainer}>
            <Image source={{ uri: eventDetails.img }} style={styles.eventImage} />
          </View>

          <View style={styles.eventDetails}>
            <Text style={styles.categoryText}>{eventDetails.category}</Text>
            <Text style={styles.eventSummary}>{eventDetails.summary}</Text>
            
            <View style={styles.eventInfoRow}>
              <Ionicons name="location" size={20} color="#666" />
              <Text style={styles.eventInfoText}>{eventDetails.location.name}</Text>
            </View>
            
            <View style={styles.eventInfoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.eventInfoText}>
                {dateParser.getFormattedDate(eventDetails.when_date)}
              </Text>
            </View>

            <View style={styles.eventInfoRow}>
              <Ionicons name="time" size={20} color="#666" />
              <Text style={styles.eventInfoText}>
                {dateParser.getFormattedTime(eventDetails.when_date)}
              </Text>
            </View>

            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={20} color="#FF4F6F" />
              <Text style={styles.likesText}>
                {eventDetails.liked?.length || 0} likes
              </Text>
            </View>
          </View>
        </View>

        {/* Creator Profile Section */}
        <View style={styles.creatorSection}>
          <View style={styles.creatorHeader}>
            <Image 
              source={{ uri: userProfile.profile_pic }} 
              style={styles.profileImage}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorName}>
                {userProfile.first_name} {userProfile.last_name}
              </Text>
              <Text style={styles.username}>@{userProfile.username}</Text>
            </View>
          </View>

          <Text style={styles.creatorSummary}>{userProfile.summary}</Text>

          {/* Photos Gallery */}
          {userProfile.photos && userProfile.photos.length > 0 && (
            <View style={styles.photoGallery}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <FlatList
                data={userProfile.photos}
                renderItem={renderPhotoItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoList}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavigation navigation={navigation} currentScreen="EventUserDetails" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#6ED784',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  eventSection: {
    backgroundColor: 'white',
    marginBottom: 10,
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  eventDetails: {
    padding: 20,
  },
  categoryText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  eventSummary: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    lineHeight: 24,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventInfoText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  likesText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  creatorSection: {
    backgroundColor: 'white',
    padding: 20,
  },
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  creatorInfo: {
    flex: 1,
    marginLeft: 15,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#666',
  },
  creatorSummary: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    lineHeight: 24,
  },
  photoGallery: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  photoList: {
    paddingRight: 20,
  },
  photoCard: {
    width: 200,
    height: 200,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  photoCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default EventUserDetailsScreen;