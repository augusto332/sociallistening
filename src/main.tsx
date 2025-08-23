import React from 'react'
import ReactDOM from 'react-dom/client'
import SocialListeningApp from './App'
import Login from './Login'
import Register from './Register'
import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { AuthProvider, useAuth } from './context/AuthContext'
import OnboardingHome from './OnboardingHome'

function Root() {
  const { session, loading } = useAuth()

  if (loading) return null

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={session ? <Navigate to="/app/mentions" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={session ? <Navigate to="/app/mentions" replace /> : <Register />}
        />
        <Route
          path="/app/mentions"
          element={
            <ProtectedRoute>
              <SocialListeningApp />
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
        <Route
          path="*"
          element={<Navigate to={session ? '/app/mentions' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Root />
    </AuthProvider>
  </React.StrictMode>,
)
