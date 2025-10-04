import React, { useState, useEffect, createContext, useMemo, useCallback } from "react";
import { api } from "../api";
import Cookies from "js-cookie";
import { verifyToken } from "../tokens_func";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState(null)
    const [showLoading, setShowLoading] = useState(true)
    console.log('🔄 AuthProvider создается/перерендеривается') 

    useEffect(() => {
        console.log('🚀 Инициализация сессии запущена')

        const inicializeSession = async () => {
            setLoading(true)
            try {
                try {
                    const response = await api.get('api/v1/csrf/')

                    // const data =await response.data
                    // console.log(data.csrfToken)
                    // console.log(response.headers)

                    const data = await response.data

                    // if (data) {
                    //     console.log(Cookies.get('csrftoken'))
                    // }
                    // const newToken = response.headers['csrftoken'];
                    // document.cookie = `csrftoken=${newToken}; Path=/; Secure; SameSite=None`;
                } catch (error) {
                    console.log(error)
                }


                try {
                    const accessTokenStorage = localStorage.getItem('accessToken')

                    const response = await verifyToken(accessTokenStorage)

                    if (response?.user) {
                        setUser(response?.user);
                        localStorage.setItem('user', JSON.stringify(response?.user))
                    } else {
                        setUser(null)
                        localStorage.removeItem('user')
                    }
                } catch (err) {
                    setUser(null)
                    localStorage.removeItem('user')
                } finally {
                }


            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
                setTimeout(() => {
                    setShowLoading(false)
                }, 1500)
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
            localStorage.setItem('refreshToken', response.data.refresh)



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
            console.error('Ошибка выхода:', err);
            setError(err);
            return false
        } finally {
            setIsLogin(false)
        }
    }, [])


    const logout = useCallback(async () => {
        
        try {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
        } catch (error) {
            console.error(error)
        }

        setUser(null)

        console.log('ВСЁ удалено')
    }, [])

    const contextValue =  useMemo(() => ({
        user,
        login,
        logout,
        loading,
        isLogin,
        error,
        showLoading
    }), [user, login, logout, loading, isLogin, error, showLoading])

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