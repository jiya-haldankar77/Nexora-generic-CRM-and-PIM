import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  Plus,
  Table,
  GitBranch,
  Plug,
  Activity,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  LogOut,
  User,
  Bot,
} from 'lucide-react'
import { getResources } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [resources, setResources] = useState([])
  const [recordsOpen, setRecordsOpen] = useState(true)
  const [error, setError] = useState(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchResList = async () => {
      try {
        const res = await getResources()
        if (isMounted) {
          const data = res?.data?.data
          setResources(Array.isArray(data) ? data : [])
          setError(null)
        }
      } catch (err) {
        console.error('Layout: Failed to fetch resources', err)
        if (isMounted) {
          setResources([])
          setError(err.message || 'Failed to load resources')
        }
      }
    }
    fetchResList()
    return () => {
      isMounted = false
    }
  }, [location.pathname])

  // Compute breadcrumbs and page title from route
  const pathParts = location.pathname.split('/').filter(Boolean)
  const getPageInfo = () => {
    try {
      if (pathParts.length === 0) {
        return { title: 'Overview', breadcrumbs: ['NEXORA', 'Dashboard'] }
      }
      if (pathParts[0] === 'resources') {
        if (pathParts[1] === 'builder') {
          return { title: 'Resource Builder', breadcrumbs: ['Resources', 'Create Schema'] }
        }
        if (pathParts[2] === 'edit') {
          return { title: `Edit ${pathParts[1]}`, breadcrumbs: ['Resources', pathParts[1], 'Edit'] }
        }
        if (pathParts[2] === 'records') {
          if (pathParts[3]) {
            return { title: `Record Details`, breadcrumbs: ['Resources', pathParts[1], 'Records', pathParts[3]] }
          }
          const resourceTitle = pathParts[1] ? `${pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)} Records` : 'Records'
          return { title: resourceTitle, breadcrumbs: ['Resources', pathParts[1] || 'Unknown', 'Records'] }
        }
        return { title: 'Resources', breadcrumbs: ['NEXORA', 'Resources'] }
      }
      if (pathParts[0] === 'workflows') {
        return { title: 'Workflows', breadcrumbs: ['NEXORA', 'Workflows'] }
      }
      if (pathParts[0] === 'integrations') {
        return { title: 'Integrations', breadcrumbs: ['NEXORA', 'Integrations'] }
      }
      if (pathParts[0] === 'ai-agent') {
        return { title: 'AI Agent', breadcrumbs: ['NEXORA', 'AI Agent'] }
      }
      if (pathParts[0] === 'sync-logs') {
        return { title: 'Sync Logs', breadcrumbs: ['NEXORA', 'Sync Logs'] }
      }
      return { title: 'NEXORA', breadcrumbs: ['Home'] }
    } catch (err) {
      console.error('Layout: getPageInfo error', err)
      return { title: 'NEXORA', breadcrumbs: ['Home'] }
    }
  }

  const { title, breadcrumbs } = getPageInfo()

  if (error) {
    return (
      <div style={{
        padding: '40px',
        background: '#fef2f2',
        color: '#991b1b',
        fontFamily: 'monospace',
        margin: '20px',
        borderRadius: '8px',
        border: '2px solid #fecaca'
      }}>
        <h2 style={{ marginTop: 0 }}>Layout Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Reload
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--workspace-bg)' }}>
      {/* Dark Navy Sidebar */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          background: 'var(--sidebar-bg)',
          color: 'var(--sidebar-text)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--sidebar-border)',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 50,
          overflowY: 'auto',
        }}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: 64,
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderBottom: '1px solid var(--sidebar-border)',
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
            }}
          >
            <Sparkles size={18} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#ffffff', fontWeight: 700, fontSize: 16, letterSpacing: '0.04em' }}>
              NEXORA
            </span>
            <span style={{ color: '#64748b', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
              SAAS PLATFORM
            </span>
          </div>
        </div>

        {/* Nav list */}
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '4px 10px 8px' }}>
            Menu
          </div>

          <NavLink
            to="/"
            end
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink
            to="/resources"
            end
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Database size={18} />
            <span>Resources</span>
          </NavLink>

          <NavLink
            to="/resources/builder"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Plus size={18} />
            <span>Resource Builder</span>
          </NavLink>

          {/* Submenu: Records */}
          <div>
            <button
              type="button"
              onClick={() => setRecordsOpen(!recordsOpen)}
              style={{
                ...navLinkStyle(location.pathname.includes('/records')),
                width: '100%',
                justifyContent: 'space-between',
                border: 'none',
                background: location.pathname.includes('/records') ? 'rgba(29, 78, 216, 0.15)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Table size={18} />
                <span>Records</span>
              </div>
              {recordsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {recordsOpen && (
              <div style={{ paddingLeft: 20, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!resources || resources.length === 0 ? (
                  <span style={{ fontSize: 12, color: '#64748b', padding: '6px 12px' }}>
                    No resources yet
                  </span>
                ) : (
                  resources.map((res) => (
                    <NavLink
                      key={res.name || res._id || Math.random()}
                      to={`/resources/${res.name}/records`}
                      style={({ isActive }) => ({
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 12px',
                        borderRadius: 6,
                        fontSize: 13,
                        color: isActive ? '#60a5fa' : '#94a3b8',
                        background: isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 150ms ease',
                      })}
                    >
                      <Layers size={13} />
                      <span className="truncate">{res.label || res.name}</span>
                    </NavLink>
                  ))
                )}
              </div>
            )}
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 10px 8px' }}>
            System
          </div>

          <NavLink
            to="/workflows"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <GitBranch size={18} />
            <span>Workflows</span>
          </NavLink>

          <NavLink
            to="/integrations"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Plug size={18} />
            <span>Integrations</span>
          </NavLink>

          <NavLink
            to="/ai-agent"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Bot size={18} />
            <span>AI Agent</span>
          </NavLink>

          <NavLink
            to="/sync-logs"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Activity size={18} />
            <span>Sync Logs</span>
          </NavLink>
        </div>

        {/* Footer info in sidebar */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--sidebar-border)',
            fontSize: 12,
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="status-dot green" />
            <span>API Online :5001</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: 240,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Top Header Bar */}
        <header
          style={{
            height: 64,
            background: '#ffffff',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 32px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span>/</span>}
                  <span style={{ color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'inherit', fontWeight: idx === breadcrumbs.length - 1 ? 500 : 400 }}>
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/resources/builder" className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>New Resource</span>
            </Link>
            
            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#1e293b'
                }}
              >
                <User size={18} />
                <span>{user?.name || 'User'}</span>
              </button>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  minWidth: '160px',
                  zIndex: 50
                }}>
                  <button
                    onClick={logout}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '14px',
                      color: '#1e293b',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main style={{ padding: '32px', flex: 1 }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function navLinkStyle(isActive) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '9px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    textDecoration: 'none',
    color: isActive ? '#ffffff' : '#94a3b8',
    background: isActive ? '#1d4ed8' : 'transparent',
    transition: 'background 150ms ease, color 150ms ease',
  }
}
