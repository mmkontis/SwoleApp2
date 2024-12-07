import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DeleteAccountPopupProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const REASONS = [
  "I don't use the app anymore",
  "I found a better alternative",
  "The app doesn't meet my needs",
  "I want to start fresh",
  "Other"
];

export function DeleteAccountPopup({ visible, onClose, onConfirm }: DeleteAccountPopupProps) {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onClose();
      setStep(1);
      setSelectedReason('');
    }
  };

  const handleConfirm = () => {
    onConfirm();
    setStep(1);
    setSelectedReason('');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Delete Account</Text>
            <Text style={styles.description}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={() => setStep(2)}
              >
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.title}>Tell Us Why</Text>
            <Text style={styles.description}>
              Please help us improve by telling us why you're leaving:
            </Text>

            <View style={styles.reasonsContainer}>
              {REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason && styles.selectedReasonButton
                  ]}
                  onPress={() => {
                    setSelectedReason(reason);
                    setStep(3);
                  }}
                >
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason && styles.selectedReasonText
                  ]}>{reason}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleBack}
            >
              <Text style={styles.cancelButtonText}>Go Back</Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <Text style={styles.title}>Final Confirmation</Text>
            <Text style={styles.description}>
              This will permanently delete your account and all associated data.
            </Text>

            <View style={styles.selectedReasonContainer}>
              <Text style={styles.selectedReasonLabel}>Reason for leaving:</Text>
              <Text style={styles.selectedReasonText}>{selectedReason}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.deleteButton]} 
                onPress={handleConfirm}
              >
                <Text style={styles.deleteButtonText}>Confirm Deletion</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={handleBack}
              >
                <Text style={styles.cancelButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </>
        );
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleBack}
    >
      <View style={styles.overlay}>
        <View style={styles.popup}>
          {renderStep()}
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
    marginBottom: 8,
  },
  description: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  reasonsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  reasonButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    marginBottom: 8,
  },
  selectedReasonButton: {
    backgroundColor: '#FF453A20',
    borderColor: '#FF453A',
    borderWidth: 1,
  },
  reasonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedReasonText: {
    color: '#FF453A',
  },
  selectedReasonContainer: {
    backgroundColor: '#2A2A2A',
    padding: 16,
    borderRadius: 8,
    width: '100%',
    marginBottom: 24,
  },
  selectedReasonLabel: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  deleteButton: {
    backgroundColor: '#FF453A',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
  },
  deleteButtonText: {
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