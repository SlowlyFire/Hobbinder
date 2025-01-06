import React, { useState } from 'react';
import { Image, ActivityIndicator, View } from 'react-native';

const RenderImage = ({ img, imgStyle }) => {
   const [isLoading, setIsLoading] = useState(true);

   return (
      <View>
        {isLoading && (
          <ActivityIndicator size="large" color="#0000ff" style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -20, marginTop: -20 }} />
        )}
        <Image
          style={imgStyle}
          source={{ uri: img }}
          onLoad={() => setIsLoading(false)} // Image loaded
          onError={() => setIsLoading(false)} // Fallback to not loading on error
        />
      </View>
   );
};

export default RenderImage;
