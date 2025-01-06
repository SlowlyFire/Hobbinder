import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialIcons, Entypo, FontAwesome5 } from '@expo/vector-icons';
import Header from '../../components/Header'; 
import ScreenContainer from '../../components/ScreenContainer'; 
import { usePushNotifications } from '../../lib/pushNotifications'; 
import { AuthContext } from '../../context/AuthContext';

const AdminHomeScreen = ({ navigation }) => {
  const { logout, username } = useContext(AuthContext);
  const { expoPushToken, notification } = usePushNotifications(username);

  const onLogoutPress = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        }
      ]
    ); 
  }

  return (
    <ScreenContainer>
        {/* Use Header Component */}
        <Header title="Admin" onBackPress={() => navigation.goBack()} hasLogoutButton={true}  />

        <Text style={styles.subTitle}>
          Here you will be able to manage the app, via the following components
        </Text>

        {/* Admin Menu Options */}
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('UserManagement', {
            toFilter: false, 
            setFilteredUser: null })}>
            <Ionicons name="person-circle-outline" size={24} color="black" style={styles.menuIcon} />
            <Text style={styles.menuText}>User Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HandleNotifications')}>
            <Ionicons name="notifications-outline" size={24} color="black" style={styles.menuIcon} />
            <Text style={styles.menuText}>Notification & Communication</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('EventsManagement')}>
            <MaterialIcons name="content-paste" size={24} color="black" style={styles.menuIcon} />
            <Text style={styles.menuText}>Events Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('HobbiesManagement')}>
            <FontAwesome5 name="palette" size={24} color="black" style={styles.menuIcon} />
            <Text style={styles.menuText}>Hobbies Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Analytics')}>
            <Entypo name="bar-graph" size={24} color="black" style={styles.menuIcon} />
            <Text style={styles.menuText}>Analytics and Reporting</Text>
          </TouchableOpacity>
        </View>

        {/* Centered logout button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={onLogoutPress}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background for the content container
    margin: 20,
    marginTop: 60,
    borderRadius: 15,
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  menuIcon: {
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutContainer: {
    flex: 1,
    justifyContent: 'flex-end', // Positions the logout button at the bottom
    alignItems: 'center', // Centers the button horizontally
    marginBottom: 30, // Adds space from the bottom
  },
  logoutButton: {
    backgroundColor: 'red',  // Red background color
    paddingVertical: 8,       // Smaller padding
    paddingHorizontal: 15,    // Smaller padding
    borderRadius: 5,         // Rounded corners
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    color: 'white',  // White text color
    fontWeight: 'bold',
  },
});

export default AdminHomeScreen;
