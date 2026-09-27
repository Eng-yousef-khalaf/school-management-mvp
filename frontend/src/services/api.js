import { handleMockRequest } from './mockData';

// Render backend URL (optional fallback)
const LIVE_RENDER_API = 'https://school-management-uzlu.onrender.com/api';
const configuredApiUrl = import.meta.env.VITE_API_URL || '';
const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

// Default to same origin /api when served by backend, or configured URL, or localhost:4000
const defaultBaseUrl = typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('vercel.app')
  ? `${window.location.origin}/api`
  : (isHttps ? LIVE_RENDER_API : 'http://localhost:4000/api');

const API_BASE_URL = configuredApiUrl || defaultBaseUrl;

// Healthy network timeout threshold (25000ms) for reliable database operations & cold starts
const NETWORK_TIMEOUT_MS = 25000;
const BACKEND_RETRY_COOLDOWN_MS = 15000; // 15 seconds cooldown after a failed connection

// Track backend availability - auto-enable for local or dedicated host
const isLocalOrDirect = typeof window !== 'undefined' && (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  !window.location.hostname.includes('vercel.app')
);

let backendStatus = {
  isAvailable: isLocalOrDirect,
  lastChecked: 0,
  lastFailure: 0,
  isProbing: false
};

// In-memory query cache for instant (0ms) reads and ultra-smooth navigation
const queryCache = new Map();
const DEFAULT_CACHE_TTL_MS = 300000; // 5 minutes

export function clearApiCache() {
  queryCache.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => queryCache.clear());
  window.addEventListener('students_updated', () => queryCache.clear());
  window.addEventListener('classes_updated', () => queryCache.clear());
  window.addEventListener('teachers_updated', () => queryCache.clear());
  window.addEventListener('grades_updated', () => queryCache.clear());
}

/**
 * Background silent probe to check if a live backend is active and awake
 */
async function probeBackendInBackground() {
  if (backendStatus.isProbing || !API_BASE_URL) return;
  if (Date.now() - backendStatus.lastFailure < BACKEND_RETRY_COOLDOWN_MS) return;

  backendStatus.isProbing = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600);
    const res = await fetch(`${API_BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      backendStatus.isAvailable = true;
      backendStatus.lastChecked = Date.now();
    } else {
      backendStatus.isAvailable = false;
      backendStatus.lastFailure = Date.now();
    }
  } catch {
    backendStatus.isAvailable = false;
    backendStatus.lastFailure = Date.now();
  } finally {
    backendStatus.isProbing = false;
  }
}

// Kick off silent background probe on browser startup
if (typeof window !== 'undefined' && (configuredApiUrl || !isHttps)) {
  probeBackendInBackground();
}

/**
 * High-Performance Intelligent Request Handler:
 * - 0ms response for cached GET queries
 * - Instant (0ms) fallback to rich Mock Engine when server is sleeping/offline
 * - Non-blocking background health check
 * - Automatic cache invalidation on mutations (POST/PUT/DELETE)
 */
export async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = `${method}:${path}`;

  // 1. Check in-memory cache for GET requests (0ms response)
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

  const now = Date.now();
  const isOnRender = typeof window !== 'undefined' && window.location.origin.includes('onrender.com');

  // 3. Fast-path: Only serve mock on client-only hosts (like vercel.app preview) without a live backend
  if (!isOnRender && !backendStatus.isAvailable && !configuredApiUrl) {
    const mockRes = handleMockRequest(path, options);
    if (isGet) {
      queryCache.set(cacheKey, { data: mockRes, timestamp: now });
    }
    return mockRes;
  }

  // If backend recently failed within cooldown, immediately use mock engine on client-only previews
  if (!isOnRender && backendStatus.isAvailable === false && now - backendStatus.lastFailure < BACKEND_RETRY_COOLDOWN_MS) {
    const mockRes = handleMockRequest(path, options);
    if (isGet) {
      queryCache.set(cacheKey, { data: mockRes, timestamp: now });
    }
    return mockRes;
  }

  const token = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('token') : null) || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null);
  const headers = { ...(options.headers || {}) };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Pass active user context for seamless authentication
  const userStr = (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('user') : null) || (typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null);
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.role) headers['x-user-role'] = u.role;
      if (u.email) headers['x-user-email'] = u.email;
    } catch {}
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers['Content-Type'] && options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }

  const url = `${API_BASE_URL}${path}`;

  // 4. Setup AbortController with healthy timeout
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
      if (!isGet) {
        let errorMsg = 'Failed to execute operation';
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      // Only fallback to mock if on vercel web preview
      if (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')) {
        const mockRes = handleMockRequest(path, options);
        queryCache.set(cacheKey, { data: mockRes, timestamp: Date.now() });
        return mockRes;
      }

      let errorMsg = `Server error (${response.status})`;
      try {
        const errData = await response.json();
        errorMsg = errData.error || errData.message || errorMsg;
      } catch {}
      throw new Error(errorMsg);
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

  } catch (networkOrTimeoutError) {
    clearTimeout(timeoutId);

    const isAborted = networkOrTimeoutError.name === 'AbortError' || String(networkOrTimeoutError.message).includes('aborted');

    if (!isGet) {
      // If clean-slate or developer operation timed out, execute local state reset so client is not stuck
      if (path.includes('clean-slate')) {
        const mockRes = handleMockRequest(path, options);
        return mockRes;
      }
      if (isAborted) {
        throw new Error('استغرقت العملية وقتاً أطول من المتوقع على الخادم، يرجى المحاولة مجدداً.');
      }
      throw networkOrTimeoutError;
    }

    // Fallback to mock if available or on preview
    const mockRes = handleMockRequest(path, options);
    queryCache.set(cacheKey, { data: mockRes, timestamp: Date.now() });
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
