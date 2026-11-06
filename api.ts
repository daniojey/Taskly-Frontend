import axios from "axios";
import { refreshTokenCall } from "./tokens_func";
import { useUser } from "./src/common/stores/AuthStore";

let refreshPromise: Promise<string> | null = null

export const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

const refreshAccessToken = () => 
  axios.post(`${import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000/'}api/v1/token/refresh/`, null, {withCredentials: true})
  .then(({ data }) => {
    if (!data.access) throw new Error("No access token")
      localStorage.setItem('accessToken', data.access)
    return data.access as string
  })

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config
      console.log('1')
      if (!original) return Promise.reject(error)

      console.log(original.url)
      const isAuthUrl = (original.url?.includes('/token/') || original.url?.includes('/login/')) && !original.url?.includes('/token/verify/')
      console.log(isAuthUrl)
      if (error.response?.status !== 401 || original._retry  || isAuthUrl) {
        console.log('2')
        return Promise.reject(error)
      }

      original._retry = true

      try {
        console.log("START GIVE TOKEn")
        refreshPromise ??= refreshAccessToken().finally(() => {refreshPromise = null})
        const token = await refreshPromise

        original.headers.Authorization = `Bearer ${token}`
        const configData = JSON.parse(original.data)
        configData.token = token
        original.data = JSON.stringify(configData)
        return api(original)
      } catch (e) {
        localStorage.removeItem('accessToken')
        useUser.setState({ user: null})
        return Promise.reject(e)
      }
    }
  )

// api.interceptors.response.use(
//   response => response,
//   async error => {
//     if (!error.config) {
//       return Promise.reject(error);
//     }

//     const originalConfig = error.config;

//     if (originalConfig.url.includes('/token/refresh/') && error.response?.status === 404) {
//       localStorage.removeItem('accessToken');
//       console.log('ТОКЕНА НЕТ')
//       return Promise.reject(error);
//     }

//     if (originalConfig.url.includes('/token/verify/') && !originalConfig._retry && !originalConfig.url.includes('/login')) {
//       console.log('KONFIG 1')
//       originalConfig._retry = true;

//       try {
//         const newAccessToken = await refreshTokenCall()
//         if (!newAccessToken || newAccessToken == 'undefined') {
//           return Promise.reject(error)
//         }

//         localStorage.setItem('accessToken', newAccessToken);

//         originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

//         if (originalConfig.url.includes('/token/verify/')) {
//           const configData = JSON.parse(originalConfig.data)
//           configData.token = newAccessToken
//           originalConfig.data = JSON.stringify(configData)
//         }

//         return api(originalConfig)

//       } catch (errorRefresh) {
//         localStorage.removeItem('accessToken');
//         return Promise.reject(errorRefresh);
//       }

//     }

//     if (error.response?.status === 401 && !originalConfig._retry && !originalConfig.url.includes('/token/')) {
//       console.log('Konfig 2')
//       originalConfig._retry = true

//       const refreshAccessToken = await refreshTokenCall()

//       if (!refreshAccessToken || refreshAccessToken == "undefined") {
//         return Promise.reject(error)
//       } else {
//         localStorage.setItem('accessToken', refreshAccessToken)
//         originalConfig.headers.Authorization = `Bearer ${refreshAccessToken}`;
//         return api(originalConfig)
//       }
//     }

//     return Promise.reject(error)

//   }

// );