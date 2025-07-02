import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';

interface CountdownTimerProps {
  endTime: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const difference = end - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const getUrgencyColor = () => {
    const totalMinutes = timeLeft.hours * 60 + timeLeft.minutes;
    if (totalMinutes < 30) return '#FF3B30';
    if (totalMinutes < 120) return '#FF9500';
    return '#34C759';
  };

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  if (isExpired) {
    return (
      <View style={[styles.container, styles.expiredContainer]}>
        <Clock size={16} color="#8E8E93" />
        <Text style={styles.expiredText}>Expired</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Clock size={16} color={getUrgencyColor()} />
      <Text style={[styles.timerText, { color: getUrgencyColor() }]}>
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
      </Text>
      <Text style={styles.remainingText}>remaining</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  expiredContainer: {
    backgroundColor: '#F2F2F7',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'monospace',
  },
  remainingText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    fontWeight: '500',
  },
  expiredText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
    fontWeight: '500',
  },
});