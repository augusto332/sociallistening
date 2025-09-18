import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  plan: 'free',
  planLoading: true,
})

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('free')
  const [planLoading, setPlanLoading] = useState(true)

  useEffect(() => {
    const fetchUserPlan = async (currentSession) => {
      if (currentSession?.user) {
        setPlanLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('plan')
          .eq('id', currentSession.user.id)
          .single()

        if (!error && data?.plan) {
          setPlan(data.plan)
        } else {
          setPlan('free')
        }
        setPlanLoading(false)
        return
      }

      setPlan('free')
      setPlanLoading(false)
    }

    const initSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setSession(session)
      await fetchUserPlan(session)
      setLoading(false)
    }
    initSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      fetchUserPlan(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user, loading, plan, planLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
