import LoginForm from "../../components/Auth/LoginForm.jsx";
import {Link, useNavigate} from "react-router-dom";

const LoginPage = ({user, setUser}) => {
  const navigate = useNavigate()
  const handleLoginSuccess = (userData) => {
    setUser(userData)
    navigate('/')
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <h1 className="text-center mb-4 text-xl">Welcome to Déclinaison</h1>
      <LoginForm onSuccess={handleLoginSuccess}></LoginForm>
    </div>
  )
}

export default LoginPage