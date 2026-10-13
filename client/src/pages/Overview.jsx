import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Database,
  FileSpreadsheet,
  CheckCircle2,
  Plug,
  Plus,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import { getOverview, getResources } from '../api/client'
import { StatCard, Skeleton, Badge, EmptyState } from '../components/UI'

export default function Overview() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [overviewRes, resourcesRes] = await Promise.allSettled([
        getOverview(),
        getResources(),
      ])

      if (overviewRes.status === 'fulfilled') {
        const fullResponse = overviewRes.value
        // API returns { success: true, data: {...} }
        // Axios wraps this as response.data, so actual data is at response.data.data
        const overviewData = fullResponse?.data?.data
        setData(overviewData || {
          totalResources: 0,
          totalRecords: 0,
          syncedRecords: 0,
          activeIntegrations: 0,
          recentRecords: [],
          recentLogs: [],
        })
      } else {
        console.error('Overview: API failed', overviewRes.reason)
        setData({
          totalResources: 0,
          totalRecords: 0,
          syncedRecords: 0,
          activeIntegrations: 0,
          recentRecords: [],
          recentLogs: [],
        })
      }

      if (resourcesRes.status === 'fulfilled') {
        const resourcesData = resourcesRes.value?.data?.data
        setResources(Array.isArray(resourcesData) ? resourcesData : [])
      } else {
        console.error('Overview: Resources API failed', resourcesRes.reason)
        setResources([])
      }
    } catch (err) {
      console.error('Overview: Unexpected error', err)
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
          <Skeleton height={110} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
          <Skeleton height={320} />
          <Skeleton height={320} />
        </div>
      </div>
    )
  }

  const stats = data || {}
  const recentRecords = stats.recentRecords || []
  const recentLogs = stats.recentLogs || stats.recentSyncLogs || []

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            System Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            Real-time status of your schemas, record instances, and automated pipelines.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchData}
            title="Refresh overview data"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <Link to="/resources/builder" className="btn btn-primary btn-sm">
            <Plus size={15} />
            New Resource
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 20,
        }}
      >
        <StatCard
          icon={Database}
          label="Total Resources"
          value={stats.totalResources ?? 0}
          change="Configured schemas"
          color="primary"
        />
        <StatCard
          icon={FileSpreadsheet}
          label="Total Records"
          value={stats.totalRecords ?? 0}
          change="Across all resources"
          color="secondary"
        />
        <StatCard
          icon={CheckCircle2}
          label="Synced Records"
          value={stats.syncStatusSummary?.synced ?? 0}
          change="External systems matched"
          color="success"
        />
        <StatCard
          icon={Plug}
          label="Active Integrations"
          value={stats.activeIntegrations?.length ?? 0}
          change="Channels enabled"
          color="accent"
        />
      </div>

      {/* Main Grid: Recent Records & Recent Sync Logs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: 24,
        }}
      >
        {/* Recent Records Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: 16 }}>Recent Records</h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                Latest documents processed across all tables
              </p>
            </div>
            {resources.length > 0 && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate(`/resources/${resources[0].name}/records`)}
              >
                View all <ArrowRight size={14} />
              </button>
            )}
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentRecords.length === 0 ? (
              <EmptyState
                icon={FileSpreadsheet}
                title="No recent records"
                description="Create resources and start adding records to see them listed here."
                action={
                  resources.length > 0 ? (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate(`/resources/${resources[0].name}/records`)}
                    >
                      <Plus size={14} /> Add First Record
                    </button>
                  ) : null
                }
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Resource</th>
                      <th>Identifier / Title</th>
                      <th>Sync Status</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecords.map((rec, i) => {
                      const resType = rec.resourceType || rec._resourceType || 'record'
                      const title =
                        rec.title ||
                        rec.name ||
                        rec.email ||
                        rec.order_number ||
                        rec._id ||
                        rec.id ||
                        `#${i + 1}`

                      return (
                        <tr
                          key={rec._id || rec.id || i}
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            if (rec.resourceType && (rec._id || rec.id)) {
                              navigate(`/resources/${rec.resourceType}/records/${rec._id || rec.id}`)
                            }
                          }}
                        >
                          <td>
                            <Badge variant="primary">{resType}</Badge>
                          </td>
                          <td className="font-medium truncate" style={{ maxWidth: 160 }}>
                            {String(title)}
                          </td>
                          <td>
                            <Badge variant={rec.syncStatus === 'synced' ? 'success' : 'muted'}>
                              {rec.syncStatus || 'local'}
                            </Badge>
                          </td>
                          <td className="text-muted text-xs">
                            {rec.updatedAt ? new Date(rec.updatedAt).toLocaleTimeString() : 'Just now'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Sync Logs Card */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 style={{ fontSize: 16 }}>Recent Sync Logs</h3>
              <p className="text-xs text-muted" style={{ marginTop: 2 }}>
                Audit history of inbound & outbound pipelines
              </p>
            </div>
            <Link to="/sync-logs" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentLogs.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No recent sync logs"
                description="Run an integration sync to see automated operational metrics."
                action={
                  <Link to="/integrations" className="btn btn-secondary btn-sm">
                    Go to Integrations
                  </Link>
                }
              />
            ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Integration</th>
                      <th>Status</th>
                      <th>Records</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log, i) => (
                      <tr key={log._id || log.id || i}>
                        <td className="font-medium">{log.integration || log.source || 'WooCommerce'}</td>
                        <td>
                          <Badge
                            variant={
                              log.status === 'success'
                                ? 'success'
                                : log.status === 'partial'
                                ? 'warning'
                                : 'danger'
                            }
                          >
                            {log.status}
                          </Badge>
                        </td>
                        <td>
                          <span className="font-mono text-xs">
                            {log.processedCount ?? log.successCount ?? 0} items
                          </span>
                        </td>
                        <td className="text-muted text-xs">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
