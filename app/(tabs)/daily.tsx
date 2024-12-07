import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import { Alert, Animated, Button, Dimensions, Easing, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';
import {
  formatDate
} from '../../lib/supabase-functions';
import { DayData, useDaysStore } from '../../lib/useDaysStore';
import { calculateAverageBodyFat, calculateTotalScore } from '../../lib/utils';
import MetricDetailBottomSheet from '../components/MetricDetailBottomSheet';
import metricsData from '../data/metrics.json';

// Add type definition for the metrics data
type MetricItem = {
  score?: number;
  explanation: string;
  tips?: string[];
  percentage?: number;
  monthsNumber?: number;
  age?: number;
};

type MetricsData = {
  [key: string]: MetricItem;
} & {
  improvementSuggestions: Array<{
    suggestion: string;
    explanation: string;
  }>;
};

// Cast the imported JSON to our type
const goalData = metricsData as unknown as MetricsData;

const windowWidth = Dimensions.get('window').width;
const boxWidth = (windowWidth - 60) / 2; // 60 is the total horizontal padding

// Define the type for the metric
type Metric = {
  key: string;
  value: {
    score: number | null;
    explanation: string;
    tips?: string[];
    percentage?: number;
    monthsNumber?: number;
    age?: number;
  };
};

// Define the RootStackParamList type
type RootStackParamList = {
  Onboarding: undefined;
  // Add other screen names and their params here
};

// Update the type of navigation
type NavigationProp = StackNavigationProp<RootStackParamList>;

type SortOption = 'alphabetical' | 'score';

// Mock data for the chart
const mockChartData = {
  labels: ['1 Jun', '8 Jun', '15 Jun', '22 Jun', '29 Jun', '6 Jul'],
  datasets: [
    {
      data: [65, 70, 75, 72, 80, 85],
    },
  ],
};

// Update the type definitions at the top of the file
type MetricValue = {
  score?: number | null;
  explanation?: string;
  tips?: string[];
  percentage?: number | null;
  monthsNumber?: number | null;
  age?: number | null;
  generalScore?: number | null;
  bodyFatPercentage?: number | null;
  // Add any other metric properties that might be in your progress_json
};

// Update the FullBodyMetrics type to properly handle the index signature and improvementSuggestions
type FullBodyMetrics = {
  [key: string]: MetricValue;
} & {
  improvementSuggestions?: Array<{ suggestion: string; explanation: string; }>;
};

type ProgressJson = {
  fullbody: FullBodyMetrics;
};

// Update or add these type definitions
type BodyPart = {
  generalScore: number;
  bodyFatPercentage: number;
  explanation: string;
};

type ScanData = {
  [key: string]: {
    [bodyPart: string]: BodyPart;
  };
};

// Update the type definitions
type BodyPartData = {
  generalScore: number;
  bodyFatPercentage: number;
  explanation: string;
};

type ScanType = {
  [key: string]: BodyPartData;
};

// Helper function to identify score-based metrics
const isScoreMetric = (key: string): boolean => {
  const scoreMetrics = [
    'abs', 'arms', 'chest', 'genetics', 'muscleDefinition',
    'muscleMass', 'posture', 'potential', 'proportions',
    'symmetry', 'vascularity', 'wellbeing'
  ];
  return scoreMetrics.includes(key);
};

// Add this helper function at the top level
const getLatestFullBodyImage = (progressJson: DayData['progress_json'] | null): string | null => {
  if (!progressJson?.fullbody) return null;
  return (progressJson.fullbody as AnalysisResult).imagePath || null;
};

// Add this helper function to get routine tips
const getRoutineTips = (progressJson: DayData['progress_json'] | null): JSX.Element => {
  if (!progressJson?.fullbody?.details) {
    return (
      <Text style={styles.routineText}>
        Scan to get your daily glow up routine
      </Text>
    );
  }

  const details = progressJson.fullbody.details;
  const suggestions = (details.improvementSuggestions || []) as ImprovementSuggestion[];
  const topTips = suggestions.slice(0, 3);

  return (
    <View style={styles.routineTipsContainer}>
      <Text style={styles.routineHeader}>Today's Focus:</Text>
      {topTips.map((tip: ImprovementSuggestion, index: number) => (
        <View key={index} style={styles.tipItem}>
          <View style={styles.tipBullet}>
            <Text style={styles.tipNumber}>{index + 1}</Text>
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>{tip.suggestion}</Text>
            <Text style={styles.tipExplanation}>{tip.explanation}</Text>
          </View>
        </View>
      ))}
      {topTips.length === 0 && (
        <Text style={styles.routineText}>
          Scan to get your daily glow up routine
        </Text>
      )}
    </View>
  );
};

// Add this helper function to refresh image URLs
const refreshImage = (uri: string) => {
  if (!uri) return '';
  return `${uri}?timestamp=${Date.now()}&random=${Math.random()}`;
};

// Add these type definitions at the top of the file
interface AnalysisResult {
  generalScore?: number | null;
  bodyFatPercentage?: number | null;
  monthsNumber?: number | null;
  age?: number | null;
  explanation?: string;
  details?: {
    improvementSuggestions?: ImprovementSuggestion[];
    [key: string]: any;
  };
  imagePath?: string;
}

interface AnalysisData {
  [key: string]: AnalysisResult;
}

// Add this interface near the other type definitions at the top
interface MetricDataType {
  score?: number;
  percentage?: number;
  age?: number;
  monthsNumber?: number;
  explanation?: string;
  [key: string]: any;
}

// Add this interface with the other type definitions at the top of the file
interface ImprovementSuggestion {
  suggestion: string;
  explanation: string;
}

export default function DailyScreen() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();

  React.useEffect(() => {
    if (navigation.getState().routes.length === 1) {
      router.replace('/(tabs)/daily');
    }
  }, []);

  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('alphabetical');

  const {
    currentDate,
    dayData,
    dayId,
    hasPreviousDay,
    hasNextDay,
    loading,
    error,
    fetchOrCreateDayData,
    handleDateChange,
    createTodayDay,
    refreshCurrentDay,
  } = useDaysStore();

  const goalEntries = Object.entries(goalData);

  const sortedGoalEntries = useMemo(() => {
    return Object.entries(goalData).sort((a, b) => {
      if (a[0] === 'improvementSuggestions' || b[0] === 'improvementSuggestions') {
        return 0; // Don't sort improvementSuggestions
      }
      if (sortOption === 'alphabetical') {
        return a[0].localeCompare(b[0]);
      } else {
        const aScore = 'score' in a[1] ? a[1].score : 0;
        const bScore = 'score' in b[1] ? b[1].score : 0;
        return (bScore || 0) - (aScore || 0);
      }
    });
  }, [goalData, sortOption]);

  const handleOpenBottomSheet = (key: string, value: any) => {
    if (key === 'settings') {
      // Handle settings
      return;
    }
    
    // Transform the data to match the expected Metric type
    const metricData = {
      key: key,
      value: {
        score: value.score || value.percentage || null,
        explanation: value.explanation || '',
        tips: value.tips || []
      }
    };

    setSelectedMetric(metricData);
    setBottomSheetVisible(true);
  };

  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  const toggleSortOption = () => {
    setSortOption(prev => prev === 'alphabetical' ? 'score' : 'alphabetical');
  };

  // Update the renderMetrics function
  const renderMetrics = () => {
    if (!dayData?.progress_json) {
      return <Text style={styles.noDataText}>No metrics data available for this date.</Text>;
    }

    const progressJson = dayData.progress_json;
    
    return Object.entries(progressJson).flatMap(([scanType, scanData]) => {
      if (!scanData?.details || typeof scanData.details !== 'object') return null;

      // Get all metrics from details
      return Object.entries(scanData.details)
        .filter(([key]) => key !== 'improvementSuggestions') // Filter out non-metric data
        .map(([metricName, metricData]) => {
          // Type assertion for metricData
          const typedMetricData = metricData as MetricDataType;
          
          // Handle different types of metrics
          let displayValue: string | number = '-';
          let progressValue: number | null = null;

          if ('score' in typedMetricData && typeof typedMetricData.score === 'number') {
            displayValue = typedMetricData.score;
            progressValue = typedMetricData.score;
          } else if ('percentage' in typedMetricData && typeof typedMetricData.percentage === 'number') {
            displayValue = `${typedMetricData.percentage}%`;
            progressValue = typedMetricData.percentage;
          } else if ('age' in typedMetricData && typeof typedMetricData.age === 'number') {
            displayValue = `${typedMetricData.age} years`;
            progressValue = null;
          } else if ('monthsNumber' in typedMetricData && typeof typedMetricData.monthsNumber === 'number') {
            displayValue = `${typedMetricData.monthsNumber} months`;
            progressValue = null;
          }

          return (
            <TouchableOpacity
              key={`${scanType}-${metricName}`}
              style={styles.metricItem}
              onPress={() => handleOpenBottomSheet(metricName, typedMetricData)}
            >
              <Text style={styles.metricTitle}>
                {metricName.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </Text>
              <Text style={styles.metricScore}>
                {displayValue}
              </Text>
              {progressValue !== null && (
                <View style={styles.progressBarContainer}>
                  <View 
                    style={[
                      styles.progressBar, 
                      { width: `${Math.min(100, progressValue)}%` }
                    ]} 
                  />
                </View>
              )}
              <Text style={styles.metricExplanation}>
                {typedMetricData.explanation || 'No explanation available'}
              </Text>
            </TouchableOpacity>
          );
        });
    }).filter(Boolean);
  };

  // Add animation values
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

  // Update the animation configuration
  const handleImageFlip = () => {
    // Reset animations to initial values
    flipAnimation.setValue(0);
    scaleAnimation.setValue(1);

    Animated.parallel([
      // Flip animation
      Animated.timing(flipAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      // Scale animation sequence
      Animated.sequence([
        // Scale up during first half
        Animated.timing(scaleAnimation, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // Scale down during second half
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  // Create interpolated values for the flip
  const spin = flipAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Daily</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push("/fullscreen/settings")}
        >
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#8A2BE2', '#9400D3']}
          style={styles.progressCard}
        >
          <View style={styles.progressHeaderRow}>
            <Text style={styles.progressTitle}>Your Stats</Text>
            <Link href="/fullscreen/social-share" asChild>
              <TouchableOpacity style={styles.shareButton}>
                <Ionicons name="share-social-outline" size={24} color="white" />
              </TouchableOpacity>
            </Link>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Score</Text>
              <Text style={styles.statValue}>
                {calculateTotalScore(dayData?.progress_json ?? null) || '-'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Body Fat</Text>
              <Text style={styles.statValue}>
                {calculateAverageBodyFat(dayData?.progress_json || null)}
              </Text>
            </View>
          </View>
          {dayData?.pic_fullbody ? (
            <TouchableOpacity 
              activeOpacity={0.9}
              onPress={handleImageFlip}
              style={styles.profileImageContainer}
            >
              <Animated.View style={{
                transform: [
                  { perspective: 1000 }, // Add perspective
                  { rotateY: spin },
                  { scale: scaleAnimation }
                ],
              }}>
                <Image
                  source={{ 
                    uri: dayData.pic_fullbody || '',
                    cache: 'reload'
                  }}
                  style={styles.profileImage}
                  resizeMode="cover"
                  onLoadStart={() => {
                    if (Image.queryCache && dayData.pic_fullbody) {
                      Image.queryCache([dayData.pic_fullbody]).then(() => {
                        console.log('Cleared cache for profile image');
                      });
                    }
                  }}
                  onError={(error) => {
                    console.error('Error loading profile image:', error);
                  }}
                />
              </Animated.View>
            </TouchableOpacity>
          ) : (
            <Image
              source={{ uri: 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
          )}
        </LinearGradient>

        <Text style={styles.routineTitle}>Your routine</Text>
        <View style={styles.routineCard}>
          {getRoutineTips(dayData?.progress_json || null)}
          <TouchableOpacity 
            style={styles.button}
            onPress={async () => {
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
                    router.push({
                      pathname: '/(tabs)/scan',
                      params: { fullbody: photo.uri }
                    });
                  }
                }
              } catch (error) {
                console.error('Error taking picture:', error);
                Alert.alert('Error', 'Failed to take picture: ' + (error as Error).message);
              }
            }}
          >
            <Text style={styles.buttonText}>
              {dayData?.progress_json?.fullbody ? 'Update Scan' : 'Take Photo'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsHeader}>
          <Text style={styles.metricsTitle}>Your Metrics</Text>
          <View style={styles.dateContainer}>
            {hasPreviousDay && (
              <TouchableOpacity onPress={() => handleDateChange('prev')}>
                <Ionicons name="chevron-back" size={20} color="white" />
              </TouchableOpacity>
            )}
            <Text style={styles.dateText}>
              {dayData ? formatDate(dayData.created_at) : 'No data'}
            </Text>
            {hasNextDay && (
              <TouchableOpacity onPress={() => handleDateChange('next')}>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        {!dayData && (
          <Button
            title="Create Today's Entry"
            onPress={createTodayDay}
            color="#8A2BE2"
          />
        )}
        <View style={styles.metricsContainer}>
          {renderMetrics()}
        </View>
      </ScrollView>
      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={handleCloseBottomSheet}
      >
        {selectedMetric && (
          <MetricDetailBottomSheet 
            selectedMetric={selectedMetric} 
            mockChartData={mockChartData}
            onClose={handleCloseBottomSheet}
          />
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
    padding: 20,
    marginTop: 80,
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
  streakContainer: {
    flex: 1,
  },
  streakText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  streakNumber: {
    fontSize: 28,
  },
  fireEmoji: {
    fontSize: 24,
  },
  progressCard: {
    borderRadius: 20,
    padding: 20,
    height: 160,
    marginBottom: 20,
    overflow: 'hidden',
  },
  progressTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  viewButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewButtonText: {
    color: '#8A2BE2',
    fontWeight: 'bold',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    backfaceVisibility: 'visible',
  },
  routineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  routineCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  routineText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  metricsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -7.5, // Increased negative margin
  },
  metricItem: {
    width: (windowWidth - 55) / 2, // 55 = 20 (scrollView padding) + 15 (gap between items)
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15, // Increased bottom margin
    marginHorizontal: 7.5, // Increased horizontal margin
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'capitalize',
    color: 'white',
  },
  metricScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    marginBottom: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8A2BE2',
    borderRadius: 5,
  },
  metricExplanation: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  bottomSheetContent: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  bottomSheetHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  bottomSheetScrollContent: {
    flex: 1,
  },
  bottomSheetFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  metricDetailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricDetailScore: {
    fontSize: 36, // Reduced from 48
    fontWeight: 'bold',
    color: 'white', // Changed from '#8A2BE2' to white
    marginRight: 20,
    width: 60, // Reduced from 80
    textAlign: 'center',
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarContainerLarge: {
    height: 20,
    backgroundColor: '#333',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBarLarge: {
    height: '100%',
    borderRadius: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  progressLabel: {
    color: '#999',
    fontSize: 12,
  },
  metricDetailExplanation: {
    fontSize: 18,
    color: '#CCCCCC',
    marginBottom: 20,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  improveButton: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  improveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  metricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sortButton: {
    padding: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 5,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginHorizontal: 10,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  tipsContainer: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  tipsCard: {
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 15,
  },
  tipsText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  tipsButton: {
    backgroundColor: '#8A2BE2',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  tipsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from space-between
    marginTop: 10,
    marginRight: 100, // Keep space for the profile image
    gap: 40, // Add specific gap between stats
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  statValue: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  routineTipsContainer: {
    marginBottom: 15,
  },
  routineHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  tipNumber: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipExplanation: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  profileImageContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 80,
    height: 80,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  shareButton: {
    padding: 5,
  },
});
