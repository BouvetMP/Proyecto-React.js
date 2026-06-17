const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('trida-token');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Error en la API');
  }

  return data;
}