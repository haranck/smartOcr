import axios from "axios";
 
let BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (BASE_URL && !BASE_URL.includes('/api')) {
    BASE_URL = BASE_URL.endsWith('/') ? `${BASE_URL}api/` : `${BASE_URL}/api/`;
} else if (BASE_URL && !BASE_URL.endsWith('/')) {
    BASE_URL = `${BASE_URL}/`;
}

export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong';
    error.message = message;
    return Promise.reject(error);
  }
);