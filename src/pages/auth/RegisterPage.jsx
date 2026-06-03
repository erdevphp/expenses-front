import {useState} from 'react'
import {Link, useNavigate} from "react-router-dom"
import RegisterForm from "../../components/Auth/RegisterForm.jsx"
import {FaUser} from "react-icons/fa";

const RegisterPage = ({user, setUser}) => {
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleRegisterSuccess = (userData) => {
    setUser(userData)
    navigate('/')
  }

  const handleRegisterError = (errorMessage) => {
    setError(errorMessage)
    setTimeout(() => setError(null), 5000)
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-white text-2xl"/>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Créer un compte
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Rejoignez Déclinaison Messenger
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        <RegisterForm
          onSuccess={handleRegisterSuccess}
          onError={handleRegisterError}
        />
      </div>
    </div>
  )
}

export default RegisterPage