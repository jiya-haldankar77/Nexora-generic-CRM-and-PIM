import React from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Overview from './pages/Overview'
import Resources from './pages/Resources'
import ResourceBuilder from './pages/ResourceBuilder'
import Records from './pages/Records'
import RecordDetail from './pages/RecordDetail'
import Workflows from './pages/Workflows'
import Integrations from './pages/Integrations'
import SyncLogs from './pages/SyncLogs'
import AIAgent from './pages/AIAgent'
import { EmptyState } from './components/UI'
import { AlertTriangle, ArrowLeft } from 'lucide-react'

function NotFound() {
  return (
    <div className="card fade-in" style={{ marginTop: 40 }}>
      <div className="card-body">
        <EmptyState
          icon={AlertTriangle}
          title="404 — Page Not Found"
          description="The requested URL does not match any route in the NEXORA workspace."
          action={
            <Link to="/" className="btn btn-primary">
              <ArrowLeft size={16} /> Return to Dashboard
            </Link>
          }
        />
      </div>
    </div>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Overview />} />
      </Route>

      <Route path="/resources" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Resources />} />
        <Route path="builder" element={<ResourceBuilder />} />
        <Route path=":name/edit" element={<ResourceBuilder />} />
        <Route path=":name/records" element={<Records />} />
        <Route path=":name/records/:id" element={<RecordDetail />} />
      </Route>

      <Route path="/workflows" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Workflows />} />
      </Route>

      <Route path="/integrations" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Integrations />} />
      </Route>

      <Route path="/sync-logs" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<SyncLogs />} />
      </Route>

      <Route path="/ai-agent" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AIAgent />} />
      </Route>

      {/* Redirect old root to landing if not authenticated */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
      } />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
