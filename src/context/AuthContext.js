// src/context/AuthContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsAuthLoading(true);
      let storedToken = null;
      let storedUser = null;

      try {
        const storedTokenJson = await AsyncStorage.getItem('authToken');
        const storedUserJson = await AsyncStorage.getItem('authUser');
        
        if (storedTokenJson) {
            storedToken = storedTokenJson;
            setToken(storedToken);
        }
        if (storedUserJson) {
            storedUser = JSON.parse(storedUserJson);
            setUser(storedUser);
        }

        if (storedToken) {
          try {
            const profileData = await getProfile(storedToken);
            if (profileData && profileData.user) {
              const freshUser = profileData.user;
              setUser(freshUser);
              await AsyncStorage.setItem('authUser', JSON.stringify(freshUser));
              setAuthError(null);
            } else {
              throw new Error("Invalid session data from server.");
            }
          } catch (error) {
            // **THIS IS THE UPDATED PART**
            // We now check the status property on the error object.
            const isAuthError = error.status === 401 || error.status === 403;
            
            if (isAuthError) {
              // The token is invalid, so we must log out.
              console.error("Authentication failed, token is invalid:", error);
              setAuthError("Your session has expired. Please log in again.");
              await AsyncStorage.removeItem('authToken');
              await AsyncStorage.removeItem('authUser');
              setToken(null);
              setUser(null);
            } else {
              // It's a network error or other server issue. Trust the cached data.
              console.log("Could not refresh profile (likely offline). Using cached user data.");
              setAuthError(null);
            }
          }
        }
      } catch (e) {
        console.error("Failed to load user data from storage:", e);
      } finally {
        setIsAuthLoading(false);
      }
    };
    
    loadUserFromStorage();
  }, []);

  const login = async (newToken) => {
    setIsAuthLoading(true);
    setAuthError(null);
    try {
        const profileData = await getProfile(newToken);
        if (profileData && profileData.user) {
            await AsyncStorage.setItem('authToken', newToken);
            await AsyncStorage.setItem('authUser', JSON.stringify(profileData.user));
            setToken(newToken);
            setUser(profileData.user);
        } else {
            throw new Error("Login successful, but failed to retrieve user profile.");
        }
    } catch (error) {
        console.error("Login process failed:", error);
        setAuthError(error.message);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
        throw error;
    } finally {
        setIsAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      setToken(null);
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error("Failed to logout and clear data:", error);
    }
  };

  const value = { token, user, isAuthLoading, authError, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);