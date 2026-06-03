import axiosApi from './axiosApi.js'

const BASE_AUTH_URL = '/auth'

export const login = async (credentials) => {
  try {
    const response = await axiosApi.post(`${BASE_AUTH_URL}/login/`, credentials)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.response?.data?.detail || "Erreur de connexion",
      errors: error.response?.data
    }
  }
}

export const logout = async () => {
  try {
    await axiosApi.post(`${BASE_AUTH_URL}/logout/`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Erreur lors de la déconnexion" }
  }
}

export const register = async (userData) => {
  try {
    const response = await axiosApi.post(`${BASE_AUTH_URL}/registration/`, userData)
    return { success: true, data: response.data }
  } catch (error) {
    // Gérer les erreurs de validation (allauth)
    let errorMessage = "Erreur lors de l'inscription"

    if (error.response?.data) {
      // Erreurs classiques Django REST
      if (error.response.data.username) {
        errorMessage = error.response.data.username[0]
      } else if (error.response.data.email) {
        errorMessage = error.response.data.email[0]
      } else if (error.response.data.password1) {
        errorMessage = error.response.data.password1[0]
      } else if (error.response.data.password2) {
        errorMessage = error.response.data.password2[0]
      } else if (error.response.data.non_field_errors) {
        errorMessage = error.response.data.non_field_errors[0]
      } else if (error.response.data.detail) {
        errorMessage = error.response.data.detail
      }
    }

    return {
      success: false,
      message: errorMessage,
      errors: error.response?.data
    }
  }
}

export const getUser = async () => {
  try {
    const response = await axiosApi.get(`${BASE_AUTH_URL}/user/`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error(error)
    return { success: false, message: "Non authentifié" }
  }
}

export const updateUser = async (data) => {
  try {
    const response = await axiosApi.patch(`${BASE_AUTH_URL}/user/`, data)
    return { success: true, data: response.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.detail || "Erreur lors de la mise à jour"
    }
  }
}