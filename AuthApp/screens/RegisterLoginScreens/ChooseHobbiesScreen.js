import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; 
import Header from '../../components/Header'; 
import ScreenContainer from '../../components/ScreenContainer'; 
import SearchBar from '../../components/SearchBar';
import GoBackButton from '../../components/GoBackButton';
import { FuncNavigationContext } from '../../context/FuncNavigationContext';
import { CLIENT_IP, PORT } from '@env';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChooseHobbiesScreen = ({ route, navigation }) => {
  const { userProfile, isAdmin, isToSetCurrentHobbies, isToSetFilteredCategories, filteredEvents } = route.params;
  const [hobbies, setHobbies] = useState([]);
  const [selectedHobbies, setSelectedHobbies] = useState(userProfile ? (userProfile.hobbies || []) : filteredEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { setCurrentHobbies, setFilteredCategories } = useContext(FuncNavigationContext);

  const getAllHobbies = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (res.ok) {
        setHobbies(data);
      } else {
        Alert.alert('Error', 'Failed to fetch hobbies');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while getting the hobbies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllHobbies();
  }, []);

  const handleConfirm = async () => {
    if (userProfile) {
      if (selectedHobbies.length === 0) {
        Alert.alert('Note', 'Please choose at least one hobby.');
        return;
      }
      userProfile.hobbies = selectedHobbies;
    }

        try {
            // Get all events
            const response = await fetch(`http://${CLIENT_IP}:${PORT}/events`);
            const events = await response.json();
            
            // Calculate category matches (similar to how we calculated distances)
            const categoryMatches = events.map(event => ({
                eventId: event.id,
                isMatch: selectedHobbies.includes(event.category)
            }));

            // Create enhanced profile with both distances and category matches
            const enhancedUserProfile = {
                ...userProfile,     // Contains original user data + eventDistances
                hobbies: selectedHobbies,
                categoryMatches     // Add category matches separately
            };

            // Navigate with enhanced profile
            if (!isAdmin) {
                navigation.navigate('CreateSummary', { 
                    userProfile: enhancedUserProfile, 
                    isAdmin 
                });
            } else {
                if (isToSetCurrentHobbies) {
                  setCurrentHobbies(selectedHobbies)
                  navigation.goBack();
                } else if (isToSetFilteredCategories) {
                  setFilteredCategories(selectedHobbies);
                  navigation.goBack();
                } else { 
                  navigation.navigate('CreateSummary', { userProfile, isAdmin });
                }
            }
        } catch (error) {
            console.error('Error calculating category matches:', error);
            Alert.alert('Error', 'Failed to process hobby selections');
        }
    }

  const handleHobbySelect = (hobby) => {
    if (selectedHobbies.includes(hobby)) {
      setSelectedHobbies(selectedHobbies.filter(item => item !== hobby));
    } else {
      setSelectedHobbies([...selectedHobbies, hobby]);
    }
  };

  // Helper function to map string to icon component
  const getIconComponent = (iconLib) => {
    switch (iconLib) {
      case 'Ionicons':
        return Ionicons;
      case 'FontAwesome5':
        return FontAwesome5;
      default:
        return Ionicons; // default fallback
    }
  };

  const filteredHobbies = hobbies.filter((hobby) => 
    hobby.hobby_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6ED784" />
          <Text style={styles.loadingText}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GoBackButton onBackPress={() => navigation.goBack()}/>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>
            {userProfile ? "Select Hobbies ✨" : "Filter Hobbies 🔍"}
          </Text>
          {userProfile && (
            <Text style={styles.subtitleText}>
              Tell us what you're passionate about
            </Text>
          )}
        </View>

        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          placeholder="Search hobbies" 
          isRegular={true}
        />

        <ScrollView 
          contentContainerStyle={styles.hobbiesContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredHobbies.map((hobby, index) => {
            const IconComponent = getIconComponent(hobby.icon_lib);
            const isLongText = hobby.hobby_name.length > 10;
            const isSelected = selectedHobbies.includes(hobby.hobby_name);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.hobbyButton,
                  isSelected && styles.hobbyButtonSelected,
                ]}
                onPress={() => handleHobbySelect(hobby.hobby_name)}
              >
                <IconComponent 
                  name={hobby.icon} 
                  size={20} 
                  color={isSelected ? "#fff" : "#666"} 
                />
                <Text
                  style={[
                    styles.hobbyText,
                    isLongText && styles.hobbyTextSmall,
                    isSelected && styles.hobbyTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  {hobby.hobby_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginTop: -30,
    padding: 15,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    fontSize: 18,
    color: '#4A90E2',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  titleSection: {
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  hobbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  hobbyButtonSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  hobbyText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  hobbyTextSmall: {
    fontSize: 12,
  },
  hobbyTextSelected: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default ChooseHobbiesScreen;