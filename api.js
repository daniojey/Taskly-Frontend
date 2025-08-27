import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:1000',
    headers: {
        'Content-Type': 'application/json',
    },
})