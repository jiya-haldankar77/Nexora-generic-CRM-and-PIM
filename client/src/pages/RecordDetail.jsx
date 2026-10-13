import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ExternalLink,
  GitBranch,
  Layers,
  ArrowRight,
  Save,
  X,
  Database,
} from 'lucide-react'
import {
  getResource,
  getRecord,
  updateRecord,
  deleteRecord,
  transitionRecord,
} from '../api/client'
import {
  Badge,
  Skeleton,
  Alert,
  ConfirmDialog,
  Spinner,
  EmptyState,
} from '../components/UI'
import DynamicForm from '../components/DynamicForm/DynamicForm'

export default function RecordDetail() {
  const { name: resourceName, id: recordId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const [resource, setResource] = useState(null)
  const [record, setRecord] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(searchParams.get('mode') === 'edit')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setFeedback(null)
    try {
      const [resDef, recRes] = await Promise.all([
        getResource(resourceName),
        getRecord(resourceName, recordId),
      ])
      setResource(resDef.data?.data || resDef.data)
      setRecord(recRes.data?.data || recRes.data)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load record details' })
    } finally {
      setLoading(false)
    }
  }, [resourceName, recordId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Save changes
  const handleUpdate = async (formData) => {
    setIsUpdating(true)
    setFeedback(null)
    try {
      const res = await updateRecord(resourceName, recordId, formData)
      setRecord(res.data || { ...record, ...formData })
      setIsEditing(false)
      setFeedback({ type: 'success', message: 'Record updated successfully!' })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update record' })
    } finally {
      setIsUpdating(false)
    }
  }

  // State machine transition
  const handleTransition = async (targetTransition) => {
    setIsTransitioning(true)
    setFeedback(null)
    try {
      const res = await transitionRecord(resourceName, recordId, targetTransition)
      setRecord(res.data)
      setFeedback({ type: 'success', message: `Record transitioned to status successfully!` })
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to transition workflow' })
    } finally {
      setIsTransitioning(false)
    }
  }

  // Delete record
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteRecord(resourceName, recordId)
      navigate(`/resources/${resourceName}/records`)
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete record' })
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton height={40} width={220} />
        <Skeleton height={260} />
        <Skeleton height={180} />
      </div>
    )
  }

  if (!record || !resource) {
    return (
      <EmptyState
        icon={Database}
        title="Record Not Found"
        description="The requested record could not be found or has been removed."
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/resources/${resourceName}/records`)}
          >
            Back to Records
          </button>
        }
      />
    )
  }

  // Evaluate current workflow state and available transitions
  const workflow = resource.workflow
  const recordData = record.data || record
  const currentStatusKey = workflow?.enabled && workflow?.statusField ? recordData[workflow.statusField] : null
  const currentStatusObj = workflow?.statuses?.find((s) => s.key === currentStatusKey)

  // Find transitions originating from currentStatusKey
  const availableTransitions = (workflow?.transitions || []).filter(
    (t) => t.from === currentStatusKey
  )

  const identifier =
    recordData.title || record.title ||
    recordData.name || record.name ||
    recordData.email || record.email ||
    recordData.order_number || record.order_number ||
    `Record #${record._id || record.id}`

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Header & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={`/resources/${resourceName}/records`}
            className="btn btn-ghost btn-icon"
            title="Back to record list"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>{identifier}</h2>
              {currentStatusObj && (
                <Badge
                  style={{
                    backgroundColor: `${currentStatusObj.color}20`,
                    color: currentStatusObj.color,
                  }}
                >
                  <span
                    className="status-dot"
                    style={{ backgroundColor: currentStatusObj.color }}
                  />
                  {currentStatusObj.label}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              ID: <span className="font-mono">{record._id || record.id}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={15} />
                Edit Record
              </button>
              <button
                type="button"
                className="btn btn-danger btn-icon"
                onClick={() => setDeleteConfirmOpen(true)}
                title="Delete Record"
              >
                <Trash2 size={16} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditing(false)}
            >
              <X size={15} />
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <Alert
          variant={feedback.type}
          onClose={() => setFeedback(null)}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Workflow Action Banner if workflow is active */}
      {workflow?.enabled && (
        <div
          className="card"
          style={{
            borderLeft: `4px solid ${currentStatusObj?.color || 'var(--primary)'}`,
          }}
        >
          <div className="card-body" style={{ padding: '16px 20px' }}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GitBranch size={18} className="text-primary" />
                <div>
                  <span className="text-xs font-semibold text-muted text-uppercase">
                    Lifecycle Workflow Status
                  </span>
                  <div className="font-semibold text-sm">
                    Currently: <span style={{ color: currentStatusObj?.color }}>{currentStatusObj?.label || currentStatusKey || 'Unset'}</span>
                  </div>
                </div>
              </div>

              {availableTransitions.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted mr-1">Move to:</span>
                  {availableTransitions.map((tr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => handleTransition(tr.to || tr.label)}
                      disabled={isTransitioning}
                    >
                      {isTransitioning && <Spinner size={12} />}
                      <span>{tr.label || tr.to}</span>
                      <ArrowRight size={13} />
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-muted">
                  Terminal or default state. No outgoing transitions.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(280px, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Record Data / Edit Form */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: 16 }}>
              {isEditing ? 'Edit Record' : 'Record Attributes'}
            </h3>
            {isEditing && (
              <span className="badge badge-primary">Edit Mode</span>
            )}
          </div>
          <div className="card-body">
            {isEditing ? (
              <DynamicForm
                resource={resource}
                initialData={record}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditing(false)}
                isLoading={isUpdating}
                submitLabel="Save Changes"
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '20px 24px',
                }}
              >
                {(resource.fields || []).map((field) => {
                  const val = recordData[field.key] ?? record[field.key]

                  return (
                    <div
                      key={field.key}
                      style={{
                        gridColumn: field.type === 'textarea' ? '1 / -1' : undefined,
                      }}
                    >
                      <div className="text-xs font-semibold text-muted mb-1">
                        {field.label || field.key}
                      </div>
                      <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                        {formatFieldValue(val, field)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Sync Status Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15 }}>Integration & Sync</h3>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <span className="text-xs text-muted">Sync Status</span>
                <div className="mt-1">
                  <Badge variant={record.syncStatus === 'synced' ? 'success' : 'muted'}>
                    {record.syncStatus || 'Local'}
                  </Badge>
                </div>
              </div>

              {record.externalId && (
                <div>
                  <span className="text-xs text-muted">External ID</span>
                  <div className="font-mono text-sm mt-1">{record.externalId}</div>
                </div>
              )}

              {record.lastSyncedAt && (
                <div>
                  <span className="text-xs text-muted">Last Synced</span>
                  <div className="text-sm mt-1 flex items-center gap-1 text-secondary">
                    <Clock size={14} />
                    {new Date(record.lastSyncedAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div>
                <span className="text-xs text-muted">Created At</span>
                <div className="text-sm mt-1">
                  {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              <div>
                <span className="text-xs text-muted">Last Modified</span>
                <div className="text-sm mt-1">
                  {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Record Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be reverted."
        confirmText="Delete Record"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}

function formatFieldValue(val, field) {
  if (val === null || val === undefined || val === '') {
    return <span className="text-muted">—</span>
  }

  switch (field.type) {
    case 'boolean':
      return val ? <Badge variant="success">Yes</Badge> : <Badge variant="muted">No</Badge>
    case 'multiselect':
      if (Array.isArray(val)) {
        return (
          <div className="flex flex-wrap gap-1">
            {val.map((item, i) => (
              <span key={i} className="badge badge-secondary">{item}</span>
            ))}
          </div>
        )
      }
      return String(val)
    case 'date': {
      try {
        const d = new Date(val)
        return isNaN(d.getTime()) ? val : d.toLocaleDateString()
      } catch {
        return val
      }
    }
    case 'url':
      return (
        <a href={val} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {val}
        </a>
      )
    case 'email':
      return (
        <a href={`mailto:${val}`} className="text-primary hover:underline">
          {val}
        </a>
      )
    default:
      return String(val)
  }
}
