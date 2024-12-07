import React, { useEffect, useState } from 'react';
import { Animated, Modal, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isVisible, onClose, children }: BottomSheetProps) {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(100));

  useEffect(() => {
    if (isVisible) {
      StatusBar.setBarStyle('light-content');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }

    return () => {
      StatusBar.setBarStyle('light-content');
    };
  }, [isVisible]);

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      hardwareAccelerated={true}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalContainer}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Animated.View 
          style={[
            styles.overlay,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouch}
            activeOpacity={1}
            onPress={onClose}
          />
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.bottomSheetContainer,
            {
              transform: [{
                translateY: slideAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: [0, 200]
                })
              }]
            }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.content}>
              <View style={styles.handle} />
              {children}
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  bottomSheetContainer: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 'auto',
  },
  content: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#666',
    borderRadius: 2,
    marginBottom: 8,
    alignSelf: 'center',
  },
});
