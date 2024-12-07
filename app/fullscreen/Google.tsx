import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../../lib/supabase';

// Ensure WebBrowser.maybeCompleteAuthSession() is called
WebBrowser.maybeCompleteAuthSession();

export default function Home() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = makeRedirectUri({
        path: 'app/auth/callback',
      });

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
    } catch (error: any) {
      console.error('Error signing in with Google:', error.message);
      // Handle error, e.g., show an error message to the user
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to My App</Text>
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>
    
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
});
