import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../../components/BottomSheet';

interface MediaPickerBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  onCameraSelect: () => void;
  onGallerySelect: () => void;
}

export default function MediaPickerBottomSheet({
  isVisible,
  onClose,
  onCameraSelect,
  onGallerySelect,
}: MediaPickerBottomSheetProps) {
  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.option} 
          onPress={() => {
            onCameraSelect();
            onClose();
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="camera" size={20} color="#fff" />
          </View>
          <Text style={styles.optionText}>Take Photo</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.option} 
          onPress={() => {
            onGallerySelect();
            onClose();
          }}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="images" size={20} color="#fff" />
          </View>
          <Text style={styles.optionText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
});
