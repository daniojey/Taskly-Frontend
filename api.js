import axios from "axios";
import { refreshTokenCall } from "./tokens_func";

export const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})



api.interceptors.response.use(
  response => response,
  async error => {
    if (!error.config) {
      return Promise.reject(error);
    }

    const originalConfig = error.config;

    if (originalConfig.url.includes('/token/refresh/') && error.response?.status === 404) {
      localStorage.removeItem('accessToken');
      console.log('ТОКЕНА НЕТ')
      return Promise.reject(error);
    }

    if (originalConfig.url.includes('/token/verify/') && !originalConfig._retry && !originalConfig.url.includes('/login')) {
      console.log('KONFIG 1')
      originalConfig._retry = true;

      try {
        const newAccessToken = await refreshTokenCall()
        if (!newAccessToken || newAccessToken == 'undefined') {
          return Promise.reject(error)
        }

        localStorage.setItem('accessToken', newAccessToken);

        originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

        if (originalConfig.url.includes('/token/verify/')) {
          const configData = JSON.parse(originalConfig.data)
          configData.token = newAccessToken
          originalConfig.data = JSON.stringify(configData)
        }

        return api(originalConfig)

      } catch (errorRefresh) {
        localStorage.removeItem('accessToken');
        return Promise.reject(errorRefresh);
      }

    }

    if (error.response?.status === 401 && !originalConfig._retry && !originalConfig.url.includes('/token/')) {
      console.log('Konfig 2')
      originalConfig._retry = true

      const refreshAccessToken = await refreshTokenCall()

      if (!refreshAccessToken || refreshAccessToken == "undefined") {
        return Promise.reject(error)
      } else {
        localStorage.setItem('accessToken', refreshAccessToken)
        originalConfig.headers.Authorization = `Bearer ${refreshAccessToken}`;
        return api(originalConfig)
      }
    }

    return Promise.reject(error)

  }

);