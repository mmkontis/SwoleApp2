import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { CameraType, CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PLACEHOLDERS = ["Full body", "Back", "Legs"];

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [images, setImages] = useState<string[]>([]);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { scanType } = params as { scanType: string };

  console.log('CameraScreen rendered', { images, scanType });

  if (!permission) {
    return <View />;
  }
 
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <BlurView intensity={80} style={styles.blurContainer}>
          <Ionicons name="camera-outline" size={48} color="white" />
          <Ionicons name="arrow-forward" size={48} color="white" onPress={requestPermission} />
        </BlurView>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function toggleFlash() {
    setFlash(current => (current === 'off' ? 'on' : 'off'));
  }

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const photo = result.assets[0];
        console.log('Picture taken:', photo);
        if (photo.uri) {
          router.back();
          router.setParams({ [scanType]: photo.uri });
        } else {
          console.error('Photo URI is undefined');
          Alert.alert('Error', 'Failed to capture image: Photo URI is undefined');
        }
      } else {
        console.log('Camera capture cancelled or no image selected');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture: ' + (error as Error).message);
    }
  };

  function handleSkip() {
    console.log('Skipping, navigating back');
    router.back();
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        <View style={styles.controlsContainer}>
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>
              {`Pic ${images.length + 1}/3: ${PLACEHOLDERS[images.length]}`}
            </Text>
          </View>
          {images.length > 0 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip</Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          )}
          <BlurView intensity={80} tint="dark" style={styles.bottomControlsBlur}>
            <View style={styles.bottomControls}>
              <TouchableOpacity onPress={toggleCameraFacing} style={styles.controlButton}>
                <Ionicons name="camera-reverse" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePicture} style={styles.captureButton}>
                <Ionicons name="camera" size={36} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
                <Ionicons name={flash === 'on' ? "flash" : "flash-off"} size={24} color="white" />
              </TouchableOpacity>
            </View>
          </BlurView>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  buttonBlur: {
    borderRadius: 25,
    overflow: 'hidden',
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonBlur: {
    borderRadius: 35,
    overflow: 'hidden',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  imageControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  imageButtonBlur: {
    borderRadius: 25,
    overflow: 'hidden',
    padding: 15,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomControlsBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageControlsBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'center',
  },
  imageCounter: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
  },
  placeholderContainer: {
    position: 'absolute',
    top: '5%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  placeholderText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    width: '80%',
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    position: 'absolute',
    bottom: 110,
    alignSelf: 'center',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 4,
  },
});
