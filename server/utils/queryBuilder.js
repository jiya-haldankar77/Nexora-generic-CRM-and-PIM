/**
 * Builds MongoDB query, sort options, and pagination for generic ResourceRecord queries.
 *
 * @param {Object} resourceDef - ResourceDefinition schema
 * @param {Object} queryParams - Express req.query object
 * @returns {Object} { filterQuery, sortOption, page, limit, skip }
 */
function buildRecordQuery(resourceDef, queryParams = {}) {
  const {
    search,
    filters,
    sort,
    sortDir,
    page: rawPage,
    limit: rawLimit,
    syncStatus,
    syncSource
  } = queryParams;

  const filterQuery = {
    resourceType: resourceDef.name
  };

  const fields = resourceDef.fields || [];
  const searchableKeys = fields.filter((f) => f.searchable).map((f) => f.key);
  const filterableKeys = fields.filter((f) => f.filterable).map((f) => f.key);
  const sortableKeys = fields.filter((f) => f.sortable).map((f) => f.key);

  // 1. Text Search across searchable fields
  if (search && typeof search === 'string' && search.trim() !== '') {
    const trimmed = search.trim();
    // Escape regex special chars
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');

    const searchConditions = [];
    if (searchableKeys.length > 0) {
      for (const key of searchableKeys) {
        searchConditions.push({ [`data.${key}`]: regex });
      }
    } else {
      // Fallback: search across all string fields if none explicitly marked searchable
      for (const field of fields) {
        if (['text', 'email', 'phone', 'url', 'textarea', 'select'].includes(field.type)) {
          searchConditions.push({ [`data.${field.key}`]: regex });
        }
      }
    }

    // Also allow searching externalId
    searchConditions.push({ externalId: regex });

    if (searchConditions.length > 0) {
      filterQuery.$or = searchConditions;
    }
  }

  // 2. Custom Filters (can be parsed from JSON or query params)
  let parsedFilters = {};
  if (filters) {
    if (typeof filters === 'string') {
      try {
        parsedFilters = JSON.parse(filters);
      } catch {
        parsedFilters = {};
      }
    } else if (typeof filters === 'object') {
      parsedFilters = filters;
    }
  }

  // Also include individual query params that match filterable field keys
  for (const key of Object.keys(queryParams)) {
    if (
      !['search', 'filters', 'sort', 'sortDir', 'page', 'limit', 'syncStatus', 'syncSource'].includes(key)
    ) {
      parsedFilters[key] = queryParams[key];
    }
  }

  // Process filter conditions
  for (const [key, value] of Object.entries(parsedFilters)) {
    if (value === undefined || value === null || value === '') continue;

    // Direct metadata filtering
    if (['externalId', 'syncSource', 'syncStatus'].includes(key)) {
      filterQuery[key] = value;
      continue;
    }

    // Must be a known filterable field, or if definition has no explicit filterable flag set, allow defined field
    const fieldDef = fields.find((f) => f.key === key);
    if (!fieldDef && !key.startsWith('data.')) continue;

    const dataKey = key.startsWith('data.') ? key : `data.${key}`;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Operator filter, e.g. { $gte: 10, $lte: 100 }
      const opFilter = {};
      for (const [op, opVal] of Object.entries(value)) {
        if (['$gte', '$gt', '$lte', '$lt', '$ne', '$in', '$nin', '$regex'].includes(op)) {
          opFilter[op] = opVal;
        }
      }
      if (Object.keys(opFilter).length > 0) {
        filterQuery[dataKey] = opFilter;
      }
    } else if (Array.isArray(value)) {
      filterQuery[dataKey] = { $in: value };
    } else if (typeof value === 'string' && value.includes(',')) {
      filterQuery[dataKey] = { $in: value.split(',').map((s) => s.trim()) };
    } else {
      filterQuery[dataKey] = value;
    }
  }

  if (syncStatus) filterQuery.syncStatus = syncStatus;
  if (syncSource) filterQuery.syncSource = syncSource;

  // 3. Sorting
  const sortOption = {};
  const defaultSortField = resourceDef.settings?.defaultSort || 'createdAt';
  const defaultSortDirection = resourceDef.settings?.defaultSortDir === 'asc' ? 1 : -1;

  let requestedSort = sort || defaultSortField;
  const requestedDir = (sortDir || (resourceDef.settings?.defaultSortDir || 'desc')).toLowerCase() === 'asc' ? 1 : -1;

  if (['createdAt', 'updatedAt', 'externalId', 'syncStatus', '_id'].includes(requestedSort)) {
    sortOption[requestedSort] = requestedDir;
  } else {
    // Check if field is sortable or valid
    const isSortable = sortableKeys.length === 0 || sortableKeys.includes(requestedSort);
    if (isSortable) {
      const fieldPath = requestedSort.startsWith('data.') ? requestedSort : `data.${requestedSort}`;
      sortOption[fieldPath] = requestedDir;
    } else {
      sortOption.createdAt = -1;
    }
  }

  // 4. Pagination
  const defaultLimit = resourceDef.settings?.itemsPerPage || 10;
  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(rawLimit, 10) || defaultLimit));
  const skip = (page - 1) * limit;

  return {
    filterQuery,
    sortOption,
    page,
    limit,
    skip
  };
}

module.exports = {
  buildRecordQuery
};
