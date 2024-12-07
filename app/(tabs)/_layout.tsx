import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../../contexts/AuthContext';
import { SettingsBottomSheet } from '../components/SettingsBottomSheet';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

function Header({ onOpenSettings, title }: { onOpenSettings: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={onOpenSettings}
      >
        <Ionicons name="settings-outline" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default function TabLayout() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleOpenSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <SafeAreaProvider style={{ flex: 1, backgroundColor: '#000' }}>
          <StatusBar style="light" />
          <View style={{ flex: 1, backgroundColor: '#000' }}>
            <Tabs 
              initialRouteName="daily"
              screenOptions={{
                header: ({ route }) => {
                  const titles = {
                    daily: 'Daily',
                    scan: 'Scan',
                    coach: 'Your coach'
                  };
                  const title = titles[route.name as keyof typeof titles] || '';
                  return <Header title={title} onOpenSettings={handleOpenSettings} />;
                },
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#666',
                tabBarShowLabel: true,
                tabBarLabelStyle: styles.tabBarLabel,
              }}
            >
              <Tabs.Screen
                name="daily"
                options={{
                  title: 'Daily',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="checkmark-circle-outline" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="scan"
                options={{
                  title: 'Scan',
                  tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons name="crop-free" size={size} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="coach"
                options={{
                  title: 'coach',
                  tabBarIcon: ({ color, size }) => (
                    <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
                  ),
                }}
              />
            </Tabs>

            <SettingsBottomSheet 
              isOpen={isSettingsOpen}
              onClose={handleCloseSettings}
            />
          </View>
        </SafeAreaProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
    zIndex: 1,
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
    padding: 8,
  },
  tabBar: {
    backgroundColor: '#000',
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '400',
  },
  bottomSheetBackground: {
    backgroundColor: '#1A1A1A',
  },
  bottomSheetIndicator: {
    backgroundColor: '#666',
    width: 40,
  },
  bottomSheetContent: {
    flex: 1,
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomSheetButton: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  bottomSheetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
