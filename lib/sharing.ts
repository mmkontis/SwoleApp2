import * as Sharing from 'expo-sharing';
import { Alert, Share } from 'react-native';

export const shareToInstagram = async (filename: string) => {
  try {
    // Use expo-sharing for Instagram
    await Sharing.shareAsync(filename, {
      mimeType: 'image/jpeg',
      dialogTitle: 'Share to Instagram Stories',
      UTI: 'public.jpeg' // for iOS
    });
  } catch (error) {
    console.error('Instagram sharing error:', error);
    Alert.alert('Error', 'Could not share to Instagram');
  }
};

export const shareToFacebook = async (filename: string) => {
  try {
    await Share.share({
      url: filename,
    });
  } catch (error) {
    console.error('Facebook sharing error:', error);
    Alert.alert('Error', 'Could not share to Facebook');
  }
};

export const shareToTikTok = async (filename: string) => {
  try {
    await Share.share({
      url: filename,
    });
  } catch (error) {
    console.error('TikTok sharing error:', error);
    Alert.alert('Error', 'Could not share to TikTok');
  }
};

export const shareToWhatsApp = async (filename: string) => {
  try {
    await Share.share({
      url: filename,
      message: 'Check out my progress!', // Added message to satisfy WhatsApp requirements
    }, {
      // Specify WhatsApp as the target app
      dialogTitle: 'Share to WhatsApp'
    });
  } catch (error) {
    console.error('WhatsApp sharing error:', error);
    Alert.alert('Error', 'Could not share to WhatsApp');
  }
};

export const shareGeneral = async (filename: string) => {
  try {
    await Share.share({
      url: filename,
      message: "Check my gainz! 💪", // Adding a default message here too
    });
  } catch (error) {
    console.error('General sharing error:', error);
    Alert.alert('Error', 'Could not share content');
  }
};
