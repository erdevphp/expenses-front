import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-9xl font-bold text-gray-300 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Page non trouvée</h1>
        <p className="text-gray-500 mb-6">Désolé, la page que vous cherchez n'existe pas sur ce site.</p>
        <Link
          to="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage