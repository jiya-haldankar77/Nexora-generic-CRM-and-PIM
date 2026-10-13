import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  Filter,
  RefreshCw,
  X,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Database,
} from 'lucide-react'
import {
  getResource,
  getRecords,
  createRecord,
  deleteRecord,
} from '../api/client'
import {
  SearchInput,
  Pagination,
  Modal,
  ConfirmDialog,
  Alert,
  Skeleton,
  EmptyState,
} from '../components/UI'
import DynamicTable from '../components/DynamicTable/DynamicTable'
import DynamicForm from '../components/DynamicForm/DynamicForm'

export default function Records() {
  const { name: resourceName } = useParams()
  const navigate = useNavigate()

  // Resource Schema
  const [resource, setResource] = useState(null)
  const [loadingResource, setLoadingResource] = useState(true)

  // Records data
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [loadingRecords, setLoadingRecords] = useState(true)

  // Query state
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortField, setSortField] = useState('')
  const [sortDir, setSortDir] = useState('asc')
  const [filters, setFilters] = useState({})
  const [showFilters, setShowFilters] = useState(false)

  // Modals & Actions
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Load resource schema
  useEffect(() => {
    let isMounted = true
    const fetchSchema = async () => {
      setLoadingResource(true)
      try {
        const res = await getResource(resourceName)
        if (isMounted) {
          const resData = res.data?.data || res.data
          setResource(resData)
          if (resData.defaultSort) {
            setSortField(resData.defaultSort)
          }
        }
      } catch (err) {
        if (isMounted) {
          setFeedback({ type: 'error', message: err.message || 'Failed to load resource schema' })
        }
      } finally {
        if (isMounted) setLoadingResource(false)
      }
    }

    fetchSchema()
    return () => {
      isMounted = false
    }
  }, [resourceName])

  // Load records
  const fetchRecords = useCallback(async () => {
    if (!resourceName) return
    setLoadingRecords(true)
    try {
      const limit = resource?.itemsPerPage || 10
      const params = {
        page,
        limit,
        search: debouncedSearch || undefined,
        sortBy: sortField || undefined,
        sortDir: sortDir || undefined,
        ...filters,
      }

      const res = await getRecords(resourceName, params)
      const responseData = res.data?.data || res.data
      
      if (Array.isArray(responseData)) {
        setRecords(responseData)
        setTotal(responseData.length)
      } else if (responseData?.records) {
        setRecords(responseData.records)
        setTotal(responseData.total ?? responseData.records.length)
      } else if (responseData?.data) {
        setRecords(responseData.data)
        setTotal(responseData.total ?? responseData.data.length)
      } else {
        setRecords([])
        setTotal(0)
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to fetch records' })
    } finally {
      setLoadingRecords(false)
    }
  }, [resourceName, page, debouncedSearch, sortField, sortDir, filters, resource?.itemsPerPage])

  useEffect(() => {
    if (resource) {
      fetchRecords()
    }
  }, [resource, fetchRecords])

  // Sort handler
  const handleSort = (field, dir) => {
    setSortField(field)
    setSortDir(dir)
    setPage(1)
  }

  // Filter change
  const handleFilterChange = (fieldName, value) => {
    setFilters((prev) => {
      const next = { ...prev }
      if (value === '' || value === undefined || value === null) {
        delete next[fieldName]
      } else {
        next[fieldName] = value
      }
      return next
    })
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
    setPage(1)
  }

  // Create record
  const handleCreateRecord = async (formData) => {
    setCreating(true)
    try {
      await createRecord(resourceName, formData)
      setCreateModalOpen(false)
      setFeedback({ type: 'success', message: 'Record created successfully!' })
      fetchRecords()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create record' })
    } finally {
      setCreating(false)
    }
  }

  // Delete record
  const handleDeleteRecord = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const id = deleteTarget._id || deleteTarget.id
      await deleteRecord(resourceName, id)
      setDeleteTarget(null)
      setFeedback({ type: 'success', message: 'Record deleted successfully' })
      fetchRecords()
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete record' })
    } finally {
      setDeleting(false)
    }
  }

  const filterableFields = useMemo(() => {
    return (resource?.fields || []).filter((f) => f.filterable)
  }, [resource])

  const totalPages = Math.ceil(total / (resource?.itemsPerPage || 10)) || 1

  if (loadingResource) {
    return (
      <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Skeleton height={40} width={260} />
        <Skeleton height={360} />
      </div>
    )
  }

  if (!resource) {
    return (
      <EmptyState
        icon={Database}
        title="Resource not found"
        description={`The requested resource "${resourceName}" does not exist in schema definitions.`}
        action={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/resources')}
          >
            Back to Resources
          </button>
        }
      />
    )
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
            {resource.label || resource.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4 }}>
            {resource.description || `Manage and query documents stored for the ${resource.name} schema.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={fetchRecords}
            title="Refresh records"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus size={15} />
            New Record
          </button>
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

      {/* Control Bar: Search & Filter Toggles */}
      <div className="card">
        <div className="card-body" style={{ padding: 14 }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3" style={{ flex: 1, minWidth: 260 }}>
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={`Search ${resource.label || resource.name}...`}
                style={{ maxWidth: 360 }}
              />

              {filterableFields.length > 0 && (
                <button
                  type="button"
                  className={`btn btn-sm ${
                    showFilters || Object.keys(filters).length > 0
                      ? 'btn-primary'
                      : 'btn-secondary'
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={14} />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <span className="badge badge-secondary" style={{ marginLeft: 4, padding: '1px 6px' }}>
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              )}

              {Object.keys(filters).length > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-danger"
                  onClick={clearFilters}
                >
                  <X size={14} />
                  Clear Filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Total: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong> records</span>
            </div>
          </div>

          {/* Filter Drawer */}
          {showFilters && filterableFields.length > 0 && (
            <div
              className="mt-3 pt-3"
              style={{
                borderTop: '1px solid var(--border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: 12,
              }}
            >
              {filterableFields.map((field) => (
                <div key={field.key} className="form-group">
                  <label className="form-label text-xs">{field.label || field.key}</label>
                  {field.type === 'select' ? (
                    <select
                      className="form-control text-sm"
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    >
                      <option value="">All</option>
                      {(field.options || []).map((opt) => {
                        const val = typeof opt === 'object' ? opt.value : opt
                        const lbl = typeof opt === 'object' ? opt.label : opt
                        return (
                          <option key={val} value={val}>
                            {lbl}
                          </option>
                        )
                      })}
                    </select>
                  ) : field.type === 'boolean' ? (
                    <select
                      className="form-control text-sm"
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="form-control text-sm"
                      placeholder={`Filter by ${field.label || field.key}`}
                      value={filters[field.key] || ''}
                      onChange={(e) => handleFilterChange(field.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Records Table */}
      <div className="card">
        {loadingRecords ? (
          <div className="p-6">
            <Skeleton height={240} />
          </div>
        ) : (
          <>
            <DynamicTable
              resource={resource}
              records={records}
              sortField={sortField}
              sortDir={sortDir}
              onSort={handleSort}
              onRowClick={(rec) => {
                const id = rec._id || rec.id
                navigate(`/resources/${resourceName}/records/${id}`)
              }}
              onEdit={(rec) => {
                const id = rec._id || rec.id
                navigate(`/resources/${resourceName}/records/${id}?mode=edit`)
              }}
              onDelete={(rec) => setDeleteTarget(rec)}
            />

            {total > 0 && (
              <div
                className="card-footer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span className="text-xs text-muted">
                  Showing page {page} of {totalPages} ({total} items total)
                </span>

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* New Record Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Add New ${resource.label || resource.name}`}
        size="lg"
      >
        <DynamicForm
          resource={resource}
          onSubmit={handleCreateRecord}
          onCancel={() => setCreateModalOpen(false)}
          isLoading={creating}
          submitLabel="Create Record"
        />
      </Modal>

      {/* Delete Record Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Record"
        message="Are you sure you want to permanently delete this record? This action cannot be reversed."
        confirmText="Delete"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDeleteRecord}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
