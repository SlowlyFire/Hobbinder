import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; 
import GoBackButton from '../../components/GoBackButton';
import { CLIENT_IP, PORT } from '@env';

const RegisterScreen = ({ route, navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPermission, setSelectedPermission] = useState('regular'); 
  const isAdmin = route.params;

  const nextScreen = async () => {
    if (!username || !password) {
      Alert.alert('Note', 'Please fill out all fields.');
      return;
    }
    try {
      const res = await fetch(`http://${CLIENT_IP}:${PORT}/users/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (res.ok) {
        Alert.alert('Note', 'Username already exists');
      } else {
        navigation.navigate('CreateProfileDetails', { username, password, selectedPermission, isAdmin });
      }
    } catch (error) {
      console.error('Register error:', error);
      Alert.alert('Error', 'An error occurred while registering');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <GoBackButton onBackPress={() => navigation.goBack()}/>
      </View>

      <View style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.welcomeText}>Create Account ✨</Text>
          <Text style={styles.subtitleText}>Let's get you started</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Choose a username"
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
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {isAdmin && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Permission Level</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedPermission}
                  onValueChange={(itemValue) => setSelectedPermission(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Regular User" value="regular" />
                  <Picker.Item label="Admin User" value="admin" />
                </Picker>
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={styles.registerButton} 
            onPress={nextScreen}
          >
            <Text style={styles.registerButtonText}>Continue</Text>
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
  pickerContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
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
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  registerButton: {
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
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  }
});

export default RegisterScreen;