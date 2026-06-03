import { useState } from 'react'
import { register } from '../../api/authApi'
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa'

const RegisterForm = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password1: '',
    password2: ''
  })
  const [fieldErrors, setFieldErrors] = useState({})

  // Vérification de la force du mot de passe
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: ''
  })

  const checkPasswordStrength = (password) => {
    let score = 0
    if (password.length >= 8) score++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++
    if (password.match(/\d/)) score++
    if (password.match(/[^a-zA-Z\d]/)) score++

    const messages = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

    setPasswordStrength({
      score,
      message: messages[score],
      color: colors[score]
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    if (name === 'password1') {
      checkPasswordStrength(value)
    }

    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFieldErrors({})

    const result = await register(formData)

    if (result.success) {
      onSuccess(result.data.user)
    } else {
      if (result.errors) {
        const errors = {}
        if (result.errors.username) errors.username = result.errors.username[0]
        if (result.errors.email) errors.email = result.errors.email[0]
        if (result.errors.password1) errors.password1 = result.errors.password1[0]
        if (result.errors.password2) errors.password2 = result.errors.password2[0]
        setFieldErrors(errors)
      }
      onError(result.message)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
      {/* Champ Username */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Nom d'utilisateur
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className={`text-sm ${fieldErrors.username ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="ex: anjar_dev"
            className={`
              w-full pl-10 pr-10 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${fieldErrors.username 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            required
          />
          {formData.username && !fieldErrors.username && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
          )}
        </div>
        {fieldErrors.username && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <FaTimesCircle size={12} /> {fieldErrors.username}
          </p>
        )}
      </div>

      {/* Champ Email */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaEnvelope className={`text-sm ${fieldErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ex: anjar@exemple.com"
            className={`
              w-full pl-10 pr-10 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${fieldErrors.email 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
          {formData.email && !fieldErrors.email && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
          )}
        </div>
        {fieldErrors.email && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <FaTimesCircle size={12} /> {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Champ Mot de passe */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className={`text-sm ${fieldErrors.password1 ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <input
            type={showPassword1 ? 'text' : 'password'}
            name="password1"
            value={formData.password1}
            onChange={handleChange}
            placeholder="••••••••"
            className={`
              w-full pl-10 pr-10 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${fieldErrors.password1 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword1(!showPassword1)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword1 ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>

        {/* Indicateur de force du mot de passe */}
        {formData.password1 && (
          <div className="mt-2 space-y-1">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    i < passwordStrength.score 
                      ? passwordStrength.color 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              Force : <span className="font-medium">{passwordStrength.message}</span>
            </p>
          </div>
        )}

        {fieldErrors.password1 && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <FaTimesCircle size={12} /> {fieldErrors.password1}
          </p>
        )}
      </div>

      {/* Champ Confirmation mot de passe */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className={`text-sm ${fieldErrors.password2 ? 'text-red-400' : 'text-gray-400'}`} />
          </div>
          <input
            type={showPassword2 ? 'text' : 'password'}
            name="password2"
            value={formData.password2}
            onChange={handleChange}
            placeholder="••••••••"
            className={`
              w-full pl-10 pr-10 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${fieldErrors.password2 
                ? 'border-red-500 bg-red-50' 
                : formData.password2 && formData.password1 === formData.password2
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }
            `}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword2(!showPassword2)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            {showPassword2 ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
          {formData.password2 && formData.password1 === formData.password2 && !fieldErrors.password2 && (
            <div className="absolute inset-y-0 right-0 pr-10 flex items-center">
              <FaCheckCircle className="text-green-500 text-sm" />
            </div>
          )}
        </div>
        {fieldErrors.password2 && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <FaTimesCircle size={12} /> {fieldErrors.password2}
          </p>
        )}
      </div>

      {/* Bouton d'inscription */}
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-2.5 rounded-lg font-medium text-white
          transition-all duration-200 transform
          ${loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg active:scale-[0.98]'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Création du compte...
          </span>
        ) : (
          'Créer un compte'
        )}
      </button>

      {/* Séparateur */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou</span>
        </div>
      </div>

      {/* Lien vers connexion */}
      <p className="text-center text-sm text-gray-600">
        Vous avez déjà un compte ?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
          Se connecter
        </a>
      </p>
    </form>
  )
}

export default RegisterForm