import React from 'react';
import { Text } from 'react-native';

const FormattedDate = ({ dateString, style, numberOfLines }) => {
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}, ${hours}:${minutes}`;
  };

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {formatEventDate(dateString)}
    </Text>
  );
};

export default FormattedDate;