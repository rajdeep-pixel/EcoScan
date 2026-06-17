import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function registerUser(payload) {
  const { data } = await API.post('/auth/register', payload);
  return data;
}

export async function loginUser(payload) {
  const { data } = await API.post('/auth/login', payload);
  return data;
}

export async function fetchCurrentUser(token) {
  const { data } = await API.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
}

export default API;