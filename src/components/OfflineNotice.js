import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const BANNER_HEIGHT = 44;

const OfflineNotice = ({ isOffline }) => {
  // Use useRef for animation values to persist them across re-renders
  const animValues = useRef({
    height: new Animated.Value(0),
    opacity: new Animated.Value(0),
  }).current;

  useEffect(() => {
    // Animate the banner based on the offline status prop
    Animated.parallel([
      Animated.timing(animValues.height, {
        toValue: isOffline ? BANNER_HEIGHT : 0,
        duration: 300,
        useNativeDriver: false, // height animation is not supported by native driver
      }),
      Animated.timing(animValues.opacity, {
        toValue: isOffline ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOffline, animValues]);


  return (
    <Animated.View style={[styles.container, { height: animValues.height, opacity: animValues.opacity }]}>
      <Icon name="cloud-offline" size={20} color="#e2e8f0" />
      <Text style={styles.text}>You are offline. Showing last updated data.</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#475569', // A neutral slate color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Hide content when height is 0
    gap: 10,
  },
  text: {
    color: '#e2e8f0', // slate-200
    fontSize: 14,
    fontWeight: '500',
  },
});

export default OfflineNotice;