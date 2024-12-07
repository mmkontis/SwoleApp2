import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <Ionicons name="scan-outline" size={150} color="#8a2be2" style={styles.scanIcon} />
        </View>
        <Text style={styles.title}>Welcome to SwoleApp!</Text>
        <Text style={styles.subtitle}>Track your progress with AI-powered body scanning</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Link href="/fullscreen/OnboardingScreen" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/(tabs)/daily" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Skip</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/fullscreen/Google" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Google Sign In</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIcon: {
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#cccccc',
    marginBottom: 40,
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
});

export default WelcomeScreen;
