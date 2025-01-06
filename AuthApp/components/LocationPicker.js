import 'react-native-get-random-values';
import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_PLACES_API_KEY } from '@env';

const LocationPicker = ({ onLocationSelect, defaultStyles }) => {
  const [error, setError] = useState(null);
  console.log('API Key being used:', GOOGLE_PLACES_API_KEY);


  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <GooglePlacesAutocomplete
        placeholder='Enter location'
        minLength={2}
        autoFocus={false}
        returnKeyType={'search'}
        fetchDetails={true}
        enablePoweredByContainer={false}
        onPress={(data, details = null) => {
          console.log('Location selected:', data);
          console.log('Location details:', details);
          
          if (!details) {
            setError('Could not fetch location details');
            return;
          }

          const locationData = {
            name: data.description,
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            placeId: data.place_id,
            fullAddress: details.formatted_address
          };
          
          console.log('Processed location data:', locationData);
          onLocationSelect(locationData);
        }}
        onFail={(error) => {
          console.error('GooglePlacesAutocomplete error:', error);
          setError('Failed to fetch locations. Please check your internet connection.');
        }}
        query={{
          key: GOOGLE_PLACES_API_KEY,
          language: 'en',
          types: '(cities)', // This restricts to cities, remove if you want all types of places
        }}
        styles={{
          container: {
            flex: 0,
          },
          textInput: {
            ...defaultStyles,
            height: 50,
            fontSize: 16,
            paddingHorizontal: 15,
          },
          listView: {
            position: 'absolute',
            top: 55,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            borderRadius: 5,
            // zIndex: 1000,
            elevation: 3,
          },
          row: {
            padding: 13,
            height: 44,
          },
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // zIndex: 1,
    // marginBottom: 15,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});

export default LocationPicker;