import React, { useState, useMemo } from 'react'
import {
  Package,
  Search,
  Plus,
  LayoutGrid,
  List,
  Star,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  DollarSign,
  TrendingUp,
  X,
  ExternalLink,
  Edit,
  Trash2,
  Sparkles,
} from 'lucide-react'
import { INITIAL_PRODUCTS } from '../data/mockData'
import { Badge, Modal } from '../components/UI'

export default function Products() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState('featured') // 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'sales'
  
  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Audio & Tech',
    price: '',
    cost: '',
    stock: '',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
    description: '',
    tags: 'Flagship, New',
  })

  const categories = ['All', 'Audio & Tech', 'Workstation', 'Wearables', 'Accessories', 'Smart Home']
  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock']

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus
        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'rating') return b.rating - a.rating
        if (sortBy === 'sales') return b.salesCount - a.salesCount
        return 0 // default
      })
  }, [products, searchTerm, selectedCategory, selectedStatus, sortBy])

  // Summary Metrics
  const totalInventoryValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.price * p.stock, 0)
  }, [products])

  const totalSalesUnits = useMemo(() => {
    return products.reduce((acc, p) => acc + p.salesCount, 0)
  }, [products])

  const handleAddProduct = (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) return

    const productToAdd = {
      id: `prd-${Date.now()}`,
      sku: newProduct.sku || `NX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newProduct.name,
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 99.99,
      cost: parseFloat(newProduct.cost) || 45.0,
      stock: parseInt(newProduct.stock, 10) || 25,
      status: parseInt(newProduct.stock, 10) > 15 ? 'In Stock' : parseInt(newProduct.stock, 10) > 0 ? 'Low Stock' : 'Out of Stock',
      rating: 5.0,
      reviewsCount: 1,
      salesCount: 0,
      badge: 'New Release',
      image: newProduct.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      description: newProduct.description || 'Enterprise grade premium manufactured component.',
      tags: newProduct.tags ? newProduct.tags.split(',').map((t) => t.trim()) : ['Verified'],
    }

    setProducts([productToAdd, ...products])
    setIsAddModalOpen(false)
    setNewProduct({
      name: '',
      sku: '',
      category: 'Audio & Tech',
      price: '',
      cost: '',
      stock: '',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80',
      description: '',
      tags: 'Flagship, New',
    })
  }

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id))
    if (selectedProduct?.id === id) {
      setSelectedProduct(null)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header Bar */}
      <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
              Products & Catalog
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
              {products.length} Items Live
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Explore high-fidelity mock catalog inventory, real-time stock statuses, SKUs, and imagery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Grid / Table toggle */}
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
              <span>Catalog Grid</span>
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
              <span>Table View</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #4f46e5' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Active Catalog</span>
            <Package size={18} color="#4f46e5" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {products.length} Products
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Across 5 Core Categories</span>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Est. Inventory Value</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span style={{ fontSize: 12, color: '#10b981', fontWeight: 500 }}>In Warehouse Stock</span>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #0ea5e9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Total Units Shipped</span>
            <TrendingUp size={18} color="#0ea5e9" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {totalSalesUnits.toLocaleString()} Units
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Lifetime Fulfilled</span>
        </div>

        <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Low / Out of Stock</span>
            <AlertTriangle size={18} color="#f59e0b" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8, color: 'var(--text-primary)' }}>
            {products.filter((p) => p.status !== 'In Stock').length} Items
          </div>
          <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 500 }}>Action Required</span>
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
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: 36, height: 38 }}
            />
          </div>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
              style={{ height: 38, padding: '0 10px', fontSize: 13 }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-control"
              style={{ height: 38, padding: '0 10px', fontSize: 13 }}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
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
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="sales">Most Popular</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* CATALOG VIEW: Grid of Products */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 24,
          }}
        >
          {filteredProducts.map((product) => {
            const isLowStock = product.status === 'Low Stock'
            const isOutOfStock = product.status === 'Out of Stock'

            return (
              <div
                key={product.id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease',
                  border: '1px solid var(--card-border)',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)'
                  e.currentTarget.style.borderColor = '#c7d2fe'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--card-shadow)'
                  e.currentTarget.style.borderColor = 'var(--card-border)'
                }}
                onClick={() => setSelectedProduct(product)}
              >
                {/* Image Container with Badge */}
                <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden', background: '#f1f5f9' }}>
                  <img
                    src={product.image}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 300ms ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Top Left Badge */}
                  {product.badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(8px)',
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: 20,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        letterSpacing: '0.03em',
                      }}
                    >
                      <Sparkles size={11} color="#fbbf24" />
                      <span>{product.badge}</span>
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                    }}
                  >
                    <Badge
                      variant={
                        product.status === 'In Stock'
                          ? 'success'
                          : isLowStock
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {product.status}
                    </Badge>
                  </div>

                  {/* Hover Quick View Pill */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      right: 10,
                      background: 'rgba(255, 255, 255, 0.92)',
                      backdropFilter: 'blur(4px)',
                      padding: '4px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Eye size={12} /> Quick View
                  </div>
                </div>

                {/* Card Body */}
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', flex: 1, gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {product.category}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {product.sku}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      lineHeight: 1.35,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      height: 40,
                    }}
                  >
                    {product.name}
                  </h3>

                  {/* Star Rating & Sales */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#f59e0b', gap: 2 }}>
                      <Star size={14} fill="#f59e0b" />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.rating}</span>
                    </div>
                    <span style={{ color: 'var(--text-muted)' }}>({product.reviewsCount} reviews)</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11 }}>
                      {product.salesCount.toLocaleString()} sold
                    </span>
                  </div>

                  {/* Inventory Health bar */}
                  <div style={{ marginTop: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                      <span>Inventory</span>
                      <span style={{ fontWeight: 600, color: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : 'var(--text-primary)' }}>
                        {product.stock} units
                      </span>
                    </div>
                    <div style={{ width: '100%', height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(5, (product.stock / 150) * 100))}%`,
                          background: isOutOfStock ? '#ef4444' : isLowStock ? '#f59e0b' : '#10b981',
                          borderRadius: 999,
                        }}
                      />
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 12,
                      borderTop: '1px solid #f1f5f9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                        ${product.price.toFixed(2)}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        MSRP Cost: ${product.cost.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedProduct(product)
                      }}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      Inspect
                    </button>
                  </div>
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
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const marginPct = Math.round(((p.price - p.cost) / p.price) * 100)
                  return (
                    <tr
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedProduct(p)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                          />
                          <div>
                            <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                              {p.name}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.badge}</span>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-xs">{p.sku}</td>
                      <td>
                        <Badge variant="primary">{p.category}</Badge>
                      </td>
                      <td className="font-bold">${p.price.toFixed(2)}</td>
                      <td>
                        <span style={{ color: '#10b981', fontWeight: 600, fontSize: 12 }}>
                          +{marginPct}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span
                            className={`status-dot ${
                              p.status === 'In Stock' ? 'green' : p.status === 'Low Stock' ? 'yellow' : 'red'
                            }`}
                          />
                          <span>{p.stock} in stock</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Star size={13} fill="#f59e0b" color="#f59e0b" />
                          <span className="font-semibold">{p.rating}</span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            p.status === 'In Stock'
                              ? 'success'
                              : p.status === 'Low Stock'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {p.status}
                        </Badge>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProduct(p)
                            }}
                            title="Inspect details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm btn-icon"
                            style={{ color: '#ef4444' }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProduct(p.id)
                            }}
                            title="Remove"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK VIEW PRODUCT MODAL */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleDeleteProduct(selectedProduct.id)}
              >
                <Trash2 size={14} /> Remove Product
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setSelectedProduct(null)}
                >
                  Save Changes
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 1.4fr', gap: 24 }}>
            {/* Image & Badges */}
            <div>
              <div style={{ borderRadius: 12, overflow: 'hidden', height: 260, position: 'relative' }}>
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', top: 12, left: 12 }}>
                  <Badge variant="primary">{selectedProduct.category}</Badge>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {selectedProduct.tags?.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 12,
                      padding: '3px 8px',
                      background: '#f1f5f9',
                      borderRadius: 6,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="font-mono text-xs text-muted">SKU: {selectedProduct.sku}</span>
                <Badge
                  variant={
                    selectedProduct.status === 'In Stock'
                      ? 'success'
                      : selectedProduct.status === 'Low Stock'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {selectedProduct.status}
                </Badge>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
                {selectedProduct.description}
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 12,
                  background: '#f8fafc',
                  padding: 16,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Retail Price</span>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                    ${selectedProduct.price.toFixed(2)}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Inventory</span>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#4f46e5' }}>
                    {selectedProduct.stock} units
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Sales</span>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                    {selectedProduct.salesCount} sold
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={i < Math.floor(selectedProduct.rating) ? '#f59e0b' : 'none'}
                    />
                  ))}
                </div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{selectedProduct.rating} out of 5</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  ({selectedProduct.reviewsCount} customer ratings)
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD PRODUCT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Catalog Product"
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
              onClick={handleAddProduct}
            >
              Publish to Catalog
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group">
            <label className="form-label required">Product Title</label>
            <input
              type="text"
              required
              className="form-control"
              placeholder="e.g. NeoTrack Studio Headphones"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">SKU Code</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. NX-AUDIO-88"
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              >
                <option value="Audio & Tech">Audio & Tech</option>
                <option value="Workstation">Workstation</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Smart Home">Smart Home</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label required">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-control"
                placeholder="249.99"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Cost ($)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="95.00"
                value={newProduct.cost}
                onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label required">Stock Units</label>
              <input
                type="number"
                required
                className="form-control"
                placeholder="50"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Unsplash or CDN)</label>
            <input
              type="url"
              className="form-control"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Features, hardware specifications, and materials..."
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  )
}
