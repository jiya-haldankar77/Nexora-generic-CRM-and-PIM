import { useState, useEffect, useCallback } from 'react'
import { getResource, getRecords } from '../api/client'

export function useResource(name) {
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchResource = useCallback(async () => {
    if (!name) return
    setLoading(true)
    setError(null)
    try {
      const res = await getResource(name)
      setResource(res.data)
    } catch (err) {
      setError(err.message || 'Failed to fetch resource definition')
    } finally {
      setLoading(false)
    }
  }, [name])

  useEffect(() => {
    fetchResource()
  }, [fetchResource])

  return { resource, loading, error, refetch: fetchResource }
}

export function useRecords(resourceType, params = {}) {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(params.page || 1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Serialize params for stable dependency comparison
  const serializedParams = JSON.stringify(params)

  const fetchRecords = useCallback(async () => {
    if (!resourceType) return
    setLoading(true)
    setError(null)
    try {
      const currentParams = JSON.parse(serializedParams)
      const res = await getRecords(resourceType, currentParams)
      // Handles both { data: [...], total, page } or { data: { records, total } } or array res.data
      if (Array.isArray(res.data)) {
        setRecords(res.data)
        setTotal(res.data.length)
        setPage(1)
      } else if (res.data?.records) {
        setRecords(res.data.records)
        setTotal(res.data.total ?? res.data.records.length)
        setPage(res.data.page ?? 1)
      } else if (res.data?.data) {
        setRecords(res.data.data)
        setTotal(res.data.total ?? res.data.data.length)
        setPage(res.data.page ?? 1)
      } else {
        setRecords([])
        setTotal(0)
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }, [resourceType, serializedParams])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { records, total, page, loading, error, refetch: fetchRecords }
}
