import { DayData } from './useDaysStore';

// Helper function to identify score-based metrics
export const isScoreMetric = (key: string): boolean => {
  const scoreMetrics = [
    'abs', 'arms', 'chest', 'genetics', 'muscleDefinition',
    'muscleMass', 'posture', 'potential', 'proportions',
    'symmetry', 'vascularity', 'wellbeing'
  ];
  return scoreMetrics.includes(key);
};

// Calculate total score
export const calculateTotalScore = (progressJson: DayData['progress_json'] | null): number => {
  if (!progressJson?.fullbody?.details) return 0;
  
  const details = progressJson.fullbody.details;
  let total = 0;
  let count = 0;

  Object.entries(details).forEach(([key, data]) => {
    if (
      isScoreMetric(key) &&
      typeof data === 'object' &&
      data !== null &&
      'score' in data &&
      typeof data.score === 'number' &&
      data.score !== null
    ) {
      total += data.score;
      count++;
    }
  });

  return count > 0 ? Math.round(total / count) : 0;
};

// Calculate average body fat
export const calculateAverageBodyFat = (progressJson: DayData['progress_json'] | null): string => {
  if (!progressJson?.fullbody?.details?.fatPercentage?.percentage) return '-';
  return `${progressJson.fullbody.details.fatPercentage.percentage}%`;
};
