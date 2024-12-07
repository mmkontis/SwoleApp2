import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

type Metric = {
  key: string;
  value: {
    score: number | null;
    explanation: string;
  };
};

type MetricDetailBottomSheetProps = {
  selectedMetric: Metric;
  mockChartData: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  onClose: () => void;
};

const MetricDetailBottomSheet: React.FC<MetricDetailBottomSheetProps> = ({ selectedMetric, mockChartData, onClose }) => {
  return (
    <View style={styles.bottomSheetContent}>
      <View style={styles.bottomSheetHeader}>
        <Text style={styles.metricDetailTitle}>{selectedMetric.key}</Text>
        <Text style={styles.metricDetailExplanation}>{selectedMetric.value.explanation}</Text>
        <View style={styles.divider} />
        <View style={styles.scoreContainer}>
          <Text style={styles.metricDetailScore}>
            {selectedMetric.value.score !== null ? selectedMetric.value.score : 'N/A'}
          </Text>
          <View style={styles.progressBarWrapper}>
            <View style={styles.progressBarContainerLarge}>
              <LinearGradient
                colors={['#8A2BE2', '#9400D3']}
                style={[
                  styles.progressBarLarge,
                  { width: selectedMetric.value.score !== null ? `${selectedMetric.value.score}%` : '0%' }
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>0</Text>
              <Text style={styles.progressLabel}>100</Text>
            </View>
          </View>
        </View>
        <View style={styles.divider} />
      </View>
      <ScrollView style={styles.bottomSheetScrollContent}>
        <Text style={styles.chartTitle}>Progress Over Time</Text>
        <LineChart
          data={mockChartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: '#1A1A1A',
            backgroundGradientFrom: '#1A1A1A',
            backgroundGradientTo: '#1A1A1A',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#9400D3',
            },
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16,
          }}
        />
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips</Text>
          <TouchableOpacity style={styles.tipsCard}>
            <Text style={styles.tipsText}>
              Tap to get personalized tips for improvement
            </Text>
            <TouchableOpacity style={styles.tipsButton}>
              <Text style={styles.tipsButtonText}>View Tips</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <View style={styles.bottomSheetFooter}>
        <TouchableOpacity style={styles.improveButton} onPress={onClose}>
          <Text style={styles.improveButtonText}>How to Improve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
  metricDetailTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  metricDetailExplanation: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 10,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 10,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  metricDetailScore: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 20,
    width: 60,
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
  bottomSheetScrollContent: {
    flex: 1,
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
  bottomSheetFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
});

export default MetricDetailBottomSheet;
