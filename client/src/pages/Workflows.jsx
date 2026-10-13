import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  GitBranch,
  ArrowRight,
  Edit2,
  Save,
  Check,
  Plus,
  RefreshCw,
  Sliders,
  Layers,
} from 'lucide-react'
import { getWorkflows, getResources, updateResource } from '../api/client'
import { Badge, Skeleton, Alert, Spinner, EmptyState } from '../components/UI'

export default function Workflows() {
  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingResource, setEditingResource] = useState(null)
  const [editData, setEditData] = useState(null)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const fetchWorkflows = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try getWorkflows endpoint first, fallback to getResources filtering workflow.enabled
      let list = []
      try {
        const wfRes = await getWorkflows()
        list = Array.isArray(wfRes.data) ? wfRes.data : []
      } catch {
        const resRes = await getResources()
        const allRes = Array.isArray(resRes.data) ? resRes.data : []
        list = allRes.filter((r) => r.workflow?.enabled)
      }

      setWorkflows(list)
    } catch (err) {
      setError(err.message || 'Failed to load workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const startEdit = (wf) => {
    setEditingResource(wf.name)
    setEditData({
      ...wf,
      workflow: {
        ...wf.workflow,
        statuses: (wf.workflow?.statuses || []).map((s) => ({ ...s })),
        transitions: (wf.workflow?.transitions || []).map((t) => ({ ...t })),
      },
    })
  }

  const handleSaveWorkflow = async () => {
    if (!editData) return
    setSaving(true)
    setFeedback(null)
    try {
      await updateResource(editData.name, editData)
      setFeedback({ type: 'success', message: `Workflow for ${editData.label || editData.name} updated!` })
      setEditingResource(null)
      fetchWorkflows()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save workflow changes' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            Workflow State Machines
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Monitor and configure automated lifecycle states and stage transitions across resources.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchWorkflows}
            title="Refresh workflows"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link to="/resources/builder" className="btn btn-primary btn-sm">
            <Plus size={15} />
            New Workflow
          </Link>
        </div>
      </div>

      {feedback && (
        <Alert variant={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Skeleton height={200} />
          <Skeleton height={200} />
        </div>
      ) : workflows.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <EmptyState
              icon={GitBranch}
              title="No active workflows"
              description="Workflows can be enabled on any resource to manage status transitions, review pipelines, and business stages."
              action={
                <Link to="/resources/builder" className="btn btn-primary">
                  <Plus size={16} />
                  Create Resource with Workflow
                </Link>
              }
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {workflows.map((wf) => {
            const isEditing = editingResource === wf.name
            const currentItem = isEditing ? editData : wf
            const statuses = currentItem.workflow?.statuses || []
            const transitions = currentItem.workflow?.transitions || []

            return (
              <div key={wf.name} className="card">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <GitBranch size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 16 }}>{wf.label || wf.name}</h3>
                      <span className="text-xs text-muted">
                        Controlled field: <strong className="font-mono">{wf.workflow?.statusField}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setEditingResource(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={handleSaveWorkflow}
                          disabled={saving}
                        >
                          {saving && <Spinner size={14} />}
                          <Save size={14} />
                          Save Workflow
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => startEdit(wf)}
                      >
                        <Edit2 size={14} />
                        Customize Statuses
                      </button>
                    )}
                  </div>
                </div>

                <div className="card-body">
                  {/* Status Badges Section */}
                  <div className="mb-6">
                    <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                      Configured Stages
                    </h4>

                    <div className="flex flex-wrap items-center gap-3">
                      {statuses.map((st, sIdx) => {
                        return (
                          <div
                            key={st.key}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 12px',
                              borderRadius: 8,
                              border: `1px solid ${st.color}40`,
                              backgroundColor: `${st.color}10`,
                            }}
                          >
                            {isEditing ? (
                              <input
                                type="color"
                                value={st.color}
                                onChange={(e) => {
                                  const updated = [...editData.workflow.statuses]
                                  updated[sIdx].color = e.target.value
                                  setEditData({
                                    ...editData,
                                    workflow: { ...editData.workflow, statuses: updated },
                                  })
                                }}
                                style={{
                                  width: 20,
                                  height: 20,
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                }}
                              />
                            ) : (
                              <span
                                className="status-dot"
                                style={{ backgroundColor: st.color }}
                              />
                            )}

                            <span style={{ fontWeight: 600, color: st.color, fontSize: 13 }}>
                              {st.label}
                            </span>
                            <span className="font-mono text-xs text-muted">({st.key})</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Transition Graph / Visual List */}
                  <div>
                    <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
                      Allowed State Transitions
                    </h4>

                    {transitions.length === 0 ? (
                      <p className="text-sm text-muted">No state transitions specified.</p>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                          gap: 12,
                        }}
                      >
                        {transitions.map((tr, tIdx) => {
                          const fromObj = statuses.find((s) => s.key === tr.from)
                          const toObj = statuses.find((s) => s.key === tr.to)

                          return (
                            <div
                              key={tIdx}
                              style={{
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                                padding: '12px 14px',
                                background: '#f8fafc',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                              }}
                            >
                              <div className="flex items-center justify-between text-xs font-semibold">
                                <span style={{ color: fromObj?.color || 'var(--text-primary)' }}>
                                  {fromObj?.label || tr.from}
                                </span>
                                <ArrowRight size={14} className="text-muted" />
                                <span style={{ color: toObj?.color || 'var(--text-primary)' }}>
                                  {toObj?.label || tr.to}
                                </span>
                              </div>

                              {isEditing ? (
                                <input
                                  type="text"
                                  className="form-control text-xs"
                                  value={tr.label}
                                  onChange={(e) => {
                                    const nextTrs = [...editData.workflow.transitions]
                                    nextTrs[tIdx].label = e.target.value
                                    setEditData({
                                      ...editData,
                                      workflow: { ...editData.workflow, transitions: nextTrs },
                                    })
                                  }}
                                  placeholder="Button action label"
                                />
                              ) : (
                                <div className="text-xs text-secondary font-medium">
                                  Action: <strong>{tr.label}</strong>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
