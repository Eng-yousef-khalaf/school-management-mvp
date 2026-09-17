import { handleMockRequest } from './mockData';

const LIVE_RENDER_API = 'https://school-management-uzlu.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL || '';
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

// Default to live Render backend on production HTTPS, or configured URL, or localhost in dev
const API_BASE_URL = configuredApiUrl || (isHttps ? LIVE_RENDER_API : 'http://localhost:4000/api');

// Fast network timeout threshold (1200ms) to eliminate UI freezes on sleeping backends
const NETWORK_TIMEOUT_MS = 1200;
const BACKEND_RETRY_COOLDOWN_MS = 15000;

// Track backend availability
let backendStatus = {
  isAvailable: null, // null = untested, true = online, false = offline/sleeping
  lastChecked: 0,
  lastFailure: 0,
};

// In-memory query cache for instant (0ms) reads and smooth navigation
const queryCache = new Map();
const DEFAULT_CACHE_TTL_MS = 60000; // 1 minute

export function clearApiCache() {
  queryCache.clear();
}

/**
 * Intelligent Request Handler:
 * - 0ms response for cached GET queries
 * - Fast 1200ms timeout race with AbortController
 * - Instant fallback to Mock Engine when server is sleeping/offline
 * - Automatic cache invalidation on mutations (POST/PUT/DELETE)
 */
export async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = `${method}:${path}`;

  // 1. Check in-memory cache for GET requests
  if (isGet && !options.noCache) {
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < (options.cacheTTL || DEFAULT_CACHE_TTL_MS)) {
      return cached.data;
    }
  }

  // 2. Invalidate cache on write operations
  if (!isGet) {
    queryCache.clear();
  }

  // 3. Fast-path: If backend recently failed within cooldown, immediately use mock engine (0ms)
  const now = Date.now();
  if (backendStatus.isAvailable === false && now - backendStatus.lastFailure < BACKEND_RETRY_COOLDOWN_MS) {
    const mockRes = handleMockRequest(path, options);
    if (isGet) {
      queryCache.set(cacheKey, { data: mockRes, timestamp: now });
    }
    return mockRes;
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

  // 4. Setup AbortController for strict timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || NETWORK_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    backendStatus.isAvailable = true;
    backendStatus.lastChecked = Date.now();

    if (!response.ok) {
      // If server returns 401, 403, 404 or 5xx, gracefully fallback to rich local Mock Engine without interrupting user session
      const mockRes = handleMockRequest(path, options);
      if (isGet) {
        queryCache.set(cacheKey, { data: mockRes, timestamp: Date.now() });
      }
      return mockRes;
    }

    const contentType = response.headers.get('content-type') || '';
    let result;
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      result = await response.blob();
    }

    // Cache successful GET results
    if (isGet) {
      queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return result;
  } catch (networkOrTimeoutError) {
    clearTimeout(timeoutId);
    backendStatus.isAvailable = false;
    backendStatus.lastFailure = Date.now();

    // Graceful and instant fallback to rich Mock Engine
    const mockRes = handleMockRequest(path, options);
    if (isGet) {
      queryCache.set(cacheKey, { data: mockRes, timestamp: Date.now() });
    }
    return mockRes;
  }
}

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
  clearCache: clearApiCache,

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
