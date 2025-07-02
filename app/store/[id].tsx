import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, MapPin, Clock, Star, Phone, Heart, Filter } from 'lucide-react-native';
import { ProductCard } from '@/components/ProductCard';
import { StorePost } from '@/components/StorePost';
import { mockProducts, mockStorePosts } from '@/data/mockData';

export default function StoreScreen() {
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState('products');
  const [isFollowing, setIsFollowing] = useState(false);
  
  // Mock store data (in real app, this would be an API call)
  const store = {
    id: id,
    name: 'Brew & Bean Coffee',
    logo: 'https://images.pexels.com/photos/2074130/pexels-photo-2074130.jpeg?auto=compress&cs=tinysrgb&w=200',
    coverImage: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.8,
    reviewCount: 1247,
    address: '123 Coffee Street, Downtown NYC',
    phone: '+1 (555) 123-4567',
    hours: 'Open until 9:00 PM',
    description: 'Premium coffee roasters serving the finest artisan blends since 2015. We source our beans directly from farmers and roast them fresh daily.',
    followers: 2847,
    categories: ['Coffee', 'Pastries', 'Breakfast'],
  };

  const storeProducts = mockProducts.filter(p => p.store.id === id || p.store.name === store.name);
  const storePosts = mockStorePosts.filter(p => p.store.id === id || p.store.name === store.name);

  const tabs = [
    { id: 'products', name: 'Products', count: storeProducts.length },
    { id: 'posts', name: 'Posts', count: storePosts.length },
    { id: 'about', name: 'About' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'products':
        return (
          <FlatList
            data={storeProducts}
            renderItem={({ item }) => <ProductCard product={item} />}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.productRow}
            contentContainerStyle={styles.productsContainer}
            scrollEnabled={false}
          />
        );
      case 'posts':
        return (
          <View style={styles.postsContainer}>
            {storePosts.map((post) => (
              <StorePost key={post.id} post={post} />
            ))}
          </View>
        );
      case 'about':
        return (
          <View style={styles.aboutContainer}>
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>About</Text>
              <Text style={styles.aboutText}>{store.description}</Text>
            </View>
            
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Categories</Text>
              <View style={styles.categoriesContainer}>
                {store.categories.map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Contact</Text>
              <View style={styles.contactItem}>
                <MapPin size={16} color="#8E8E93" />
                <Text style={styles.contactText}>{store.address}</Text>
              </View>
              <View style={styles.contactItem}>
                <Phone size={16} color="#8E8E93" />
                <Text style={styles.contactText}>{store.phone}</Text>
              </View>
              <View style={styles.contactItem}>
                <Clock size={16} color="#8E8E93" />
                <Text style={styles.contactText}>{store.hours}</Text>
              </View>
            </View>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: store.coverImage }} style={styles.coverImage} />
          <View style={styles.coverOverlay} />
        </View>

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <View style={styles.storeHeader}>
            <Image source={{ uri: store.logo }} style={styles.storeLogo} />
            <View style={styles.storeDetails}>
              <Text style={styles.storeName}>{store.name}</Text>
              <View style={styles.storeRating}>
                <Star size={16} color="#FFD700" fill="#FFD700" />
                <Text style={styles.ratingText}>{store.rating}</Text>
                <Text style={styles.reviewCount}>({store.reviewCount} reviews)</Text>
              </View>
              <View style={styles.storeLocation}>
                <MapPin size={14} color="#8E8E93" />
                <Text style={styles.locationText}>{store.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.storeActions}>
            <TouchableOpacity 
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => setIsFollowing(!isFollowing)}
            >
              <Heart 
                size={16} 
                color={isFollowing ? '#FFFFFF' : '#FF6B35'} 
                fill={isFollowing ? '#FFFFFF' : 'transparent'}
              />
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Following' : 'Follow'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton}>
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{store.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{storeProducts.length}</Text>
              <Text style={styles.statLabel}>Products</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{storePosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.name}
                {tab.count && ` (${tab.count})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {renderTabContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 20,
  },
  coverContainer: {
    position: 'relative',
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
  },
  storeInfo: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: -30,
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  storeHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  storeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 4,
  },
  storeLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
  },
  storeActions: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  followButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F0',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B35',
  },
  followingButton: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  followButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  followingButtonText: {
    color: '#FFFFFF',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabContent: {
    marginTop: 20,
    paddingBottom: 40,
  },
  productsContainer: {
    paddingHorizontal: 20,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  postsContainer: {
    paddingHorizontal: 20,
  },
  aboutContainer: {
    paddingHorizontal: 20,
  },
  aboutSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 24,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#FFF5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#1C1C1E',
    marginLeft: 8,
  },
});