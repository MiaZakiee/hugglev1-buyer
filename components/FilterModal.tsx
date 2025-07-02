import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { X, MapPin, Clock, Tag, Percent } from 'lucide-react-native';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: any) => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState('5');
  const [selectedTimeLeft, setSelectedTimeLeft] = useState('all');
  const [selectedDiscount, setSelectedDiscount] = useState('all');
  const [onlyFollowedStores, setOnlyFollowedStores] = useState(false);

  const categories = [
    'Food & Drink',
    'Fashion',
    'Electronics',
    'Beauty',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
  ];

  const distanceOptions = [
    { value: '1', label: '1 km' },
    { value: '2', label: '2 km' },
    { value: '5', label: '5 km' },
    { value: '10', label: '10 km' },
    { value: '25', label: '25 km' },
  ];

  const timeLeftOptions = [
    { value: 'all', label: 'All' },
    { value: '1', label: 'Less than 1 hour' },
    { value: '3', label: 'Less than 3 hours' },
    { value: '6', label: 'Less than 6 hours' },
    { value: '24', label: 'Less than 24 hours' },
  ];

  const discountOptions = [
    { value: 'all', label: 'All' },
    { value: '10', label: '10% or more' },
    { value: '25', label: '25% or more' },
    { value: '50', label: '50% or more' },
    { value: '75', label: '75% or more' },
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleApply = () => {
    const filters = {
      categories: selectedCategories,
      distance: selectedDistance,
      timeLeft: selectedTimeLeft,
      discount: selectedDiscount,
      onlyFollowedStores,
    };
    onApply(filters);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedDistance('5');
    setSelectedTimeLeft('all');
    setSelectedDiscount('all');
    setOnlyFollowedStores(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filters</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#1C1C1E" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Tag size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategories.includes(category) && styles.categoryButtonActive,
                  ]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      selectedCategories.includes(category) && styles.categoryButtonTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Distance</Text>
            </View>
            <View style={styles.optionsContainer}>
              {distanceOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedDistance === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedDistance(option.value)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedDistance === option.value && styles.optionButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Time Left</Text>
            </View>
            <View style={styles.optionsContainer}>
              {timeLeftOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedTimeLeft === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedTimeLeft(option.value)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedTimeLeft === option.value && styles.optionButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Percent size={20} color="#FF6B35" />
              <Text style={styles.sectionTitle}>Discount</Text>
            </View>
            <View style={styles.optionsContainer}>
              {discountOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    selectedDiscount === option.value && styles.optionButtonActive,
                  ]}
                  onPress={() => setSelectedDiscount(option.value)}
                >
                  <Text
                    style={[
                      styles.optionButtonText,
                      selectedDiscount === option.value && styles.optionButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Only followed stores</Text>
              <Switch
                value={onlyFollowedStores}
                onValueChange={setOnlyFollowedStores}
                trackColor={{ false: '#E5E5E7', true: '#FF6B35' }}
                thumbColor={onlyFollowedStores ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  categoryButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E7',
  },
  optionButtonActive: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  footer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#FF6B35',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});