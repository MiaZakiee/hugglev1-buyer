import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { OrderCard } from '@/components/OrderCard';
import { mockOrders } from '@/data/mockData';

export default function OrdersScreen() {
  const [selectedStatus, setSelectedStatus] = useState('all');

  const statusOptions = [
    { id: 'all', name: 'All', count: mockOrders.length },
    { id: 'pending', name: 'Pending', count: mockOrders.filter(o => o.status === 'pending').length },
    { id: 'confirmed', name: 'Confirmed', count: mockOrders.filter(o => o.status === 'confirmed').length },
    { id: 'completed', name: 'Completed', count: mockOrders.filter(o => o.status === 'completed').length },
    { id: 'cancelled', name: 'Cancelled', count: mockOrders.filter(o => o.status === 'cancelled').length },
  ];

  const filteredOrders = selectedStatus === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === selectedStatus);

  const renderStatusItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.statusItem,
        selectedStatus === item.id && styles.statusItemActive
      ]}
      onPress={() => setSelectedStatus(item.id)}
    >
      <Text style={[
        styles.statusText,
        selectedStatus === item.id && styles.statusTextActive
      ]}>
        {item.name}
      </Text>
      {item.count > 0 && (
        <View style={[
          styles.statusBadge,
          selectedStatus === item.id && styles.statusBadgeActive
        ]}>
          <Text style={[
            styles.statusBadgeText,
            selectedStatus === item.id && styles.statusBadgeTextActive
          ]}>
            {item.count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track your bookings and purchases</Text>
      </View>

      <FlatList
        data={statusOptions}
        renderItem={renderStatusItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statusContainer}
      />

      <View style={styles.content}>
        {filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            renderItem={({ item }) => <OrderCard order={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.ordersContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {selectedStatus === 'all' 
                ? 'Start browsing to make your first booking'
                : `No ${selectedStatus} orders at the moment`
              }
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '400',
  },
  statusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  statusItemActive: {
    backgroundColor: '#FF6B35',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  statusBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  statusBadgeActive: {
    backgroundColor: '#FFFFFF',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusBadgeTextActive: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
  },
  ordersContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
});