import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { Link, useRouter, useSegments } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';
import LoadingScreen from '../components/LoadingScreen';

const { width } = Dimensions.get('window');

// Ensure WebBrowser.maybeCompleteAuthSession() is called
WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);

      const redirectUrl = Platform.select({
        web: `${window.location.origin}/app/auth/callback`,
        default: makeRedirectUri({
          path: 'app/auth/callback',
        }),
      });

      console.log('Redirect URL:', redirectUrl);

      if (Platform.OS === 'web') {
        // Web-specific OAuth handling
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
          },
        });

        if (error) throw error;
      } else {
        // Native-specific OAuth handling
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            skipBrowserRedirect: true,
          },
        });

        if (error) throw error;

        if (data?.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

          if (result.type === 'success') {
            const { params } = QueryParams.getQueryParams(result.url);

            if (params?.access_token && params?.refresh_token) {
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: params.access_token,
                refresh_token: params.refresh_token,
              });

              if (sessionError) throw sessionError;

              console.log('Google sign-in successful:', sessionData);
              
              // Navigate to the daily tab screen with immediate loading state
              router.replace({
                pathname: '/(tabs)/daily',
                params: {
                  initial: 'true'
                }
              });
            } else {
              throw new Error('No access token or refresh token found in the response');
            }
          } else {
            throw new Error('Browser session ended without success');
          }
        }
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isNavigating) {
    return <LoadingScreen />;
  }

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
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>
        <Link href="/fullscreen/Welcome" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Go to Welcome Page</Text>
          </TouchableOpacity>
        </Link>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#8A2BE2" />
          <Text style={styles.loadingText}>Logging you in...</Text>
        </View>
      )}
    </View>
  );
}

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
  buttonDisabled: {
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    color: 'white',
    marginTop: 10,
    fontSize: 16,
  },
});
