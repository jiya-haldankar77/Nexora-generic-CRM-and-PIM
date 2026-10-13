import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// Overview
export const getOverview = () => api.get('/overview')

// Resource Definitions
export const getResources = () => api.get('/resources')
export const getResource = (name) => api.get(`/resources/${name}`)
export const createResource = (data) => api.post('/resources', data)
export const updateResource = (name, data) => api.put(`/resources/${name}`, data)
export const deleteResource = (name) => api.delete(`/resources/${name}`)

// Records (Generic Engine)
export const getRecords = (resourceType, params) =>
  api.get(`/records/${resourceType}`, { params })
export const getRecord = (resourceType, id) =>
  api.get(`/records/${resourceType}/${id}`)
export const createRecord = (resourceType, data) =>
  api.post(`/records/${resourceType}`, data)
export const updateRecord = (resourceType, id, data) =>
  api.put(`/records/${resourceType}/${id}`, data)
export const deleteRecord = (resourceType, id) =>
  api.delete(`/records/${resourceType}/${id}`)
export const transitionRecord = (resourceType, id, data) =>
  api.post(`/records/${resourceType}/${id}/transition`, data)

// Workflows
export const getWorkflows = () => api.get('/workflows')

// Integrations
export const getIntegrations = () => api.get('/integrations')
export const getIntegration = (id) => api.get(`/integrations/id/${id}`)
export const createIntegration = (data) => api.post('/integrations', data)
export const updateIntegration = (id, data) => api.put(`/integrations/${id}`, data)
export const deleteIntegration = (id) => api.delete(`/integrations/${id}`)
export const syncIntegration = (id) => api.post(`/integrations/${id}/sync`)
export const testIntegration = (id) => api.post(`/integrations/${id}/test`)
export const exportToWooCommerce = (recordId) => api.post(`/integrations/woocommerce/export/${recordId}`)
export const getAvailableResourceTypes = (id) => api.get(`/integrations/${id}/resource-types`)
export const getFieldSchema = (id, externalType) => api.get(`/integrations/${id}/field-schema/${externalType}`)

// Sync Logs
export const getSyncLogs = (params) => api.get('/sync-logs', { params })

// AI Agent
export const analyzeAIQuery = (data) => api.post('/ai-agent/analyze', data)
export const executeAIQuery = (data) => api.post('/ai-agent/execute', data)
export const getAISuggestions = () => api.get('/ai-agent/suggestions')

export default api
