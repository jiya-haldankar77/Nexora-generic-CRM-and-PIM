import React, { useState, useMemo } from 'react'
import {
  Users,
  Search,
  Plus,
  LayoutGrid,
  List,
  Mail,
  Building,
  DollarSign,
  ShoppingBag,
  Globe,
  Clock,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import { INITIAL_CUSTOMERS } from '../data/mockData'
import { Badge, Modal } from '../components/UI'

export default function Customers() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('spent') // 'spent' | 'orders' | 'name'

  // Modals
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    company: '',
    role: '',
    status: 'Active',
    spent: '',
    ordersCount: '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    country: 'United States',
    flag: '🇺🇸',
    tags: 'Direct Client',
  })

  // Filtered & sorted customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.company.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'spent') return b.spent - a.spent
        if (sortBy === 'orders') return b.ordersCount - a.ordersCount
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0
      })
  }, [customers, searchTerm, statusFilter, sortBy])

  // Summary Metrics
  const totalCustomerSpend = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.spent, 0)
  }, [customers])

  const totalOrders = useMemo(() => {
    return customers.reduce((acc, c) => acc + c.ordersCount, 0)
  }, [customers])

  const averageLTV = customers.length ? totalCustomerSpend / customers.length : 0

  const handleAddCustomer = (e) => {
    e.preventDefault()
    if (!newCustomer.name || !newCustomer.email) return

    const customerToAdd = {
      id: `cst-${Date.now()}`,
      name: newCustomer.name,
      email: newCustomer.email,
      company: newCustomer.company || 'Independent Enterprise',
      role: newCustomer.role || 'Managing Director',
      status: newCustomer.status,
      spent: parseFloat(newCustomer.spent) || 1200.0,
      ordersCount: parseInt(newCustomer.ordersCount, 10) || 1,
      avatar: newCustomer.avatar,
      country: newCustomer.country,
      flag: newCustomer.flag,
      joinDate: 'Just now',
      lastActive: 'Active now',
      tags: newCustomer.tags ? newCustomer.tags.split(',').map((t) => t.trim()) : ['Onboarded'],
    }

    setCustomers([customerToAdd, ...customers])
    setIsAddModalOpen(false)
    setNewCustomer({
      name: '',
      email: '',
      company: '',
      role: '',
      status: 'Active',
      spent: '',
      ordersCount: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      country: 'United States',
      flag: '🇺🇸',
      tags: 'Direct Client',
    })
  }

  const handleDeleteCustomer = (id) => {
    setCustomers(customers.filter((c) => c.id !== id))
    if (selectedCustomer?.id === id) {
      setSelectedCustomer(null)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
              Customers Directory
            </h2>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.15) 100%)',
                color: '#059669',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              {customers.length} Accounts Active
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            High-value enterprise clients, verified buyer accounts, purchase histories, and lifetime value tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle between Grid & Table */}
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 3,
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'grid' ? 'var(--primary-light)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              <LayoutGrid size={15} />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: viewMode === 'table' ? 'var(--primary-light)' : 'transparent',
                color: viewMode === 'table' ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              <List size={15} />
              <span>Table</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Revenue Collected</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            ${totalCustomerSpend.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>From Verified Accounts</span>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Average Lifetime Value (LTV)</span>
            <TrendingUp size={18} color="#4f46e5" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            ${averageLTV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Per Customer Account</span>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Completed Orders</span>
            <ShoppingBag size={18} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalOrders} Orders
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Processed via Platform</span>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>VIP Accounts</span>
            <Sparkles size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {customers.filter((c) => c.status === 'VIP').length} Clients
          </div>
          <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>High-Frequency Buyers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: 16,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', flex: 1, minWidth: 280 }}>
          {/* Search */}
          <div style={{ position: 'relative', width: 260 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search customer, email, firm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 36, height: 38 }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Tier:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
              style={{ height: 38, padding: '0 10px', fontSize: 13 }}
            >
              <option value="All">All Tiers</option>
              <option value="VIP">VIP Tier</option>
              <option value="Active">Active</option>
              <option value="At-Risk">At-Risk</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ArrowUpDown size={15} color="var(--text-secondary)" />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ height: 38, padding: '0 10px', fontSize: 13 }}
          >
            <option value="spent">Highest Spend (LTV)</option>
            <option value="orders">Most Orders</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* CUSTOMER DIRECTORY VIEW: Cards Grid */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 20,
          }}
        >
          {filteredCustomers.map((cust) => {
            const isVip = cust.status === 'VIP'
            const isAtRisk = cust.status === 'At-Risk'

            return (
              <div
                key={cust.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 20,
                  gap: 16,
                  transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                  border: isVip ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--card-border)',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.07)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                }}
                onClick={() => setSelectedCustomer(cust)}
              >
                {/* Header with Avatar and Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={cust.avatar}
                        alt={cust.name}
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: isVip ? '2px solid #f59e0b' : '2px solid #e2e8f0',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          fontSize: 14,
                        }}
                      >
                        {cust.flag}
                      </span>
                    </div>

                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {cust.name}
                      </h4>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {cust.role}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      isVip ? 'warning' : cust.status === 'Active' ? 'success' : isAtRisk ? 'danger' : 'muted'
                    }
                  >
                    {cust.status}
                  </Badge>
                </div>

                {/* Company and Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)' }}>
                    <Building size={14} color="var(--text-muted)" />
                    <span className="truncate">{cust.company}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: 12 }}>
                    <Mail size={14} />
                    <span className="truncate">{cust.email}</span>
                  </div>
                </div>

                {/* Metrics Box */}
                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 8,
                    padding: '10px 14px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 8,
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Lifetime Spend</span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#10b981' }}>
                      ${cust.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Orders Placed</span>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cust.ordersCount} orders
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: 'var(--text-muted)',
                    marginTop: 'auto',
                    paddingTop: 8,
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    <span>{cust.lastActive}</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11, padding: '4px 8px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCustomer(cust)
                    }}
                  >
                    View 360° Profile
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Company & Role</th>
                  <th>Location</th>
                  <th>Lifetime Spend</th>
                  <th>Orders</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedCustomer(c)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={c.avatar}
                          alt={c.name}
                          style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                            {c.name}
                          </div>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-sm">{c.company}</div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.role}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: 14 }}>{c.flag} {c.country}</span>
                    </td>
                    <td className="font-bold" style={{ color: '#10b981' }}>
                      ${c.spent.toFixed(2)}
                    </td>
                    <td>
                      <span className="font-semibold">{c.ordersCount}</span>
                    </td>
                    <td>
                      <Badge
                        variant={
                          c.status === 'VIP'
                            ? 'warning'
                            : c.status === 'Active'
                            ? 'success'
                            : c.status === 'At-Risk'
                            ? 'danger'
                            : 'muted'
                        }
                      >
                        {c.status}
                      </Badge>
                    </td>
                    <td className="text-muted text-xs">{c.lastActive}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 6 }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedCustomer(c)
                          }}
                          title="View 360 profile"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-icon"
                          style={{ color: '#ef4444' }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteCustomer(c.id)
                          }}
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOMER 360 MODAL */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Customer 360° Profile — ${selectedCustomer.name}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteCustomer(selectedCustomer.id)}
              >
                <Trash2 size={14} /> Remove Account
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedCustomer(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Top Identity banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: 16,
                background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
                borderRadius: 12,
                border: '1px solid #e0e7ff',
              }}
            >
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.name}
                style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: 20, margin: 0 }}>{selectedCustomer.name}</h3>
                  <Badge variant={selectedCustomer.status === 'VIP' ? 'warning' : 'success'}>
                    {selectedCustomer.status}
                  </Badge>
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: 13 }}>
                  {selectedCustomer.role} at <strong>{selectedCustomer.company}</strong> ({selectedCustomer.flag} {selectedCustomer.country})
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
                  {selectedCustomer.email} • Client since {selectedCustomer.joinDate}
                </div>
              </div>
            </div>

            {/* Financial & Engagement Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Gross Lifetime Spend</span>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#10b981', marginTop: 4 }}>
                  ${selectedCustomer.spent.toFixed(2)}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Orders</span>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#4f46e5', marginTop: 4 }}>
                  {selectedCustomer.ordersCount} Completed
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Average Order Value</span>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#0ea5e9', marginTop: 4 }}>
                  ${(selectedCustomer.spent / (selectedCustomer.ordersCount || 1)).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Tags & Account Notes */}
            <div>
              <h4 style={{ fontSize: 14, marginBottom: 8 }}>Account Segments & Badges</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {selectedCustomer.tags?.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Recent Simulated Activity */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
              <h4 style={{ fontSize: 14, marginBottom: 10 }}>Recent Activity Timeline</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>Placed Order <strong>#NX-8942</strong> for 4x Titanium Smartwatches ($1,996.00)</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>3 days ago</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="#4f46e5" />
                  <span>Invoice settled via Stripe Business Checkout</span>
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>1 week ago</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD CUSTOMER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Customer Account"
        size="md"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, width: '100%' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleAddCustomer}
            >
              Register Customer
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label required">Full Name</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. Jordan Miller"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input
              type="email"
              required
              className="form-control"
              placeholder="jordan@company.com"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Company / Organization</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Vertex Studio"
                value={newCustomer.company}
                onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Job Title / Role</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Head of Product"
                value={newCustomer.role}
                onChange={(e) => setNewCustomer({ ...newCustomer, role: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Tier Status</label>
              <select
                className="form-control"
                value={newCustomer.status}
                onChange={(e) => setNewCustomer({ ...newCustomer, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="VIP">VIP</option>
                <option value="At-Risk">At-Risk</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Spend ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="4500.00"
                value={newCustomer.spent}
                onChange={(e) => setNewCustomer({ ...newCustomer, spent: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Orders Count</label>
              <input
                type="number"
                className="form-control"
                placeholder="5"
                value={newCustomer.ordersCount}
                onChange={(e) => setNewCustomer({ ...newCustomer, ordersCount: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Avatar Photo URL</label>
            <input
              type="url"
              className="form-control"
              value={newCustomer.avatar}
              onChange={(e) => setNewCustomer({ ...newCustomer, avatar: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
