import { useState, useEffect } from 'react'
import {
  Activity, RefreshCw, ChevronDown, ChevronUp, CheckCircle,
  AlertCircle, AlertTriangle, Clock, Filter
} from 'lucide-react'
import { getSyncLogs } from '../api/client'
import { Spinner, Alert, EmptyState, Badge, Pagination } from '../components/UI'

const STATUS_CONFIG = {
  success: { label: 'Success', type: 'success', icon: CheckCircle },
  error: { label: 'Error', type: 'danger', icon: AlertCircle },
  partial: { label: 'Partial', type: 'warning', icon: AlertTriangle },
}

function LogRow({ log }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.error
  const Icon = cfg.icon

  return (
    <>
      <tr
        onClick={() => log.errors?.length > 0 && setExpanded(e => !e)}
        style={{ cursor: log.errors?.length > 0 ? 'pointer' : 'default' }}
      >
        <td>
          <div className="text-sm">{new Date(log.createdAt).toLocaleString()}</div>
        </td>
        <td>
          <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{log.integration}</span>
        </td>
        <td>
          <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>{log.resourceType}</span>
        </td>
        <td>
          <span className="text-sm" style={{ textTransform: 'capitalize' }}>{log.operation}</span>
        </td>
        <td>
          <div className="flex items-center gap-1">
            <Icon size={14} />
            <Badge type={cfg.type}>{cfg.label}</Badge>
          </div>
        </td>
        <td>
          <div className="text-sm">
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{log.recordsSuccess}</span>
            {' / '}
            <span style={{ color: 'var(--text-secondary)' }}>{log.recordsProcessed}</span>
            {log.recordsError > 0 && (
              <span style={{ color: 'var(--danger)', marginLeft: 6 }}>({log.recordsError} err)</span>
            )}
          </div>
        </td>
        <td>
          <div className="text-sm text-muted">
            {log.duration ? `${(log.duration / 1000).toFixed(1)}s` : '—'}
          </div>
        </td>
        <td>
          {log.errors?.length > 0 && (
            <button className="btn btn-ghost btn-icon btn-sm" onClick={e => { e.stopPropagation(); setExpanded(ex => !ex) }}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </td>
      </tr>
      {expanded && log.errors?.length > 0 && (
        <tr>
          <td colSpan={8} style={{ background: '#fef2f2', padding: '8px 16px' }}>
            <div className="text-sm font-medium text-danger mb-2">Errors ({log.errors.length})</div>
            <div className="flex flex-col gap-1">
              {log.errors.map((err, i) => (
                <div key={i} className="text-sm" style={{ color: '#991b1b' }}>
                  {err.recordId && <span className="font-mono text-xs" style={{ marginRight: 8 }}>[{err.recordId}]</span>}
                  {err.message}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function SyncLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ status: '', integration: '' })

  const limit = 20

  useEffect(() => {
    loadLogs()
  }, [page, filters])

  async function loadLogs() {
    setLoading(true)
    setError(null)
    try {
      const params = { page, limit }
      if (filters.status) params.status = filters.status
      if (filters.integration) params.integration = filters.integration
      const res = await getSyncLogs(params)
      const data = res.data
      setLogs(data.data || data.logs || [])
      setTotal(data.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div style={{ padding: 32 }} className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 style={{ margin: 0 }}>Sync Logs</h2>
          <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
            Audit trail for all integration sync operations.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => loadLogs()}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body" style={{ padding: 16 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              className="form-control"
              style={{ width: 160 }}
              value={filters.status}
              onChange={e => { setFilters(f => ({ ...f, status: e.target.value })); setPage(1) }}
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="partial">Partial</option>
            </select>
            <input
              className="form-control"
              placeholder="Filter by integration..."
              style={{ width: 200 }}
              value={filters.integration}
              onChange={e => { setFilters(f => ({ ...f, integration: e.target.value })); setPage(1) }}
            />
            {(filters.status || filters.integration) && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => { setFilters({ status: '', integration: '' }); setPage(1) }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          <div className="card-body">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4 mb-3">
                <div className="skeleton" style={{ width: 140, height: 20 }} />
                <div className="skeleton" style={{ width: 100, height: 20 }} />
                <div className="skeleton" style={{ width: 80, height: 20 }} />
                <div className="skeleton" style={{ width: 60, height: 20 }} />
              </div>
            ))}
          </div>
        </div>
      ) : error ? (
        <Alert type="error">{error}</Alert>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<Activity size={28} />}
          title="No Sync Logs"
          description="Sync logs will appear here after you trigger integrations."
        />
      ) : (
        <>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Integration</th>
                    <th>Resource</th>
                    <th>Operation</th>
                    <th>Status</th>
                    <th>Records</th>
                    <th>Duration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => (
                    <LogRow key={log._id} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted">
                Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total} logs
              </span>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
