import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

type BottomSheetContentProps = {
  type: 'settings' | 'other';
  onClose: () => void;
};

const BottomSheetContent: React.FC<BottomSheetContentProps> = ({ type, onClose }) => {
  if (type === 'settings') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Settings Content</Text>
        {/* Add your settings content here */}
        <Button title="Close" onPress={onClose} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Other Content</Text>
      {/* Add your other content here */}
      <Button title="Close" onPress={onClose} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  text: {
    color: 'white',
    fontSize: 18,
  },
});

export default BottomSheetContent;