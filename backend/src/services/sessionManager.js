const NodeCache = require('node-cache');
const { randomUUID } = require('crypto');
const config = require('../config/env');

// TTL in seconds (SESSION_TTL env is in ms)
const TTL_SECONDS = Math.floor(config.sessionTTL / 1000);

const sessionStore = new NodeCache({
  stdTTL: TTL_SECONDS,
  checkperiod: 300, // Auto-cleanup check every 5 minutes
  useClones: false, // Avoid deep-clone overhead for large payloads
});

/**
 * Creates a new session and returns its ID.
 * @param {object} metadata - Initial metadata (fileName, fileSize, filePath)
 * @returns {string} sessionId
 */
function createSession(metadata) {
  const sessionId = randomUUID();
  sessionStore.set(sessionId, {
    sessionId,
    ...metadata,
    status: 'uploaded',
    createdAt: new Date().toISOString(),
    results: null,
    summary: null,
  });
  return sessionId;
}

/**
 * Returns the full session object or null if not found / expired.
 */
function getSession(sessionId) {
  return sessionStore.get(sessionId) || null;
}

/**
 * Stores analysis results into an existing session.
 */
function storeResults(sessionId, summary, results) {
  const session = getSession(sessionId);
  if (!session) throw new Error('Session not found or expired');

  const expiresAt = new Date(Date.now() + config.sessionTTL).toISOString();

  session.status = 'complete';
  session.summary = summary;
  session.results = results;
  session.expiresAt = expiresAt;

  // Re-set to reset TTL
  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Deletes a session immediately (user-triggered purge).
 */
function purgeSession(sessionId) {
  const existed = sessionStore.del(sessionId);
  return existed > 0;
}

/**
 * Checks whether a session exists.
 */
function sessionExists(sessionId) {
  return sessionStore.has(sessionId);
}

module.exports = { createSession, getSession, storeResults, purgeSession, sessionExists };
