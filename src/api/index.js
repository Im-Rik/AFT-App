import { fetchWithAuth } from './apiClient'; // <-- Import from the new file
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://aft-server.onrender.com';

// --- [REMOVED] The entire fetchWithAuth function has been moved to apiClient.js ---

// --- AUTHENTICATION ---
// This function doesn't use fetchWithAuth, so it remains unchanged, but we add the token override
// parameter to the getProfile call to keep the manualLogin function working as before.
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
// The getProfile function now needs to handle the token override case for login.
export const getProfile = (token = null) => {
    if (token) {
        // This is a special case for the initial login call where we don't want to use fetchWithAuth
        return fetch(`${API_BASE_URL}/api/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => res.json());
    }
    return fetchWithAuth('/api/profile');
};

export const getUsers = () => fetchWithAuth('/api/users');
export const addPayment = (paymentData) => fetchWithAuth('/api/payments', { method: 'POST', body: JSON.stringify(paymentData) });
export const addExpense = (expenseData) => fetchWithAuth('/api/expenses', { method: 'POST', body: JSON.stringify(expenseData) });
export const getDashboardData = () => fetchWithAuth('/api/dashboard-data');