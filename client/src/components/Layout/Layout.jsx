import React, { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Users,
  BarChart3,
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
  Search,
  Bell,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react'
import { getResources } from '../../api/client'
import { useAuth } from '../../context/AuthContext'

export default function Layout() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [resources, setResources] = useState([])
  const [recordsOpen, setRecordsOpen] = useState(false)
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
        // Silently handle if server offline in demo mode
        if (isMounted) {
          setResources([])
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
      if (pathParts.length === 0 || pathParts[0] === 'dashboard') {
        return { title: 'System Overview', breadcrumbs: ['NEXORA', 'Dashboard'] }
      }
      if (pathParts[0] === 'products') {
        return { title: 'Products & Catalog', breadcrumbs: ['NEXORA', 'Commerce', 'Products'] }
      }
      if (pathParts[0] === 'customers') {
        return { title: 'Customers Directory', breadcrumbs: ['NEXORA', 'CRM', 'Customers'] }
      }
      if (pathParts[0] === 'analytics') {
        return { title: 'Data Analytics & Simulation', breadcrumbs: ['NEXORA', 'Intelligence', 'Analytics'] }
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
          const resourceTitle = pathParts[1]
            ? `${pathParts[1].charAt(0).toUpperCase() + pathParts[1].slice(1)} Records`
            : 'Records'
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
      return { title: 'NEXORA Platform', breadcrumbs: ['NEXORA', 'Home'] }
    } catch (err) {
      console.error('Layout: getPageInfo error', err)
      return { title: 'NEXORA Platform', breadcrumbs: ['Home'] }
    }
  }

  const { title, breadcrumbs } = getPageInfo()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--workspace-bg)' }}>
      {/* Dark Slate Premium Sidebar */}
      <aside
        style={{
          width: 250,
          minWidth: 250,
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
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 3px 12px rgba(99, 102, 241, 0.45)',
            }}
          >
            <Sparkles size={19} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#ffffff', fontWeight: 800, fontSize: 16, letterSpacing: '0.04em' }}>
              NEXORA
            </span>
            <span style={{ color: '#818cf8', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
              ENTERPRISE SUITE
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <div style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 10px 4px' }}>
            Core Workspace
          </div>

          <NavLink
            to="/dashboard"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <LayoutDashboard size={18} />
            <span style={{ flex: 1 }}>Overview</span>
          </NavLink>

          <NavLink
            to="/products"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Package size={18} />
            <span style={{ flex: 1 }}>Products</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              CATALOG
            </span>
          </NavLink>

          <NavLink
            to="/customers"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Users size={18} />
            <span style={{ flex: 1 }}>Customers</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 10,
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              VIP
            </span>
          </NavLink>

          <NavLink
            to="/analytics"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <BarChart3 size={18} />
            <span style={{ flex: 1 }}>Data Analytics</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 10,
                background: 'rgba(99, 102, 241, 0.25)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
              }}
            >
              LIVE
            </span>
          </NavLink>

          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 10px 4px' }}>
            Data Architecture
          </div>

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
            <span>Schema Builder</span>
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
                background: location.pathname.includes('/records') ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Table size={18} />
                <span>Custom Records</span>
              </div>
              {recordsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {recordsOpen && (
              <div style={{ paddingLeft: 20, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {!resources || resources.length === 0 ? (
                  <span style={{ fontSize: 12, color: '#64748b', padding: '6px 12px' }}>
                    No custom tables
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
                        color: isActive ? '#818cf8' : '#94a3b8',
                        background: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
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

          <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '16px 10px 4px' }}>
            Automation & AI
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
            <span>AI Copilot</span>
          </NavLink>

          <NavLink
            to="/sync-logs"
            style={({ isActive }) => navLinkStyle(isActive)}
          >
            <Activity size={18} />
            <span>Sync Audit Logs</span>
          </NavLink>
        </div>

        {/* Footer info in sidebar */}
        <div
          style={{
            padding: '14px 18px',
            borderTop: '1px solid var(--sidebar-border)',
            fontSize: 12,
            color: '#64748b',
            background: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="status-dot green" />
              <span style={{ color: '#cbd5e1', fontWeight: 500 }}>System Live</span>
            </div>
            <span style={{ fontSize: 11, color: '#64748b', fontFamily: 'monospace' }}>v2.4.0</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        style={{
          marginLeft: 250,
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
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Breadcrumbs and Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb}>
                  {idx > 0 && <span>/</span>}
                  <span
                    style={{
                      color: idx === breadcrumbs.length - 1 ? 'var(--text-primary)' : 'inherit',
                      fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                    }}
                  >
                    {crumb}
                  </span>
                </React.Fragment>
              ))}
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {title}
            </h1>
          </div>

          {/* Quick Header Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/products" className="btn btn-secondary btn-sm" style={{ fontSize: 13 }}>
                <Package size={14} /> Catalog
              </Link>
              <Link to="/analytics" className="btn btn-secondary btn-sm" style={{ fontSize: 13 }}>
                <BarChart3 size={14} /> Analytics
              </Link>
            </div>

            {/* Notification Bell */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                position: 'relative',
              }}
              title="Notifications"
            >
              <Bell size={17} color="#64748b" />
              <span
                style={{
                  position: 'absolute',
                  top: 7,
                  right: 7,
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: '#ef4444',
                }}
              />
            </div>

            {/* User Profile Pill Menu */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '4px 12px 4px 6px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 24,
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#1e293b',
                  transition: 'background 150ms ease, border-color 150ms ease',
                }}
              >
                <img
                  src={
                    user?.avatar ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
                  }
                  alt={user?.name || 'User'}
                  style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
                />
                <span>{user?.name || 'Sarah Chen'}</span>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {userMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    marginTop: 6,
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: 10,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    minWidth: 200,
                    zIndex: 60,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>
                      {user?.name || 'Sarah Chen'}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {user?.email || 'sarah.chen@nexora.io'}
                    </div>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 16px',
                      fontSize: 13,
                      color: 'var(--text-secondary)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid #f1f5f9',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '13px',
                      color: '#ef4444',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
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
    fontSize: 13,
    fontWeight: isActive ? 600 : 500,
    textDecoration: 'none',
    color: isActive ? '#ffffff' : '#94a3b8',
    background: isActive ? 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' : 'transparent',
    boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.35)' : 'none',
    transition: 'all 150ms ease',
  }
}
