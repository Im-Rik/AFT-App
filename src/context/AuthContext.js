// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null); // <-- ADDED: State for auth errors

  useEffect(() => {
    const loadUser = async () => {
      // On initial mount, we first check storage for a token
      const storedToken = !token ? await AsyncStorage.getItem('authToken') : token;

      if (storedToken) {
        if (!token) {
          setToken(storedToken);
        }
        try {
          // Now fetch the profile using the token
          const profileData = await getProfile(storedToken);
          if (profileData && profileData.user) {
            setUser(profileData.user);
            setAuthError(null); // Clear any previous errors on success
          } else {
            // If token is invalid (but doesn't throw), clear it
            throw new Error("Invalid session. Please log in again.");
          }
        } catch (error) {
          console.error("Authentication check failed:", error);
          setAuthError(error.message); // <-- UPDATED: Set the error state
          await AsyncStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        }
      }
      setIsAuthLoading(false);
    };
    
    // Only run loadUser if we are in a loading state or the token changes
    if (isAuthLoading || token) {
        loadUser();
    }
  }, [token]);

  const login = async (newToken) => {
    setAuthError(null); // <-- ADDED: Clear previous errors on a new login attempt
    await AsyncStorage.setItem('authToken', newToken);
    setToken(newToken); // This will trigger the useEffect to fetch the profile
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error("Failed to logout and clear token:", error);
    }
  };

  // Expose the new error state in the context value
  const value = { token, user, isAuthLoading, authError, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);