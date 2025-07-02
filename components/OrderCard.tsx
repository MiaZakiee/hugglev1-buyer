import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Clock, MapPin, Star, MessageCircle, Phone, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle } from 'lucide-react-native';

interface OrderCardProps {
  order: any;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'confirmed': return '#4ECDC4';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle size={16} color="#FF9500" />;
      case 'confirmed': return <CheckCircle size={16} color="#4ECDC4" />;
      case 'completed': return <CheckCircle size={16} color="#34C759" />;
      case 'cancelled': return <XCircle size={16} color="#FF3B30" />;
      default: return <Clock size={16} color="#8E8E93" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Approval';
      case 'confirmed': return 'Confirmed - Ready for Pickup';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          {getStatusIcon(order.status)}
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        <Image source={{ uri: order.product.image }} style={styles.productImage} />
        <View style={styles.productDetails}>
          <Text style={styles.productName} numberOfLines={2}>
            {order.product.name}
          </Text>
          <View style={styles.storeInfo}>
            <MapPin size={14} color="#8E8E93" />
            <Text style={styles.storeName}>{order.store.name}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>${order.totalAmount}</Text>
            <Text style={styles.quantity}>Qty: {order.quantity}</Text>
          </View>
        </View>
      </View>

      <View style={styles.pickupInfo}>
        <View style={styles.pickupDetail}>
          <Clock size={16} color="#8E8E93" />
          <Text style={styles.pickupText}>
            {order.pickupDate} at {order.pickupTime}
          </Text>
        </View>
        <View style={styles.pickupDetail}>
          <MapPin size={16} color="#8E8E93" />
          <Text style={styles.pickupText} numberOfLines={1}>
            {order.store.address}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {order.status === 'pending' && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'confirmed' && (
          <>
            <TouchableOpacity style={[styles.actionButton, styles.contactButton]}>
              <Phone size={16} color="#4ECDC4" />
              <Text style={styles.contactButtonText}>Contact Store</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.directionsButton]}>
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
          </>
        )}
        
        {order.status === 'completed' && !order.reviewed && (
          <TouchableOpacity style={[styles.actionButton, styles.reviewButton]}>
            <Star size={16} color="#FFD700" />
            <Text style={styles.reviewButtonText}>Leave Review</Text>
          </TouchableOpacity>
        )}
        
        {order.status === 'completed' && order.reviewed && (
          <View style={styles.reviewInfo}>
            <Star size={16} color="#FFD700" />
            <Text style={styles.reviewText}>You rated this {order.rating} stars</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  productInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 20,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
  },
  quantity: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  pickupInfo: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pickupDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupText: {
    fontSize: 14,
    color: '#1C1C1E',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: '#4ECDC4' + '20',
    borderWidth: 1,
    borderColor: '#4ECDC4',
  },
  contactButtonText: {
    color: '#4ECDC4',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  directionsButton: {
    backgroundColor: '#FF6B35',
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewButton: {
    backgroundColor: '#FFD700' + '20',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  reviewButtonText: {
    color: '#FF9500',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  reviewInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  reviewText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 6,
    fontWeight: '500',
  },
});