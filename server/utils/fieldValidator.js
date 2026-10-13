const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{4,15}$/;
const URL_REGEX = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;

/**
 * Validates record data against a given ResourceDefinition.
 * @param {Object} resourceDef - ResourceDefinition mongoose document or plain object
 * @param {Object} inputData - Data payload to validate
 * @param {Boolean} isUpdate - If true, only validate supplied fields (partial update)
 * @returns {Object} { isValid: boolean, errors: Array, sanitizedData: Object }
 */
function validateRecordData(resourceDef, inputData = {}, isUpdate = false) {
  const errors = [];
  const sanitizedData = {};
  const fields = resourceDef.fields || [];

  for (const field of fields) {
    const rawValue = inputData[field.key];
    const hasKey = Object.prototype.hasOwnProperty.call(inputData, field.key);

    // If update and field was not provided in payload, skip validation
    if (isUpdate && !hasKey) {
      continue;
    }

    // Required check
    const isEmpty =
      rawValue === undefined ||
      rawValue === null ||
      (typeof rawValue === 'string' && rawValue.trim() === '') ||
      (Array.isArray(rawValue) && rawValue.length === 0);

    if (field.required && isEmpty) {
      errors.push({
        field: field.key,
        message: `${field.label || field.key} is required`
      });
      continue;
    }

    // If value is empty and not required, set to default/null and continue
    if (isEmpty) {
      sanitizedData[field.key] = field.type === 'multiselect' ? [] : null;
      continue;
    }

    let val = rawValue;

    // Type casting and validation
    switch (field.type) {
      case 'number': {
        const num = Number(val);
        if (Number.isNaN(num)) {
          errors.push({ field: field.key, message: `${field.label} must be a valid number` });
          continue;
        }
        val = num;
        if (field.validation?.min !== undefined && val < field.validation.min) {
          errors.push({
            field: field.key,
            message: field.validation.message || `${field.label} must be at least ${field.validation.min}`
          });
        }
        if (field.validation?.max !== undefined && val > field.validation.max) {
          errors.push({
            field: field.key,
            message: field.validation.message || `${field.label} cannot exceed ${field.validation.max}`
          });
        }
        break;
      }

      case 'boolean': {
        if (typeof val === 'string') {
          val = val.toLowerCase() === 'true' || val === '1';
        } else {
          val = Boolean(val);
        }
        break;
      }

      case 'date': {
        const dateVal = new Date(val);
        if (Number.isNaN(dateVal.getTime())) {
          errors.push({ field: field.key, message: `${field.label} must be a valid date` });
          continue;
        }
        val = dateVal.toISOString();
        break;
      }

      case 'email': {
        if (typeof val !== 'string' || !EMAIL_REGEX.test(val.trim())) {
          errors.push({ field: field.key, message: `${field.label} must be a valid email address` });
          continue;
        }
        val = val.trim().toLowerCase();
        break;
      }

      case 'phone': {
        if (typeof val !== 'string' || !PHONE_REGEX.test(val.trim())) {
          errors.push({ field: field.key, message: `${field.label} must be a valid phone number` });
          continue;
        }
        val = val.trim();
        break;
      }

      case 'url': {
        if (typeof val !== 'string' || !URL_REGEX.test(val.trim())) {
          errors.push({ field: field.key, message: `${field.label} must be a valid URL` });
          continue;
        }
        val = val.trim();
        break;
      }

      case 'select': {
        val = String(val).trim();
        if (field.options && field.options.length > 0 && !field.options.includes(val)) {
          errors.push({
            field: field.key,
            message: `${field.label} must be one of: ${field.options.join(', ')}`
          });
          continue;
        }
        break;
      }

      case 'multiselect': {
        if (!Array.isArray(val)) {
          errors.push({ field: field.key, message: `${field.label} must be an array of values` });
          continue;
        }
        val = val.map((v) => String(v).trim());
        if (field.options && field.options.length > 0) {
          const invalid = val.filter((item) => !field.options.includes(item));
          if (invalid.length > 0) {
            errors.push({
              field: field.key,
              message: `Invalid option(s) in ${field.label}: ${invalid.join(', ')}`
            });
            continue;
          }
        }
        break;
      }

      case 'text':
      case 'textarea':
      case 'richtext':
      default: {
        val = typeof val === 'string' ? val.trim() : String(val);
        if (field.validation?.min !== undefined && val.length < field.validation.min) {
          errors.push({
            field: field.key,
            message: field.validation.message || `${field.label} must be at least ${field.validation.min} characters`
          });
        }
        if (field.validation?.max !== undefined && val.length > field.validation.max) {
          errors.push({
            field: field.key,
            message: field.validation.message || `${field.label} cannot exceed ${field.validation.max} characters`
          });
        }
        if (field.validation?.pattern) {
          try {
            const regex = new RegExp(field.validation.pattern);
            if (!regex.test(val)) {
              errors.push({
                field: field.key,
                message: field.validation.message || `${field.label} format is invalid`
              });
            }
          } catch {
            // ignore invalid pattern config
          }
        }
        break;
      }
    }

    sanitizedData[field.key] = val;
  }

  // Preserve any unmodeled fields that caller might have sent (or preserve existing keys)
  for (const key of Object.keys(inputData)) {
    if (!fields.some((f) => f.key === key) && !['createdAt', 'updatedAt', '_id', '__v'].includes(key)) {
      sanitizedData[key] = inputData[key];
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  };
}

module.exports = {
  validateRecordData
};
