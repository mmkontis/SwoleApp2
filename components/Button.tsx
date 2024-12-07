import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  title?: string;
  onPress: () => void;
  icon?: string;
  color?: string;
}

const Button: React.FC<ButtonProps> = ({ title, onPress, icon, color = '#fff' }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      {icon && <Ionicons name={icon as any} size={24} color={color} />}
      {title && <Text style={[styles.text, { color }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default Button;