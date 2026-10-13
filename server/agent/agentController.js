/**
 * NEXORA Agent Controller — HTTP handler for the /api/agent endpoint.
 *
 * POST /api/agent/run
 *   body: { goal: string, data?: object, confirmed?: boolean }
 *   → runs the full agent pipeline and returns structured evidence
 *
 * GET /api/agent/tools
 *   → returns the current user's allowed tool list (RBAC)
 *
 * GET /api/agent/health
 *   → agent subsystem health (no auth required)
 */

'use strict';

const NexoraAgent          = require('./agentEngine');
const { checkPermission, getRoleFromUser, getAllowlistedTools } = require('./agentRbac');
const logger               = require('./agentLogger');

/**
 * @route POST /api/agent/run
 */
const runAgent = async (req, res, next) => {
  try {
    const { goal, data = {}, confirmed = false } = req.body;

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return res.status(400).json({
        success: false,
        error: 'A non-empty "goal" string is required in the request body.'
      });
    }

    const agent = new NexoraAgent(req.user, { sessionId: req.headers['x-session-id'] });
    logger.info(agent.sessionId, 'Agent run requested', {
      role: agent.role,
      goal: goal.substring(0, 200),
      hasData: Object.keys(data).length > 0,
      confirmed
    });

    const result = await agent.run(goal.trim(), data, { confirmed });

    const statusCode = result.ok
      ? 200
      : result.requiresConfirmation
        ? 202   // Accepted — needs re-confirmation
        : result.denied
          ? 403
          : result.statusCode || 500;

    return res.status(statusCode).json({ success: result.ok, ...result });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/agent/tools
 */
const listAgentTools = (req, res) => {
  const role = getRoleFromUser(req.user);
  const tools = getAllowlistedTools().map((name) => {
    const perm = checkPermission(role, name);
    return { name, allowed: perm.allowed, reason: perm.reason };
  });
  return res.json({ success: true, role, tools });
};

/**
 * @route GET /api/agent/health
 */
const agentHealth = (_req, res) => {
  const hasLLM = !!(process.env.OPENAI_API_KEY);
  return res.json({
    success: true,
    agent: 'NexoraAgent',
    version: '1.0.0',
    llmAvailable: hasLLM,
    fallbackMode: !hasLLM,
    notice: hasLLM ? undefined : '[RULE-BASED FALLBACK] OPENAI_API_KEY not set — using deterministic rule engine'
  });
};

module.exports = { runAgent, listAgentTools, agentHealth };
