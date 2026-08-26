import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export function getApiError(error, fallback = 'Không thể kết nối máy chủ.') {
  return error.response?.data?.message || fallback
}

export default api
