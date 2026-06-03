import {useEffect, useState} from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'
import {setLogoutCallback} from './api/axiosApi'
import {getUser, logout} from './api/authApi'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import MessageListPage from "./pages/message/MessageListPage.jsx";
import MainLayout from "./layout/MainLayout.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import Map from "./components/Map.jsx";
import ExpenseListPage from "./pages/expense/ExpenseListPage.jsx";
import ProfilePage from "./pages/user/ProfilePage.jsx";


// Composant de route protégée
const ProtectedRoute = ({user, children}) => {
  return user ? children : <Navigate to="/login"/>
}

// Composant de route publique (redirige si déjà connecté)
const PublicRoute = ({user, children}) => {
  return user ? <Navigate to="/"/> : children
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await getUser()
        if (result.success && result.data) {
          setUser(result.data)
        }
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  useEffect(() => {
    setLogoutCallback(() => setUser(null))
  }, [])

  const handleLogout = async () => {
    if (!confirm("Voulez vous vraiment vous déconnecter?")) return
    const result = await logout()
    if (result.success) setUser(null)
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Chargement...</div>
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute user={user}>
            <LoginPage user={user || null} setUser={setUser}/>
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute user={user}>
            <RegisterPage user={user || null} setUser={setUser}/>
          </PublicRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute user={user}>
            <MainLayout user={user} onLogout={handleLogout}/>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<ExpenseListPage user={user}/>}/>
        <Route path="/message" element={<MessageListPage user={user}/>}/>
        <Route path="/map" element={<Map user={user}/>}/>
        <Route path="/profile" element={<ProfilePage user={user}/>}/>
      </Route>
      <Route path="*" element={<NotFoundPage/>}/>
    </Routes>
  )
}

export default App