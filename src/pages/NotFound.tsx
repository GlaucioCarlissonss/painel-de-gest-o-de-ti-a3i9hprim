/* 404 Page - Displays when a user attempts to access a non-existent route - em Português do Brasil */
import { useLocation, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error('404 Error: Rota não encontrada:', location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F5F9] p-4 text-[#0F172A]">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">404</h1>
        <p className="text-lg font-semibold text-slate-800 mb-1">Página não encontrada</p>
        <p className="text-sm text-slate-500 mb-6">
          A rota que você tentou acessar não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Dashboard</span>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
