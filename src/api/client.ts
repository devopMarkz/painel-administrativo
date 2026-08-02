import axios from 'axios'
import { useAuthStore } from '../stores/auth'

export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api' })
api.interceptors.request.use((config) => {
  const token = useAuthStore().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) useAuthStore().logout()
  return Promise.reject(error)
})
export const errorMessage = (error: unknown) => axios.isAxiosError(error) ? error.response?.data?.message || 'Não foi possível concluir a operação.' : 'Ocorreu um erro inesperado.'