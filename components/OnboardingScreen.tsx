import { NavigationProp } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type OnboardingScreenProps = {
  navigation: NavigationProp<any>;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose gender</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Daily')}>
        <Text style={styles.buttonText}>Male</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Daily')}>
        <Text style={styles.buttonText}>Female</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Daily')}>
        <Text style={styles.skipButtonText}>skip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: 20,
  },
  skipButtonText: {
    color: '#999',
    fontSize: 16,
  },
});

export default OnboardingScreen;