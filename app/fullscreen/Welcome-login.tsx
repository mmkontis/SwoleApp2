import { Ionicons } from '@expo/vector-icons';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { Link, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');

// Ensure WebBrowser.maybeCompleteAuthSession() is called
WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
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

        console.log('Redirecting to Google for authentication...');
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
              // Navigate to the daily tab screen
              router.replace('/(tabs)/daily');
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
      // Handle error, e.g., show an error message to the user
    }
  };

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
        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
            <Text style={styles.buttonText}>Sign in with Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {/* Add another action here */}}>
            <Text style={styles.buttonText}>Another Action</Text>
          </TouchableOpacity>
        </View>
        <Link href="/fullscreen/Welcome" asChild>
          <TouchableOpacity style={styles.link}>
            <Text style={styles.linkText}>Go to Welcome Page</Text>
          </TouchableOpacity>
        </Link>
      </View>
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
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
