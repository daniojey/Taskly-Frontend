import React, { useState, useEffect, createContext, useMemo, useCallback } from "react";
import { api } from "../api";
import Cookies from "js-cookie";
import { getAccessToken, verifyToken } from "../tokens_func";
import { useUser } from "./common/stores/AuthStore";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const removeUser = useUser((state) => state.removeUser)
    const {user, setUser} = useUser()
    const [notifications, setNotifications] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState(null)
    const [showLoading, setShowLoading] = useState(true)
    console.log('🔄 AuthProvider создается/перерендеривается') 

    const updateNotify = useCallback(async () => {
            try {
                const response = await api.get(
                    'api/v1/notifications/',
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )

                console.log(response)
                setNotifications(response.data.results)
            } catch (error) {
                console.error(error)
            }
    }, [])

    useEffect(() => {
        console.log('🚀 Инициализация сессии запущена')

         const getNotifications = async () => {
            console.log('🚀 Инициализация уведомлений')
            try {
                const response = await api.get(
                    'api/v1/notifications/',
                    {headers: {
                        Authorization: getAccessToken()
                    }}
                )

                console.log(response)
                setNotifications(response.data.results)

                return true
            } catch (error) {
                console.error(error)
                return false
            }
        }

        const inicializeSession = async () => {
            setLoading(true)
            try {
                try {
                    const response = await api.get('api/v1/csrf/')

                    const data = await response.data
                } catch (error) {
                    console.log(error)
                }


                try {
                    const accessTokenStorage = localStorage.getItem('accessToken')

                    const response = await verifyToken(accessTokenStorage)

                    if (response?.user) {
                        setUser(response?.user);
                        localStorage.setItem('user', JSON.stringify(response?.user))
                        const resultNotify = await getNotifications()


                    } else {
                        removeUser()
                        localStorage.removeItem('user')
                    }
                } catch (err) {
                    removeUser()
                    localStorage.removeItem('user')
                } finally {
                    setLoading(false)
                    setShowLoading(false)
                }


            } catch (error) {
                console.log(error)
            }
        }

        inicializeSession()

    }, [])

    const login = useCallback(async (username, password) => {
        try {
            const response = await api.post('/api/v1/token/',
                { username, password },
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )


            console.log(response.data)
            localStorage.setItem('accessToken', response.data.access)

            const userResponse = await api.post(
                'api/v1/token/verify/',
                {
                    withCredentials: true,
                    token: response.data.access
                },
            )

            setUser(userResponse.data.user);
            setError(null)
            console.log(userResponse.user)
            return true
        } catch (error) {
            console.error('Ошибка входа:', err);
            setError(err);
            return false
        } finally {
            setIsLogin(false)
        }
    }, [])


    const logout = useCallback(async () => {
        
        try {
            localStorage.removeItem('accessToken')
            const response = await api.post(
                'api/v1/token/logout/',
                {},
                {},
            )

            if (response.status === 200) {
                console.log('SUCCESS!')
            } 


        } catch (error) {
            console.error(error)
        }

        removeUser()

        console.log('ВСЁ удалено')
    }, [])

    const contextValue =  useMemo(() => ({
        user,
        login,
        logout,
        loading,
        isLogin,
        error,
        showLoading,
        notifications,
        updateNotify
    }), [user, login, logout, loading, isLogin, error, showLoading, notifications, updateNotify])

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
            
            {showLoading && (
                <div className={`loading-overlay ${!loading ? 'fade-out' : ''}`}>
                    <div className="Loading-container">
                        Loading...
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    )
}