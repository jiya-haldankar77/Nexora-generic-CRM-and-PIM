/**
 * NEXORA Agent Logger — Structured JSON logging for agent operations.
 * All agent actions are logged with: timestamp, sessionId, step, tool, role,
 * outcome, duration, and evidence.
 */

'use strict';

const { inspect } = require('util');

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const ACTIVE_LEVEL = LEVELS[process.env.AGENT_LOG_LEVEL] ?? LEVELS.info;

function log(level, sessionId, message, data = {}) {
  if ((LEVELS[level] ?? 99) < ACTIVE_LEVEL) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    component: 'NexoraAgent',
    sessionId: sessionId || 'no-session',
    message,
    ...data
  };

  // Use console.error for warn/error so it doesn't pollute test output
  const fn = level === 'error' || level === 'warn' ? console.error : console.log;
  fn(JSON.stringify(entry));
}

const logger = {
  debug: (sid, msg, data) => log('debug', sid, msg, data),
  info:  (sid, msg, data) => log('info',  sid, msg, data),
  warn:  (sid, msg, data) => log('warn',  sid, msg, data),
  error: (sid, msg, data) => log('error', sid, msg, data),

  /**
   * Log a completed agent step with timing evidence.
   */
  step: (sid, stepName, status, details = {}) => {
    log(status === 'ok' ? 'info' : 'warn', sid, `[step:${stepName}] ${status}`, details);
  },

  /**
   * Log a tool invocation with timing.
   */
  toolCall: (sid, tool, args, result, durationMs) => {
    log('info', sid, `[tool:${tool}]`, {
      args: safeSerialize(args),
      ok: result.ok,
      durationMs,
      error: result.error || undefined
    });
  }
};

function safeSerialize(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch {
    return inspect(obj, { depth: 2 });
  }
}

module.exports = logger;
