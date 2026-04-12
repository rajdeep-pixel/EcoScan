import axios from 'axios';

// 1. Centralized Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function registerUser(payload) {
  try {
    const { data } = await API.post('/auth/register', payload);
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Registration failed. Please try again.";
  }
}

export async function loginUser(payload) {
  try {
    const { data } = await API.post('/auth/login', payload);
    return data;
  } catch (error) {
    throw error.response?.data?.detail || "Invalid credentials.";
  }
}

export async function fetchCurrentUser(token) {
  try {
    const { data } = await API.get('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    throw error.response?.status === 401 ? "Session expired" : "Failed to fetch user";
  }
}

export default API;