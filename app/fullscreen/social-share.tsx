import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import { shareGeneral, shareToFacebook, shareToInstagram, shareToTikTok } from '../../lib/sharing';
import { useDaysStore } from '../../lib/useDaysStore';
import { calculateAverageBodyFat, calculateTotalScore } from '../../lib/utils';

// Add ViewShot type
type ViewShotType = {
  capture: () => Promise<string>;
} & View;

// List of Instagram-style gradients
const gradients = [
  ['#4A00E0', '#8E2DE2'], // Original purple gradient
  ['#8A2387', '#E94057', '#F27121'], // Instagram
  ['#1CB5E0', '#000046'], // Midnight City
  ['#FF416C', '#FF4B2B'], // Orange Coral
  ['#00C9FF', '#92FE9D'], // Relaxing Green
  ['#FF00CC', '#333399'], // Neon Purple
  ['#833ab4', '#fd1d1d', '#fcb045'], // Instagram Brand
  ['#DA4453', '#89216B'], // Crimson Tide
  ['#11998e', '#38ef7d'], // Emerald Water
  ['#4158D0', '#C850C0', '#FFCC70'], // Candy Shop
];

// Add this function at the top of your file, outside the component
const getTransparentColor = (color: string, opacity: number) => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export default function SocialShareScreen() {
  // Update the ref type
  const viewShotRef = useRef<ViewShotType>(null);
  const { dayData } = useDaysStore();

  // Get the stats dynamically
  const totalScore = calculateTotalScore(dayData?.progress_json ?? null);
  // Fix the type error by using null coalescing
  const bodyFat = calculateAverageBodyFat(dayData?.progress_json ?? null);
  const profileImage = dayData?.pic_fullbody;

  // Add state for title emojis
  const [titleEmojis, setTitleEmojis] = useState('💪');
  // Add state for pattern emojis
  const [patternEmojis, setPatternEmojis] = useState(['💪']);
  
  // Add state for emoji visibility in post
  const [showEmojisInPost, setShowEmojisInPost] = useState(false);

  // Add state for current gradient
  const [currentGradient, setCurrentGradient] = useState(0);

  // Function to change gradient
  const changeGradient = () => {
    setCurrentGradient((prev) => (prev + 1) % gradients.length);
  };

  // Update function to generate random emoji combinations and toggle visibility
  const generateRandomEmojis = () => {
    const gymEmojis = ['💪', '🏋️‍♂️', '🏃‍♂', '🔥', '🎯', '💯', '🦾', '🦿', '⚡️', '🏆'];
    const count = Math.floor(Math.random() * 3) + 1; // Random number between 1-3
    const selectedEmojis = [];
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * gymEmojis.length);
      selectedEmojis.push(gymEmojis[randomIndex]);
    }
    
    setPatternEmojis(selectedEmojis);
    setTitleEmojis(selectedEmojis.join(''));
    setShowEmojisInPost(true);
  };

  // Function to toggle emoji visibility on long press
  const toggleEmojiVisibility = () => {
    setShowEmojisInPost(!showEmojisInPost);
  };

  const captureAndShare = async (platform: 'instagram' | 'facebook' | 'tiktok' | 'general') => {
    try {
      if (!viewShotRef.current?.capture) {
        console.error('ViewShot ref or capture method not available');
        return;
      }

      const uri = await viewShotRef.current.capture();
      
      // Save the image temporarily
      const filename = `${FileSystem.cacheDirectory}share.jpg`;
      await FileSystem.moveAsync({
        from: uri,
        to: filename
      });

      switch (platform) {
        case 'instagram':
          await shareToInstagram(filename);
          break;
        case 'facebook':
          await shareToFacebook(filename);
          break;
        case 'tiktok':
          await shareToTikTok(filename);
          break;
        case 'general':
          await shareGeneral(filename);
          break;
      }

      // Clean up temporary file
      await FileSystem.deleteAsync(filename);
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Could not share content');
    }
  };

  // Add this helper function at the top
  const refreshImage = (uri: string) => {
    if (!uri) return '';
    return `${uri}?timestamp=${Date.now()}&random=${Math.random()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Link href="../" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </Link>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Show Off Your Gains</Text>
          <TouchableOpacity 
            onPress={generateRandomEmojis}
            onLongPress={toggleEmojiVisibility}
            delayLongPress={500}
          >
            <Text style={styles.titleEmoji}>{titleEmojis}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.placeholder} />
      </View>

      <TouchableOpacity onPress={changeGradient} activeOpacity={0.8}>
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'jpg', quality: 1.0 }}
          style={styles.shareCard}
        >
          <LinearGradient
            colors={gradients[currentGradient]}
            style={styles.statsCard}
          >
            {showEmojisInPost && (
              <View style={styles.emojiPattern}>
                {Array.from({ length: 400 }).map((_, index) => (
                  <Text key={index} style={styles.emoji}>
                    {patternEmojis[index % patternEmojis.length]}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.watermark}>
              <Text style={styles.watermarkText}>Analyzed by</Text>
              <Text style={styles.appName}>SwoleApp</Text>
            </View>

            {profileImage ? (
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ 
                    uri: profileImage,
                    cache: 'force-cache' // This will use the cached image if available
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error('Error loading profile image:', error);
                  }}
                />
              </View>
            ) : (
              <View style={styles.profileImageContainer}>
                <Image
                  source={{ uri: 'https://via.placeholder.com/100' }}
                  style={styles.profileImage}
                />
              </View>
            )}
            
            <View style={styles.statsContent}>
              <View style={styles.statsContainer}>
                <BlurView 
                  intensity={20} 
                  tint="dark" 
                  style={[
                    styles.statItemBlur, 
                    currentGradient !== 0 && styles.customThemeStatItem,
                    { borderColor: currentGradient === 0 ? 'rgba(255, 255, 255, 0.5)' : gradients[currentGradient][0] }
                  ]}
                >
                  <View style={[
                    styles.statItem,
                    { backgroundColor: currentGradient === 0 
                      ? 'rgba(0, 0, 0, 0.3)' 
                      : getTransparentColor(gradients[currentGradient][0], 0.3) 
                    }
                  ]}>
                    <Text style={styles.statValue}>{totalScore || '-'} 💯</Text>
                    <Text style={styles.statLabel}>Total Score</Text>
                  </View>
                </BlurView>
                <BlurView 
                  intensity={20} 
                  tint="dark" 
                  style={[
                    styles.statItemBlur, 
                    currentGradient !== 0 && styles.customThemeStatItem,
                    { borderColor: currentGradient === 0 ? 'rgba(255, 255, 255, 0.5)' : gradients[currentGradient][0] }
                  ]}
                >
                  <View style={[
                    styles.statItem,
                    { backgroundColor: currentGradient === 0 
                      ? 'rgba(0, 0, 0, 0.3)' 
                      : getTransparentColor(gradients[currentGradient][0], 0.3) 
                    }
                  ]}>
                    <Text style={styles.statValue}>{bodyFat} 🔥</Text>
                    <Text style={styles.statLabel}>Body Fat</Text>
                  </View>
                </BlurView>
              </View>
            </View>
          </LinearGradient>
        </ViewShot>
      </TouchableOpacity>

      <Text style={styles.shareText}>Share to</Text>
      
      <View style={styles.shareOptions}>
        <TouchableOpacity
          style={[styles.shareButton, styles.instagramButton]}
          onPress={() => captureAndShare('instagram')}
        >
          <Ionicons name="logo-instagram" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareButton, styles.facebookButton]}
          onPress={() => captureAndShare('facebook')}
        >
          <Ionicons name="logo-facebook" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareButton, styles.tiktokButton]}
          onPress={() => captureAndShare('tiktok')}
        >
          <Ionicons name="logo-tiktok" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.shareButton, styles.generalButton]}
          onPress={() => captureAndShare('general')}
        >
          <Ionicons name="share-social" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, // Changed from padding: 20
    paddingTop: 60,
    marginBottom: 0, // Ensure no bottom margin
  },
  backButton: {
    padding: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  titleEmoji: {
    fontSize: 24,
  },
  placeholder: {
    width: 34,
  },
  shareCard: {
    margin: 20,
    borderRadius: 15,
    overflow: 'hidden',
    height: 550,
  },
  statsCard: {
    padding: 0, // Removed padding to eliminate empty spaces
    borderRadius: 15,
    height: '100%',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Ensure pattern stays within bounds
  },
  watermark: {
    alignItems: 'center',
    marginTop: 25, // Increased from 15 to 25
    marginBottom: 10, // Added to create some space below
    paddingTop: 8,
    zIndex: 1, // Ensure watermark is above emojis
  },
  watermarkText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    letterSpacing: 1,
    marginRight: 8,
  },
  appName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  profileImageContainer: {
    alignSelf: 'center',
    width: 280,
    height: 280,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Increased opacity for better visibility
    marginBottom: 20,
    marginTop: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  statsContent: {
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 280,
    alignSelf: 'center',
    marginTop: 10,
  },
  statItemBlur: {
    borderRadius: 15,
    overflow: 'hidden',
    width: '48%',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)', // Matching the image container border
  },
  customThemeStatItem: {
    backgroundColor: 'transparent', // Remove background when custom theme is applied
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    // Remove the backgroundColor from here as we're setting it dynamically
  },
  statValue: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'nowrap',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 4,
    textAlign: 'center',
  },
  shareText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 20,
    marginBottom: 10,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  shareButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instagramButton: {
    backgroundColor: '#C13584',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  tiktokButton: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  generalButton: {
    backgroundColor: '#8A2BE2',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.1 }],
  },
  emojiPattern: {
    position: 'absolute',
    top: -100, // Increased to ensure coverage
    left: -100, // Increased to ensure coverage
    right: -100, // Increased to ensure coverage
    bottom: -100, // Increased to ensure coverage
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    opacity: 0.3,
    padding: 0,
    transform: [{ rotate: '15deg' }],
    zIndex: 0,
    backgroundColor: 'transparent',
  },
  emoji: {
    fontSize: 28, // Increased for better visibility
    margin: 12, // Increased to space emojis farther apart
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
