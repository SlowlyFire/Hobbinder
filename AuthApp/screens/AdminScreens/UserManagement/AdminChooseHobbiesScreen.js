import React, { useState, useEffect, useContext } from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; 
import Header from '../../../components/Header'; 
import ScreenContainer from '../../../components/ScreenContainer'; 
import SearchBar from '../../../components/SearchBar';
import LoadingComp from '../../../components/LoadingComp';
import { FuncNavigationContext } from '../../../context/FuncNavigationContext';
import { CLIENT_IP, PORT } from '@env';

const screenWidth = Dimensions.get('window').width;

const AdminChooseHobbiesScreen = ({ route, navigation }) => {
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

  const handleConfirm = () => {
    if (userProfile) {
      if (selectedHobbies.length === 0) {
        Alert.alert('Error', 'Please choose at least one hobby.');
        return;
      }
      userProfile.hobbies = selectedHobbies;
    }

    if (!isAdmin) {
      navigation.navigate('CreateSummary', { userProfile, isAdmin });
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
      <LoadingComp loadingText="Loading hobbies..."/>
    );
  }

  return (
    <ScreenContainer>
        <Header title={userProfile ? "Your hobbies" : "Filter hobbies"} onBackPress={() => navigation.goBack()} /> 

        { userProfile ? (
          <Text style={styles.subTitle}>
              Select a few of your hobbies and let everyone know what you’re passionate about
          </Text>
        ) : (
          <></>
        )}

        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search" />

        <ScrollView contentContainerStyle={styles.hobbiesContainer}>
          {filteredHobbies.map((hobby, index) => {
            const IconComponent = getIconComponent(hobby.icon_lib); // Map to actual icon component
            const isLongText = hobby.hobby_name.length > 10; // Check if hobby name is long
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.hobbyButton,
                  selectedHobbies.includes(hobby.hobby_name) ? styles.hobbyButtonSelected : null,
                ]}
                onPress={() => handleHobbySelect(hobby.hobby_name)}
              >
                <IconComponent name={hobby.icon} size={20} color={selectedHobbies.includes(hobby.hobby_name) ? "#fff" : "#000"} />
                <Text
                  style={[
                    styles.hobbyText,
                    isLongText && { fontSize: screenWidth > 400 ? 14 : 12 }, // Smaller font size for long text
                    selectedHobbies.includes(hobby.hobby_name) ? styles.hobbyTextSelected : null,
                  ]}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.5} // Allows shrinking further if needed
                >
                  {hobby.hobby_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    margin: 20,
    marginTop: 60,
    borderRadius: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  hobbiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hobbyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 15,
    width: '48%',
  },
  hobbyButtonSelected: {
    backgroundColor: '#4D9DE0',
    borderColor: '#4D9DE0',
  },
  hobbyText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
  hobbyTextSelected: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#4D9DE0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AdminChooseHobbiesScreen;