import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://aft-server.onrender.com';

/**
 * A utility function to handle API requests with authentication.
 * It is responsible for making requests and reporting success or failure.
 * It does NOT manage authentication state (like removing tokens).
 * @param {string} endpoint - The API endpoint to call.
 * @param {object} options - Optional fetch options.
 * @returns {Promise<any>} - The JSON response from the API.
 */
export async function fetchWithAuth(endpoint, options = {}) {
  const token = await AsyncStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });

  if (!response.ok) {
    // If the response is not OK, we construct a detailed error.
    let errorBody;
    try {
      // Try to get a specific message from the server's JSON response.
      errorBody = await response.json();
    } catch (e) {
      // If the body isn't JSON, use the status text as a fallback.
      errorBody = { message: response.statusText };
    }

    // Create a new Error object with the server's message.
    const error = new Error(errorBody.message || 'An API error occurred.');
    
    // CRUCIAL: Attach the HTTP status code to the error object.
    // This allows the AuthContext to inspect it.
    error.status = response.status;
    
    // Throw the enhanced error so the calling function can handle it intelligently.
    throw error;
  }

  // Handle successful but empty responses (e.g., HTTP 204 No Content)
  if (response.status === 204) {
    return null;
  }

  // Handle successful responses with a JSON body
  try {
    return await response.json();
  } catch (error) {
    console.warn("Could not parse JSON response for a successful request, returning null.", error);
    return null;
  }
}