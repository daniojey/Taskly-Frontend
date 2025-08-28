import { api } from "./api";

export async function refreshTokenCall(token) {
    try {
        const response = await api.post(
            'api/v1/token/refresh/',
            {
                refresh: token
            }, // пустое тело запроса
            {
                withCredentials: true, // перенесите сюда
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )

        return response.data.access

    } catch (error) {
        // console.error(error)
        return null
    }
}

export async function verifyToken(token) {
    // const accessToken = localStorage.getItem('accessToken');
    // console.log('ACCESS TOKEN', token)

    try {
        const response = await api.post(
            '/api/v1/token/verify/',
            {
                token: token
            }
        )

        return response.data
    } catch (error) {
        // console.error(error)
        return null
    }
}