// src/api/index.js

import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://aft-server.onrender.com';

/**
 * A utility function to handle API requests with authentication.
 * It now accepts an optional token override to avoid race conditions on login.
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} options - Optional fetch options.
 * @param {string|null} tokenOverride - A token to use directly instead of reading from storage.
 * @returns {Promise<any>} - The JSON response from the API.
 */
async function fetchWithAuth(endpoint, options = {}, tokenOverride = null) {
  // Use the token override if it exists, otherwise get it from storage.
  const token = tokenOverride || await AsyncStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    await AsyncStorage.removeItem('authToken');
    throw new Error('Unauthorized or Forbidden');
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'An API error occurred.');
  }

  // === THIS BLOCK IS NOW MORE ROBUST ===
  // If the status is 204 No Content, we can safely return null.
  if (response.status === 204) {
    return null;
  }

  // For any other successful response, try to parse the JSON body.
  // An empty body will throw an error, which we can catch.
  try {
    return await response.json();
  } catch (error) {
    console.warn("Could not parse JSON response, returning null.", error);
    return null;
  }
  // === END OF UPDATE ===
}

// --- AUTHENTICATION ---
export const manualLogin = (credentials) =>
  fetch(`${API_BASE_URL}/auth/manual-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(async res => {
    if (!res.ok) {
      const errorBody = await res.json();
      throw new Error(errorBody.message || 'Login failed');
    }
    return res.json();
  });

// --- CORE API FUNCTIONS ---
export const getProfile = (token = null) => fetchWithAuth('/api/profile', {}, token);
export const getUsers = () => fetchWithAuth('/api/users');
export const addPayment = (paymentData) => fetchWithAuth('/api/payments', { method: 'POST', body: JSON.stringify(paymentData) });
export const addExpense = (expenseData) => fetchWithAuth('/api/expenses', { method: 'POST', body: JSON.stringify(expenseData) });
export const getDashboardData = () => fetchWithAuth('/api/dashboard-data');