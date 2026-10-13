import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Zap,
  Target,
  FileText,
  Database,
  Lightbulb,
  X
} from 'lucide-react'
import {
  analyzeAIQuery,
  executeAIQuery,
  getAISuggestions
} from '../api/client'
import {
  Alert,
  Badge,
  Spinner,
  EmptyState
} from '../components/UI'

export default function AIAgent() {
  const [query, setQuery] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [result, setResult] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    loadSuggestions()
  }, [])

  async function loadSuggestions() {
    try {
      const res = await getAISuggestions()
      setSuggestions(res.data?.suggestions || [])
    } catch (err) {
      console.error('Failed to load suggestions:', err)
    }
  }

  async function handleAnalyze() {
    if (!query.trim()) return
    
    setAnalyzing(true)
    setError(null)
    setAnalysis(null)
    setResult(null)
    
    try {
      const res = await analyzeAIQuery({ query })
      setAnalysis(res.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleExecute() {
    if (!analysis) return
    
    setExecuting(true)
    setError(null)
    setResult(null)
    
    try {
      const res = await executeAIQuery({
        rule: analysis.parsed.rule,
        threshold: analysis.parsed.threshold,
        resourceType: analysis.parsed.resourceType
      })
      setResult(res.data.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setExecuting(false)
    }
  }

  function handleReset() {
    setQuery('')
    setAnalysis(null)
    setResult(null)
    setError(null)
  }

  function selectSuggestion(suggestion) {
    setQuery(suggestion)
    setAnalysis(null)
    setResult(null)
    setError(null)
  }

  return (
    <div style={{ padding: 32 }} className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={22} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0 }}>NEXORA AI Agent</h2>
              <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
                Rule-based intelligent assistant for data analysis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Query Input */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="form-group mb-4">
            <label className="form-label">What would you like to know?</label>
            <div className="flex gap-2">
              <input
                className="form-control"
                style={{ flex: 1 }}
                placeholder="e.g., Find products with stock below 10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              />
              <button
                className="btn btn-primary"
                onClick={handleAnalyze}
                disabled={analyzing || !query.trim()}
              >
                {analyzing ? <Spinner size={16} /> : <Send size={16} />}
                Analyze
              </button>
            </div>
          </div>

          {/* Suggestions */}
          {!analysis && !result && (
            <div>
              <div className="text-xs text-muted mb-2">Try asking:</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="badge badge-secondary"
                    style={{
                      cursor: 'pointer',
                      padding: '6px 12px',
                      fontSize: 13,
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0'
                    }}
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)} style={{ marginBottom: 24 }}>
          {error}
        </Alert>
      )}

      {/* Analysis Result */}
      {analysis && !result && (
        <div className="card mb-6">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-primary" />
              <h3 style={{ margin: 0 }}>Analysis Plan</h3>
            </div>
            <button
              className="btn btn-ghost btn-icon"
              onClick={handleReset}
            >
              <X size={16} />
            </button>
          </div>
          <div className="card-body">
            {!analysis.matched ? (
              <div className="flex items-start gap-3" style={{ color: '#d97706' }}>
                <AlertTriangle size={20} style={{ marginTop: 2 }} />
                <div>
                  <div className="font-semibold mb-2">Could not understand request</div>
                  <div className="text-sm text-secondary mb-3">{analysis.message}</div>
                  <div className="text-xs text-muted">Try one of the suggested queries above</div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-xs text-muted mb-1">Detected Intent</div>
                  <div className="font-semibold text-lg">{analysis.rule}</div>
                  <div className="text-sm text-secondary mt-1">
                    Confidence: {Math.round(analysis.parsed.confidence * 100)}%
                  </div>
                </div>

                {analysis.parsed.threshold && (
                  <div className="mb-4">
                    <div className="text-xs text-muted mb-1">Threshold</div>
                    <Badge type="info">{analysis.parsed.threshold}</Badge>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-xs text-muted mb-2">Execution Steps</div>
                  <div className="flex flex-col gap-2">
                    {analysis.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3"
                        style={{
                          background: '#f8fafc',
                          borderRadius: 8,
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: '#6366f1', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600
                        }}>
                          {step.step}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{step.action}</div>
                          <div className="text-xs text-secondary mt-1">{step.details}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    className="btn btn-secondary"
                    onClick={handleReset}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleExecute}
                    disabled={executing}
                  >
                    {executing ? <Spinner size={16} /> : <Zap size={16} />}
                    Execute Plan
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Execution Result */}
      {result && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-success" />
              <h3 style={{ margin: 0 }}>Results</h3>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleReset}
            >
              New Query
            </button>
          </div>
          <div className="card-body">
            {result.summary && (
              <div className="mb-4">
                <div className="text-xs text-muted mb-1">Summary</div>
                <div className="font-medium">{result.summary}</div>
              </div>
            )}

            {result.message && (
              <div className="mb-4">
                <div className="text-xs text-muted mb-1">Message</div>
                <div className="font-medium">{result.message}</div>
              </div>
            )}

            {/* Findings */}
            {result.findings && result.findings.length > 0 && (
              <div className="mb-4">
                <div className="text-xs text-muted mb-2">Findings</div>
                <div className="flex flex-col gap-3">
                  {result.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="card"
                      style={{ background: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}
                    >
                      <div className="card-body" style={{ padding: '12px 16px' }}>
                        <div className="font-semibold text-sm mb-2">
                          {finding.resourceLabel || finding.integration || finding.resource?.label}
                        </div>
                        
                        {finding.records && (
                          <div className="text-xs text-secondary mb-2">
                            {finding.count} affected records
                          </div>
                        )}
                        
                        {finding.samples && (
                          <div className="text-xs text-secondary mb-2">
                            {finding.incompleteCount || finding.total} records found
                          </div>
                        )}

                        {finding.records && finding.records.length > 0 && (
                          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            <table className="table table-sm" style={{ fontSize: 12 }}>
                              <thead>
                                <tr>
                                  <th>Name</th>
                                  <th>SKU</th>
                                  <th>Stock</th>
                                  <th>Sync Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {finding.records.slice(0, 10).map((rec, ridx) => (
                                  <tr key={ridx}>
                                    <td>{rec.name}</td>
                                    <td>{rec.sku || '—'}</td>
                                    <td>{rec.stock}</td>
                                    <td>
                                      <Badge type={rec.syncStatus === 'synced' ? 'success' : 'muted'}>
                                        {rec.syncStatus || 'Local'}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {finding.samples && finding.samples.length > 0 && (
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            <div className="font-semibold mb-1">Sample records:</div>
                            {finding.samples.map((sample, sidx) => (
                              <div key={sidx} className="mb-1">
                                Missing: {sample.missingFields?.join(', ') || 'N/A'}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Statistics */}
            {result.statistics && (
              <div className="mb-4">
                <div className="text-xs text-muted mb-2">Statistics</div>
                <div className="flex gap-4 flex-wrap">
                  <div className="card" style={{ background: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      <div className="text-xs text-muted">Total Records</div>
                      <div className="font-semibold text-lg">{result.statistics.totalRecords}</div>
                    </div>
                  </div>
                  <div className="card" style={{ background: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      <div className="text-xs text-muted">Fields</div>
                      <div className="font-semibold text-lg">{result.statistics.fieldCount}</div>
                    </div>
                  </div>
                  <div className="card" style={{ background: '#f8fafc', boxShadow: 'none', border: '1px solid #e2e8f0' }}>
                    <div className="card-body" style={{ padding: '12px 16px' }}>
                      <div className="text-xs text-muted">Required Fields</div>
                      <div className="font-semibold text-lg">{result.statistics.requiredFieldCount}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div>
                <div className="text-xs text-muted mb-2 flex items-center gap-2">
                  <Lightbulb size={14} />
                  Recommendations
                </div>
                <div className="flex flex-col gap-2">
                  {result.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3"
                      style={{
                        background: '#f0fdf4',
                        borderRadius: 8,
                        border: '1px solid #bbf7d0'
                      }}
                    >
                      <CheckCircle2 size={16} className="text-success" style={{ marginTop: 2 }} />
                      <div className="text-sm">{rec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
