import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types'
import { observeAuthState, getUserProfile, signOut } from '@/lib/dataProvider'

interface AuthContextType {
  firebaseUser: any | null // Can be Firebase user or mock user
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('🏗️ AuthProvider: Component rendering')

  const [firebaseUser, setFirebaseUser] = useState<any | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  console.log('🏗️ AuthProvider: Current state - user:', user, 'loading:', loading)

  useEffect(() => {
    console.log('🔐 AuthContext: useEffect running - Setting up auth state observer')

    const unsubscribe = observeAuthState(async (authUser) => {
      try {
        console.log('🔐 AuthContext: ⚡ Auth state callback triggered:', authUser)
        setFirebaseUser(authUser)

        if (authUser) {
          // Fetch user profile from Firestore or mock database
          console.log('🔐 AuthContext: Fetching user profile for', authUser.uid)
          const userProfile = await getUserProfile(authUser.uid)
          console.log('🔐 AuthContext: User profile loaded:', userProfile)
          setUser(userProfile)
        } else {
          console.log('🔐 AuthContext: No user, clearing state')
          setUser(null)
        }

        setLoading(false)
      } catch (error) {
        console.error('🔐 AuthContext: Error in auth state callback:', error)
        setUser(null)
        setLoading(false)
      }
    })

    console.log('🔐 AuthContext: Observer registered, unsubscribe function:', typeof unsubscribe)

    return () => {
      console.log('🔐 AuthContext: Cleaning up observer')
      unsubscribe()
    }
  }, [])

  const value = {
    firebaseUser,
    user,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
