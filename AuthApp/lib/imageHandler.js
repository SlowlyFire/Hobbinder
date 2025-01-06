import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { CLOUDINARY_API_KEY, CLOUDINARY_URL } from '@env';


async function handlePickImage(setCloudinaryUrl, setLoading) {
    let permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "Permission to access gallery is required.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setLoading(true)
      await uploadImageToCloudinary(result.assets[0].uri, setCloudinaryUrl)
    }
}

async function uploadImageToCloudinary(imageUri, setCloudinaryUrl) {
  console.log("Image URI:", imageUri);

  const formData = new FormData();
  formData.append('file', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });
  formData.append('upload_preset', 'hobbinder_image_preset'); 
  formData.append('api_key', CLOUDINARY_API_KEY);

  try {
    const response = await axios.post(CLOUDINARY_URL, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    await setCloudinaryUrl(response.data.secure_url);
  } catch (error) {
    console.error('Error uploading image:', error);
  }
};

export default { handlePickImage, uploadImageToCloudinary }