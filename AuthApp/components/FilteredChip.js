import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilteredChip = ({ item, onRemove }) => {
  return (
    <View style={styles.chipContainer}>
        <Text style={styles.chipText}>{item}</Text>
        <TouchableOpacity onPress={() => onRemove(item)} style={styles.clearIconContainer}>
        <Ionicons name="close" size={16} color="white" />
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    chipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4A90E2',
        borderRadius: 15,
        paddingHorizontal: 10,
        paddingVertical: 5,
        marginRight: 8,
        marginBottom: 5,
    },
    chipText: {
        color: 'white',
        fontSize: 14,
    },
    clearIconContainer: {
        marginLeft: 5,
    },
});

export default FilteredChip;
