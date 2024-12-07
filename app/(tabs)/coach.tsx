import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const coachItems = [
  { icon: '💬', title: 'Ask me anything', color: '#8A2BE2' },
  { icon: '🔥', title: 'Improve your overall', color: '#FF4500' },
  { icon: '💪', title: 'Gain more muscle', color: '#20B2AA' },
  { icon: '🧍', title: 'Lose body fat', color: '#FF69B4' },
  { icon: '🧴', title: 'Get clear skin', color: '#32CD32' },
  { icon: '🗿', title: 'Sharpen your jawline', color: '#4169E1' },
];

export default function CoachScreen() {
  const router = useRouter();

  const handleTopicPress = (topic: string) => {
    const initialMessage = `~~${topic}~~`;
    router.push({
      pathname: '/chat',
      params: { initialMessage: encodeURIComponent(initialMessage) },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your coach</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.askAnythingItem}
          onPress={() => handleTopicPress(coachItems[0].title)}
        >
          <View style={[styles.iconContainer, { backgroundColor: coachItems[0].color }]}>
            <Text style={styles.icon}>{coachItems[0].icon}</Text>
          </View>
          <Text style={styles.itemText}>{coachItems[0].title}</Text>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Learn how to...</Text>

        {coachItems.slice(1).map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.coachItem}
            onPress={() => handleTopicPress(item.title)}
          >
            <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <Text style={styles.itemText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
 // Added top margin
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  settingsButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    marginTop: 80,
  },
  askAnythingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  coachItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  icon: {
    fontSize: 24,
    color: 'white',
  },
  itemText: {
    fontSize: 18,
    color: 'white',
    marginLeft: 15,
  },
});
