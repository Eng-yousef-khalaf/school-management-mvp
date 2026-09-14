import { handleMockRequest } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // If not on login page, clear token
      if (!path.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      // If server returns error, attempt fallback in demo mode for 404/502
      if (response.status === 404 || response.status >= 500) {
        return handleMockRequest(path, options);
      }

      let errorMessage = 'Request failed';
      try {
        if (contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      const err = new Error(errorMessage);
      err.status = response.status;
      throw err;
    }

    if (contentType.includes('application/json')) {
      return response.json();
    }

    return response.blob();
  } catch (networkError) {
    // Graceful fallback to rich Demo Mock Engine if backend is offline or on demo host
    return handleMockRequest(path, options);
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),

  download: async (path, filename) => {
    try {
      const blob = await request(path, { method: 'GET' });
      if (blob instanceof Blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'download.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (e) {
      console.warn('Download fallback', e);
    }
  }
};

export default api;
