/**
 * NEXORA AI Agent — Core Engine
 *
 * Flow:
 *  1. UNDERSTAND  — parse goal, extract intent & target resources
 *  2. INSPECT     — verify resources exist, gather schema (RBAC-gated)
 *  3. PLAN        — select allowlisted tools; flag destructive actions
 *  4. EXECUTE     — run each step, validate args, collect evidence
 *  5. VERIFY      — confirm outcomes against expectations
 *  6. REPORT      — return structured evidence + audit log
 *
 * LLM integration: if OPENAI_API_KEY is set, uses GPT-4o-mini for understanding
 * and planning. Otherwise falls back to a deterministic rule-based engine.
 * The fallback is clearly labelled in every response.
 */

'use strict';

const { randomUUID } = require('crypto');
const { checkPermission, isDestructive, getRoleFromUser, getAllowlistedTools } = require('./agentRbac');
const { executeTool } = require('./agentTools');
const logger = require('./agentLogger');

// ── LLM client (optional) ────────────────────────────────────────────────────

let openaiClient = null;

function getOpenAIClient() {
  if (openaiClient !== null) return openaiClient;
  if (!process.env.OPENAI_API_KEY) {
    openaiClient = false;
    return false;
  }
  try {
    const { OpenAI } = require('openai');
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openaiClient;
  } catch {
    openaiClient = false;
    return false;
  }
}

// ── Rule-based intent parser (fallback) ─────────────────────────────────────

const INTENT_PATTERNS = [
  // list / get records
  { re: /list\s+(\w+)\s+records?/i,        intent: 'listRecords',    extract: (m) => ({ resourceType: m[1].toLowerCase() }) },
  { re: /show\s+all\s+(\w+)/i,             intent: 'listRecords',    extract: (m) => ({ resourceType: m[1].toLowerCase() }) },
  { re: /get\s+(\w+)\s+record\s+(\S+)/i,  intent: 'getRecord',      extract: (m) => ({ resourceType: m[1].toLowerCase(), id: m[2] }) },
  // create
  { re: /create\s+(?:a\s+)?(\w+)/i,        intent: 'createRecord',   extract: (m) => ({ resourceType: m[1].toLowerCase() }) },
  { re: /add\s+(?:a\s+)?new\s+(\w+)/i,     intent: 'createRecord',   extract: (m) => ({ resourceType: m[1].toLowerCase() }) },
  // update
  { re: /update\s+(\w+)\s+(\S+)/i,         intent: 'updateRecord',   extract: (m) => ({ resourceType: m[1].toLowerCase(), id: m[2] }) },
  // delete
  { re: /delete\s+(\w+)\s+(\S+)/i,         intent: 'deleteRecord',   extract: (m) => ({ resourceType: m[1].toLowerCase(), id: m[2] }) },
  { re: /remove\s+(\w+)\s+(\S+)/i,         intent: 'deleteRecord',   extract: (m) => ({ resourceType: m[1].toLowerCase(), id: m[2] }) },
  // transition
  { re: /transition\s+(\w+)\s+(\S+)\s+to\s+(\w+)/i, intent: 'transitionRecord', extract: (m) => ({ resourceType: m[1].toLowerCase(), id: m[2], to: m[3] }) },
  { re: /move\s+(\w+)\s+(\S+)\s+to\s+(\w+)/i,       intent: 'transitionRecord', extract: (m) => ({ resourceType: m[1].toLowerCase(), id: m[2], to: m[3] }) },
  // resources & integrations
  { re: /list\s+resources?/i,               intent: 'listResources',  extract: () => ({}) },
  { re: /show\s+resources?/i,               intent: 'listResources',  extract: () => ({}) },
  { re: /get\s+resource\s+(\w+)/i,          intent: 'getResource',    extract: (m) => ({ resourceType: m[1].toLowerCase() }) },
  { re: /list\s+integrations?/i,            intent: 'listIntegrations', extract: () => ({}) },
  { re: /sync\s+(\S+)/i,                    intent: 'triggerSync',    extract: (m) => ({ integrationId: m[1] }) },
  { re: /list\s+workflows?/i,               intent: 'listWorkflows',  extract: () => ({}) },
];

function ruleBasedUnderstand(goal) {
  for (const { re, intent, extract } of INTENT_PATTERNS) {
    const m = goal.match(re);
    if (m) {
      return { intent, params: extract(m), confidence: 0.85, method: 'rule-based' };
    }
  }
  return { intent: 'listResources', params: {}, confidence: 0.2, method: 'rule-based', fallback: true };
}

// ── LLM-based understanding ──────────────────────────────────────────────────

async function llmUnderstand(goal, allowedTools) {
  const client = getOpenAIClient();
  if (!client) return null;

  const systemPrompt = `You are the NEXORA AI Agent planner.
Given a user goal, extract the primary intent and parameters.
Allowed intents (tools): ${allowedTools.join(', ')}.
Respond with ONLY valid JSON: {"intent":"<tool>","params":{"key":"value"},"confidence":0.9}`;

  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: goal }
      ]
    });
    const text = resp.choices[0].message.content.trim();
    const parsed = JSON.parse(text);
    return { ...parsed, method: 'llm' };
  } catch {
    return null;
  }
}

// ── Plan builder ─────────────────────────────────────────────────────────────

function buildPlan(intent, params) {
  const steps = [];

  // Most intents need the resource definition for validation
  if (params.resourceType && intent !== 'listResources') {
    steps.push({ tool: 'getResource', args: { resourceType: params.resourceType }, label: 'Inspect resource schema' });
  }

  // Add the primary action step
  const primaryArgs = { ...params };
  delete primaryArgs.data; // data injected separately during execute phase if needed
  steps.push({ tool: intent, args: params, label: `Execute: ${intent}` });

  return steps;
}

// ── Main Agent class ─────────────────────────────────────────────────────────

class NexoraAgent {
  /**
   * @param {Object} user       - Mongoose User doc (for RBAC)
   * @param {Object} options
   * @param {boolean} options.allowDestructive - if true, destructive actions may run without confirmation
   * @param {string}  options.sessionId        - override session ID
   */
  constructor(user, options = {}) {
    this.user = user;
    this.role = getRoleFromUser(user);
    this.sessionId = options.sessionId || randomUUID();
    this.allowDestructive = options.allowDestructive === true;
    this.auditLog = [];
  }

  /**
   * Run the full agent pipeline for a given goal.
   *
   * @param {string} goal       - plain-English goal description
   * @param {Object} extraData  - additional structured data (e.g. record fields)
   * @param {Object} opts
   * @param {boolean} opts.confirmed  - user confirmed destructive action
   * @returns {Promise<AgentResult>}
   */
  async run(goal, extraData = {}, opts = {}) {
    const sid = this.sessionId;
    const startTime = Date.now();
    this._audit('session_start', { goal, role: this.role });

    try {
      // ── 1. UNDERSTAND ──────────────────────────────────────────────────────
      logger.step(sid, 'understand', 'start', { goal });
      const allowedTools = getAllowlistedTools().filter(
        (t) => checkPermission(this.role, t).allowed
      );

      let understood = await llmUnderstand(goal, allowedTools);
      const usedLLM = !!understood;
      if (!understood) {
        understood = ruleBasedUnderstand(goal);
        logger.info(sid, 'Using rule-based fallback for intent parsing', { understood });
      }

      const { intent, params: rawParams, confidence, method } = understood;

      // For create/update, caller's extraData is the record field payload → nest under .data
      // For other intents, extraData provides ID overrides etc. at top level
      let params;
      if ((intent === 'createRecord' || intent === 'updateRecord') && Object.keys(extraData).length > 0) {
        params = { ...rawParams, data: { ...(rawParams.data || {}), ...extraData } };
      } else {
        params = { ...rawParams, ...extraData };
      }

      this._audit('understand', { intent, params, confidence, method });
      logger.step(sid, 'understand', 'ok', { intent, confidence, method });

      // ── 2. RBAC CHECK ──────────────────────────────────────────────────────
      const perm = checkPermission(this.role, intent);
      if (!perm.allowed) {
        return this._deny(intent, perm.reason, startTime);
      }

      // ── 3. PLAN ───────────────────────────────────────────────────────────
      logger.step(sid, 'plan', 'start');
      const plan = buildPlan(intent, params);

      // Validate all tools in plan are allowed
      for (const step of plan) {
        const sp = checkPermission(this.role, step.tool);
        if (!sp.allowed) {
          return this._deny(step.tool, sp.reason, startTime);
        }
      }

      // Flag destructive steps
      const hasDestructive = plan.some((s) => isDestructive(s.tool));
      if (hasDestructive && !opts.confirmed && !this.allowDestructive) {
        const destructiveSteps = plan.filter((s) => isDestructive(s.tool)).map((s) => s.tool);
        this._audit('confirmation_required', { destructiveSteps });
        logger.step(sid, 'plan', 'pending_confirmation', { destructiveSteps });
        return {
          ok: false,
          requiresConfirmation: true,
          destructiveActions: destructiveSteps,
          plan: plan.map((s) => ({ tool: s.tool, label: s.label })),
          sessionId: sid,
          role: this.role,
          method: method || 'rule-based',
          message: `The following actions are destructive and require confirmation: ${destructiveSteps.join(', ')}. Re-submit with confirmed=true.`
        };
      }

      this._audit('plan', { steps: plan.map((s) => ({ tool: s.tool, label: s.label })) });
      logger.step(sid, 'plan', 'ok', { stepCount: plan.length });

      // ── 4. EXECUTE ────────────────────────────────────────────────────────
      logger.step(sid, 'execute', 'start', { stepCount: plan.length });
      const evidence = [];
      let finalResult = null;

      for (const step of plan) {
        const t0 = Date.now();
        try {
          const result = await executeTool(step.tool, step.args);
          const durationMs = Date.now() - t0;
          const ev = { tool: step.tool, label: step.label, ok: true, durationMs, result };
          evidence.push(ev);
          logger.toolCall(sid, step.tool, step.args, { ok: true }, durationMs);
          this._audit('tool_ok', { tool: step.tool, durationMs });
          // The primary action (last step) is the final result
          if (step.tool === intent) finalResult = result;
        } catch (err) {
          const durationMs = Date.now() - t0;
          const ev = { tool: step.tool, label: step.label, ok: false, durationMs, error: err.message };
          evidence.push(ev);
          logger.toolCall(sid, step.tool, step.args, { ok: false, error: err.message }, durationMs);
          this._audit('tool_error', { tool: step.tool, error: err.message });

          // If the primary action fails, abort
          if (step.tool === intent) {
            return this._fail(err, evidence, startTime, method || 'rule-based');
          }
          // Non-primary step failure (e.g. resource inspection) — log and continue
          logger.warn(sid, `Non-critical step '${step.tool}' failed, continuing`, { error: err.message });
        }
      }

      // ── 5. VERIFY ─────────────────────────────────────────────────────────
      logger.step(sid, 'verify', 'start');
      const verification = this._verify(intent, finalResult);
      this._audit('verify', verification);
      logger.step(sid, 'verify', verification.passed ? 'ok' : 'warn', verification);

      // ── 6. REPORT ─────────────────────────────────────────────────────────
      const totalMs = Date.now() - startTime;
      logger.step(sid, 'report', 'ok', { totalMs });
      this._audit('session_end', { ok: true, totalMs });

      return {
        ok: true,
        intent,
        result: finalResult,
        verification,
        evidence,
        auditLog: this.auditLog,
        sessionId: sid,
        role: this.role,
        durationMs: totalMs,
        method: method || 'rule-based',
        usedLLM,
        ...(!usedLLM ? { notice: '[RULE-BASED FALLBACK] LLM not available. Intent was resolved deterministically.' } : {})
      };
    } catch (err) {
      const totalMs = Date.now() - startTime;
      logger.error(sid, 'Agent pipeline error', { error: err.message });
      this._audit('session_end', { ok: false, error: err.message, totalMs });
      return this._fail(err, [], startTime, 'unknown');
    }
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  _audit(event, data = {}) {
    this.auditLog.push({
      ts: new Date().toISOString(),
      event,
      sessionId: this.sessionId,
      role: this.role,
      ...data
    });
  }

  _deny(tool, reason, startTime) {
    const durationMs = Date.now() - startTime;
    this._audit('rbac_denied', { tool, reason });
    logger.warn(this.sessionId, 'RBAC denied', { tool, reason });
    return {
      ok: false,
      denied: true,
      tool,
      reason,
      role: this.role,
      sessionId: this.sessionId,
      auditLog: this.auditLog,
      durationMs
    };
  }

  _fail(err, evidence, startTime, method) {
    const durationMs = Date.now() - startTime;
    return {
      ok: false,
      error: err.message,
      statusCode: err.statusCode,
      evidence,
      auditLog: this.auditLog,
      sessionId: this.sessionId,
      role: this.role,
      durationMs,
      method
    };
  }

  /**
   * Post-execution verification: lightweight sanity checks on the result.
   */
  _verify(intent, result) {
    if (result === null || result === undefined) {
      return { passed: false, checks: [{ check: 'result_exists', passed: false }] };
    }

    const checks = [{ check: 'result_exists', passed: true }];

    if (intent === 'createRecord') {
      checks.push({ check: 'has_id', passed: !!(result._id) });
      checks.push({ check: 'has_data', passed: !!(result.data) });
    }
    if (intent === 'listRecords') {
      checks.push({ check: 'is_array', passed: Array.isArray(result) });
    }
    if (intent === 'transitionRecord') {
      checks.push({ check: 'has_id', passed: !!(result._id) });
    }
    if (intent === 'deleteRecord') {
      checks.push({ check: 'deleted_flag', passed: result.deleted === true });
    }

    return {
      passed: checks.every((c) => c.passed),
      checks
    };
  }
}

module.exports = NexoraAgent;
