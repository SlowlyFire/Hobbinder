import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Header from '../../../components/Header';  
import ScreenContainer from '../../../components/ScreenContainer'; 
import SearchBar from '../../../components/SearchBar';
import ProfileImage from '../../../components/ProfileImage';
import UploadImage from '../../../components/UploadImage';
import { ioniconsNames, fontAwesomeNames } from '../../../lib/iconLibraries';
import imageHandler from '../../../lib/imageHandler';
import { AuthContext } from '../../../context/AuthContext';
import { CLIENT_IP, PORT } from '@env';

const AddNewHobbyScreen = ({ navigation }) => {
  const [hobbyDetails, setHobbyDetails] = useState({
    hobby_name: '',
    icon: null,
    icon_lib: null,
    pic: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  const { token } = useContext(AuthContext);

  const iconLibrary = [
    ...ioniconsNames.map(icon => ({ name: icon, library: 'Ionicons' })),
    ...fontAwesomeNames.map(icon => ({ name: icon, library: 'FontAwesome5' }))
  ];

  const filteredIconLibrary = iconLibrary.filter(icon => 
    icon.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectIcon = (icon, icon_lib) => {
    setHobbyDetails((prevDetails) => ({ ...prevDetails, icon, icon_lib }));
  };

  const pickImage = async () => {
    try {
      await imageHandler.handlePickImage(setCloudinaryUrl, setUploadLoading);
    } catch (error) {
      Alert.alert('Error', 'Image upload failed.');
    } finally {
      setUploadLoading(false);
    }
  };

  useEffect(() => {
    if (cloudinaryUrl) {
      setHobbyDetails((prevDetails) => ({ ...prevDetails, pic: cloudinaryUrl }));
    }
  }, [cloudinaryUrl]);

  const addNewHobby = async () => {
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/hobbies`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hobbyDetails),
      });

      if (res.ok) {
        Alert.alert('Success', 'New hobby added');
        navigation.navigate('HobbiesManagement');
      } else {
        Alert.alert('Error', 'Failed to add new hobby');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while adding the hobby');
    }
  };

  const handleAddNewHobby = () => {
    if (!hobbyDetails.pic || !hobbyDetails.icon || !hobbyDetails.hobby_name) {
      Alert.alert('Note', 'Please fill out all fields.');
      return;
    }
    addNewHobby();
  }

  const renderIconRows = () => {
    const rows = [];
    for (let i = 0; i < filteredIconLibrary.length; i += 5) {
      const iconsInRow = filteredIconLibrary.slice(i, i + 5);
      rows.push(
        <View key={i} style={[styles.iconRow, iconsInRow.length < 5 && styles.leftAlignedRow]}>
          {iconsInRow.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.iconItem}
              onPress={() => selectIcon(item.name, item.library)}
            >
              {item.library === 'Ionicons' ? (
                <Ionicons name={item.name} size={32} color="gray" />
              ) : (
                <FontAwesome5 name={item.name} size={32} color="gray" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      );
    }
    return rows;
  };

  return (
    <ScreenContainer>
      <Header title="Add New Hobby" onBackPress={() => navigation.goBack()} />

      {/* Modal for loading state */}
      <UploadImage loading={uploadLoading} setLoading={setUploadLoading} />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.hobbySection}>
          <ProfileImage pickImage={pickImage} image={hobbyDetails.pic} canEdit={true} />
          
          <TextInput
              style={styles.hobbyNameInput}
              placeholder="Enter hobby name"
              value={hobbyDetails.hobby_name}
              onChangeText={(text) => setHobbyDetails((prev) => ({ ...prev, hobby_name: text }))}
          />

          <View style={styles.iconContainer}>
              {hobbyDetails.icon ? (
                hobbyDetails.icon_lib === 'Ionicons' ? (
                  <Ionicons name={hobbyDetails.icon} size={32} color="gray" />
                ) : (
                  <FontAwesome5 name={hobbyDetails.icon} size={32} color="gray" />
                )
              ) : (
                <Text>No icon selected</Text>
              )}
          </View>
        </View>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} placeholder="Search for an icon..." />
          
        <View style={styles.iconLibrary}>
              <Text style={styles.sectionTitle}>Icons List</Text>
              <ScrollView
                contentContainerStyle={styles.iconScrollContainer}
                nestedScrollEnabled
                style={styles.fixedIconListContainer}
              >
                {renderIconRows()}
              </ScrollView>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddNewHobby}>
          <Text style={styles.buttonText}>Add Hobby</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hobbySection: {
    alignItems: 'center',
    marginTop: 20,
  },
  hobbyNameInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    fontSize: 20,
    marginVertical: 20,
    width: '80%',
    textAlign: 'center',
  },
  iconLibrary: {
    marginVertical: 10,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftAlignedRow: {
    justifyContent: 'flex-start',
  },
  iconItem: {
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  fixedIconListContainer: {
    height: 250, // Adjust this height based on your icon size and padding/margins
    overflow: 'scroll', // Allow for scrolling
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
});

export default AddNewHobbyScreen;
