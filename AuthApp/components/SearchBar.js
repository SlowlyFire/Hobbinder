import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SearchBar = ({ searchQuery, setSearchQuery, placeholder, hasFilter = false, isRegular = false }) => {
  return (
    <View 
      style={
        isRegular 
          ? styles.searchBar 
          : hasFilter 
            ? styles.searchBarWithFilter 
            : styles.regularSearchBar
      }
    >
      <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={text => setSearchQuery(text)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 220, 220, 0.8)',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  regularSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  searchBarWithFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    height: 40, 
    borderRadius: 10,
    flex: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
});

export default SearchBar;
