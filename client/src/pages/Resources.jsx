import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Database,
  Plus,
  Edit2,
  Trash2,
  Table,
  Layers,
  Sparkles,
  ShoppingBag,
  Users,
  Box,
  FileText,
  Tag,
  Settings,
} from 'lucide-react'
import { getResources, deleteResource } from '../api/client'
import { Skeleton, ConfirmDialog, EmptyState, Alert } from '../components/UI'

const ICON_MAP = {
  database: Database,
  users: Users,
  box: Box,
  shopping: ShoppingBag,
  tag: Tag,
  file: FileText,
  settings: Settings,
}

export default function Resources() {
  const navigate = useNavigate()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchResources = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getResources()
      setResources(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      setError(err.message || 'Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteResource(deleteTarget.name)
      setResources((prev) => prev.filter((r) => r.name !== deleteTarget.name))
      setDeleteTarget(null)
    } catch (err) {
      setError(err.message || 'Failed to delete resource')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            Resource Schemas
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Define custom entities, relational structures, field types, and workflow rules.
          </p>
        </div>
        <Link to="/resources/builder" className="btn btn-primary">
          <Plus size={16} />
          Create Resource
        </Link>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          <Skeleton height={200} />
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
      ) : resources.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState
              icon={Database}
              title="No resources configured yet"
              description="NEXORA schemas let you model any business data such as Products, Orders, Customers, or Custom Leads."
              action={
                <Link to="/resources/builder" className="btn btn-primary">
                  <Plus size={16} />
                  Build Your First Resource
                </Link>
              }
            />
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}
        >
          {resources.map((res) => {
            const IconComponent = ICON_MAP[res.icon?.toLowerCase()] || Layers
            const fieldCount = (res.fields || []).length
            const recordCount = res.recordCount ?? res.count ?? 0

            return (
              <div
                key={res.name}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'box-shadow 150ms ease, transform 150ms ease',
                }}
              >
                <div className="card-body" style={{ flex: 1 }}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComponent size={22} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: 16, fontWeight: 600 }}>{res.label || res.name}</h3>
                        <span className="font-mono text-xs text-muted">/{res.name}</span>
                      </div>
                    </div>
                  </div>

                  <p
                    className="text-sm"
                    style={{
                      color: 'var(--text-secondary)',
                      minHeight: 40,
                      marginBottom: 16,
                      lineHeight: 1.4,
                    }}
                  >
                    {res.description || 'No description provided for this resource schema.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-medium text-muted">
                    <span className="badge badge-muted">
                      {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                    </span>
                    <span className="badge badge-secondary">
                      {recordCount} {recordCount === 1 ? 'record' : 'records'}
                    </span>
                    {res.workflow?.enabled && (
                      <span className="badge badge-success">
                        Workflow Active
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="card-footer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/resources/${res.name}/records`)}
                  >
                    <Table size={14} />
                    View Records
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Edit Schema"
                      onClick={() => navigate(`/resources/${res.name}/edit`)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm text-danger"
                      title="Delete Resource"
                      onClick={() => setDeleteTarget(res)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.label || deleteTarget?.name}"?`}
        message={`Are you sure you want to permanently delete the schema and all associated records? This cannot be undone.`}
        confirmText="Delete Resource"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
