import { useState, useEffect } from 'react'
import {
  Plug, RefreshCw, TestTube2, Trash2, Plus, AlertCircle, CheckCircle,
  ShoppingBag, Clock, ArrowRight, ExternalLink, Settings, Layers
} from 'lucide-react'
import {
  getIntegrations, createIntegration, updateIntegration, deleteIntegration,
  syncIntegration, testIntegration, getResources, getAvailableResourceTypes, getFieldSchema
} from '../api/client'
import { Spinner, Alert, EmptyState, Badge, ConfirmDialog, Modal } from '../components/UI'

const STATUS_CONFIG = {
  idle: { label: 'Idle', type: 'muted' },
  active: { label: 'Active', type: 'success' },
  syncing: { label: 'Syncing...', type: 'secondary' },
  error: { label: 'Error', type: 'danger' },
  mock: { label: 'Mock Mode', type: 'warning' },
}

function WooCommerceForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: initial?.name || 'WooCommerce',
    type: 'woocommerce',
    config: {
      url: initial?.config?.url || '',
      consumerKey: initial?.config?.consumerKey || '',
      consumerSecret: initial?.config?.consumerSecret || '',
    },
    resourceMappings: initial?.resourceMappings || [],
    enabled: initial?.enabled !== false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [resources, setResources] = useState([])
  const [loadingResources, setLoadingResources] = useState(false)

  useEffect(() => {
    loadResources()
  }, [])

  async function loadResources() {
    setLoadingResources(true)
    try {
      const res = await getResources()
      setResources(res.data?.data || res.data || [])
    } catch (err) {
      console.error('Failed to load resources:', err)
    } finally {
      setLoadingResources(false)
    }
  }

  function addResourceMapping() {
    setForm(f => ({
      ...f,
      resourceMappings: [
        ...f.resourceMappings,
        {
          resourceType: '',
          externalType: 'product',
          fieldMappings: {},
          enabled: true
        }
      ]
    }))
  }

  function removeResourceMapping(index) {
    setForm(f => ({
      ...f,
      resourceMappings: f.resourceMappings.filter((_, i) => i !== index)
    }))
  }

  function updateResourceMapping(index, field, value) {
    setForm(f => ({
      ...f,
      resourceMappings: f.resourceMappings.map((m, i) =>
        i === index ? { ...m, [field]: value } : m
      )
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <Alert type="error" style={{ marginBottom: 16 }}>{error}</Alert>}
      <div className="form-group mb-4">
        <label className="form-label required">Integration Name</label>
        <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Store URL</label>
        <input
          className="form-control"
          type="url"
          placeholder="https://your-store.com"
          value={form.config.url}
          onChange={e => setForm(f => ({ ...f, config: { ...f.config, url: e.target.value } }))}
        />
        <div className="form-hint">Leave empty to use Mock Mode</div>
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Consumer Key</label>
        <input
          className="form-control"
          placeholder="ck_..."
          value={form.config.consumerKey}
          onChange={e => setForm(f => ({ ...f, config: { ...f.config, consumerKey: e.target.value } }))}
        />
      </div>
      <div className="form-group mb-4">
        <label className="form-label">Consumer Secret</label>
        <input
          className="form-control"
          type="password"
          placeholder="cs_..."
          value={form.config.consumerSecret}
          onChange={e => setForm(f => ({ ...f, config: { ...f.config, consumerSecret: e.target.value } }))}
        />
      </div>

      {/* Resource Mappings */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="form-label">Resource Mappings</label>
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={addResourceMapping}
          >
            <Plus size={14} /> Add Mapping
          </button>
        </div>
        
        {form.resourceMappings.length === 0 ? (
          <div className="text-sm text-muted p-3" style={{ background: '#f8fafc', borderRadius: 6 }}>
            No resource mappings configured. Add a mapping to sync WooCommerce data to a NEXORA resource.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {form.resourceMappings.map((mapping, index) => (
              <div
                key={index}
                className="card"
                style={{ background: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}
              >
                <div className="card-body" style={{ padding: '12px 16px' }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers size={16} className="text-primary" />
                      <span className="font-semibold text-sm">Mapping {index + 1}</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon btn-sm text-danger"
                      onClick={() => removeResourceMapping(index)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  
                  <div className="flex gap-3 mb-3">
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">WooCommerce Type</label>
                      <select
                        className="form-control text-sm"
                        value={mapping.externalType}
                        onChange={e => updateResourceMapping(index, 'externalType', e.target.value)}
                      >
                        <option value="product">Products</option>
                        <option value="customer">Customers</option>
                        <option value="order">Orders</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="form-label text-xs">Target NEXORA Resource</label>
                      <select
                        className="form-control text-sm"
                        value={mapping.resourceType}
                        onChange={e => updateResourceMapping(index, 'resourceType', e.target.value)}
                        required
                      >
                        <option value="">Select resource...</option>
                        {loadingResources ? (
                          <option disabled>Loading...</option>
                        ) : (
                          resources.map(res => (
                            <option key={res.name} value={res.name}>
                              {res.label || res.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`enabled-${index}`}
                      checked={mapping.enabled}
                      onChange={e => updateResourceMapping(index, 'enabled', e.target.checked)}
                    />
                    <label htmlFor={`enabled-${index}`} className="text-sm">
                      Enable this mapping
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a', marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '12px 16px' }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#92400e' }}>
            <AlertCircle size={16} />
            <strong>Mock Mode:</strong> If URL/credentials are empty, realistic simulated data will be used for demonstration.
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <Spinner size={16} /> : null} Save Integration
        </button>
      </div>
    </form>
  )
}

function IntegrationCard({ integration, onSync, onTest, onDelete, onEdit }) {
  const [syncing, setSyncing] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const isMockMode = !integration.config?.url && integration.type === 'woocommerce'

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await syncIntegration(integration._id)
      setSyncResult({ type: 'success', message: res.data.message || 'Sync completed' })
      onSync()
    } catch (err) {
      setSyncResult({ type: 'error', message: err.message })
    } finally {
      setSyncing(false)
    }
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testIntegration(integration._id)
      setTestResult({ type: 'success', message: res.data.message || 'Connection successful!' })
    } catch (err) {
      setTestResult({ type: 'error', message: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShoppingBag size={22} color="white" />
          </div>
          <div>
            <h4 style={{ margin: 0 }}>{integration.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted" style={{ textTransform: 'capitalize' }}>{integration.type}</span>
              {isMockMode && <Badge type="warning">Mock Mode</Badge>}
              <Badge type={STATUS_CONFIG[integration.status]?.type || 'muted'}>
                {STATUS_CONFIG[integration.status]?.label || integration.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-icon" title="Settings" onClick={() => onEdit(integration)}>
            <Settings size={16} />
          </button>
          <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="card-body">
        {(syncResult || testResult) && (
          <div style={{ marginBottom: 12 }}>
            {syncResult && <Alert type={syncResult.type}>{syncResult.message}</Alert>}
            {testResult && <Alert type={testResult.type}>{testResult.message}</Alert>}
          </div>
        )}

        <div className="flex gap-4 mb-4" style={{ flexWrap: 'wrap' }}>
          {integration.config?.url ? (
            <div>
              <div className="text-xs text-muted">Store URL</div>
              <a href={integration.config.url} target="_blank" rel="noopener noreferrer"
                className="text-sm" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                {integration.config.url} <ExternalLink size={12} />
              </a>
            </div>
          ) : (
            <div>
              <div className="text-xs text-muted">Store URL</div>
              <div className="text-sm text-muted">Not configured (Mock Mode)</div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted">Last Sync</div>
            <div className="text-sm">
              {integration.lastSync
                ? <><Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{new Date(integration.lastSync).toLocaleString()}</>
                : <span className="text-muted">Never synced</span>
              }
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">Resource Mappings</div>
            <div className="text-sm">{integration.resourceMappings?.length || 0} configured</div>
          </div>
        </div>

        {/* Field mappings preview */}
        <div className="card" style={{ background: '#f8fafc', boxShadow: 'none', border: '1px solid var(--border)' }}>
          <div className="card-body" style={{ padding: '12px 16px' }}>
            <div className="text-xs font-medium text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Field Mappings (Product)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '6px 12px', alignItems: 'center', fontSize: 13 }}>
              {[
                ['WooCommerce name', 'NEXORA name'],
                ['WooCommerce sku', 'NEXORA sku'],
                ['WooCommerce price', 'NEXORA price'],
                ['WooCommerce stock_quantity', 'NEXORA stock'],
                ['WooCommerce description', 'NEXORA description'],
              ].map(([from, to], i) => (
                <>
                  <span key={`f-${i}`} className="badge badge-muted">{from}</span>
                  <ArrowRight key={`a-${i}`} size={12} style={{ color: 'var(--text-muted)' }} />
                  <span key={`t-${i}`} className="badge badge-primary">{to}</span>
                </>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-footer">
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={handleSync} disabled={syncing || testing}>
            {syncing ? <Spinner size={16} /> : <RefreshCw size={16} />}
            {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button className="btn btn-secondary" onClick={handleTest} disabled={testing || syncing}>
            {testing ? <Spinner size={16} /> : <TestTube2 size={16} />}
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
        </div>
        {isMockMode && (
          <span className="text-xs text-muted" style={{ marginLeft: 'auto', alignSelf: 'center' }}>
            ⚠ Using mock data — configure credentials for real sync
          </span>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Integration"
        message={`Remove "${integration.name}" integration? This won't delete synced records.`}
        onConfirm={() => { onDelete(integration._id); setShowDeleteConfirm(false) }}
        onCancel={() => setShowDeleteConfirm(false)}
        danger
      />
    </div>
  )
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingIntegration, setEditingIntegration] = useState(null)

  useEffect(() => {
    loadIntegrations()
  }, [])

  async function loadIntegrations() {
    setLoading(true)
    setError(null)
    try {
      const res = await getIntegrations()
      setIntegrations(res.data.data || res.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(formData) {
    await createIntegration(formData)
    setShowAddModal(false)
    await loadIntegrations()
  }

  async function handleUpdate(formData) {
    await updateIntegration(editingIntegration._id, formData)
    setEditingIntegration(null)
    await loadIntegrations()
  }

  async function handleDelete(id) {
    try {
      await deleteIntegration(id)
      await loadIntegrations()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ padding: 32 }} className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ margin: 0 }}>Integrations</h2>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
            Connect external platforms and sync data automatically.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={16} /> Add Integration
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {[1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: 280, borderRadius: 12 }} />
          ))}
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : integrations.length === 0 ? (
        <div>
          <EmptyState
            icon={<Plug size={28} />}
            title="No Integrations"
            description="Connect your first platform to start syncing data automatically."
            action={<button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={16} /> Add WooCommerce</button>}
          />
          {/* Tip card */}
          <div className="card" style={{ maxWidth: 560, margin: '24px auto 0' }}>
            <div className="card-body">
              <div className="flex items-start gap-3">
                <div style={{ color: 'var(--warning)', marginTop: 2 }}>
                  <AlertCircle size={18} />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-1">Mock Mode Available</div>
                  <div className="text-sm text-secondary">
                    You can add a WooCommerce integration without real credentials.
                    NEXORA will use realistic simulated product data so you can test
                    the full sync workflow immediately.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {integrations.map(integration => (
            <IntegrationCard
              key={integration._id}
              integration={integration}
              onSync={loadIntegrations}
              onDelete={handleDelete}
              onEdit={setEditingIntegration}
            />
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add WooCommerce Integration"
        size="md"
      >
        <WooCommerceForm
          onSave={handleCreate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={!!editingIntegration}
        onClose={() => setEditingIntegration(null)}
        title="Edit Integration"
        size="md"
      >
        {editingIntegration && (
          <WooCommerceForm
            initial={editingIntegration}
            onSave={handleUpdate}
            onCancel={() => setEditingIntegration(null)}
          />
        )}
      </Modal>
    </div>
  )
}
