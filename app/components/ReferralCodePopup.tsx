import React, { useState } from 'react';
import { Clipboard, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ReferralCodePopupProps {
  visible: boolean;
  onClose: () => void;
  code: string;
}

export function ReferralCodePopup({ visible, onClose, code }: ReferralCodePopupProps) {
  const [showCopied, setShowCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(code);
    setShowCopied(true);
    
    setTimeout(() => {
      setShowCopied(false);
      onClose();
    }, 1500);
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Text style={styles.title}>Your Referral Code</Text>
          <TouchableOpacity 
            style={styles.codeContainer}
            onPress={handleCopy}
            onLongPress={handleCopy}
          >
            <Text style={styles.code}>{code}</Text>
            {showCopied && <Text style={styles.copiedText}>Copied!</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]} 
            onPress={handleCopy}
          >
            <Text style={styles.primaryButtonText}>Copy Code</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
  },
  codeContainer: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
    minWidth: 140,
  },
  code: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 1,
  },
  copiedText: {
    color: '#4CD964',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#FF453A',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
}); 