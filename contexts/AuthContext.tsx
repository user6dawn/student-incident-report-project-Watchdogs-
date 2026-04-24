'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase, Student } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  profile: Student | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const initializedRef = useRef(false)
  const lastAuthHandledRef = useRef<string | null>(null)

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId)
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('📊 Profile fetch result:', { data, error })
      if (error) throw error
      setProfile(data)
      console.log('✅ Profile set:', data)
    } catch (error) {
      console.error('❌ Error fetching profile:', error)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id)
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      if (initializedRef.current) return
      initializedRef.current = true
      try {
        console.log('🚀 Initializing auth...')
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        console.log('👤 Current user:', currentUser)
        setUser(currentUser)
        lastAuthHandledRef.current = currentUser?.id ?? null

        if (currentUser) {
          await fetchProfile(currentUser.id)
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error)
      } finally {
        console.log('🏁 Auth initialization complete')
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUserId = session?.user?.id ?? null
        if (lastAuthHandledRef.current === currentUserId && event === 'SIGNED_IN') {
          return
        }
        lastAuthHandledRef.current = currentUserId

        // When auth state changes (login/logout), mark as loading
        setLoading(true)

        ;(async () => {
          setUser(session?.user ?? null)

          if (session?.user) {
            await fetchProfile(session.user.id)
          } else {
            setProfile(null)
          }

          setLoading(false)
        })()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut: handleSignOut,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
