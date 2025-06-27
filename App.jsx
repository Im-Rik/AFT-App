import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { View, ActivityIndicator, StatusBar } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen'; // We will create this next

// A custom dark theme for the navigation
const AppTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4ade80',      // Green-400
    background: '#0f172a',  // Slate-900
    card: '#1e293b',        // Slate-800
    text: '#f1f5f9',        // Slate-100
    border: '#334155',      // Slate-700
    notification: '#f87171', // Red-400
  },
};

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    // Show a loading spinner while we check for a token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#4ade80" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        // If user is logged in, show the main dashboard
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
      ) : (
        // Otherwise, show the login screen
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer theme={AppTheme}>
        {/* Use 'light-content' for dark backgrounds */}
        <StatusBar barStyle="light-content" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;