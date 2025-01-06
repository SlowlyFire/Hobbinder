import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, Alert } from 'react-native';
import background from '../../assets/background.png';
import logo from '../../assets/logo.png';
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
    <ImageBackground source={background} style={styles.background}>
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          <Image style={styles.image} source={logo} />
          <Text style={styles.title}>Sign up to continue</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.loginButtonText}>👋 Let's Start!</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>✨ Create New Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 40,
  },
  contentContainer: {
    alignItems: 'center',
    marginTop: 60, // Moved logo down
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: '#4A90E2', // Changed to match the background blue
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: 'transparent',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default StartScreen;