import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL as string

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('trobat_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('trobat_token')
      
      // Solo redirigimos si NO estamos ya en la pantalla de login
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
      
    }
    return Promise.reject(error)
  },
)
