const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export function saveSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  listReadings: (page = 1, limit = 10) => request(`/readings?page=${page}&limit=${limit}`),
  addReading: (body) => request('/readings', { method: 'POST', body }),
  updateReading: (id, body) => request(`/readings/${id}`, { method: 'PUT', body }),
  deleteReading: (id) => request(`/readings/${id}`, { method: 'DELETE' }),
  getReports: (date) => request(`/reports?date=${date}`),
  getMonthReadings: (date) => request(`/reports/month?date=${date}`),
  listPatients: () => request('/doctor/patients'),
  getPatientReports: (id, date) => request(`/doctor/patients/${id}/reports?date=${date}`),
};