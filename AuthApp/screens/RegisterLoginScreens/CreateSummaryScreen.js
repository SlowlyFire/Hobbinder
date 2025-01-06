import React, { useState, useContext, useEffect } from 'react';
import { Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import GoBackButton from '../../components/GoBackButton';
import { CLIENT_IP, PORT } from '@env';

const CreateSummaryScreen = ({ route, navigation }) => {
  const { userProfile, isAdmin } = route.params;
  const { login, token } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [summary, setSummary] = useState('');

  useEffect(() => {
    if (userProfile?.summary) {
      setSummary(userProfile.summary);
    }
  }, [userProfile]);

  const handleConfirm = async () => {
    try {
      if (!summary.trim()) {
        Alert.alert('Error', 'Please write about yourself.');
        return;
      }
  
      const cleanedSummary = summary
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s+$/, '');
  
      userProfile.summary = cleanedSummary;
      if(!isAdmin) { // User is not Admin
        if (userProfile._id) { // User is already registered
          await handleUpdateProfile();
          navigation.navigate('UserProfile', {
            updatedHobbies: userProfile.hobbies,
            updatedSummary: cleanedSummary
          });
        } else { // User is new
          const registrationSuccess = await handleFinalRegistration(); // returns true if handled to register the user (if fetching succeed)
          console.log('regist: ' + registrationSuccess);
          if (registrationSuccess) {
            try {
              console.log('Registration successful, attempting login');
              const loginSuccess = await login(userProfile.username, userProfile.password);
              
              if (loginSuccess) {
                console.log('Login successful');
                if (socket) {
                  socket.emit("userLoggedIn", userProfile.username);
                }
                navigation.navigate('Discover', userProfile);
              } else {
                throw new Error('Login failed after successful registration');
              }
            } catch (error) {
              console.error('Post-registration error:', error);
              Alert.alert('Error', 'Registration successful but unable to log in automatically. Please try logging in manually.');
            }
          }
        }
      } else {
        // User is Admin
        await handleFinalRegistration()
        navigation.navigate('UserManagement', userProfile);
      }

    } catch (error) {
      console.error('Confirmation error:', error);
      Alert.alert('Error', 'An error occurred while processing your request');
    }
  };

   const handleUpdateProfile = async () => {
    try {
      console.log('Updating profile for user:', userProfile.username);
      console.log('New summary:', summary);
      console.log('New hobbies:', userProfile.hobbies);

      // Destructing userProfile
      const {eventDistances, categoryMatches, ...userData} = userProfile;

      const response = await fetch(`http://${CLIENT_IP}:${PORT}/users/${userProfile.username}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          summary: summary,
          hobbies: userProfile.hobbies
        }),
      });

      // We get the updated user with the new hobbies and bio
      const responseData = await response.json();
      
      // Store updated category matches. Notice that categoryMatches is boolean
      await fetch(`http://${CLIENT_IP}:${PORT}/userEventsCategories`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: responseData.username,
            categoryMatches: categoryMatches
        })
      });

      if (response.ok) {
        Alert.alert('Success', 'Profile updated successfully');
      } else {
        throw new Error(responseData.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', error.message || 'An error occurred while updating profile');
    }
  };

  const handleFinalRegistration = async () => {
    try {
        // Log the profile we're about to send
        console.log('Starting registration with profile:', {
            username: userProfile.username,
            hasPassword: !!userProfile.password,
            hasLocation: !!userProfile.location,
            locationDetails: userProfile.location,
            hobbiesCount: userProfile.hobbies?.length
        });

        // Destructing userProfile
        const {eventDistances, categoryMatches, ...userData} = userProfile;

        // First create the user
        const response = await fetch(`http://${CLIENT_IP}:${PORT}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            // move only userData to create the user, because userData correlates with the User scheme, without distances array
            body: JSON.stringify(userData) 
        });

        const newUser = await response.json();

      // Now that we have userId (user is legit, registered and stored in DB), store the distances in mongo DB
      if (eventDistances && eventDistances.length > 0) {
        await fetch(`http://${CLIENT_IP}:${PORT}/userEventsDistances`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: newUser.username, // Maybe we shall use newUser._id now that its stored in Mongo
            distances: eventDistances
            })
          })
        };
        
        // Store category matches. Notice that categoryMatches is boolean
        await fetch(`http://${CLIENT_IP}:${PORT}/userEventsCategories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: newUser.username,
                categoryMatches: categoryMatches
            })
        });

        // Log the complete response information
        console.log('Registration attempt complete:', {
            status: response.status,
            ok: response.ok,
            responseData: newUser
        });

        if (response.ok) {
            Alert.alert('Success', 'Registered successfully');
            return true;
        } else {
            // Enhanced error logging
            console.error('Registration failed with details:', {
                status: response.status,
                error: newUser.error,
                details: newUser.details,
                fullResponse: newUser
            });
            Alert.alert('Error', newUser.message || 'Registration failed');
            return false;
        }
    } catch (error) {
        // Enhanced error logging
        console.error('Registration error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        Alert.alert('Error', 'An unexpected error occurred during registration.');
        return false;
    }
};


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GoBackButton onBackPress={() => navigation.goBack()}/>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>
            {userProfile._id ? "Edit Your Bio ✏️" : "Tell Us About You ✨"}
          </Text>
          <Text style={styles.subtitleText}>
            Share your interests and what makes you unique
          </Text>
        </View>

        <View style={styles.inputSection}>
          <TextInput
            style={styles.summaryInput}
            placeholder="Write something about yourself..."
            placeholderTextColor="#999"
            multiline
            value={summary}
            onChangeText={(text) => {
              const cleanedText = text.replace(/\n{3,}/g, '\n\n');
              setSummary(cleanedText);
            }}
            maxLength={500}
          />

          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {userProfile._id ? 'Save Changes' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
    paddingTop: 40,
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
  inputSection: {
    flex: 1,
    marginTop: 10,
  },
  summaryInput: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
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

export default CreateSummaryScreen;