import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import UserRow from './UserRow';

const UserList = ({ users, onUserPress, selectedUsers }) => {
  return (
    <ScrollView>
      {users.length > 0 ? (
        users.map((user, index) => (
          <TouchableOpacity 
            key={index} 
            onPress={() => onUserPress(user.username)}
          >
            <UserRow 
              username={user.username} 
              imageUri={user.profile_pic} 
              selected={selectedUsers && selectedUsers.has(user.username)} // Pass selected prop
            />
          </TouchableOpacity>
        ))
      ) : (
        <Text style={styles.noResults}>No users found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    marginTop: 20,
  },
});

export default UserList;
