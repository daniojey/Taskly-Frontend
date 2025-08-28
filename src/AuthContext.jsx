import React, { useState, useEffect, createContext } from "react";
import { api } from "../api";
import Cookies from "js-cookie";
import { verifyToken } from "../tokens_func";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(false)
    const [error, setError] = useState(null)
    const [authChecked, setAuthCheked] = useState(false);
    const [auth, setAuth] = useState({
        accessToken: null,
        refreshToken: null
    })

    useEffect(() => {
        const getCSRF = async () => {
            setLoading(true)
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
        }

        const checkAuth = async () => {
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
                setAuthCheked(false)
            } finally {
                setLoading(false);
                setAuthCheked(true)
            }
            
        }

        checkAuth()
        getCSRF()

        setLoading(false)
    }, [])

    const login = async (username, password) => {
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

            setUser(userResponse.user);
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
    }

    return (
        <AuthContext.Provider value={{user, login, isLogin, error, authChecked}}>
            {loading ? <div className="Loading-container">Loading...</div> : children}
        </AuthContext.Provider>
    )
}