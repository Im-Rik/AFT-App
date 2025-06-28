import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://aft-server.onrender.com';

/**
 * A utility function to handle API requests with authentication.
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} options - Optional fetch options.
 * @returns {Promise<any>} - The JSON response from the API.
 */
export async function fetchWithAuth(endpoint, options = {}) {
  // NOTE: We pass the token override through, but it's not used in this file.
  // This is to keep the function signature consistent for other parts of the app that might use it.
  const token = await AsyncStorage.getItem('authToken');
  
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
    try {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An API error occurred.');
    } catch (e) {
        throw new Error(response.statusText || 'A network error occurred.');
    }
  }

  if (response.status === 204) {
    return null;
  }

  try {
    return await response.json();
  } catch (error) {
    console.warn("Could not parse JSON response, returning null.", error);
    return null;
  }
}