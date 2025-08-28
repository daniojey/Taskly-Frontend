import axios from "axios";
import { refreshTokenCall } from "./tokens_func";

export const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials:true ,
})


// api.interceptors.request.use((config) => {
//     console.log('Запрос перехвачен')
//     const csrfToken = getCSRFTokenFromCookie()
//     if (csrfToken) {
//         config.headers['X-CSRFToken'] = csrfToken
//     }
//     return config
// })

api.interceptors.response.use(
    response => response,
    async error => {
      if (!error.config) {
      return Promise.reject(error);
      }

      const originalConfig = error.config;
      console.log(error.config)

        // if (originalConfig?.metadata?.skipAuth) {
        //   return Promise.reject(error)
        // }
        // Пропускаем запросы на обновление токена, чтобы избежать рекурсии
        if (originalConfig.url.includes('/token/refresh/')) {
            // Если запрос на обновление токена вернул 401 - разлогиниваем
            if (error.response?.status === 404) {
                localStorage.removeItem('accessToken');
                console.log('ТОКЕНА НЕТ')
                // window.location.href = '/login/';
            }
            return Promise.reject(error);
        }

        if (originalConfig.url.includes('/token/verify/') && !originalConfig._retry && !originalConfig.url.includes('/login')) {
            originalConfig._retry = true;

                try {
                    // Делаем запрос на обновление токена без авторизации
                    // const refreshResponse = await refreshTokenCall();
                    const refreshResponse = localStorage.getItem('refreshToken')
                    console.log("RefreshRESPONSE",refreshResponse)

                    if (!refreshResponse || refreshResponse == 'undefined') {
                      return Promise.reject(error)
                    }

                    const newAccessToken =await refreshTokenCall(refreshResponse)
                    // console.log(refreshResponse)

                    localStorage.setItem('accessToken', newAccessToken);

                    try {

                      // const accessVerify = await api.post('/api/v1/token/verify/', {
                      //   // withCredentials: true,
                      //   // headers: {
                      //     //     Authorization: `Bearer ${auth.accessToken}`
                      //     // },
                      //     token: newAccessToken,
                      //   },
                      //   {
                      //     metadata: { skipAuth: true }
                      //   }
                      // )

                      // console.log("Запрос на токен", accessVerify)

                      originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;

                      if (originalConfig.url.includes('/token/verify/')) {
                        console.log('ВЕРИФИКАЦИЯ ТОКЕНА')
                        const configData = JSON.parse(originalConfig.data)
                        configData.token = newAccessToken
                        originalConfig.data = JSON.stringify(configData)
                        // console.log(configData)
                      }

                      // delete originalConfig._retry

                      return api(originalConfig)

                    } catch (error) {
                      return Promise.reject(error)
                    }
                    
                } catch (errorRefresh) {
                    console.error("ОШИБКА REFRESH", errorRefresh);
                    
                    // Очищаем токены при ошибке обновления
                    localStorage.removeItem('accessToken');
                    // window.location.href = '/login/'
                    return Promise.reject(errorRefresh);
                }

          }

          if (error.response?.status === 401 && !originalConfig._retry && !originalConfig.url.includes('/token/')) {
            originalConfig._retry = true

            const accessToken = localStorage.getItem('accessToken');

            // if (!accessToken) {

            // }
            const refreshToken = localStorage.getItem('refreshToken')
            const refreshAccessToken = await refreshTokenCall(refreshToken)
            // const refreshAccessToken = localStorage.getItem('refreshToken')
            console.log('ПОЛУЧЕНИЕ ТОКЕНА ИЗ СТОРЕДЖА')
            // const refreshAccessToken = await refreshTokenCall();
            console.log(refreshAccessToken)
            console.log(typeof refreshAccessToken)
            if (!refreshAccessToken || refreshAccessToken == "undefined") {
                console.log('ОШИБКА')
                // return Promise.reject(error)
            //   // const logout = api/post/logout
            //   try {
            //     const response = await api.post(
            //       "api/v1/token-logout/",
            //       {},
            //       {
            //         withCredentials: true
            //       }
            //     )
            //     console.log("LOGOUT RESPONSE",response)


                // window.location.href = '/login/';

            //   } catch (error) {
            //     window.location.href = '/';
            //   }

                return Promise.reject(error)

            } else {
              localStorage.setItem('accessToken', refreshAccessToken)

              originalConfig.headers.Authorization = `Bearer ${refreshAccessToken}`;

              return api(originalConfig)
            }

            console.log('КОД 401!!!!!!!!!')
          }

          return Promise.reject(error)
      
      }
    
);