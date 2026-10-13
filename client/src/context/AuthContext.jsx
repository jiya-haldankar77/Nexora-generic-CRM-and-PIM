import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.data.user)
    } catch (err) {
      // Not authenticated is expected if no cookie
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const res = await api.post('/auth/login', { email, password })
      setUser(res.data.data.user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const signup = async (name, email, password) => {
    try {
      setError(null)
      const res = await api.post('/auth/signup', { name, email, password })
      setUser(res.data.data.user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Signup failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
      setUser(null)
    } catch (err) {
      // Still clear user state even if API call fails
      setUser(null)
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    checkAuth,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
