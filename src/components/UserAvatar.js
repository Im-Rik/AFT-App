import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Helper function to generate a consistent, pleasant color from a string
const generateColorFromName = (name) => {
  if (!name) name = 'Anonymous';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Using HSL for better color variety and control
  const h = hash % 360;
  return `hsl(${h}, 70%, 80%)`;
};

const UserAvatar = ({ name, size = 'md' }) => {
  const color = generateColorFromName(name);
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  const sizeStyles = {
    sm: { width: 32, height: 32, borderRadius: 16 },
    md: { width: 40, height: 40, borderRadius: 20 },
    lg: { width: 60, height: 60, borderRadius: 30 },
  };

  const fontStyles = {
    sm: { fontSize: 14 },
    md: { fontSize: 18 },
    lg: { fontSize: 24 },
  };

  return (
    <View style={[styles.avatar, { backgroundColor: color }, sizeStyles[size]]}>
      <Text style={[styles.initial, fontStyles[size]]}>{initial}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initial: {
    color: '#1e293b', // slate-800
    fontWeight: 'bold',
  },
});

export default UserAvatar;