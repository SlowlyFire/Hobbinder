import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { SocketContext } from '../../context/SocketContext';
import GoBackButton from '../../components/GoBackButton';
import { CLIENT_IP, PORT } from '@env';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const socket = useContext(SocketContext);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Note', 'Please enter both username and password');
      return;
    }

    try {
      const success = await login(username, password);
      if (!success) {
        throw new Error('Login failed');
      }
      const userRes = await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 5000
      });
      if (!userRes.ok) {
        throw new Error(`Failed to get user data: ${userRes.status}`);
      }

      const user = await userRes.json();

      console.log('User data received:', { permission: user.permission });

      if (socket) {
        socket.emit("userLoggedIn", username);
      }

      // Navigation based on user permission
      if (user.permission === 'admin') {
        navigation.navigate('AdminHomeScreen');
      } else if (user.permission === 'regular') {
        navigation.navigate('Discover');
      } else {
        Alert.alert('Error', 'Invalid user permissions');
      }
    } catch (error) {
      console.log("Redirecting to AuthContext");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
       <GoBackButton onBackPress={() => navigation.navigate("Welcome")}/>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>Welcome Back! 👋</Text>
          <Text style={styles.subtitleText}>Let's get you signed in</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor="#999"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
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
  content: {
    flex: 1,
    padding: 24,
  },
  titleSection: {
    marginTop: 40,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 18,
    color: '#666',
  },
  inputSection: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    paddingLeft: 4,
  },
  input: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default LoginScreen;