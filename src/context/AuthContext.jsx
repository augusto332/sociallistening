import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const AuthContext = createContext({
  session: null,
  user: null,
  loading: true,
  plan: 'free',
  planLoading: true,
  role: 'contributor',
  accountId: undefined,
})

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState('free')
  const [planLoading, setPlanLoading] = useState(true)
  const [role, setRole] = useState('contributor')
  const [accountId, setAccountId] = useState(undefined)

  useEffect(() => {
    const fetchUserPlan = async (currentSession) => {
      if (currentSession?.user) {
        setPlanLoading(true)
        const { data, error } = await supabase
          .from('profiles')
          .select('plan, role, account_id')
          .eq('user_id', currentSession.user.id)
          .single()

        const nextPlan = data?.plan || 'free'
        const nextRole = data?.role || 'contributor'
        const nextAccountId = data?.account_id ?? null

        if (!error) {
          setPlan(nextPlan)
          setRole(nextRole)
          setAccountId(nextAccountId)
        } else {
          setPlan('free')
          setRole('contributor')
          setAccountId(null)
        }
        setPlanLoading(false)
        return
      }

      setPlan('free')
      setRole('contributor')
      setAccountId(null)
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
      value={{ session, user: session?.user, loading, plan, planLoading, role, accountId }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
