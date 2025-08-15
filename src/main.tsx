import React from 'react'
import ReactDOM from 'react-dom/client'
import SocialListeningApp from './App'
import Login from './Login'
import Register from './Register'
import './index.css'
import { FavoritesProvider } from './context/FavoritesContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'

function Root() {
  const { session, loading } = useAuth()

  if (loading) return null

  return (
    <FavoritesProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={session ? <Navigate to="/home" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={session ? <Navigate to="/home" replace /> : <Register />}
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <SocialListeningApp />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={session ? '/home' : '/login'} replace />}
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
