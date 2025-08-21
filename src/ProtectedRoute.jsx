import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  const [checkingKeywords, setCheckingKeywords] = useState(true)
  const [hasKeywords, setHasKeywords] = useState(false)

  useEffect(() => {
    const checkKeywords = async () => {
      if (!session) {
        setCheckingKeywords(false)
        setHasKeywords(false)
        return
      }

      const { count, error } = await supabase
        .from('dim_keywords')
        .select('keyword_id', { count: 'exact', head: true })
      if (error) {
        console.error('Error checking keywords', error)
      }
      setHasKeywords((count ?? 0) > 0)
      setCheckingKeywords(false)
    }
    checkKeywords()
  }, [session, location.pathname])

  if (loading || checkingKeywords) return null
  if (!session) return <Navigate to="/login" replace />

  if (!hasKeywords && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (hasKeywords && location.pathname === '/onboarding') {
    return <Navigate to="/app/mentions" replace />
  }

  return children
}
