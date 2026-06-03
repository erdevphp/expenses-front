import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { login } from '../../api/authApi.js'
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import {Link} from "react-router-dom";

const loginSchema = z.object({
  username: z.string().min(3, 'Nom d\'utilisateur trop court (min 3 caractères)'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
})

export default function LoginForm({ onSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data) => {
    setErrorMessage('')
    const result = await login(data)
    if (result.success) {
      onSuccess(result.data?.user || result.data)
    } else {
      setErrorMessage(result.message || 'Identifiants incorrects')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Message d'erreur global */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        </div>
      )}

      {/* Champ Username */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Nom d'utilisateur
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaUser className="text-gray-400 text-sm" />
          </div>
          <input
            {...register('username')}
            type="text"
            placeholder="Entrez votre nom d'utilisateur"
            className={`
              w-full pl-10 pr-3 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.username 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
        </div>
        {errors.username && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <span>⚠️</span> {errors.username.message}
          </p>
        )}
      </div>

      {/* Champ Password */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Mot de passe
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaLock className="text-gray-400 text-sm" />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Entrez votre mot de passe"
            className={`
              w-full pl-10 pr-10 py-2.5 border rounded-lg 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${errors.password 
                ? 'border-red-500 bg-red-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <span>⚠️</span> {errors.password.message}
          </p>
        )}
      </div>

      {/* Options supplémentaires */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">Se souvenir de moi</span>
        </label>
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
          Mot de passe oublié ?
        </a>
      </div>

      {/* Bouton de connexion */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`
          w-full py-2.5 rounded-lg font-medium text-white
          transition-all duration-200 transform
          ${isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]'
          }
        `}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connexion en cours...
          </span>
        ) : (
          'Se connecter'
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

      {/* Lien vers inscription */}
      <p className="text-center text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
          Créer un compte
        </Link>
      </p>
    </form>
  )
}