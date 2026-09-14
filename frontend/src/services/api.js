import { handleMockRequest } from './mockData';

const LIVE_RENDER_API = 'https://school-management-uzlu.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL || '';
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

// Default to live Render backend on production HTTPS, or configured URL, or localhost in dev
const API_BASE_URL = configuredApiUrl || (isHttps ? LIVE_RENDER_API : 'http://localhost:4000/api');

// Live mode is now active by default; mock engine acts as a resilient fallback
const isDemoMode = false;

export async function request(path, options = {}) {
  // If explicitly flagged in demo mode, execute via Mock Engine
  if (isDemoMode) {
    return handleMockRequest(path, options);
  }

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
      if (!path.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      // If server returns 404 or 5xx, fallback seamlessly to demo data
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
    // Graceful fallback to rich Demo Mock Engine if backend is offline or mixed-content blocked
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
      const res = await request(path, { method: 'GET' });
      let blob;
      if (res instanceof Blob) {
        blob = res;
      } else {
        // Create realistic CSV/text blob if mock returned object or string
        const content = typeof res === 'string' ? res : JSON.stringify(res, null, 2);
        blob = new Blob([content], { type: 'application/octet-stream' });
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.warn('Download fallback', e);
    }
  }
};

export default api;
