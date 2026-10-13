import React from 'react'
import {
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react'

/* ==========================================================================
   1. Modal
   ========================================================================== */
export function Modal({ isOpen, onClose, title, children, footer, size = 'md' }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <h3>{title}</h3>
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

/* ==========================================================================
   2. Spinner
   ========================================================================== */
export function Spinner({ size = 20, className = '' }) {
  return (
    <div
      className={`spinner ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    />
  )
}

/* ==========================================================================
   3. EmptyState
   ========================================================================== */
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && (
        <div className="empty-state-icon">
          {typeof icon === 'function' ? React.createElement(icon, { size: 28 }) : null}
        </div>
      )}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

/* ==========================================================================
   4. Badge
   ========================================================================== */
export function Badge({ variant, type, children, className = '', style }) {
  const v = variant || type || 'muted'
  return (
    <span className={`badge badge-${v} ${className}`} style={style}>
      {children}
    </span>
  )
}

/* ==========================================================================
   5. Pagination
   ========================================================================== */
export function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  const maxButtons = 5
  let start = Math.max(1, currentPage - 2)
  let end = Math.min(totalPages, start + maxButtons - 1)
  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <div className="pagination">
      <button
        type="button"
        className="page-btn"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`page-btn ${p === currentPage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="page-btn"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next Page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

/* ==========================================================================
   6. Alert
   ========================================================================== */
export function Alert({ variant, type, title, message, children, onClose, style }) {
  variant = variant || type || 'info'
  const iconMap = {
    info: <Info size={18} />,
    success: <CheckCircle2 size={18} />,
    warning: <AlertTriangle size={18} />,
    error: <AlertCircle size={18} />,
  }

  return (
    <div className={`alert alert-${variant} fade-in`} style={style}>
      <div style={{ flexShrink: 0, marginTop: 1 }}>{iconMap[variant]}</div>
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {message && <div>{message}</div>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          className="btn btn-ghost btn-icon btn-sm"
          onClick={onClose}
          aria-label="Dismiss alert"
          style={{ padding: 2, marginLeft: 8 }}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

/* ==========================================================================
   7. Tooltip
   ========================================================================== */
export function Tooltip({ text, children }) {
  return (
    <div className="tooltip-wrapper">
      {children}
      <span className="tooltip">{text}</span>
    </div>
  )
}

/* ==========================================================================
   8. ConfirmDialog
   ========================================================================== */
export function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant,
  danger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  const variant = confirmVariant || (danger ? 'danger' : 'primary')
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${variant}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? <Spinner size={16} /> : null}
            {confirmText}
          </button>
        </>
      }
    >
      <p style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </Modal>
  )
}

/* ==========================================================================
   9. SearchInput
   ========================================================================== */
export function SearchInput({ value, onChange, placeholder = 'Search...', className = '', ...props }) {
  return (
    <div className={`search-wrapper ${className}`}>
      <Search size={16} className="search-icon" />
      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="btn btn-ghost btn-icon btn-sm"
          style={{ position: 'absolute', right: 6, padding: 4 }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      ) : null}
    </div>
  )
}

/* ==========================================================================
   10. Skeleton
   ========================================================================== */
export function Skeleton({ width = '100%', height = 20, style, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, ...style }}
    />
  )
}

/* ==========================================================================
   11. StatCard
   ========================================================================== */
export function StatCard({ icon: Icon, label, value, change, color = 'primary' }) {
  const colorMap = {
    primary: { bg: 'var(--primary-light)', text: 'var(--primary)' },
    secondary: { bg: '#e0f2fe', text: '#0284c7' },
    success: { bg: '#ecfdf5', text: '#10b981' },
    warning: { bg: '#fffbeb', text: '#d97706' },
    accent: { bg: '#f3e8ff', text: '#8b5cf6' },
  }

  const activeColor = colorMap[color] || colorMap.primary

  return (
    <div className="card" style={{ flex: 1, minWidth: 220 }}>
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </span>
          {Icon && (
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius)',
                backgroundColor: activeColor.bg,
                color: activeColor.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={20} />
            </div>
          )}
        </div>
        <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
          {value}
        </div>
        {change && (
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}
