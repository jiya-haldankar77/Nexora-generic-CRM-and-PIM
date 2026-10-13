import React, { useState, useEffect, useRef } from 'react'
import { X, Plus, AlertCircle } from 'lucide-react'
import { Spinner } from '../UI'

export default function DynamicForm({
  resource,
  initialData = {},
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel = 'Save Record',
}) {
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const prevFieldKeysRef = useRef('')

  // Initialize form state - only when field keys change, not when field properties change
  useEffect(() => {
    if (!resource || !resource.fields) return

    const currentFieldKeys = resource.fields.map(f => f.key).sort().join(',')

    // Only reset if field keys have changed
    if (currentFieldKeys === prevFieldKeysRef.current) {
      return
    }

    prevFieldKeysRef.current = currentFieldKeys

    setFormData(prevFormData => {
      const initial = { ...prevFormData }
      const dataSource = initialData?.data || initialData || {}
      resource.fields.forEach((field) => {
        // Preserve existing value if it exists in current formData
        if (prevFormData[field.key] !== undefined) {
          initial[field.key] = prevFormData[field.key]
        } else if (dataSource[field.key] !== undefined) {
          initial[field.key] = dataSource[field.key]
        } else if (field.defaultValue !== undefined) {
          initial[field.key] = field.defaultValue
        } else if (field.type === 'boolean') {
          initial[field.key] = false
        } else if (field.type === 'multiselect') {
          initial[field.key] = []
        } else {
          initial[field.key] = ''
        }
      })
      return initial
    })
  }, [resource.fields, initialData])

  const validateField = (field, value) => {
    if (field.required) {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        return `${field.label || field.key} is required`
      }
    }

    if (value !== undefined && value !== null && value !== '') {
      if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return 'Please enter a valid email address'
        }
      }

      if (field.type === 'number') {
        const numVal = Number(value)
        if (isNaN(numVal)) {
          return 'Must be a valid number'
        }
        if (field.min !== undefined && numVal < field.min) {
          return `Minimum value is ${field.min}`
        }
        if (field.max !== undefined && numVal > field.max) {
          return `Maximum value is ${field.max}`
        }
      }

      if (field.pattern) {
        try {
          const reg = new RegExp(field.pattern)
          if (!reg.test(value)) {
            return field.patternError || 'Input does not match the required pattern'
          }
        } catch {
          // ignore invalid regex string in config
        }
      }
    }

    return null
  }

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    if (touched[fieldName]) {
      const field = (resource.fields || []).find((f) => f.key === fieldName)
      if (field) {
        const error = validateField(field, value)
        setErrors((prev) => ({ ...prev, [fieldName]: error }))
      }
    }
  }

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    const field = (resource.fields || []).find((f) => f.key === fieldName)
    if (field) {
      const error = validateField(field, formData[field.key])
      setErrors((prev) => ({ ...prev, [fieldName]: error }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!resource || !resource.fields) return

    const newErrors = {}
    const newTouched = {}

    resource.fields.forEach((field) => {
      newTouched[field.key] = true
      const err = validateField(field, formData[field.key])
      if (err) {
        newErrors[field.key] = err
      }
    })

    setTouched(newTouched)
    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData)
    }
  }

  if (!resource || !resource.fields || resource.fields.length === 0) {
    return (
      <div className="p-4 text-muted">
        No fields defined for this resource.
      </div>
    )
  }

  const sortedFields = [...resource.fields].sort(
    (a, b) => (a.order || 0) - (b.order || 0)
  )

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px 20px',
        }}
      >
        {sortedFields.map((field) => {
          const isFullWidth =
            field.type === 'textarea' ||
            field.type === 'multiselect' ||
            field.fullWidth

          return (
            <div
              key={field.key}
              className="form-group"
              style={{
                gridColumn: isFullWidth ? '1 / -1' : undefined,
              }}
            >
              <label
                className={`form-label ${field.required ? 'required' : ''}`}
                htmlFor={`field-${field.key}`}
              >
                {field.label || field.key}
              </label>

              {renderFieldInput(
                field,
                formData[field.key],
                (val) => handleChange(field.key, val),
                () => handleBlur(field.key),
                errors[field.key]
              )}

              {field.description && !errors[field.key] && (
                <span className="form-hint">{field.description}</span>
              )}

              {errors[field.key] && (
                <span className="form-error">
                  <AlertCircle size={14} />
                  {errors[field.key]}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div
        className="mt-6 flex items-center justify-end gap-3"
        style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}
      >
        {onCancel && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
        >
          {isLoading && <Spinner size={16} />}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

function renderFieldInput(field, value, onChange, onBlur, error) {
  const hasError = !!error
  const inputClass = `form-control ${hasError ? 'error' : ''}`

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          id={`field-${field.key}`}
          className={inputClass}
          placeholder={field.placeholder || `Enter ${field.label || field.key}`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          rows={field.rows || 3}
        />
      )

    case 'select': {
      const options = field.options || []
      return (
        <select
          id={`field-${field.key}`}
          className={inputClass}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        >
          <option value="">-- Select {field.label || field.key} --</option>
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt
            const lbl = typeof opt === 'object' ? opt.label : opt
            return (
              <option key={val} value={val}>
                {lbl}
              </option>
            )
          })}
        </select>
      )
    }

    case 'multiselect': {
      const selected = Array.isArray(value) ? value : []
      const options = (field.options || []).map((opt) =>
        typeof opt === 'object' ? opt : { value: opt, label: opt }
      )

      const toggleItem = (val) => {
        if (selected.includes(val)) {
          onChange(selected.filter((item) => item !== val))
        } else {
          onChange([...selected, val])
        }
      }

      return (
        <div>
          <div
            className="flex flex-wrap gap-2 mb-2 p-2"
            style={{
              minHeight: 38,
              border: `1px solid ${hasError ? 'var(--danger)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              background: 'white',
            }}
          >
            {selected.length === 0 ? (
              <span className="text-muted text-sm" style={{ padding: '2px 4px' }}>
                No options selected
              </span>
            ) : (
              selected.map((val) => {
                const optObj = options.find((o) => o.value === val)
                const label = optObj ? optObj.label : val
                return (
                  <span key={val} className="tag">
                    {label}
                    <span
                      className="tag-remove"
                      onClick={() => toggleItem(val)}
                      role="button"
                    >
                      <X size={12} />
                    </span>
                  </span>
                )
              })
            )}
          </div>
          {options.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {options.map((opt) => {
                const isSelected = selected.includes(opt.value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`btn btn-sm ${
                      isSelected ? 'btn-primary' : 'btn-secondary'
                    }`}
                    onClick={() => toggleItem(opt.value)}
                    style={{ fontSize: 12, padding: '4px 8px' }}
                  >
                    {!isSelected && <Plus size={12} />}
                    {opt.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    case 'boolean':
      return (
        <div className="flex items-center gap-3" style={{ height: 38 }}>
          <label className="toggle">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              onBlur={onBlur}
            />
            <span className="toggle-slider" />
          </label>
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            {value ? 'Yes / Enabled' : 'No / Disabled'}
          </span>
        </div>
      )

    case 'number':
      return (
        <input
          id={`field-${field.key}`}
          type="number"
          className={inputClass}
          placeholder={field.placeholder || '0'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          onBlur={onBlur}
          min={field.min}
          max={field.max}
          step={field.step || 'any'}
        />
      )

    case 'date':
      return (
        <input
          id={`field-${field.key}`}
          type="date"
          className={inputClass}
          value={value ? String(value).slice(0, 10) : ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )

    case 'email':
      return (
        <input
          id={`field-${field.key}`}
          type="email"
          className={inputClass}
          placeholder={field.placeholder || 'name@example.com'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )

    case 'phone':
      return (
        <input
          id={`field-${field.key}`}
          type="tel"
          className={inputClass}
          placeholder={field.placeholder || '+1 (555) 000-0000'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )

    case 'url':
      return (
        <input
          id={`field-${field.key}`}
          type="url"
          className={inputClass}
          placeholder={field.placeholder || 'https://example.com'}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )

    default:
      return (
        <input
          id={`field-${field.key}`}
          type="text"
          className={inputClass}
          placeholder={field.placeholder || `Enter ${field.label || field.key}`}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
        />
      )
  }
}
