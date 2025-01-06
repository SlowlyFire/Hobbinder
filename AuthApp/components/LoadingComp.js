import React from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingComp = ({ loadingText }) => {
    return (
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6ED784" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
});

export default LoadingComp;
