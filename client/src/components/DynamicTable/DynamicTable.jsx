import React, { useState, useRef, useEffect } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react'
import { Badge, EmptyState } from '../UI'

export default function DynamicTable({
  resource,
  records = [],
  onSort,
  sortField,
  sortDir = 'asc',
  onRowClick,
  onEdit,
  onDelete,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!records || records.length === 0) {
    return (
      <EmptyState
        icon={FileSpreadsheet}
        title="No records found"
        description="There are no records matching your current criteria or none have been created yet."
      />
    )
  }

  // Determine columns to display
  let displayFields = (resource?.fields || []).filter((f) => f.showInList)
  if (displayFields.length === 0) {
    displayFields = (resource?.fields || []).slice(0, 5)
  }

  const handleHeaderClick = (fieldName, sortable) => {
    if (!sortable || !onSort) return
    let newDir = 'asc'
    if (sortField === fieldName) {
      newDir = sortDir === 'asc' ? 'desc' : 'asc'
    }
    onSort(fieldName, newDir)
  }

  return (
    <div className="table-wrapper">
      <table className="table table-clickable">
        <thead>
          <tr>
            {displayFields.map((field) => {
              const isSorted = sortField === field.key
              const isSortable = field.sortable !== false && !!onSort

              return (
                <th
                  key={field.key}
                  onClick={() => handleHeaderClick(field.key, isSortable)}
                  style={{
                    cursor: isSortable ? 'pointer' : 'default',
                    userSelect: 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>{field.label || field.key}</span>
                    {isSortable && (
                      <span className="text-muted">
                        {isSorted ? (
                          sortDir === 'asc' ? (
                            <ChevronUp size={14} className="text-primary" />
                          ) : (
                            <ChevronDown size={14} className="text-primary" />
                          )
                        ) : (
                          <ChevronsUpDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}

            {/* Sync status column if resource or records have sync data */}
            <th style={{ width: 110 }}>Sync Status</th>

            {/* Actions column */}
            {(onEdit || onDelete || onRowClick) && (
              <th style={{ width: 80, textAlign: 'right' }}>Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const recordId = record._id || record.id

            return (
              <tr
                key={recordId}
                onClick={() => onRowClick && onRowClick(record)}
              >
                {displayFields.map((field) => {
                  const val = record.data?.[field.key] ?? record[field.key]
                  return (
                    <td key={field.key}>
                      {formatCellValue(val, field, resource)}
                    </td>
                  )
                })}

                <td>
                  <SyncBadge status={record.syncStatus || record._syncStatus || 'local'} />
                </td>

                {(onEdit || onDelete || onRowClick) && (
                  <td
                    style={{ textAlign: 'right' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="dropdown" style={{ display: 'inline-block' }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveDropdown(activeDropdown === recordId ? null : recordId)
                        }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {activeDropdown === recordId && (
                        <div
                          ref={dropdownRef}
                          className="dropdown-menu"
                          style={{ minWidth: 140 }}
                        >
                          {onRowClick && (
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                setActiveDropdown(null)
                                onRowClick(record)
                              }}
                            >
                              <Eye size={14} />
                              View
                            </button>
                          )}
                          {onEdit && (
                            <button
                              type="button"
                              className="dropdown-item"
                              onClick={() => {
                                setActiveDropdown(null)
                                onEdit(record)
                              }}
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <>
                              <div className="dropdown-divider" />
                              <button
                                type="button"
                                className="dropdown-item danger"
                                onClick={() => {
                                  setActiveDropdown(null)
                                  onDelete(record)
                                }}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SyncBadge({ status }) {
  switch (status?.toLowerCase()) {
    case 'synced':
      return <Badge variant="success">Synced</Badge>
    case 'pending':
      return <Badge variant="warning">Pending</Badge>
    case 'error':
    case 'failed':
      return <Badge variant="danger">Failed</Badge>
    default:
      return <Badge variant="muted">Local</Badge>
  }
}

function formatCellValue(val, field, resource) {
  if (val === null || val === undefined || val === '') {
    return <span className="text-muted">—</span>
  }

  // If this field is the workflow status field
  if (
    resource?.workflow?.enabled &&
    resource?.workflow?.statusField === field.key
  ) {
    const statuses = resource.workflow.statuses || []
    const statusObj = statuses.find((s) => s.key === val)
    return (
      <Badge
        style={{
          backgroundColor: statusObj?.color ? `${statusObj.color}20` : undefined,
          color: statusObj?.color || undefined,
          borderColor: statusObj?.color || undefined,
        }}
      >
        <span
          className="status-dot"
          style={{ backgroundColor: statusObj?.color || 'var(--primary)' }}
        />
        {statusObj?.label || val}
      </Badge>
    )
  }

  switch (field.type) {
    case 'boolean':
      return val ? (
        <Badge variant="success">Yes</Badge>
      ) : (
        <Badge variant="muted">No</Badge>
      )

    case 'number':
      return (
        <span className="font-mono">
          {typeof val === 'number' ? val.toLocaleString() : val}
        </span>
      )

    case 'date': {
      try {
        const d = new Date(val)
        return isNaN(d.getTime()) ? val : d.toLocaleDateString()
      } catch {
        return val
      }
    }

    case 'multiselect':
      if (Array.isArray(val)) {
        return (
          <div className="flex flex-wrap gap-1">
            {val.map((item, idx) => (
              <span key={idx} className="badge badge-secondary">
                {item}
              </span>
            ))}
          </div>
        )
      }
      return String(val)

    case 'select':
      return <Badge variant="secondary">{String(val)}</Badge>

    case 'url':
      return (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {val}
        </a>
      )

    case 'email':
      return (
        <a
          href={`mailto:${val}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {val}
        </a>
      )

    default:
      return String(val)
  }
}
