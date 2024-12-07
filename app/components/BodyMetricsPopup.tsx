import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Gender = 'male' | 'female' | 'other';
type Units = 'metric' | 'imperial';

interface BodyMetricsPopupProps {
  visible: boolean;
  onClose: () => void;
  initialMetrics?: {
    gender: Gender;
    height: string;
    weight: string;
    units: Units;
  };
  onSave: (metrics: {
    gender: Gender;
    height: string;
    weight: string;
    units: Units;
  }) => void;
}

type Option<T extends string> = {
  label: string;
  value: T;
};

function RadioGroup<T extends string>({ 
  options, 
  selected, 
  onSelect 
}: { 
  options: Option<T>[], 
  selected: T, 
  onSelect: (value: T) => void 
}) {
  return (
    <View style={radioStyles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            radioStyles.option,
            selected === option.value && radioStyles.selectedOption
          ]}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[
            radioStyles.optionText,
            selected === option.value && radioStyles.selectedOptionText
          ]}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function BodyMetricsPopup({ visible, onClose, initialMetrics, onSave }: BodyMetricsPopupProps) {
  const [gender, setGender] = useState<Gender>(initialMetrics?.gender || 'male');
  const [height, setHeight] = useState(initialMetrics?.height || '');
  const [weight, setWeight] = useState(initialMetrics?.weight || '');
  const [units, setUnits] = useState<Units>(initialMetrics?.units || 'metric');

  const genderOptions: Option<Gender>[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  const unitOptions: Option<Units>[] = [
    { label: 'Metric', value: 'metric' },
    { label: 'Imperial', value: 'imperial' }
  ];

  const handleSave = () => {
    onSave({
      gender,
      height,
      weight,
      units,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Body Metrics</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Gender</Text>
              <RadioGroup<Gender>
                options={genderOptions}
                selected={gender}
                onSelect={setGender}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Units</Text>
              <RadioGroup<Units>
                options={unitOptions}
                selected={units}
                onSelect={setUnits}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Height</Text>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder={units === 'metric' ? 'cm' : 'ft\'in"'}
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weight</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder={units === 'metric' ? 'kg' : 'lbs'}
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="numeric"
                style={styles.input}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const radioStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  selectedOption: {
    backgroundColor: '#8A2BE2',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
  },
  content: {
    maxHeight: 400,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#8A2BE2',
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 