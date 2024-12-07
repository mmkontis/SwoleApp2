import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { updateDayWithImage, uploadImage } from '../../lib/supabase-functions';
import { DayData, useDaysStore } from '../../lib/useDaysStore';
import MediaPickerBottomSheet from '../components/MediaPickerBottomSheet';
import { SettingsBottomSheet } from '../components/SettingsBottomSheet';

// Define the type for the route parameters
export type RootStackParamList = {
  ScanScreen: { photoUri?: string };
  CameraScreen: undefined;
};

type ScanScreenRouteProp = RouteProp<RootStackParamList, 'ScanScreen'>;

const { width: screenWidth } = Dimensions.get('window');
const itemWidth = screenWidth * 0.7;
const sideMargin = screenWidth * 0.15;

// Add this helper function at the top of the file, outside of the component
const getFormattedDate = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear(); // Use full year instead of last two digits
  return `${year}-${month}-${day}`; // Format as YYYY-MM-DD
};

// Add this function at the top level of your component
const refreshImage = (uri: string) => {
  if (!uri) return '';
  // Add timestamp and random number to force refresh
  return `${uri}?timestamp=${Date.now()}&random=${Math.random()}`;
};

// Define the type for the route parameters
type RouteParams = {
  photoUri?: string;
  fullbody?: string;
  back?: string;
  legs?: string;
};

// Add this type definition
type BodyPart = {
  generalScore: number;
  bodyFatPercentage: number;
  explanation: string;
};

type ScanAnalysis = {
  generalScore: number;
  bodyFatPercentage: number | null;
  explanation: string;
  details?: any;
};

type ScanData = {
  [key: string]: ScanAnalysis;
};

// Add this near the top of the file, after the imports
const gradients = [
  ['#8A2387', '#E94057', '#F27121'], // Instagram gradient for full body
  ['#4A00E0', '#8E2DE2'], // Purple gradient for back
  ['#1CB5E0', '#000046'], // Midnight City for legs
];

export default function ScanScreen() {
  const navigation = useNavigation();
  const route = useRoute<ScanScreenRouteProp>();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Body scan');
  const [activePage, setActivePage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [scannedParts, setScannedParts] = useState<{ [key: string]: boolean }>({
    fullbody: false,
    back: false,
    legs: false,
  });
  const [scannedPhotos, setScannedPhotos] = useState<{ [key: string]: string }>({
    fullbody: '',
    back: '',
    legs: '',
  });
  const params = useLocalSearchParams();
  const [fileExists, setFileExists] = useState<{ [key: string]: boolean }>({
    fullbody: false,
    back: false,
    legs: false,
  });
  const [pic10Image, setPic10Image] = useState<string | null>(null);
  const { user } = useAuth();
  const [uploadingImages, setUploadingImages] = useState<{ [key: string]: boolean }>({
    fullbody: false,
    back: false,
    legs: false,
  });
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [currentScanType, setCurrentScanType] = useState<string>('');
  const [currentDayData, setCurrentDayData] = useState<DayData | null>(null);
  const [analyzingImages, setAnalyzingImages] = useState<{ [key: string]: boolean }>({
    fullbody: false,
    back: false,
    legs: false,
  });
  const { uploadScanImage, loading, error, fetchOrCreateDayData, updateDayProgress } = useDaysStore();
  const [scanData, setScanData] = useState<ScanData>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  console.log('ScanScreen rendered', { photoUri, scannedPhotos, params });

  const analyzeImage = async (imageUrl: string | null, scanType: string) => {
    if (!imageUrl) {
      console.error('No image URL provided for analysis');
      Alert.alert('Error', 'No image available for analysis');
      return;
    }

    setAnalyzingImages(prev => ({ ...prev, [scanType]: true }));

    try {
      const formattedDate = getFormattedDate();
      console.log('Analyzing image for date:', formattedDate);

      const currentDayData = await fetchOrCreateDayData(new Date(formattedDate));
      if (!currentDayData) {
        throw new Error('No data found for the current day');
      }

      const picField = `pic_${scanType}` as keyof DayData;
      const storedImageUrl = currentDayData[picField];

      if (typeof storedImageUrl !== 'string') {
        console.error(`Invalid image URL for ${scanType}`);
        throw new Error(`Invalid image URL for ${scanType}`);
      }

      console.log('Sending analysis request for:', scanType);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        `https://open-ai-image-test.vercel.app/api/analyze?image=${encodeURIComponent(storedImageUrl)}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysisData = await response.json();
      console.log('Received analysis data:', analysisData);

      // Transform the analysis data into the expected format
      const transformedData = {
        generalScore: calculateAverageScore(analysisData),
        bodyFatPercentage: analysisData.fatPercentage?.percentage || null,
        explanation: generateSummary(analysisData),
        details: analysisData // Store the full analysis for detailed view
      };

      // Update local state
      setScanData(prevData => ({
        ...prevData,
        [scanType]: transformedData
      }));

      // Prepare the progress update by preserving existing data
      const existingProgressJson = currentDayData.progress_json || {};
      const progressUpdate = {
        ...existingProgressJson,
        [scanType]: transformedData
      };

      console.log('Updating progress with:', progressUpdate);

      // Update the database with the merged data
      await updateDayProgress(progressUpdate);

      // Update the current day data
      setCurrentDayData(prev => prev ? {
        ...prev,
        progress_json: progressUpdate
      } : null);

      Alert.alert('Success', 'Analysis completed successfully');

    } catch (error: unknown) {
      console.error('Error in analyzeImage:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        Alert.alert('Timeout', 'The analysis is taking too long. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to analyze the image: ' + (error as Error).message);
      }
    } finally {
      setAnalyzingImages(prev => ({ ...prev, [scanType]: false }));
    }
  };

  // Helper function to calculate average score from analysis data
  const calculateAverageScore = (analysisData: any): number => {
    const scoreKeys = [
      'abs', 'arms', 'chest', 'genetics', 'muscleDefinition',
      'muscleMass', 'posture', 'potential', 'proportions',
      'symmetry', 'vascularity', 'wellbeing'
    ];

    let totalScore = 0;
    let count = 0;

    scoreKeys.forEach(key => {
      if (analysisData[key]?.score) {
        totalScore += analysisData[key].score;
        count++;
      }
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
  };

  // Helper function to generate a summary from analysis data
  const generateSummary = (analysisData: any): string => {
    const summaryPoints = [];

    // Add body fat percentage if available
    if (analysisData.fatPercentage?.percentage) {
      summaryPoints.push(`Body fat: ${analysisData.fatPercentage.percentage}%`);
    }

    // Add body age if available
    if (analysisData.bodyAge?.age) {
      summaryPoints.push(`Body age: ${analysisData.bodyAge.age} years`);
    }

    // Add top 3 improvement suggestions
    if (analysisData.improvementSuggestions?.length > 0) {
      const suggestions = analysisData.improvementSuggestions
        .slice(0, 3)
        .map((s: any) => s.suggestion)
        .join('. ');
      summaryPoints.push(suggestions);
    }

    return summaryPoints.join('. ');
  };

  useEffect(() => {
    console.log('ScanScreen useEffect - route params changed', route.params);
    const routeParams = route.params as RouteParams;
    
    // Check if we have any valid scan type params
    const validScanTypes = ['fullbody', 'back', 'legs'] as const;
    type ScanType = typeof validScanTypes[number];
    
    const foundScanType = validScanTypes.find(type => routeParams?.[type]);
    
    if (foundScanType && routeParams[foundScanType]) {
      setPhotoUri(routeParams[foundScanType]);
      setCurrentScanType(foundScanType);
      analyzeImage(routeParams[foundScanType], foundScanType);
    }
  }, [route.params]);

  const handleImageCapture = useCallback(async (capturedImage: string, scanType: string) => {
    if (!capturedImage || !user) return;

    try {
      setUploadingImages(prev => ({ ...prev, [scanType]: true }));
      
      // Compress the image
      const manipResult = await ImageManipulator.manipulateAsync(
        capturedImage,
        [],
        { 
          compress: 0.6,
          format: ImageManipulator.SaveFormat.JPEG 
        }
      );

      // Get the formatted date
      const formattedDate = getFormattedDate();

      // Upload the image with the new date format
      const publicUrl = await uploadImage(user.id, manipResult.uri, scanType);
      console.log('uploadImage result:', publicUrl);

      if (typeof publicUrl !== 'string') {
        console.error('Unexpected publicUrl type:', typeof publicUrl, publicUrl);
        throw new Error('Unexpected publicUrl type');
      }

      // Update the day entry with the image URL
      const updatedDayData = await updateDayWithImage(formattedDate, scanType, publicUrl);

      // Clear the old image from cache if it exists
      if (scannedPhotos[scanType] && Image.queryCache) {
        await Image.queryCache([scannedPhotos[scanType]]);
      }

      // Update the local state with the new public URL
      setScannedPhotos(prev => ({
        ...prev,
        [scanType]: publicUrl // Use the public URL instead of the local URI
      }));
      
      setScannedParts(prev => ({
        ...prev,
        [scanType]: true
      }));

      // Update the current day data
      if (updatedDayData && !Array.isArray(updatedDayData)) {
        setCurrentDayData(updatedDayData as DayData);
        // Analyze the image
        await analyzeImage(publicUrl, scanType);
      } else {
        console.error('Failed to update day data');
      }

    } catch (error) {
      console.error('Error in handleImageCapture:', error);
      Alert.alert('Error', 'Failed to process the captured image: ' + (error as Error).message);
    } finally {
      setUploadingImages(prev => ({ ...prev, [scanType]: false }));
    }
  }, [user, analyzeImage, updateDayWithImage, scannedPhotos]);

  const scrollToNextEmptyScan = useCallback(() => {
    const nextEmptyIndex = bodyScanItems.findIndex(item => !scannedPhotos[item.type]);
    if (nextEmptyIndex !== -1 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: nextEmptyIndex, animated: true });
    }
  }, [scannedPhotos]);

  useEffect(() => {
    console.log('ScanScreen useEffect - params changed', params);
    const newScannedPhotos = { ...scannedPhotos };
    let hasChanges = false;

    if (params.fullbody && params.fullbody !== scannedPhotos.fullbody) {
      newScannedPhotos.fullbody = params.fullbody as string;
      hasChanges = true;
    }
    if (params.back && params.back !== scannedPhotos.back) {
      newScannedPhotos.back = params.back as string;
      hasChanges = true;
    }
    if (params.legs && params.legs !== scannedPhotos.legs) {
      newScannedPhotos.legs = params.legs as string;
      hasChanges = true;
    }

    if (hasChanges) {
      setScannedPhotos(newScannedPhotos);
      // Handle the captured image
      Object.entries(newScannedPhotos).forEach(([type, uri]) => {
        if (uri && uri !== scannedPhotos[type]) {
          handleImageCapture(uri, type);
        }
      });
      // Scroll to the next empty scan after updating scannedPhotos
      setTimeout(scrollToNextEmptyScan, 500);
    }
  }, [params, scrollToNextEmptyScan, handleImageCapture, scannedPhotos]);

  useEffect(() => {
    console.log('scannedPhotos updated:', scannedPhotos);
  }, [scannedPhotos]);

  useEffect(() => {
    async function checkFiles() {
      const newFileExists = { ...fileExists };
      for (const [key, uri] of Object.entries(scannedPhotos)) {
        if (uri) {
          try {
            // For URLs, consider them as existing
            if (uri.startsWith('http')) {
              newFileExists[key] = true;
            } else {
              const fileInfo = await FileSystem.getInfoAsync(uri);
              newFileExists[key] = fileInfo.exists;
            }
            console.log(`File exists for ${key}:`, newFileExists[key]);
          } catch (error) {
            console.error(`Error checking file for ${key}:`, error);
            newFileExists[key] = false;
          }
        } else {
          newFileExists[key] = false;
        }
      }
      setFileExists(newFileExists);
    }
    checkFiles();
  }, [scannedPhotos]);

  // Add this useEffect to fetch the pic_10 data
  useEffect(() => {
    const fetchPic10Data = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase
            .from('days')
            .select('pic_10')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error) throw error;
          
          console.log('Raw pic_10 data:', data?.pic_10);

          if (data && data.pic_10) {
            // Assuming pic_10 is now a string (URL or text)
            setPic10Image(data.pic_10);
          } else {
            console.log('No pic_10 data found');
          }
        }
      } catch (error) {
        console.error('Error fetching pic_10 data:', error);
      }
    };

    fetchPic10Data();
  }, []);

  useEffect(() => {
    console.log('pic10Image updated:', pic10Image);
  }, [pic10Image]);

  // Update the useEffect for fetching current day data
  useEffect(() => {
    const fetchCurrentDay = async () => {
      const today = new Date().toISOString().split('T')[0];
      const dayData = await fetchOrCreateDayData(new Date(today));
      if (dayData) {
        setCurrentDayData(dayData);
        
        // If we have day data, update the scanned photos
        const newScannedPhotos = { ...scannedPhotos };
        let hasChanges = false;

        // Check each scan type
        (['fullbody', 'back', 'legs'] as const).forEach(type => {
          if (dayData[type] && dayData[type] !== scannedPhotos[type]) {
            newScannedPhotos[type] = dayData[type] || '';
            hasChanges = true;
          }
        });

        if (hasChanges) {
          setScannedPhotos(newScannedPhotos);
          // Update file exists state for new photos
          const newFileExists = { ...fileExists };
          for (const [key, uri] of Object.entries(newScannedPhotos)) {
            if (uri) {
              try {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                newFileExists[key] = fileInfo.exists;
              } catch (error) {
                console.error(`Error checking file existence for ${key}:`, error);
                newFileExists[key] = false;
              }
            } else {
              newFileExists[key] = false;
            }
          }
          setFileExists(newFileExists);
        }
      }
    };

    fetchCurrentDay();
  }, []);

  // Add this useEffect to fetch existing scan images when the component mounts
  useEffect(() => {
    const fetchExistingScans = async () => {
      if (user) {
        const formattedDate = getFormattedDate();
        const dayData = await fetchOrCreateDayData(new Date(formattedDate));
        if (dayData) {
          const newScannedPhotos = { ...scannedPhotos };
          let hasChanges = false;

          ['fullbody', 'back', 'legs'].forEach(scanType => {
            const picField = `pic_${scanType}` as keyof typeof dayData;
            if (dayData[picField]) {
              newScannedPhotos[scanType] = dayData[picField] as string;
              hasChanges = true;
            }
          });

          if (hasChanges) {
            setScannedPhotos(newScannedPhotos);
            // Update file exists state for new photos
            const newFileExists = { ...fileExists };
            for (const [key, uri] of Object.entries(newScannedPhotos)) {
              newFileExists[key] = !!uri;
            }
            setFileExists(newFileExists);
          }
        }
      }
    };

    fetchExistingScans();
  }, [user]);

  const bodyScanItems = [
    { 
      id: 1, 
      colors: ['#8A2387', '#E94057', '#F27121'], // Instagram gradient
      title: 'Full Body Scan', 
      type: 'fullbody' 
    },
    { 
      id: 2, 
      colors: ['#4A00E0', '#8E2DE2'], // Purple gradient
      title: 'Back Scan', 
      type: 'back' 
    },
    { 
      id: 3, 
      colors: ['#1CB5E0', '#000046'], // Midnight City
      title: 'Legs Scan', 
      type: 'legs' 
    },
  ];

  const youAs10Items = [
    { id: 1, title: 'Future Image 1' },
    { id: 2, title: 'Future Image 2' },
    { id: 3, title: 'Future Image 3' },
    { id: 4, title: 'Future Image 4' },
    { id: 5, title: 'scan' },
    { id: 6, title: 'daily' },
    { id: 7, title: 'coach' },
    { id: 8, title: '!' },
  ];

  const deleteScanPhoto = async (type: string) => {
    Alert.alert(
      "Delete Scan",
      "Are you sure you want to delete this scan?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "OK", 
          onPress: async () => {
            try {
              const formattedDate = getFormattedDate();
              const dayData = await fetchOrCreateDayData(new Date(formattedDate));
              if (dayData) {
                // Update the day data to remove the image
                const updatedProgressJson = { ...dayData.progress_json };
                if (updatedProgressJson[type]) {
                  delete updatedProgressJson[type];
                }
                
                // Update the database
                await updateDayProgress(updatedProgressJson);
                
                // Clear local state
                setScannedPhotos(prev => ({ ...prev, [type]: '' }));
                setScannedParts(prev => ({ ...prev, [type]: false }));
                setFileExists(prev => ({ ...prev, [type]: false }));
                
                // Clear the image from the DayData
                const updatedDayData = { ...dayData };
                const picField = `pic_${type}` as keyof DayData;
                if (updatedDayData[picField]) {
                  delete updatedDayData[picField];
                }
                
                // Refresh current day data
                setCurrentDayData(updatedDayData);
                
                // Attempt to delete the image from storage
                if (dayData[`pic_${type}` as keyof DayData]) {
                  const imagePath = dayData[`pic_${type}` as keyof DayData] as string;
                  await supabase.storage.from('images').remove([imagePath]);
                }

                // Clear image cache
                if (Image.queryCache && photoUri) {  // Add null check for photoUri
                  await Image.queryCache([photoUri]);
                }

                // Clear the local file if it exists
                const localUri = scannedPhotos[type];
                if (localUri) {
                  await FileSystem.deleteAsync(localUri, { idempotent: true });
                }

                // Force re-render
                setActivePage(activePage);
              }
            } catch (error) {
              console.error('Error deleting scan:', error);
              Alert.alert('Error', 'Failed to delete scan');
            }
          }
        }
      ]
    );
  };

  const openMediaPicker = (scanType: string) => {
    setCurrentScanType(scanType);
    setShowMediaPicker(true);
  };

  const handleCameraSelect = async () => {
    setShowMediaPicker(false);
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        if (photo.uri) {
          handleImageCapture(photo.uri, currentScanType);
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture: ' + (error as Error).message);
    }
  };

  const handleGallerySelect = async () => {
    setShowMediaPicker(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        if (photo.uri) {
          handleImageCapture(photo.uri, currentScanType);
        }
      }
    } catch (error) {
      console.error('Error selecting picture:', error);
      Alert.alert('Error', 'Failed to select picture: ' + (error as Error).message);
    }
  };

  const renderBodyScanItem = ({ item }: { item: { id: number; colors: string[]; title: string; type: string } }) => {
    const photoUri = scannedPhotos[item.type as keyof typeof scannedPhotos];
    const exists = fileExists[item.type as keyof typeof fileExists];
    const isUploading = uploadingImages[item.type as keyof typeof uploadingImages];
    const isAnalyzing = analyzingImages[item.type as keyof typeof analyzingImages];

    const scanTypeData = scanData[item.type];
    const hasValidAnalysis = scanTypeData && Object.keys(scanTypeData).length > 0;

    const calculateAverageScore = (data: typeof scanTypeData) => {
      if (!data) return 0;
      const scores = Object.values(data).map(part => part.generalScore);
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    };

    const calculateAverageBodyFat = (data: typeof scanTypeData) => {
      if (!data) return 0;
      const fats = Object.values(data).map(part => part.bodyFatPercentage);
      return fats.reduce((a, b) => a + b, 0) / fats.length;
    };

    // Add this check for progress_json
    const hasProgressData = currentDayData?.progress_json?.[item.type];

    console.log(`Rendering ${item.type} scan, photoUri:`, photoUri, 'exists:', exists, 'isUploading:', isUploading);

    const getIcon = (type: string) => {
      switch (type) {
        case 'fullbody':
          return require('../../assets/body_icons/fullbody.png');
        case 'back':
          return require('../../assets/body_icons/back.png');
        case 'legs':
          return require('../../assets/body_icons/legs.png');
        default:
          return require('../../assets/body_icons/fullbody.png');
      }
    };

    return (
      <View style={styles.bodyScanItem}>
        <LinearGradient
          colors={item.colors} // Use the specific colors for each item
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.scanItemTitle}>{item.title}</Text>
              {!photoUri && !isUploading && (
                <Text style={styles.scanItemSubtitle}>Get your ratings and recommendations</Text>
              )}
            </View>
            {isUploading ? (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={styles.loaderText}>Uploading...</Text>
              </View>
            ) : photoUri && exists ? (
              <>
                <View style={styles.photoWrapper}>
                  <View style={styles.photoContainer}>
                    <Image 
                      source={{ 
                        uri: refreshImage(photoUri),
                        cache: 'reload'
                      }} 
                      style={styles.photo} 
                      resizeMode="cover"
                      onLoadStart={() => {
                        if (Image.queryCache) {
                          Image.queryCache([photoUri]).then(() => {
                            console.log('Cleared cache for:', photoUri);
                          });
                        }
                      }}
                      onLoad={() => console.log(`Image loaded for ${item.type}`)}
                      onError={(error) => {
                        console.error(`Error loading image for ${item.type}:`, error);
                        Alert.alert('Image Load Error', `Failed to load image for ${item.type}. URI: ${photoUri}`);
                      }}
                    />
                    {!hasProgressData && (
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteScanPhoto(item.type)}
                      >
                        <Ionicons name="trash-outline" size={18} color="white" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                {hasProgressData ? (
                  <View style={styles.analysisResultContainer}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultValue}>
                        {currentDayData?.progress_json?.[item.type]?.generalScore?.toFixed(1) || '0.0'}
                      </Text>
                      <Text style={styles.resultLabel}>General</Text>
                    </View>
                    <View style={styles.resultDivider} />
                    <View style={styles.resultItem}>
                      <Text style={styles.resultValue}>
                        {currentDayData?.progress_json?.[item.type]?.bodyFatPercentage?.toFixed(1) || '0.0'}%
                      </Text>
                      <Text style={styles.resultLabel}>Body Fat</Text>
                    </View>
                  </View>
                ) : !hasValidAnalysis ? (
                  <TouchableOpacity 
                    style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
                    onPress={() => analyzeImage(photoUri, item.type)}
                    disabled={isAnalyzing}
                  >
                    <View style={styles.analyzeButtonContent}>
                      {isAnalyzing && <ActivityIndicator size="small" color="#fff" style={styles.analyzeLoader} />}
                      <Ionicons name="sparkles" size={18} color="#fff" style={styles.analyzeIcon} />
                      <Text style={styles.analyzeButtonText}>Analyze</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.analysisResultContainer}>
                    <View style={styles.resultItem}>
                      <Text style={styles.resultValue}>
                        {calculateAverageScore(scanTypeData).toFixed(1)}
                      </Text>
                      <Text style={styles.resultLabel}>General</Text>
                    </View>
                    <View style={styles.resultDivider} />
                    <View style={styles.resultItem}>
                      <Text style={styles.resultValue}>
                        {calculateAverageBodyFat(scanTypeData).toFixed(1)}%
                      </Text>
                      <Text style={styles.resultLabel}>Body Fat</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                <View style={styles.iconContainer}>
                  <Image source={getIcon(item.type)} style={styles.bodyIcon} resizeMode="contain" />
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={() => openMediaPicker(item.type)}
                >
                  <Text style={styles.buttonText}>Begin scan</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </LinearGradient> 
      </View>
    );
  };

  const handleManualScroll = useCallback((event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / screenWidth);
    setActivePage(index);
  }, []);

  const renderCarousel = useCallback((data: any[], renderItem: any) => (
    <View style={styles.carouselWrapper}>
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={screenWidth}
          decelerationRate="fast"
          onScroll={handleManualScroll}
          scrollEventThrottle={16}
          contentContainerStyle={styles.carousel}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
        />
      </View>
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === activePage && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  ), [activePage, handleManualScroll]);

  const renderYouAs10Item = useCallback(({ item }: { item: { id: number; title: string } }) => {
    console.log('Rendering item:', item);
    if (item.title.startsWith('Future Image')) {
      const imageIndex = parseInt(item.title.split(' ')[2]) - 1;
      const imageUrl = pic10Image; // Changed from pic10Images[imageIndex]
      console.log('Image URL for', item.title, ':', imageUrl);

      if (imageUrl) {
        return (
          <View style={styles.youAs10Item}>
            <View style={styles.youAs10Content}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.youAs10Image} 
                resizeMode="cover"
                onLoad={() => console.log(`Image loaded for ${item.title}`)}
                onError={(error) => console.error(`Error loading image for ${item.title}:`, error)}
              />
              <Text style={styles.youAs10Text}>{item.title}</Text>
            </View>
          </View>
        );
      }
    }

    return (
      <View style={styles.youAs10Item}>
        <View style={styles.youAs10Content}>
          <Ionicons name={item.title === 'scan' ? 'scan-outline' : item.title === 'daily' ? 'calendar-outline' : item.title === 'coach' ? 'person-outline' : 'alert-circle-outline'} size={72} color="#666" />
          <Text style={styles.youAs10Text}>{item.title}</Text>
        </View>
      </View>
    );
  }, [pic10Image]); // Changed from pic10Images

  const renderYouAs10Content = useCallback(() => {
    console.log('Rendering You as 10 content, pic10Image:', pic10Image);
    if (!pic10Image) {
      return (
        <View style={styles.singleContainer}>
          <View style={styles.youAs10Content}>
            <Link href="/fullscreen/GenerateBestSelfScreen" asChild>
              <TouchableOpacity style={styles.generateButton}>
                <Text style={styles.generateButtonText}>Generate your best self</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.singleContainer}>
        <View style={styles.youAs10Content}>
          <Image 
            source={{ uri: pic10Image }} 
            style={styles.youAs10Image}
            resizeMode="cover"
            onLoad={() => console.log('Image loaded successfully')}
            onError={(error) => console.error('Error loading image:', error.nativeEvent.error)}
          />
        </View>
      </View>
    );
  }, [pic10Image]);

  const handleTakePhoto = async (type: 'fullbody' | 'face') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        if (photo.uri) {
          await uploadScanImage(photo.uri, type);
          // Handle successful upload (e.g., show success message, navigate to results)
        }
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture: ' + (error as Error).message);
    }
  };

  // Add a settings button to the header
  const Header = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Scan</Text>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setIsSettingsOpen(true)}
      >
        <Ionicons name="settings-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.container}>
          <Header />
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Body scan' && styles.activeTab]}
              onPress={() => setActiveTab('Body scan')}
            >
              <Text style={[styles.tabText, activeTab === 'Body scan' && styles.activeTabText]}>Body scan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'You as a 10' && styles.activeTab]}
              onPress={() => setActiveTab('You as a 10')}
            >
              <Text style={[styles.tabText, activeTab === 'You as a 10' && styles.activeTabText]}>You as a 10</Text>
            </TouchableOpacity>
          </View>
          
          {activeTab === 'Body scan'
            ? renderCarousel(bodyScanItems, renderBodyScanItem)
            : renderYouAs10Content()
          }
          
          <MediaPickerBottomSheet
            isVisible={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onCameraSelect={handleCameraSelect}
            onGallerySelect={handleGallerySelect}
          />

          <SettingsBottomSheet 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
          />
        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
    marginTop: 80,
  },
  tab: {
    marginHorizontal: 10,
    paddingBottom: 5,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
  },
  tabText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  carouselWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  carouselContainer: {
    // This container now only wraps the FlatList
  },
  carousel: {
    // If there's any padding here, you can remove it
  },
  bodyScanItem: {
    width: itemWidth,
    height: itemWidth * 1.5,
    marginHorizontal: sideMargin,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 30,
    paddingBottom: 20,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scanItemTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5, // Reduced margin between title and subtitle
  },
  scanItemSubtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20, // Add some space above the button
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  youAs10Item: {
    width: itemWidth,
    height: itemWidth * 1.5, // Same height as bodyScanItem
    marginHorizontal: sideMargin,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#222',
  },
  youAs10Content: {
    width: '100%',
    aspectRatio: 3/4, // Adjust this ratio as needed
    borderRadius: 20,
    overflow: 'hidden',
  },
  youAs10Text: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15, // Adjust this value to position the dots 10-20px below the carousel
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  embeddedPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3, // Adjust this value to change the photo's transparency
  },
  completedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  nextScanButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8A2BE2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  nextScanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoWrapper: {
    flex: 1,
    justifyContent: 'flex-end', // This pushes the content to the bottom
    alignItems: 'center',
    width: '100%',
    paddingBottom: 10, // Reduced padding at the bottom to move image lower
  },
  photoContainer: {
    width: '80%',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  photoUriText: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 5,
    fontSize: 10,
  },
  youAs10Image: {
    width: '100%',
    height: '100%',
  },
  generateButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  singleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: sideMargin,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  analyzeButton: {
    backgroundColor: '#8A2BE2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    marginTop: 20,
  },
  analyzeButtonDisabled: {
    opacity: 0.5,
  },
  analyzeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeLoader: {
    marginRight: 8,
  },
  analyzeIcon: {
    marginRight: 8,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyIcon: {
    width: 80,
    height: 80,
    tintColor: '#fff', // This will make the icon white. Remove if you want to keep original colors.
  },
  analysisResultContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  resultLabel: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
  },
  resultDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 10,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 15,
    backgroundColor: '#000',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 8,  // Increased padding for better touch target
  },
});
