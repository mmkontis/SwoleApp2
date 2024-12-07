import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { Linking, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface RatingPopupProps {
  visible: boolean;
  onClose: () => void;
}

export function RatingPopup({ visible, onClose }: RatingPopupProps) {
  const [rating, setRating] = React.useState(0);
  const [showFeedback, setShowFeedback] = React.useState(false);

  const handleRate = async (selectedRating: number) => {
    setRating(selectedRating);
    
    if (selectedRating >= 4) {
      // Open Google Play Store
      await Linking.openURL('market://details?id=your.app.id');
      onClose();
    } else {
      setShowFeedback(true);
    }
  };

  const handleLeaveComment = async () => {
    // Open email with pre-filled subject
    const subject = `Swole App Feedback (${rating} stars)`;
    const body = "Tell us how we can improve:";
    const email = "feedback@swoleapp.com";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    await Linking.openURL(mailtoUrl);
    onClose();
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
          {!showFeedback ? (
            <>
              <Text style={styles.title}>Rate Swole</Text>
              <Text style={styles.description}>How would you rate your experience?</Text>
              
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleRate(star)}
                    style={styles.star}
                  >
                    <AntDesign
                      name={star <= rating ? "star" : "staro"}
                      size={32}
                      color={star <= rating ? "#FFD700" : "#666"}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setShowFeedback(false);
                  setRating(0);
                  onClose();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <AntDesign name="heart" size={40} color="#FF453A" style={styles.feedbackIcon} />
              <Text style={styles.title}>Thank You!</Text>
              <Text style={styles.description}>
                We appreciate your feedback and would love to hear how we can improve.
              </Text>

              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]} 
                  onPress={handleLeaveComment}
                >
                  <Text style={styles.primaryButtonText}>Leave Comment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={() => {
                    setShowFeedback(false);
                    setRating(0);
                    onClose();
                  }}
                >
                  <Text style={styles.cancelButtonText}>Skip</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
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
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  star: {
    padding: 8,
  },
  feedbackIcon: {
    marginBottom: 16,
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