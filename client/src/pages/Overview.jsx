import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Plug,
  Plus,
  ArrowRight,
  RefreshCw,
  Package,
  Users,
  BarChart3,
  TrendingUp,
  DollarSign,
  Sparkles,
  ShoppingBag,
  ArrowUpRight,
  Star,
} from 'lucide-react'
import { getOverview, getResources } from '../api/client'
import { StatCard, Skeleton, Badge, EmptyState } from '../components/UI'
import { INITIAL_PRODUCTS, INITIAL_CUSTOMERS, INITIAL_ANALYTICS_DATA } from '../data/mockData'

export default function Overview() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, resourcesRes] = await Promise.allSettled([
        getOverview(),
        getResources(),
      ])

      if (overviewRes.status === 'fulfilled') {
        const fullResponse = overviewRes.value
        const overviewData = fullResponse?.data?.data
        setData(overviewData || null)
      }

      if (resourcesRes.status === 'fulfilled') {
        const resourcesData = resourcesRes.value?.data?.data
        setResources(Array.isArray(resourcesData) ? resourcesData : [])
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const stats = data || {}
  const recentRecords = stats.recentRecords || []
  const recentLogs = stats.recentLogs || stats.recentSyncLogs || []

  // Top products from mock catalog
  const topProducts = INITIAL_PRODUCTS.slice(0, 3)
  const topCustomers = INITIAL_CUSTOMERS.slice(0, 3)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
              Executive Overview
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: 20,
                background: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              Enterprise Mode
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Unified real-time pulse of product inventory, customer accounts, pipelines, and revenue performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchData}
            title="Refresh overview data"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link to="/products" className="btn btn-primary btn-sm">
            <Package size={15} />
            Explore Catalog
          </Link>
        </div>
      </div>

      {/* QUICK LAUNCH HERO BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 560, zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12, backdropFilter: 'blur(6px)' }}>
            <Sparkles size={13} color="#fde047" />
            <span>Award-Winning Workspace Released</span>
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.3 }}>
            Next-Gen Commerce & Analytics Dashboard
          </h3>
          <p style={{ color: '#c7d2fe', fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>
            Manage mock product inventory with high-res photography, view customer lifetime spend profiles, and forecast performance with interactive bar charts.
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
            <Link
              to="/products"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: '#ffffff',
                color: '#312e81',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
              }}
            >
              <Package size={15} /> View Products Catalog
            </Link>
            <Link
              to="/customers"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                backdropFilter: 'blur(6px)',
              }}
            >
              <Users size={15} /> Customers Directory
            </Link>
            <Link
              to="/analytics"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 13,
                textDecoration: 'none',
                backdropFilter: 'blur(6px)',
              }}
            >
              <BarChart3 size={15} /> Interactive Bar Chart
            </Link>
          </div>
        </div>

        {/* Mini Preview Widget */}
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 12,
            padding: '16px 20px',
            minWidth: 260,
            zIndex: 2,
          }}
        >
          <div style={{ fontSize: 12, color: '#c7d2fe', fontWeight: 600 }}>YTD Performance Run-Rate</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>
            $892,400.00
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: '#34d399', fontSize: 12, fontWeight: 600 }}>
            <ArrowUpRight size={14} /> +24.8% Pace vs Q3 Target
          </div>

          <div style={{ display: 'flex', gap: 4, marginTop: 14, alignItems: 'flex-end', height: 42 }}>
            {[35, 45, 55, 50, 68, 75, 82, 88, 95, 100].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: i === 9 ? '#38bdf8' : 'rgba(255,255,255,0.4)',
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
        }}
      >
        <StatCard
          icon={DollarSign}
          label="Total Annual Revenue"
          value="$892,400"
          change="+24.8% YoY growth"
          color="primary"
        />
        <StatCard
          icon={Package}
          label="Catalog Products"
          value="8 Live Items"
          change="Audio, Tech, Wearables"
          color="secondary"
        />
        <StatCard
          icon={Users}
          label="Verified Customers"
          value="8 Enterprise VIPs"
          change="Total spend $109,280"
          color="success"
        />
        <StatCard
          icon={Plug}
          label="Active Integrations"
          value="3 Channels Active"
          change="Shopify, WooCommerce, Stripe"
          color="accent"
        />
      </div>

      {/* TWO COLUMN SHOWCASE: Featured Catalog & Analytics Preview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
          gap: 24,
        }}
      >
        {/* Top Products Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={17} color="var(--primary)" />
                <span>Featured Catalog Inventory</span>
              </h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                High-converting product line with live mock stock tracking
              </p>
            </div>
            <Link to="/products" className="btn btn-ghost btn-sm">
              View Catalog <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate('/products')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.name}
                      </span>
                      <Badge variant="primary">{p.category}</Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: 12 }}>
                      <span className="font-bold">${p.price.toFixed(2)}</span>
                      <span className="text-muted">•</span>
                      <span style={{ color: '#10b981', fontWeight: 600 }}>{p.stock} units in stock</span>
                      <span className="text-muted">•</span>
                      <span style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', gap: 2 }}>
                        <Star size={11} fill="#f59e0b" /> {p.rating}
                      </span>
                    </div>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Customers Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Users size={17} color="#10b981" />
                <span>Top Enterprise Accounts</span>
              </h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                Highest lifetime value clients & recent order volume
              </p>
            </div>
            <Link to="/customers" className="btn btn-ghost btn-sm">
              View Directory <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => navigate('/customers')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 150ms ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                >
                  <img
                    src={c.avatar}
                    alt={c.name}
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                        {c.name}
                      </span>
                      <Badge variant={c.status === 'VIP' ? 'warning' : 'success'}>{c.status}</Badge>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {c.role} at {c.company} ({c.flag})
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="font-bold text-sm" style={{ color: '#10b981' }}>
                      ${c.spent.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {c.ordersCount} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE BAR CHART PREVIEW TEASER */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={19} color="var(--primary)" />
              <span>Monthly Revenue Trend & Analytics Engine</span>
            </h3>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              12-month performance trajectory with real-time input simulator
            </p>
          </div>
          <Link to="/analytics" className="btn btn-primary btn-sm">
            Open Full Analytics & Simulator <ArrowRight size={14} />
          </Link>
        </div>

        {/* Simplified preview bar chart */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 160, paddingTop: 10 }}>
          {INITIAL_ANALYTICS_DATA.map((item, idx) => {
            const heightPct = Math.round((item.revenue / 130000) * 100)
            return (
              <div
                key={item.month}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: 36,
                    height: `${heightPct}%`,
                    background: idx === 11 ? 'linear-gradient(180deg, #818cf8, #4f46e5)' : 'linear-gradient(180deg, #a5b4fc, #6366f1)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'transform 200ms ease',
                    cursor: 'pointer',
                  }}
                  title={`${item.month}: $${item.revenue.toLocaleString()}`}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scaleY(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scaleY(1)')}
                />
                <span style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>{item.month}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
