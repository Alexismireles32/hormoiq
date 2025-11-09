import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Slider from '@react-native-community/slider';
import { HORMONE_RANGES } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const HORMONE_INFO = {
  cortisol: {
    name: 'Cortisol',
    icon: '💧',
    color: '#3B82F6',
    unit: 'ng/mL',
  },
  testosterone: {
    name: 'Testosterone',
    icon: '⚡',
    color: '#EF4444',
    unit: 'ng/dL',
  },
  dhea: {
    name: 'DHEA',
    icon: '🔥',
    color: '#F97316',
    unit: 'ng/dL',
  },
} as const;

export default function InputScreen() {
  const { hormone } = useLocalSearchParams<{ hormone: 'cortisol' | 'testosterone' | 'dhea' }>();
  const { user } = useAuth();
  
  // Get hormone info and range before early return
  const info = hormone && hormone in HORMONE_INFO ? HORMONE_INFO[hormone] : HORMONE_INFO['cortisol'];
  const range = hormone === 'testosterone' 
    ? HORMONE_RANGES.testosterone.male // Default to male, will adjust based on user profile
    : HORMONE_RANGES[(hormone as 'cortisol' | 'dhea') || 'cortisol'];

  // Initialize state with range values (must be called before any early returns)
  const [value, setValue] = useState<number>(range.optimal_min);
  const [inputText, setInputText] = useState<string>(range.optimal_min.toString());
  
  // Early return AFTER all hooks
  if (!hormone || !(hormone in HORMONE_INFO)) {
    return null;
  }

  const getStatus = (val: number): { text: string; color: string } => {
    if (val >= range.optimal_min && val <= range.optimal_max) {
      return { text: 'Optimal ✓', color: '#10B981' };
    } else if (val < range.optimal_min) {
      return { text: 'Below Optimal', color: '#F59E0B' };
    } else {
      return { text: 'Above Optimal', color: '#EF4444' };
    }
  };

  const status = getStatus(value);

  const handleSliderChange = (val: number) => {
    const rounded = Math.round(val * 10) / 10;
    setValue(rounded);
    setInputText(rounded.toString());
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
    const numValue = parseFloat(text);
    if (!isNaN(numValue) && numValue >= range.min && numValue <= range.max) {
      setValue(numValue);
    }
  };

  const handleNext = () => {
    if (!value || value < range.min || value > range.max) {
      Alert.alert('Invalid Value', `Please enter a value between ${range.min} and ${range.max}`);
      return;
    }

    // Navigate to context screen with hormone and value
    router.push({
      pathname: '/test/context',
      params: {
        hormone,
        value: value.toString(),
      },
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>{info.icon}</Text>
          <Text style={styles.title}>{info.name}</Text>
          <Text style={styles.subtitle}>Enter your test result</Text>
        </View>

        {/* Value Display */}
        <View style={[styles.valueCard, { borderColor: info.color }]}>
          <TextInput
            style={styles.valueInput}
            value={inputText}
            onChangeText={handleTextChange}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor="#CCC"
          />
          <Text style={styles.unit}>{info.unit}</Text>
        </View>

        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.color + '20', borderColor: status.color }]}>
          <Text style={[styles.statusText, { color: status.color }]}>
            {status.text}
          </Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Drag to adjust</Text>
          <Slider
            style={styles.slider}
            minimumValue={range.min}
            maximumValue={range.max}
            value={value}
            onValueChange={handleSliderChange}
            minimumTrackTintColor={info.color}
            maximumTrackTintColor="#E5E7EB"
            thumbTintColor={info.color}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabelText}>{range.min}</Text>
            <Text style={styles.sliderLabelText}>{range.max}</Text>
          </View>
        </View>

        {/* Optimal Range Indicator */}
        <View style={styles.rangeCard}>
          <Text style={styles.rangeTitle}>Optimal Range</Text>
          <View style={styles.rangeBar}>
            <View 
              style={[
                styles.rangeBarFill, 
                { 
                  backgroundColor: '#10B981' + '30',
                  left: `${(range.optimal_min / range.max) * 100}%`,
                  width: `${((range.optimal_max - range.optimal_min) / range.max) * 100}%`,
                }
              ]} 
            />
            <View 
              style={[
                styles.rangeIndicator,
                { 
                  backgroundColor: info.color,
                  left: `${(value / range.max) * 100}%`,
                }
              ]} 
            />
          </View>
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabelText}>
              {range.optimal_min} - {range.optimal_max} {info.unit}
            </Text>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            On the next screen, you'll add context like sleep quality and stress level to help track patterns.
          </Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: info.color }]}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next: Add Context</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  valueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderRadius: 20,
    borderWidth: 3,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  valueInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    minWidth: 120,
    textAlign: 'center',
  },
  unit: {
    fontSize: 24,
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 32,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  sliderContainer: {
    marginBottom: 32,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#999',
  },
  rangeCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  rangeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
  },
  rangeBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    position: 'relative',
    marginBottom: 12,
  },
  rangeBarFill: {
    position: 'absolute',
    height: '100%',
    borderRadius: 4,
  },
  rangeIndicator: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -4,
    marginLeft: -8,
  },
  rangeLabels: {
    alignItems: 'center',
  },
  rangeLabelText: {
    fontSize: 14,
    color: '#666',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

