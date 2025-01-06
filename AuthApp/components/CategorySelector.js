// components/CategorySelector.js

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const CategorySelector = ({ value, onChange, isEditing = true, hobbies }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isDisabled = !isEditing; // in EventEditingScreen we send isEditing=false
  
  return (
    <View style={styles.categoryContainer}>
      <TouchableOpacity
        style={[
          styles.categorySelector,
          isDisabled ? styles.textDisabled : styles.textEnabled
        ]}
        onPress={() => !isDisabled && setShowDropdown(!showDropdown)}
        disabled={isDisabled}
      >
        <Text style={isDisabled ? styles.textDisabled : styles.textEnabled}>
          {value || "Select Event Category"}
        </Text>
        {!isDisabled && (
          <Ionicons
            name={showDropdown ? "chevron-up" : "chevron-down"}
            size={24}
            color={isDisabled ? "gray" : "#333"}
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={[styles.dropdownContainer, { top: 0 }]}>
            <ScrollView style={styles.dropdownScroll}>
              {hobbies.map((hobby) => (
                <TouchableOpacity
                  key={hobby.hobby_name}
                  style={styles.dropdownItem}
                  onPress={() => {
                    onChange(hobby.hobby_name);
                    setShowDropdown(false);
                  }}
                >
                  <View style={styles.dropdownItemContent}>
                    {hobby.icon_lib === 'Ionicons' && (
                      <Ionicons name={hobby.icon} size={20} color="#666" />
                    )}
                    {hobby.icon_lib === 'FontAwesome5' && (
                      <FontAwesome5 name={hobby.icon} size={20} color="#666" />
                    )}
                    <Text style={styles.dropdownItemText}>{hobby.hobby_name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    position: 'relative',
    zIndex: 1,
  },
  categorySelector: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownItemText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  textEnabled: {
    color: '#000',
  },
  textDisabled: {
    color: 'gray',
  },
});

export default CategorySelector;