import React from 'react'
import ReactDOM from 'react-dom/client'
import SocialListeningApp from './App'
import Account from './Account'
import Login from './Login'
import Register from './Register'
import './index.css'
import { FavoritesProvider } from './context/FavoritesContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import OnboardingHome from './OnboardingHome'
import Landing from './Landing' // 👈 NUEVA IMPORTACIÓN
import Support from './Support'

function Root() {
  const { session, loading } = useAuth()

  if (loading) return null

  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Routes>

          {/* 👇 NUEVA RUTA PRINCIPAL */}
          <Route
            path="/"
            element={session ? <Navigate to="/app/mentions" replace /> : <Landing />}
          />

          <Route
            path="/login"
            element={session ? <Navigate to="/app/mentions" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={session ? <Navigate to="/app/mentions" replace /> : <Register />}
          />

          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <SocialListeningApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app/support"
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <OnboardingHome />
              </ProtectedRoute>
            }
          />

          {/* Cualquier otra ruta redirige según el estado de sesión */}
          <Route
            path="*"
            element={<Navigate to={session ? '/app/mentions' : '/login'} replace />}
          />
        </Routes>
      </BrowserRouter>
    </FavoritesProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
)
