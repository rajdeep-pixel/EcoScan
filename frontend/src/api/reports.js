import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

API.interceptors.request.use((config) => {
  const rawSession = sessionStorage.getItem('ecoscan_session');
  if (rawSession) {
    try {
      const session = JSON.parse(rawSession);
      if (session?.token) {
        config.headers.Authorization = `Bearer ${session.token}`;
      }
    } catch (error) {
      sessionStorage.removeItem('ecoscan_session');
    }
  }
  return config;
});

export async function fetchReports() {
  const { data } = await API.get('/reports');
  return data;
}

export async function createReport({ lat, lng, severity, desc, landmark, imageData }) {
  const { data } = await API.post('/reports', {
    lat,
    lng,
    severity,
    desc,
    landmark,
    image_data: imageData || null,
  });
  return data;
}

export async function claimReport(reportId) {
  const { data } = await API.patch(`/reports/${reportId}/claim`);
  return data;
}

export async function submitCleanup(reportId, afterImageData) {
  const { data } = await API.patch(`/reports/${reportId}/clean`, {
    after_image_data: afterImageData,
  });
  return data;
}

export async function fetchStats() {
  const { data } = await API.get('/stats');
  return data;
}

export async function fetchLeaderboard() {
  const { data } = await API.get('/leaderboard');
  return data;
}
