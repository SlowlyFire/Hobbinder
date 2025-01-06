import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext'; 
import { FuncNavigationProvider } from './context/FuncNavigationContext'; 
import { SocketProvider } from './context/SocketContext'; 

import LoginScreen from './screens/RegisterLoginScreens/LoginScreen';
import RegisterScreen from './screens/RegisterLoginScreens/RegisterScreen';
import StartScreen from './screens/RegisterLoginScreens/StartScreen';
import CreateProfileDetailsScreen from './screens/RegisterLoginScreens/CreateProfileDetailsScreen';
import ChooseHobbiesScreen from './screens/RegisterLoginScreens/ChooseHobbiesScreen';
import CreateSummaryScreen from './screens/RegisterLoginScreens/CreateSummaryScreen';
import DiscoverScreen from './screens/HomePageScreens/DiscoverScreen';
import AdminHomeScreen from './screens/AdminScreens/AdminHomeScreen';
import HandleNotificationsScreen from './screens/AdminScreens/Notification/HandleNotificationsScreen';
import UserManagementScreen from './screens/AdminScreens/UserManagement/UserManagementScreen';
import AnalyticsScreen from './screens/AdminScreens/Analytics/AnalyticsScreen';
import NotifySpecificUserScreen from './screens/AdminScreens/Notification/NotifySpecificUserScreen';
import SomeUserProfileScreen from './screens/AdminScreens/UserManagement/SomeUserProfileScreen';
import AdminChooseHobbiesScreen from './screens/AdminScreens/UserManagement/AdminChooseHobbiesScreen';
import HobbiesManagementScreen from './screens/AdminScreens/HobbiesManagement/HobbiesManagementScreen';
import HobbyDetailsScreen from './screens/AdminScreens/HobbiesManagement/HobbyDetailsScreen';
import AddNewHobbyScreen from './screens/AdminScreens/HobbiesManagement/AddNewHobbyScreen';
import EventsManagementScreen from './screens/AdminScreens/EventsMangement/EventsManagementScreen';
import EventDetailsScreen from './screens/AdminScreens/EventsMangement/EventDetailsScreen';
import EventEditingScreen from './screens/HomePageScreens/EventEditingScreen';
import EventCreationScreen from './screens/HomePageScreens/EventCreationScreen';
import EventLikesScreen from './screens/HomePageScreens/EventLikesScreen';
import UserProfileScreen from './screens/HomePageScreens/UserProfileScreen';
import ChatScreen from './screens/HomePageScreens/ChatScreen';
import MessagesScreen from './screens/HomePageScreens/MessagesScreen';
import EventUserDetailsScreen from './screens/HomePageScreens/EventUserDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <FuncNavigationProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Welcome" component={StartScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="CreateProfileDetails" component={CreateProfileDetailsScreen} />
              <Stack.Screen name="ChooseHobbies" component={ChooseHobbiesScreen} />
              <Stack.Screen name="CreateSummary" component={CreateSummaryScreen} />
              <Stack.Screen name="Discover" component={DiscoverScreen} />
              <Stack.Screen name="AdminHomeScreen" component={AdminHomeScreen} />
              <Stack.Screen name="HandleNotifications" component={HandleNotificationsScreen} />
              <Stack.Screen name="UserManagement" component={UserManagementScreen} />
              <Stack.Screen name="Analytics" component={AnalyticsScreen} />
              <Stack.Screen name="NotifySpecificUser" component={NotifySpecificUserScreen} />
              <Stack.Screen name="SomeUserProfile" component={SomeUserProfileScreen} />
              <Stack.Screen name="AdminChooseHobbies" component={AdminChooseHobbiesScreen} />
              <Stack.Screen name="HobbiesManagement" component={HobbiesManagementScreen} />
              <Stack.Screen name="HobbyDetails" component={HobbyDetailsScreen} />
              <Stack.Screen name="AddNewHobby" component={AddNewHobbyScreen} />
              <Stack.Screen name="EventsManagement" component={EventsManagementScreen} />
              <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
              <Stack.Screen name="EventEditing" component={EventEditingScreen} />
              <Stack.Screen name="EventCreation" component={EventCreationScreen} />
              <Stack.Screen name="EventLikes" component={EventLikesScreen}/>
              <Stack.Screen name="UserProfile" component={UserProfileScreen}/>
              <Stack.Screen name="Chat" component={ChatScreen}/>
              <Stack.Screen name="Messages" component={MessagesScreen}/>
              <Stack.Screen name="EventUserDetails" component={EventUserDetailsScreen}/>
            </Stack.Navigator>
          </NavigationContainer>
        </FuncNavigationProvider>
     </SocketProvider>
    </AuthProvider>
  );
}