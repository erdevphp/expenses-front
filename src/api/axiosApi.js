import axios from 'axios'

const REFRESH_URL = import.meta.env.VITE_REFRESH_URL

const axiosApi = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let logoutCallback = null

export const setLogoutCallback = (callback) => {
  logoutCallback = callback
}

axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes(REFRESH_URL)) {
      originalRequest._retry = true

      try {
        await axiosApi.post(REFRESH_URL)
        return axiosApi(originalRequest)
      } catch (refreshError) {
        if (logoutCallback) {
          logoutCallback()
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosApi