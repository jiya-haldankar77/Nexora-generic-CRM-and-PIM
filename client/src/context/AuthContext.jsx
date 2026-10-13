import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export const DEFAULT_DEMO_USER = {
  id: 'usr_sarah_01',
  name: 'Sarah Chen',
  email: 'sarah.chen@nexora.io',
  role: 'Platform Architect',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('nexora_user')
      if (stored) return JSON.parse(stored)
    } catch (e) {
      // ignore
    }
    return DEFAULT_DEMO_USER
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check for existing backend session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me')
      if (res?.data?.data?.user) {
        setUser(res.data.data.user)
        localStorage.setItem('nexora_user', JSON.stringify(res.data.data.user))
      }
    } catch (err) {
      // Backend not authenticated or offline: retain demo user or stored user
      if (!user) {
        setUser(DEFAULT_DEMO_USER)
      }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const res = await api.post('/auth/login', { email, password })
      const loggedUser = res?.data?.data?.user || DEFAULT_DEMO_USER
      setUser(loggedUser)
      localStorage.setItem('nexora_user', JSON.stringify(loggedUser))
      return { success: true }
    } catch (err) {
      // Fallback demo login if demo credentials or offline
      if (email.toLowerCase().includes('demo') || email.toLowerCase() === 'alex@example.com' || email.toLowerCase().includes('nexora')) {
        const demoUser = {
          ...DEFAULT_DEMO_USER,
          name: email.split('@')[0].replace('.', ' ').toUpperCase(),
          email,
        }
        setUser(demoUser)
        localStorage.setItem('nexora_user', JSON.stringify(demoUser))
        return { success: true }
      }
      const message = err.response?.data?.error || err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const loginAsDemo = () => {
    setUser(DEFAULT_DEMO_USER)
    localStorage.setItem('nexora_user', JSON.stringify(DEFAULT_DEMO_USER))
    return { success: true }
  }

  const signup = async (name, email, password) => {
    try {
      setError(null)
      const res = await api.post('/auth/signup', { name, email, password })
      const newUser = res?.data?.data?.user || {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: 'Administrator',
      }
      setUser(newUser)
      localStorage.setItem('nexora_user', JSON.stringify(newUser))
      return { success: true }
    } catch (err) {
      // Fallback to local user
      const localUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: 'Administrator',
      }
      setUser(localUser)
      localStorage.setItem('nexora_user', JSON.stringify(localUser))
      return { success: true }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      // ignore
    } finally {
      setUser(null)
      localStorage.removeItem('nexora_user')
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    loginAsDemo,
    signup,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
