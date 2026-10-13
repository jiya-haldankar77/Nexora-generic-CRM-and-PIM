const ResourceRecord = require('../models/ResourceRecord');
const ResourceDefinition = require('../models/ResourceDefinition');
const SyncLog = require('../models/SyncLog');
const Integration = require('../models/Integration');

/**
 * Rule-based AI Agent Controller
 * Uses deterministic rules to parse user queries and execute MongoDB operations
 */

// Rule definitions with keyword patterns
const RULES = [
  {
    id: 'low_stock',
    name: 'Low Stock Detection',
    keywords: ['stock', 'inventory', 'below', 'low', 'out', 'shortage'],
    description: 'Find products with stock below a threshold',
    requiresThreshold: true,
    thresholdDefault: 10,
    thresholdParam: 'stock_threshold'
  },
  {
    id: 'missing_fields',
    name: 'Missing Required Fields',
    keywords: ['missing', 'incomplete', 'empty', 'required', 'fields'],
    description: 'Find records with missing required field values',
    requiresThreshold: false
  },
  {
    id: 'failed_syncs',
    name: 'Failed Integration Syncs',
    keywords: ['failed', 'sync', 'error', 'integration', 'synclog'],
    description: 'Find failed synchronization operations',
    requiresThreshold: false
  },
  {
    id: 'resource_summary',
    name: 'Resource Summary',
    keywords: ['summarize', 'analyze', 'overview', 'resource'],
    description: 'Summarize a resource and suggest improvements',
    requiresThreshold: false,
    requiresResource: true
  }
];

/**
 * Parse user query and match to rule
 */
function parseQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Try to match rules based on keywords
  for (const rule of RULES) {
    const keywordMatches = rule.keywords.filter(keyword => 
      lowerQuery.includes(keyword)
    );
    
    if (keywordMatches.length >= 2) {
      const result = {
        rule: rule.id,
        ruleName: rule.name,
        confidence: keywordMatches.length / rule.keywords.length
      };
      
      // Extract threshold if needed
      if (rule.requiresThreshold) {
        const thresholdMatch = lowerQuery.match(/(\d+)/);
        if (thresholdMatch) {
          result.threshold = parseInt(thresholdMatch[1], 10);
        } else {
          result.threshold = rule.thresholdDefault;
        }
      }
      
      // Extract resource name if needed
      if (rule.requiresResource) {
        const resourceMatch = query.match(/(?:resource|type|schema)\s+(\w+)/i);
        if (resourceMatch) {
          result.resourceType = resourceMatch[1].toLowerCase();
        }
      }
      
      return result;
    }
  }
  
  return null;
}

/**
 * Analyze query and return execution plan
 */
const analyzeQuery = async (req, res, next) => {
  try {
    const { query } = req.body;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Query is required'
      });
    }
    
    const parsed = parseQuery(query);
    
    if (!parsed) {
      return res.json({
        success: true,
        matched: false,
        message: 'I could not understand your request. Try asking about: low stock, missing fields, failed syncs, or resource summary.',
        suggestions: [
          'Find products with stock below 10',
          'Find records with missing required fields',
          'Check failed integration syncs',
          'Summarize the product resource'
        ]
      });
    }
    
    const rule = RULES.find(r => r.id === parsed.rule);
    
    // Build execution plan
    const steps = [];
    
    switch (parsed.rule) {
      case 'low_stock':
        steps.push({
          step: 1,
          action: 'Query MongoDB for records with stock below threshold',
          details: `Find records where stock < ${parsed.threshold}`
        });
        steps.push({
          step: 2,
          action: 'Aggregate results by resource type',
          details: 'Count affected records per resource'
        });
        steps.push({
          step: 3,
          action: 'Generate report with recommendations',
          details: 'Suggest reorder actions or stock adjustments'
        });
        break;
        
      case 'missing_fields':
        steps.push({
          step: 1,
          action: 'Fetch all resource definitions',
          details: 'Get required field configurations'
        });
        steps.push({
          step: 2,
          action: 'Scan records for missing required values',
          details: 'Check each record against its schema requirements'
        });
        steps.push({
          step: 3,
          action: 'Compile report of incomplete records',
          details: 'List affected records and missing fields'
        });
        break;
        
      case 'failed_syncs':
        steps.push({
          step: 1,
          action: 'Query sync logs for failed operations',
          details: 'Find sync logs with error status'
        });
        steps.push({
          step: 2,
          action: 'Analyze error patterns',
          details: 'Group errors by integration type'
        });
        steps.push({
          step: 3,
          action: 'Generate troubleshooting report',
          details: 'Identify common issues and suggest fixes'
        });
        break;
        
      case 'resource_summary':
        steps.push({
          step: 1,
          action: 'Fetch resource definition',
          details: `Get schema for ${parsed.resourceType || 'specified resource'}`
        });
        steps.push({
          step: 2,
          action: 'Query record statistics',
          details: 'Count total records, analyze field usage'
        });
        steps.push({
          step: 3,
          action: 'Generate summary and suggestions',
          details: 'Provide insights and improvement recommendations'
        });
        break;
    }
    
    res.json({
      success: true,
      matched: true,
      parsed,
      rule: rule.name,
      steps,
      requiresConfirmation: false // Analysis only, no data changes
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute the analyzed query plan
 */
const executeQuery = async (req, res, next) => {
  try {
    const { rule, threshold, resourceType } = req.body;
    
    if (!rule) {
      return res.status(400).json({
        success: false,
        error: 'Rule is required for execution'
      });
    }
    
    let result;
    
    switch (rule) {
      case 'low_stock':
        result = await executeLowStockQuery(threshold || 10);
        break;
        
      case 'missing_fields':
        result = await executeMissingFieldsQuery();
        break;
        
      case 'failed_syncs':
        result = await executeFailedSyncsQuery();
        break;
        
      case 'resource_summary':
        result = await executeResourceSummaryQuery(resourceType);
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: `Unknown rule: ${rule}`
        });
    }
    
    res.json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Execute low stock query
 */
async function executeLowStockQuery(threshold) {
  const resourceDefs = await ResourceDefinition.find({
    'fields.key': 'stock'
  });
  
  const results = [];
  
  for (const resourceDef of resourceDefs) {
    const records = await ResourceRecord.find({
      resourceType: resourceDef.name,
      'data.stock': { $lt: threshold }
    }).limit(50);
    
    if (records.length > 0) {
      results.push({
        resourceType: resourceDef.name,
        resourceLabel: resourceDef.label,
        threshold,
        count: records.length,
        records: records.map(r => ({
          id: r._id,
          name: r.data.name || r.data.title || 'Unnamed',
          sku: r.data.sku,
          stock: r.data.stock,
          syncStatus: r.syncStatus
        }))
      });
    }
  }
  
  const totalAffected = results.reduce((sum, r) => sum + r.count, 0);
  
  return {
    queryType: 'low_stock',
    threshold,
    totalAffected,
    findings: results,
    summary: `Found ${totalAffected} records with stock below ${threshold}`,
    recommendations: totalAffected > 0 
      ? ['Review affected items and consider reordering', 'Set up automated stock alerts', 'Update stock levels from suppliers']
      : ['All products have sufficient stock levels']
  };
}

/**
 * Execute missing fields query
 */
async function executeMissingFieldsQuery() {
  const resourceDefs = await ResourceDefinition.find();
  const results = [];
  
  for (const resourceDef of resourceDefs) {
    const requiredFields = resourceDef.fields
      .filter(f => f.required)
      .map(f => f.key);
    
    if (requiredFields.length === 0) continue;
    
    const records = await ResourceRecord.find({
      resourceType: resourceDef.name
    }).limit(100);
    
    const incompleteRecords = [];
    
    for (const record of records) {
      const missingFields = requiredFields.filter(
        field => !record.data[field] || record.data[field] === ''
      );
      
      if (missingFields.length > 0) {
        incompleteRecords.push({
          id: record._id,
          missingFields,
          data: record.data
        });
      }
    }
    
    if (incompleteRecords.length > 0) {
      results.push({
        resourceType: resourceDef.name,
        resourceLabel: resourceDef.label,
        requiredFields,
        incompleteCount: incompleteRecords.length,
        totalRecords: records.length,
        samples: incompleteRecords.slice(0, 5)
      });
    }
  }
  
  const totalIncomplete = results.reduce((sum, r) => sum + r.incompleteCount, 0);
  
  return {
    queryType: 'missing_fields',
    totalIncomplete,
    findings: results,
    summary: `Found ${totalIncomplete} records with missing required fields across ${results.length} resources`,
    recommendations: totalIncomplete > 0
      ? ['Update incomplete records with required field values', 'Consider making some fields optional if frequently missing', 'Set up validation rules in forms']
      : ['All records have complete required field data']
  };
}

/**
 * Execute failed syncs query
 */
async function executeFailedSyncsQuery() {
  const failedLogs = await SyncLog.find({
    status: { $in: ['error', 'partial'] }
  }).sort({ createdAt: -1 }).limit(50);
  
  const integrations = await Integration.find();
  const integrationMap = new Map(
    integrations.map(i => [i.type, i.name])
  );
  
  const errorGroups = {};
  
  for (const log of failedLogs) {
    const integrationName = integrationMap.get(log.integration) || log.integration;
    
    if (!errorGroups[integrationName]) {
      errorGroups[integrationName] = {
        integration: integrationName,
        total: 0,
        errors: 0,
        successes: 0,
        samples: []
      };
    }
    
    errorGroups[integrationName].total++;
    errorGroups[integrationName].errors += log.recordsError || 0;
    errorGroups[integrationName].successes += log.recordsSuccess || 0;
    
    if (errorGroups[integrationName].samples.length < 3) {
      errorGroups[integrationName].samples.push({
        date: log.createdAt,
        operation: log.operation,
        status: log.status,
        errors: log.errors?.slice(0, 2) || []
      });
    }
  }
  
  const groups = Object.values(errorGroups);
  
  return {
    queryType: 'failed_syncs',
    totalFailedLogs: failedLogs.length,
    findings: groups,
    summary: `Found ${failedLogs.length} failed or partial sync operations`,
    recommendations: groups.length > 0
      ? ['Review integration credentials and configuration', 'Check external API endpoints for availability', 'Implement retry logic for transient failures']
      : ['All recent sync operations completed successfully']
  };
}

/**
 * Execute resource summary query
 */
async function executeResourceSummaryQuery(resourceType) {
  if (!resourceType) {
    const resourceDefs = await ResourceDefinition.find();
    const availableResources = [];
    
    for (const r of resourceDefs) {
      const count = await ResourceRecord.countDocuments({ resourceType: r.name });
      availableResources.push({
        name: r.name,
        label: r.label,
        recordCount: count
      });
    }
    
    return {
      queryType: 'resource_summary',
      message: 'Please specify a resource type to summarize',
      availableResources
    };
  }
  
  const resourceDef = await ResourceDefinition.findOne({ 
    name: resourceType.toLowerCase() 
  });
  
  if (!resourceDef) {
    return {
      queryType: 'resource_summary',
      error: `Resource '${resourceType}' not found`
    };
  }
  
  const totalRecords = await ResourceRecord.countDocuments({ 
    resourceType: resourceDef.name 
  });
  
  const syncStatusCounts = await ResourceRecord.aggregate([
    { $match: { resourceType: resourceDef.name } },
    { $group: { _id: '$syncStatus', count: { $sum: 1 } } }
  ]);
  
  const fieldUsage = {};
  for (const field of resourceDef.fields) {
    const count = await ResourceRecord.countDocuments({
      resourceType: resourceDef.name,
      [`data.${field.key}`]: { $exists: true, $ne: null, $ne: '' }
    });
    fieldUsage[field.key] = {
      label: field.label,
      type: field.type,
      required: field.required,
      populated: count,
      percentage: totalRecords > 0 ? Math.round((count / totalRecords) * 100) : 0
    };
  }
  
  const suggestions = [];
  
  // Generate suggestions based on analysis
  if (totalRecords === 0) {
    suggestions.push('No records found - consider adding sample data or importing from integrations');
  }
  
  const lowPopulatedFields = Object.entries(fieldUsage)
    .filter(([_, data]) => data.required && data.percentage < 80);
  
  if (lowPopulatedFields.length > 0) {
    suggestions.push(`Required fields with low completion: ${lowPopulatedFields.map(([k]) => k).join(', ')}`);
  }
  
  const syncedRecords = syncStatusCounts.find(s => s._id === 'synced')?.count || 0;
  if (syncedRecords === 0 && totalRecords > 0) {
    suggestions.push('No records are synced - consider setting up integrations');
  }
  
  if (resourceDef.fields.length > 10) {
    suggestions.push('Resource has many fields - consider simplifying or grouping related fields');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Resource is well-configured with good data quality');
  }
  
  return {
    queryType: 'resource_summary',
    resource: {
      name: resourceDef.name,
      label: resourceDef.label,
      description: resourceDef.description
    },
    statistics: {
      totalRecords,
      fieldCount: resourceDef.fields.length,
      requiredFieldCount: resourceDef.fields.filter(f => f.required).length,
      syncStatus: syncStatusCounts
    },
    fieldUsage,
    summary: `Resource '${resourceDef.label}' has ${totalRecords} records with ${resourceDef.fields.length} configured fields`,
    recommendations: suggestions
  };
}

/**
 * Get suggested queries for users
 */
const getSuggestions = async (req, res, next) => {
  try {
    const suggestions = [
      'Find products with stock below 10',
      'Find products with stock below 5',
      'Find records with missing required fields',
      'Check failed integration syncs',
      'Summarize the product resource',
      'Summarize the customer resource'
    ];
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeQuery,
  executeQuery,
  getSuggestions
};
