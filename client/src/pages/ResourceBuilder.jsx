import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  GripVertical,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Settings,
  Sparkles,
  GitBranch,
  Layers,
  Check,
  Eye,
  Sliders,
} from 'lucide-react'
import { getResource, createResource, updateResource } from '../api/client'
import { Alert, Spinner } from '../components/UI'
import DynamicForm from '../components/DynamicForm/DynamicForm'

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'url', label: 'URL' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean (Toggle)' },
  { value: 'select', label: 'Single Select' },
  { value: 'multiselect', label: 'Multi Select' },
  { value: 'textarea', label: 'Long Text (Textarea)' },
]

const ICONS = ['database', 'users', 'box', 'shopping', 'tag', 'file', 'settings']

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '_')
}

export default function ResourceBuilder() {
  const { name: editName } = useParams()
  const isEdit = Boolean(editName)
  const navigate = useNavigate()

  // Resource metadata
  const [label, setLabel] = useState('')
  const [name, setName] = useState('')
  const [nameManuallyEdited, setNameManuallyEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('database')

  // Fields
  const [fields, setFields] = useState([
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: false,
      searchable: true,
      filterable: true,
      sortable: true,
      showInList: true,
      options: [],
      order: 0,
    },
  ])

  // Workflow
  const [workflowEnabled, setWorkflowEnabled] = useState(false)
  const [statusField, setStatusField] = useState('')
  const [statuses, setStatuses] = useState([
    { key: 'draft', label: 'Draft', color: '#64748b' },
    { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
    { key: 'published', label: 'Published', color: '#10b981' },
  ])
  const [transitions, setTransitions] = useState([
    { from: 'draft', to: 'in_progress', label: 'Start Progress' },
    { from: 'in_progress', to: 'published', label: 'Publish' },
  ])

  // Settings
  const [defaultSort, setDefaultSort] = useState('')
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Page state
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [activeTab, setActiveTab] = useState('fields') // 'fields' | 'workflow' | 'settings'

  // Load existing resource in edit mode
  useEffect(() => {
    if (!isEdit) return
    let isMounted = true

    const loadData = async () => {
      setLoading(true)
      try {
        const res = await getResource(editName)
        const d = res.data
        if (isMounted && d) {
          setLabel(d.label || d.name)
          setName(d.name)
          setNameManuallyEdited(true)
          setDescription(d.description || '')
          setIcon(d.icon || 'database')
          // Map fields: ensure backend 'key' maps to frontend 'key'
          const loadedFields = (d.fields || []).map(f => ({
            ...f,
            key: f.key || f.name,
          }))
          setFields(loadedFields)
          setDefaultSort(d.defaultSort || '')
          setItemsPerPage(d.itemsPerPage || 10)

          if (d.workflow?.enabled) {
            setWorkflowEnabled(true)
            setStatusField(d.workflow.statusField || '')
            setStatuses(d.workflow.statuses || [])
            setTransitions(d.workflow.transitions || [])
          }
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load existing resource')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => {
      isMounted = false
    }
  }, [editName, isEdit])

  // Auto-slug name from label
  const handleLabelChange = (newLabel) => {
    setLabel(newLabel)
    if (!isEdit && !nameManuallyEdited) {
      const slug = slugify(newLabel)
      setName(slug)
    }
  }

  // Field management
  const addField = () => {
    const newOrder = fields.length
    const newField = {
      key: `field_${newOrder + 1}`,
      label: `Field ${newOrder + 1}`,
      type: 'text',
      required: false,
      searchable: true,
      filterable: true,
      sortable: true,
      showInList: true,
      options: [],
      order: newOrder,
    }
    setFields([...fields, newField])
  }

  const updateField = (index, updates) => {
    setFields((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  // Options editor for select / multiselect
  const addOption = (fieldIndex) => {
    const field = fields[fieldIndex]
    const opts = field.options || []
    const newOptVal = `opt_${opts.length + 1}`
    updateField(fieldIndex, {
      options: [...opts, { value: newOptVal, label: `Option ${opts.length + 1}` }],
    })
  }

  const updateOption = (fieldIndex, optIndex, key, value) => {
    const field = fields[fieldIndex]
    const opts = [...(field.options || [])]
    opts[optIndex] = {
      ...(typeof opts[optIndex] === 'object' ? opts[optIndex] : { value: opts[optIndex], label: opts[optIndex] }),
      [key]: value,
    }
    updateField(fieldIndex, { options: opts })
  }

  const removeOption = (fieldIndex, optIndex) => {
    const field = fields[fieldIndex]
    const opts = (field.options || []).filter((_, i) => i !== optIndex)
    updateField(fieldIndex, { options: opts })
  }

  // Workflow status management
  const addStatus = () => {
    setStatuses([
      ...statuses,
      { key: `status_${statuses.length + 1}`, label: `Status ${statuses.length + 1}`, color: '#6366f1' },
    ])
  }

  const updateStatus = (index, key, val) => {
    const next = [...statuses]
    next[index] = { ...next[index], [key]: val }
    setStatuses(next)
  }

  const removeStatus = (index) => {
    setStatuses(statuses.filter((_, i) => i !== index))
  }

  // Workflow transitions management
  const addTransition = () => {
    if (statuses.length < 2) return
    setTransitions([
      ...transitions,
      {
        from: statuses[0].key,
        to: statuses[1].key,
        label: `Move to ${statuses[1].label}`,
      },
    ])
  }

  const updateTransition = (index, key, val) => {
    const next = [...transitions]
    next[index] = { ...next[index], [key]: val }
    setTransitions(next)
  }

  const removeTransition = (index) => {
    setTransitions(transitions.filter((_, i) => i !== index))
  }

  // Save handler
  const handleSave = async () => {
    setError(null)
    setSuccess(null)

    if (!name.trim()) {
      setError('Resource programmatic name (slug) is required')
      return
    }

    if (!fields.length) {
      setError('At least one field is required')
      return
    }

    // Check for duplicate field names
    const fieldNames = new Set()
    for (const f of fields) {
      if (!f.key || !f.key.trim()) {
        setError('All fields must have a valid identifier')
        return
      }
      if (fieldNames.has(f.key.trim())) {
        setError(`Duplicate field identifier found: "${f.key}"`)
        return
      }
      fieldNames.add(f.key.trim())
    }

    const payload = {
      name: name.trim(),
      label: label.trim() || name.trim(),
      description: description.trim(),
      icon,
      fields: fields.map((f, idx) => ({ ...f, order: idx })),
      settings: {
        defaultSort: defaultSort || (fields[0]?.key ?? 'createdAt'),
        itemsPerPage: Number(itemsPerPage) || 10,
      },
      workflow: workflowEnabled
        ? {
            enabled: true,
            statusField: statusField || (fields.find((f) => f.type === 'select')?.key || fields[0]?.key),
            statuses,
            transitions,
          }
        : { enabled: false },
    }

    setSaving(true)
    try {
      if (isEdit) {
        await updateResource(editName, payload)
        setSuccess('Resource schema updated successfully!')
      } else {
        await createResource(payload)
        setSuccess('Resource schema created successfully!')
        setTimeout(() => {
          navigate(`/resources/${payload.name}/records`)
        }, 800)
      }
    } catch (err) {
      setError(err.message || 'Failed to save resource schema')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6" style={{ minHeight: 300 }}>
        <Spinner size={32} />
      </div>
    )
  }

  const previewResource = useMemo(() => ({
    name: name || 'resource_preview',
    label: label || 'Preview Resource',
    fields,
    workflow: workflowEnabled ? { enabled: true, statusField, statuses, transitions } : undefined,
  }), [name, label, fields, workflowEnabled, statusField, statuses, transitions])

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/resources" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>
              {isEdit ? `Edit Schema: ${label || editName}` : 'Create Resource Schema'}
            </h2>
            <p className="text-xs text-muted" style={{ marginTop: 2 }}>
              Configure data schema, validation rules, workflow transitions, and UI representation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/resources')}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <Spinner size={16} /> : <Save size={16} />}
            <span>{isEdit ? 'Update Schema' : 'Save Schema'}</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Two-Panel Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* LEFT PANEL: Schema Configuration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Metadata Card */}
          <div className="card">
            <div className="card-header">
              <h3 style={{ fontSize: 15 }}>Resource Metadata</h3>
            </div>
            <div className="card-body">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                }}
              >
                <div className="form-group">
                  <label className="form-label required">Display Label</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Products, Support Tickets"
                    value={label}
                    onChange={(e) => handleLabelChange(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label required">API / Database Name (Slug)</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="e.g. products, support_tickets"
                    value={name}
                    disabled={isEdit}
                    onChange={(e) => {
                      setNameManuallyEdited(true)
                      setName(slugify(e.target.value))
                    }}
                  />
                </div>
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Explain what this resource tracks and how it is used..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="form-group mt-4">
                <label className="form-label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      className={`btn btn-sm ${icon === ic ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setIcon(ic)}
                      style={{ textTransform: 'capitalize' }}
                    >
                      {icon === ic && <Check size={12} />}
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Builder Tabs */}
          <div className="tabs">
            <button
              type="button"
              className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
              onClick={() => setActiveTab('fields')}
            >
              <div className="flex items-center gap-2">
                <Layers size={14} />
                <span>Fields ({fields.length})</span>
              </div>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'workflow' ? 'active' : ''}`}
              onClick={() => setActiveTab('workflow')}
            >
              <div className="flex items-center gap-2">
                <GitBranch size={14} />
                <span>Workflow {workflowEnabled ? '●' : ''}</span>
              </div>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <div className="flex items-center gap-2">
                <Settings size={14} />
                <span>Settings</span>
              </div>
            </button>
          </div>

          {/* TAB 1: Fields Section */}
          {activeTab === 'fields' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {fields.map((field, index) => (
                <div key={index} className="card" style={{ borderLeft: '3px solid var(--primary)' }}>
                  <div className="card-body" style={{ padding: 16 }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="drag-handle" title="Reorder">
                          <GripVertical size={16} />
                        </span>
                        <span className="font-semibold text-sm">
                          #{index + 1} {field.label || field.key}
                        </span>
                        <span className="badge badge-secondary">{field.type}</span>
                        {field.required && <span className="badge badge-danger">Required</span>}
                      </div>

                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm text-danger"
                        title="Remove Field"
                        onClick={() => removeField(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Field Basic Config */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div className="form-group">
                        <label className="form-label text-xs">Field Label</label>
                        <input
                          type="text"
                          className="form-control"
                          value={field.label}
                          onChange={(e) => {
                            const newLbl = e.target.value
                            const updates = { label: newLbl }
                            if (!field._manuallyEditedKey) {
                              updates.key = slugify(newLbl)
                            }
                            updateField(index, updates)
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label text-xs">Key / Identifier</label>
                        <input
                          type="text"
                          className="form-control font-mono"
                          value={field.key}
                          onChange={(e) => {
                            updateField(index, {
                              key: slugify(e.target.value),
                              _manuallyEditedKey: true,
                            })
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label text-xs">Field Type</label>
                        <select
                          className="form-control"
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value })}
                        >
                          {FIELD_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Options Editor for Select & Multiselect */}
                    {(field.type === 'select' || field.type === 'multiselect') && (
                      <div
                        style={{
                          background: '#f8fafc',
                          padding: 12,
                          borderRadius: 'var(--radius)',
                          marginBottom: 12,
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-secondary">
                            Dropdown Options
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '2px 8px', fontSize: 11 }}
                            onClick={() => addOption(index)}
                          >
                            <Plus size={11} /> Add Option
                          </button>
                        </div>

                        {(field.options || []).length === 0 ? (
                          <span className="text-xs text-muted">
                            No options defined yet. Click &quot;Add Option&quot; above.
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(field.options || []).map((opt, optIdx) => {
                              const optVal = typeof opt === 'object' ? opt.value : opt
                              const optLbl = typeof opt === 'object' ? opt.label : opt
                              return (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    className="form-control font-mono"
                                    style={{ flex: 1, padding: '4px 8px', fontSize: 12 }}
                                    placeholder="Value"
                                    value={optVal}
                                    onChange={(e) => updateOption(index, optIdx, 'value', e.target.value)}
                                  />
                                  <input
                                    type="text"
                                    className="form-control"
                                    style={{ flex: 1, padding: '4px 8px', fontSize: 12 }}
                                    placeholder="Label"
                                    value={optLbl}
                                    onChange={(e) => updateOption(index, optIdx, 'label', e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-icon btn-sm text-danger"
                                    style={{ padding: 4 }}
                                    onClick={() => removeOption(index, optIdx)}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Flags / Checkboxes */}
                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={!!field.required}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                        />
                        <span className="form-check-label text-xs">Required</span>
                      </label>

                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={field.showInList !== false}
                          onChange={(e) => updateField(index, { showInList: e.target.checked })}
                        />
                        <span className="form-check-label text-xs">Show in Table</span>
                      </label>

                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={field.searchable !== false}
                          onChange={(e) => updateField(index, { searchable: e.target.checked })}
                        />
                        <span className="form-check-label text-xs">Searchable</span>
                      </label>

                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={field.filterable !== false}
                          onChange={(e) => updateField(index, { filterable: e.target.checked })}
                        />
                        <span className="form-check-label text-xs">Filterable</span>
                      </label>

                      <label className="form-check">
                        <input
                          type="checkbox"
                          checked={field.sortable !== false}
                          onChange={(e) => updateField(index, { sortable: e.target.checked })}
                        />
                        <span className="form-check-label text-xs">Sortable</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={addField}
                style={{ borderStyle: 'dashed' }}
              >
                <Plus size={16} /> Add Field
              </button>
            </div>
          )}

          {/* TAB 2: Workflow Section */}
          {activeTab === 'workflow' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 style={{ fontSize: 15 }}>State Machine & Workflow</h3>
                  <p className="text-xs text-muted">
                    Automate record lifecycles with state transitions
                  </p>
                </div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={workflowEnabled}
                    onChange={(e) => setWorkflowEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {workflowEnabled && (
                <div className="card-body">
                  <div className="form-group mb-4">
                    <label className="form-label required">Status Attribute Field</label>
                    <select
                      className="form-control"
                      value={statusField}
                      onChange={(e) => setStatusField(e.target.value)}
                    >
                      <option value="">-- Choose field representing state --</option>
                      {fields.map((f) => (
                        <option key={f.name} value={f.name}>
                          {f.label || f.name} ({f.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Statuses Editor */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 style={{ fontSize: 14 }}>Statuses</h4>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addStatus}
                      >
                        <Plus size={13} /> Add Status
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {statuses.map((st, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={st.color}
                            onChange={(e) => updateStatus(sIdx, 'color', e.target.value)}
                            style={{
                              width: 32,
                              height: 32,
                              padding: 0,
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          />
                          <input
                            type="text"
                            className="form-control font-mono"
                            style={{ flex: 1 }}
                            placeholder="Key (e.g. pending)"
                            value={st.key}
                            onChange={(e) => updateStatus(sIdx, 'key', slugify(e.target.value))}
                          />
                          <input
                            type="text"
                            className="form-control"
                            style={{ flex: 1 }}
                            placeholder="Label (e.g. Pending)"
                            value={st.label}
                            onChange={(e) => updateStatus(sIdx, 'label', e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm text-danger"
                            onClick={() => removeStatus(sIdx)}
                            disabled={statuses.length <= 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Transitions Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 style={{ fontSize: 14 }}>Allowed Transitions</h4>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addTransition}
                        disabled={statuses.length < 2}
                      >
                        <Plus size={13} /> Add Transition
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {transitions.map((tr, tIdx) => (
                        <div key={tIdx} className="flex items-center gap-2">
                          <select
                            className="form-control"
                            style={{ flex: 1 }}
                            value={tr.from}
                            onChange={(e) => updateTransition(tIdx, 'from', e.target.value)}
                          >
                            {statuses.map((s) => (
                              <option key={s.key} value={s.key}>
                                From: {s.label}
                              </option>
                            ))}
                          </select>

                          <select
                            className="form-control"
                            style={{ flex: 1 }}
                            value={tr.to}
                            onChange={(e) => updateTransition(tIdx, 'to', e.target.value)}
                          >
                            {statuses.map((s) => (
                              <option key={s.key} value={s.key}>
                                To: {s.label}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            className="form-control"
                            style={{ flex: 1.2 }}
                            placeholder="Button Label"
                            value={tr.label}
                            onChange={(e) => updateTransition(tIdx, 'label', e.target.value)}
                          />

                          <button
                            type="button"
                            className="btn btn-ghost btn-icon btn-sm text-danger"
                            onClick={() => removeTransition(tIdx)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Settings Section */}
          {activeTab === 'settings' && (
            <div className="card">
              <div className="card-header">
                <h3 style={{ fontSize: 15 }}>Display & Pagination Settings</h3>
              </div>
              <div className="card-body">
                <div className="form-group mb-4">
                  <label className="form-label">Default Sort Field</label>
                  <select
                    className="form-control"
                    value={defaultSort}
                    onChange={(e) => setDefaultSort(e.target.value)}
                  >
                    <option value="">-- Choose field --</option>
                    {fields.map((f) => (
                      <option key={f.key} value={f.key}>
                        {f.label || f.key}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Records Per Page</label>
                  <input
                    type="number"
                    className="form-control"
                    min={5}
                    max={100}
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Live Interactive Preview */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div className="card">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-primary" />
                <h3 style={{ fontSize: 15 }}>Live Form Preview</h3>
              </div>
              <span className="badge badge-primary">Interactive Preview</span>
            </div>
            <div className="card-body">
              <p className="text-xs text-muted mb-4">
                This is a real-time rendition of how record forms will look and validate for end users.
              </p>

              <DynamicForm
                resource={previewResource}
                onSubmit={(data) => {
                  alert(`Preview form valid! Output payload:\n${JSON.stringify(data, null, 2)}`)
                }}
                submitLabel="Test Submit"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
