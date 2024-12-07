import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [isMetric, setIsMetric] = useState(true);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [notifications, setNotifications] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const router = useRouter();

  const toggleUnits = () => {
    setIsMetric(!isMetric);
    if (isMetric) {
      setHeight(Math.round(height / 2.54));
      setWeight(Math.round(weight * 2.20462));
    } else {
      setHeight(Math.round(height * 2.54));
      setWeight(Math.round(weight / 2.20462));
    }
  };

  const handleNotificationToggle = async () => {
    if (!notifications) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        setNotifications(true);
      }
    } else {
      setNotifications(false);
    }
  };

  const handleFinish = () => {
    try {
      router.push('/(tabs)');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', 'Unable to navigate to the main screen. Please try again.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Let's Get Started</Text>
              <Text style={styles.subtitle}>Enter your measurements to personalize your experience</Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.genderContainer}>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'male' && styles.selectedGender]}
                  onPress={() => setGender('male')}
                >
                  <Ionicons name="male" size={24} color={gender === 'male' ? '#FFFFFF' : '#8A2BE2'} />
                  <Text style={[styles.genderText, gender === 'male' && styles.selectedGenderText]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, gender === 'female' && styles.selectedGender]}
                  onPress={() => setGender('female')}
                >
                  <Ionicons name="female" size={24} color={gender === 'female' ? '#FFFFFF' : '#8A2BE2'} />
                  <Text style={[styles.genderText, gender === 'female' && styles.selectedGenderText]}>Female</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.unitToggle} onPress={toggleUnits}>
                <Ionicons name={isMetric ? 'resize' : 'scale'} size={24} color="#8A2BE2" />
              </TouchableOpacity>
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    Height: {isMetric ? `${height} cm` : `${Math.floor(height / 30.48)}' ${Math.round((height / 2.54) % 12)}"`}
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={isMetric ? 100 : 39}
                    maximumValue={isMetric ? 250 : 98}
                    value={height}
                    onValueChange={(value) => setHeight(Math.round(value))}
                    minimumTrackTintColor="#8A2BE2"
                    maximumTrackTintColor="#FFFFFF"
                    thumbTintColor="#8A2BE2"
                  />
                </View>
              </View>
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderLabel}>
                    Weight: {isMetric ? `${weight} kg` : `${Math.round(weight)} lbs`}
                  </Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={isMetric ? 30 : 66}
                    maximumValue={isMetric ? 200 : 440}
                    value={weight}
                    onValueChange={(value) => setWeight(Math.round(value))}
                    minimumTrackTintColor="#8A2BE2"
                    maximumTrackTintColor="#FFFFFF"
                    thumbTintColor="#8A2BE2"
                  />
                </View>
              </View>
            </View>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>Set Your Goals</Text>
            <Text style={styles.subtitle}>Choose up to 2 body goals to focus on</Text>
            <View style={styles.goalsContainer}>
              {['Lose Fat', 'Gain Muscle', 'Improve Flexibility', 'Increase Strength'].map((goal) => {
                const isSelected = goals.includes(goal);
                const isDisabled = goals.length === 2 && !isSelected;
                return (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      styles.goalButton,
                      isSelected && styles.selectedGoal,
                      isDisabled && styles.disabledGoal
                    ]}
                    onPress={() => {
                      if (isSelected) {
                        setGoals(goals.filter(g => g !== goal));
                      } else if (goals.length < 2) {
                        setGoals([...goals, goal]);
                      }
                    }}
                    disabled={isDisabled}
                  >
                    <Text style={[
                      styles.goalText,
                      isSelected && styles.selectedGoalText,
                      isDisabled && styles.disabledGoalText
                    ]}>
                      {goal}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>Stay Updated</Text>
            <Text style={styles.subtitle}>Enable notifications to get timely updates and reminders</Text>
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationEmoji}>🔔</Text>
              <View style={styles.notificationTextContainer}>
                <Text style={styles.notificationText}>Allow Notifications</Text>
                <Switch
                  trackColor={{ false: "#767577", true: "#8A2BE2" }}
                  thumbColor={notifications ? "#f4f3f4" : "#f4f3f4"}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={handleNotificationToggle}
                  value={notifications}
                />
              </View>
            </View>
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>Join Our Community</Text>
            <Text style={styles.subtitle}>Enter a referral code if you have one</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., #WRKZT"
              value={referralCode}
              onChangeText={setReferralCode}
              placeholderTextColor="#999999"
            />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.title}>Almost There!</Text>
            <Text style={styles.subtitle}>Login with Google or continue as a guest</Text>
            <TouchableOpacity style={styles.googleButton}>
              <Text style={styles.googleButtonText}>Login with Google</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {renderStep()}
      </View>
      <View style={styles.buttonContainer}>
        {step < 5 ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button}
            onPress={handleFinish}
          >
            <Text style={styles.buttonText}>Finish</Text>
          </TouchableOpacity>
        )}
        {step > 1 && (
          <TouchableOpacity style={styles.link} onPress={() => setStep(step - 1)}>
            <Text style={styles.linkText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  linkText: {
    color: '#8A2BE2',
    fontSize: 16,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    width: '100%',
    color: '#FFFFFF',
    fontSize: 16,
  },
  goalsContainer: {
    width: '100%',
  },
  goalButton: {
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#444444',
  },
  selectedGoal: {
    backgroundColor: '#8A2BE2',
    borderColor: '#8A2BE2',
  },
  disabledGoal: {
    opacity: 0.5,
  },
  goalText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  selectedGoalText: {
    fontWeight: 'bold',
  },
  disabledGoalText: {
    color: '#999999',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sliderWrapper: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444444',
  },
  sliderContainer: {
    width: '100%',
  },
  sliderLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  unitToggle: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: '#333333',
    padding: 10,
    borderRadius: 20,
  },
  unitToggleText: {
    color: '#8A2BE2',
    fontSize: 16,
    marginLeft: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    padding: 15,
    borderRadius: 25,
    width: '45%',
    justifyContent: 'center',
  },
  selectedGender: {
    backgroundColor: '#8A2BE2',
  },
  genderText: {
    color: '#8A2BE2',
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectedGenderText: {
    color: '#FFFFFF',
  },
  sliderThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#8A2BE2',
  },
  notificationContainer: {
    backgroundColor: '#333333',
    borderRadius: 10,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  notificationEmoji: {
    fontSize: 40,
    marginRight: 20,
  },
  notificationTextContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
