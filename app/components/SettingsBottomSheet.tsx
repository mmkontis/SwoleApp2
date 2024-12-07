import BottomSheet from '@gorhom/bottom-sheet';
import { Link } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { BodyMetricsPopup } from './BodyMetricsPopup';
import { DeleteAccountPopup } from './DeleteAccountPopup';
import { RatingPopup } from './RatingPopup';
import { ReferralCodePopup } from './ReferralCodePopup';

interface SettingsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsBottomSheet({ isOpen, onClose }: SettingsBottomSheetProps) {
  const { signOut } = useAuth();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['70%'], []);
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showBodyMetricsPopup, setShowBodyMetricsPopup] = useState(false);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isOpen]);

  const handleContactSupport = async () => {
    const url = 'mailto:support@swoleapp.com';
    const canOpen = await Linking.canOpenURL(url);
    
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Could not open email client');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await signOut();
      setShowDeletePopup(false);
      onClose();
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const handleSaveBodyMetrics = (metrics: {
    gender: 'male' | 'female' | 'other';
    height: string;
    weight: string;
    units: 'metric' | 'imperial';
  }) => {
    // Implement the save logic here
    console.log('Saving metrics:', metrics);
  };

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.indicator}
        style={styles.bottomSheet}
      >
        <View style={styles.container}>
          <TouchableOpacity 
            style={styles.option}
            onPress={() => setShowRatingPopup(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FFD70020' }]}>
              <Text style={styles.emoji}>⭐️</Text>
            </View>
            <Text style={styles.optionText}>Rate us</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => setShowReferralPopup(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#4A90E220' }]}>
              <Text style={styles.emoji}>#️⃣</Text>
            </View>
            <Text style={styles.optionText}>Copy my referral code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => setShowBodyMetricsPopup(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FF69B420' }]}>
              <Text style={styles.emoji}>📏</Text>
            </View>
            <Text style={styles.optionText}>Change body metrics</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={handleContactSupport}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#80808020' }]}>
              <Text style={styles.emoji}>✉️</Text>
            </View>
            <Text style={styles.optionText}>Contact support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <View style={[styles.iconContainer, { backgroundColor: '#00BCD420' }]}>
              <Text style={styles.emoji}>💎</Text>
            </View>
            <Text style={styles.optionText}>Upgrade to Pro</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <View style={[styles.iconContainer, { backgroundColor: '#80808020' }]}>
              <Text style={styles.emoji}>📝</Text>
            </View>
            <Text style={styles.optionText}>Learn more</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.option}
            onPress={() => setShowDeletePopup(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#FF453A20' }]}>
              <Text style={styles.emoji}>❌</Text>
            </View>
            <Text style={styles.dangerText}>Delete my account</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Link href="/privacy-policy" asChild>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.footerText}>Privacy</Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.footerDot}>•</Text>
            <Link href="/terms" asChild>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.footerText}>Terms</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </BottomSheet>

      <RatingPopup 
        visible={showRatingPopup}
        onClose={() => setShowRatingPopup(false)}
      />

      <ReferralCodePopup 
        visible={showReferralPopup}
        onClose={() => setShowReferralPopup(false)}
        code="SWOLE123" // Replace with actual referral code
      />

      <DeleteAccountPopup 
        visible={showDeletePopup}
        onClose={() => setShowDeletePopup(false)}
        onConfirm={handleDeleteAccount}
      />

      <BodyMetricsPopup 
        visible={showBodyMetricsPopup}
        onClose={() => setShowBodyMetricsPopup(false)}
        onSave={handleSaveBodyMetrics}
        initialMetrics={{
          gender: 'male',
          height: '',
          weight: '',
          units: 'metric',
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetBackground: {
    backgroundColor: '#1A1A1A',
  },
  indicator: {
    backgroundColor: '#666',
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emoji: {
    fontSize: 22,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  dangerText: {
    color: '#FF453A',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  footerDot: {
    color: '#666',
    marginHorizontal: 8,
  }
});
