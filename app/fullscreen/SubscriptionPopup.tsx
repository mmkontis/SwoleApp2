import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SubscriptionPopupProps {}

const SubscriptionPopup: React.FC<SubscriptionPopupProps> = () => {
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>LEVEL UP</Text>
        <Text style={styles.subtitle}>Proven to help you max your looks.</Text>
        <View style={styles.ratingsContainer}>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>68</Text>
            <Text style={styles.ratingLabel}>Overall</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>91</Text>
            <Text style={styles.ratingLabel}>Potential</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>56</Text>
            <Text style={styles.ratingLabel}>Jawline</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>81</Text>
            <Text style={styles.ratingLabel}>Masculinity</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>65</Text>
            <Text style={styles.ratingLabel}>Skin quality</Text>
          </View>
          <View style={styles.ratingBox}>
            <Text style={styles.ratingValue}>76</Text>
            <Text style={styles.ratingLabel}>Cheekbones</Text>
          </View>
        </View>
        <Text style={styles.scansCompleted}>1,000,000 scans completed</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Unlock now 🙌</Text>
        </TouchableOpacity>
        <Text style={styles.priceInfo}>€4.49 per week, auto-renews</Text>
        <View style={styles.linksContainer}>
          <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Use</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/restore')}>Restore Purchase</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy Policy</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: '#000',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
  },
  ratingsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  ratingBox: {
    width: 100,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  ratingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#fff',
  },
  scansCompleted: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceInfo: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 20,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  link: {
    fontSize: 14,
    color: '#1E90FF',
  },
});

export default SubscriptionPopup;
