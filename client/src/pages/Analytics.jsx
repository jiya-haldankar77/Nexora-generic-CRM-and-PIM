import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingBag,
  Plus,
  RefreshCw,
  Sparkles,
  Sliders,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react'
import { INITIAL_ANALYTICS_DATA, CATEGORY_BREAKDOWN } from '../data/mockData'
import { Badge } from '../components/UI'

export default function Analytics() {
  const [dataPoints, setDataPoints] = useState(INITIAL_ANALYTICS_DATA)
  const [activeMetric, setActiveMetric] = useState('revenue') // 'revenue' | 'orders' | 'customers'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [growthMultiplier, setGrowthMultiplier] = useState(1.0) // 1.0 = 100%

  // Input form state for user to add / update data points
  const [inputMonth, setInputMonth] = useState('')
  const [inputRevenue, setInputRevenue] = useState('')
  const [inputTarget, setInputTarget] = useState('')
  const [inputOrders, setInputOrders] = useState('')
  const [inputCustomers, setInputCustomers] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)

  // Apply growth multiplier to data dynamically
  const displayData = useMemo(() => {
    return dataPoints.map((item) => ({
      ...item,
      adjustedRevenue: Math.round(item.revenue * growthMultiplier),
      adjustedTarget: Math.round(item.target * growthMultiplier),
      adjustedOrders: Math.round(item.orders * growthMultiplier),
      adjustedCustomers: Math.round(item.customers * growthMultiplier),
    }))
  }, [dataPoints, growthMultiplier])

  // Aggregate KPI Calculations
  const totalRevenue = useMemo(() => {
    return displayData.reduce((acc, d) => acc + d.adjustedRevenue, 0)
  }, [displayData])

  const totalOrders = useMemo(() => {
    return displayData.reduce((acc, d) => acc + d.adjustedOrders, 0)
  }, [displayData])

  const totalCustomers = useMemo(() => {
    return displayData.reduce((acc, d) => acc + d.adjustedCustomers, 0)
  }, [displayData])

  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Chart Max Scale Calculation
  const maxVal = useMemo(() => {
    if (activeMetric === 'revenue') {
      const highest = Math.max(...displayData.map((d) => Math.max(d.adjustedRevenue, d.adjustedTarget)))
      return highest * 1.15
    }
    if (activeMetric === 'orders') {
      const highest = Math.max(...displayData.map((d) => d.adjustedOrders))
      return highest * 1.2
    }
    const highest = Math.max(...displayData.map((d) => d.adjustedCustomers))
    return highest * 1.2
  }, [displayData, activeMetric])

  // Handle Form Submission for Adding / Updating Data Point
  const handleSaveDataPoint = (e) => {
    e.preventDefault()
    if (!inputMonth) return

    const rev = parseFloat(inputRevenue) || 50000
    const tar = parseFloat(inputTarget) || Math.round(rev * 0.95)
    const ord = parseInt(inputOrders, 10) || Math.round(rev / 120)
    const cust = parseInt(inputCustomers, 10) || Math.round(ord * 0.35)

    if (editingIndex !== null) {
      // Edit existing
      const updated = [...dataPoints]
      updated[editingIndex] = {
        ...updated[editingIndex],
        month: inputMonth,
        revenue: rev,
        target: tar,
        orders: ord,
        customers: cust,
      }
      setDataPoints(updated)
      setEditingIndex(null)
    } else {
      // Add new month
      const newPoint = {
        month: inputMonth,
        revenue: rev,
        target: tar,
        orders: ord,
        customers: cust,
        expenses: Math.round(rev * 0.35),
      }
      setDataPoints([...dataPoints, newPoint])
    }

    // Reset inputs
    setInputMonth('')
    setInputRevenue('')
    setInputTarget('')
    setInputOrders('')
    setInputCustomers('')
  }

  const handleStartEdit = (idx) => {
    const item = dataPoints[idx]
    setEditingIndex(idx)
    setInputMonth(item.month)
    setInputRevenue(item.revenue.toString())
    setInputTarget(item.target.toString())
    setInputOrders(item.orders.toString())
    setInputCustomers(item.customers.toString())
  }

  const handleDeleteMonth = (idx) => {
    if (dataPoints.length <= 2) return
    setDataPoints(dataPoints.filter((_, i) => i !== idx))
  }

  // Preset Scenarios
  const applyPreset = (preset) => {
    if (preset === 'reset') {
      setDataPoints(INITIAL_ANALYTICS_DATA)
      setGrowthMultiplier(1.0)
    } else if (preset === 'surge') {
      setGrowthMultiplier(1.35)
    } else if (preset === 'q4spike') {
      setDataPoints(
        dataPoints.map((d, i) =>
          i >= 8 ? { ...d, revenue: Math.round(d.revenue * 1.45), orders: Math.round(d.orders * 1.5) } : d
        )
      )
    } else if (preset === 'moderate') {
      setGrowthMultiplier(1.15)
    }
  }

  // Chart Dimensions
  const chartHeight = 280
  const chartWidth = 780
  const barWidth = Math.max(16, Math.min(36, Math.floor((chartWidth - 100) / displayData.length) - 14))

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
              Data Analytics & Simulation
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(139, 92, 246, 0.15) 100%)',
                color: 'var(--primary)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
              }}
            >
              Interactive Engine
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Real-time interactive SVG bar charts, revenue modeling, live data input editor, and forecasting simulator.
          </p>
        </div>

        {/* Quick Presets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => applyPreset('moderate')}
            title="Apply 15% growth projection"
          >
            <TrendingUp size={14} color="#10b981" /> +15% Growth
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => applyPreset('surge')}
            title="Apply 35% scaling projection"
          >
            <Sparkles size={14} color="#8b5cf6" /> 🚀 Surge (+35%)
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => applyPreset('reset')}
            title="Reset baseline values"
          >
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Adjusted Annual Revenue
            </span>
            <DollarSign size={18} color="#4f46e5" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            ${totalRevenue.toLocaleString()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +24.8% YoY
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>vs Prior Cycle</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #0ea5e9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Gross Orders Processed
            </span>
            <ShoppingBag size={18} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalOrders.toLocaleString()} Orders
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ color: '#0ea5e9', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +18.2%
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Throughput</span>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Avg. Order Value (AOV)
            </span>
            <TrendingUp size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            ${avgOrderValue.toFixed(2)}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Per Transaction Checkout</span>
        </div>

        <div className="card" style={{ padding: '18px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>
              Acquired Customers
            </span>
            <Users size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalCustomers.toLocaleString()} Clients
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> +31.4%
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Growth Rate</span>
          </div>
        </div>
      </div>

      {/* MAIN INTERACTIVE BAR CHART CARD */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Chart Top Header & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BarChart3 size={20} color="var(--primary)" />
              <span>Performance Bar Chart Visualization</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
              Hover over bars to inspect monthly comparisons, targets, and volume metrics.
            </p>
          </div>

          {/* Metric Selector Tabs */}
          <div
            style={{
              display: 'flex',
              background: '#f1f5f9',
              borderRadius: 'var(--radius)',
              padding: 3,
            }}
          >
            <button
              type="button"
              onClick={() => setActiveMetric('revenue')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeMetric === 'revenue' ? '#ffffff' : 'transparent',
                color: activeMetric === 'revenue' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: activeMetric === 'revenue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Revenue ($)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('orders')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeMetric === 'orders' ? '#ffffff' : 'transparent',
                color: activeMetric === 'orders' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: activeMetric === 'orders' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Order Volume
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('customers')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: activeMetric === 'customers' ? '#ffffff' : 'transparent',
                color: activeMetric === 'customers' ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow: activeMetric === 'customers' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              New Customers
            </button>
          </div>
        </div>

        {/* Live Growth Multiplier Slider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
            padding: '12px 18px',
            borderRadius: 10,
            border: '1px solid #e0e7ff',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sliders size={16} color="var(--primary)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Live Growth Forecast Multiplier:
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 }}>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.05"
              value={growthMultiplier}
              onChange={(e) => setGrowthMultiplier(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: '#4f46e5', cursor: 'pointer' }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: growthMultiplier >= 1 ? '#10b981' : '#ef4444',
                minWidth: 54,
              }}
            >
              {growthMultiplier >= 1 ? '+' : ''}{Math.round((growthMultiplier - 1) * 100)}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(180deg, #6366f1, #4f46e5)' }} />
              <span>Actual Value</span>
            </div>
            {activeMetric === 'revenue' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: '#cbd5e1' }} />
                <span>Target Plan</span>
              </div>
            )}
          </div>
        </div>

        {/* SVG BAR CHART CONTAINER */}
        <div style={{ width: '100%', overflowX: 'auto', position: 'relative', paddingTop: 20, paddingBottom: 10 }}>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            style={{ width: '100%', height: 'auto', minWidth: 620, overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="barGradientPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="barGradientTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </linearGradient>
            </defs>

            {/* Grid lines and Y-axis marks */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = 30 + (1 - pct) * (chartHeight - 70)
              const val = Math.round(pct * maxVal)
              const formatted =
                activeMetric === 'revenue'
                  ? `$${(val / 1000).toFixed(0)}k`
                  : val.toLocaleString()

              return (
                <g key={i}>
                  <line
                    x1="45"
                    y1={y}
                    x2={chartWidth - 20}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x="40"
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="11"
                    fontFamily="Inter, sans-serif"
                  >
                    {formatted}
                  </text>
                </g>
              )
            })}

            {/* Bars rendering */}
            {displayData.map((d, index) => {
              const count = displayData.length
              const availableWidth = chartWidth - 75
              const slotWidth = availableWidth / count
              const xCenter = 55 + index * slotWidth + slotWidth / 2

              // Determine bar value based on selected metric
              const actual =
                activeMetric === 'revenue'
                  ? d.adjustedRevenue
                  : activeMetric === 'orders'
                  ? d.adjustedOrders
                  : d.adjustedCustomers

              const target = activeMetric === 'revenue' ? d.adjustedTarget : 0

              const plotHeight = chartHeight - 70
              const actualHeight = Math.max(6, (actual / maxVal) * plotHeight)
              const targetHeight = target ? Math.max(6, (target / maxVal) * plotHeight) : 0

              const yActual = 30 + plotHeight - actualHeight
              const yTarget = target ? 30 + plotHeight - targetHeight : 0

              const isHovered = hoveredIndex === index

              return (
                <g
                  key={d.month + index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Subtle hover background highlight column */}
                  {isHovered && (
                    <rect
                      x={xCenter - slotWidth / 2 + 2}
                      y="20"
                      width={slotWidth - 4}
                      height={plotHeight + 20}
                      fill="#f8fafc"
                      rx="6"
                    />
                  )}

                  {/* Target Bar (if revenue) */}
                  {activeMetric === 'revenue' && targetHeight > 0 && (
                    <rect
                      x={xCenter - barWidth / 2}
                      y={yTarget}
                      width={barWidth}
                      height={targetHeight}
                      fill="url(#barGradientTarget)"
                      rx="4"
                      opacity="0.75"
                    />
                  )}

                  {/* Actual Main Bar */}
                  <rect
                    x={xCenter - barWidth / 2}
                    y={yActual}
                    width={barWidth}
                    height={actualHeight}
                    fill={isHovered ? 'url(#barGradientHover)' : 'url(#barGradientPrimary)'}
                    rx="4"
                    style={{
                      transition: 'height 250ms ease, y 250ms ease, fill 150ms ease',
                    }}
                  />

                  {/* Value label on top of bar when hovered or top values */}
                  {isHovered && (
                    <g>
                      <rect
                        x={xCenter - 40}
                        y={Math.max(10, yActual - 28)}
                        width="80"
                        height="22"
                        rx="4"
                        fill="#0f172a"
                      />
                      <text
                        x={xCenter}
                        y={Math.max(25, yActual - 13)}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="11"
                        fontWeight="600"
                      >
                        {activeMetric === 'revenue'
                          ? `$${actual.toLocaleString()}`
                          : actual.toLocaleString()}
                      </text>
                    </g>
                  )}

                  {/* Month Label (X-Axis) */}
                  <text
                    x={xCenter}
                    y={chartHeight - 16}
                    textAnchor="middle"
                    fill={isHovered ? '#4f46e5' : '#64748b'}
                    fontWeight={isHovered ? '700' : '500'}
                    fontSize="12"
                  >
                    {d.month}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Hovered Month Detail Inspector Card */}
        {hoveredIndex !== null && displayData[hoveredIndex] && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Month Selected
              </span>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayData[hoveredIndex].month} Detailed Breakdown
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5' }}>
                  ${displayData[hoveredIndex].adjustedRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Target Plan</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#64748b' }}>
                  ${displayData[hoveredIndex].adjustedTarget.toLocaleString()}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0ea5e9' }}>
                  {displayData[hoveredIndex].adjustedOrders}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>New Clients</span>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>
                  {displayData[hoveredIndex].adjustedCustomers}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DATA INPUT & EDIT PANEL (User input section!) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 1fr) 1.5fr',
          gap: 24,
        }}
      >
        {/* INPUT FORM: Add or Update data point */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={18} color="var(--primary)" />
              <span>{editingIndex !== null ? `Edit Month: ${inputMonth}` : 'Add / Update Month Data'}</span>
            </h3>
            {editingIndex !== null && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setEditingIndex(null)
                  setInputMonth('')
                  setInputRevenue('')
                  setInputTarget('')
                  setInputOrders('')
                  setInputCustomers('')
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Type any month and values below. The bar chart instantly recalculates and graphs your inputs!
          </p>

          <form onSubmit={handleSaveDataPoint} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label required">Month / Period Label</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Next Month or Q1"
                value={inputMonth}
                onChange={(e) => setInputMonth(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label required">Revenue ($)</label>
                <input
                  type="number"
                  required
                  className="form-control"
                  placeholder="85000"
                  value={inputRevenue}
                  onChange={(e) => setInputRevenue(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Revenue ($)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="75000"
                  value={inputTarget}
                  onChange={(e) => setInputTarget(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Total Orders</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="650"
                  value={inputOrders}
                  onChange={(e) => setInputOrders(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Customers</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="220"
                  value={inputCustomers}
                  onChange={(e) => setInputCustomers(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ marginTop: 8, justifyContent: 'center' }}
            >
              <Check size={16} />
              <span>{editingIndex !== null ? 'Save Changes' : 'Inject Data Point'}</span>
            </button>
          </form>
        </div>

        {/* IN-PLACE DATA EDITOR TABLE */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16 }}>Live Data Records Table</h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                Click "Edit" on any month to adjust its value and watch the bar chart adapt.
              </p>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {dataPoints.length} Periods Logged
            </span>
          </div>

          <div className="table-wrapper" style={{ maxHeight: 330, overflowY: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Target</th>
                  <th>Orders</th>
                  <th>New Clients</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {dataPoints.map((row, idx) => (
                  <tr key={row.month + idx}>
                    <td className="font-bold">{row.month}</td>
                    <td className="font-semibold" style={{ color: '#4f46e5' }}>
                      ${row.revenue.toLocaleString()}
                    </td>
                    <td className="text-muted">
                      ${row.target.toLocaleString()}
                    </td>
                    <td>{row.orders}</td>
                    <td>{row.customers}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => handleStartEdit(idx)}
                          title="Edit this data point"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          style={{ color: '#ef4444' }}
                          onClick={() => handleDeleteMonth(idx)}
                          title="Remove month"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECONDARY BREAKDOWN: Category Market Share */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          Revenue Contribution by Product Category
        </h3>
        <p className="text-xs text-muted" style={{ marginBottom: 20 }}>
          Proportional catalog sales performance and volume shares across inventory segments.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {CATEGORY_BREAKDOWN.map((cat) => (
            <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontWeight: 700, color: cat.color }}>
                    ${cat.revenue.toLocaleString()}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                    ({cat.percentage}%)
                  </span>
                </div>
              </div>
              <div style={{ width: '100%', height: 8, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${cat.percentage}%`,
                    background: cat.color,
                    borderRadius: 999,
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
