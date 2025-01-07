import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import background from '../../assets/clear_friends_background.png';
import logo from '../../assets/friends_title.png'
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import { CLIENT_IP, PORT } from '@env';

const StartScreen = ({ navigation }) => {
  const { token, username, loginByToken } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const authenticateWithToken = async () => {
      if (token) {
        try {
          const isAuthenticated = await loginByToken(token);
          if (isAuthenticated) {
            console.log(`Token validated for user: ${username}`);
            await getUserFromUsername(username);

            if (socket) {
              socket.emit("userLoggedIn", username);
            }
          } else {
            Alert.alert('Session Expired', 'Please log in again.');
          }
        } catch (error) {
          console.error("Error during token validation:", error);
          Alert.alert('Error', 'An error occurred during login. Please try again.');
        }
      }
    };

    authenticateWithToken();
  }, []);

  useEffect(() => {
    if (user) {
      if (user.permission === 'admin') {
        navigation.navigate('AdminHomeScreen');
      } else if (user.permission === 'regular') {
        navigation.navigate('Discover');
      }
    }
  }, [user]);

  const getUserFromUsername = async (username) => {
    if (username) {
      try {
        const res = await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          Alert.alert('Error', 'Failed to fetch the user');
        }
      } catch (error) {
        console.log(error);
        Alert.alert('Error', 'An error occurred while getting the user');
      }
    }
  };

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.container}>
        <View style={styles.logo}>
          <Image source={logo} style={styles.logoImage}/>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>👋 Let's Start!</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.loginButtonText}>✨ Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '5%',
  },
  logo: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Make it flexible
    paddingTop: '15%', 
    width: '100%',
  },
  logoImage: {
    width: '100%', // Make width relative to container
    height: '55%',
    maxWidth: 400, // But limit maximum size
    aspectRatio: 2, // Maintain aspect ratio
    resizeMode: 'contain',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: '10%',
    paddingBottom: '60%', // Add bottom padding
    justifyContent: 'flex-end', // Align buttons to bottom
  },
  loginButton: {
    backgroundColor: '#04090d',
    opacity: 0.92,
    padding: '5%',
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: '4%',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StartScreen;
