const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:3000/api' : '/api');

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  const backendOrigin = API_URL.replace('/api', '');
  return `${backendOrigin}${path.startsWith('/') ? '' : '/'}${path}`;
};

/**
 * Cliente HTTP unificado con CORS y envío automático de Cookies httpOnly
 */
export const fetchData = async (endpoint, method = 'GET', body = null) => {
  const isFormData = body instanceof FormData;
  const headers = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    method,
    headers,
    credentials: 'include' // Envía y recibe cookies httpOnly de forma segura
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && endpoint !== '/user/me') {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('yumenikki:auth-expired'));
        }
      }
      const error = new Error(data.message || 'Error al procesar la solicitud.');
      error.response = { data };
      error.status = response.status;
      throw error;
    }

    return { data, status: response.status };
  } catch (error) {
    if (!(error.status === 401 && endpoint === '/user/me')) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
    }
    throw error;
  }
};

const request = async (endpoint, method, body) => {
  const result = await fetchData(endpoint, method, body);
  return result.data || {};
};

export default {
  get: (endpoint) => request(endpoint, 'GET'),
  post: (endpoint, body) => request(endpoint, 'POST', body),
  put: (endpoint, body) => request(endpoint, 'PUT', body),
  delete: (endpoint) => request(endpoint, 'DELETE'),
  upload: (endpoint, formData) => request(endpoint, 'POST', formData),
  postFormData: (endpoint, formData) => request(endpoint, 'POST', formData),
  putFormData: (endpoint, formData) => request(endpoint, 'PUT', formData),
  getImageUrl
};
