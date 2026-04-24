/**
 * In-memory feedback store. Holds up to MAX_ENTRIES items (rolling).
 * No PII — message is stored only if user explicitly submitted it.
 */

const MAX_ENTRIES = 500;

const store = [];

/**
 * Adds a feedback entry.
 * @param {{ sentiment: string, message?: string }} entry
 * @returns {{ id: string, sentiment: string, message: string, timestamp: string }}
 */
function addFeedback({ sentiment, message }) {
  const entry = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    sentiment,
    message: message && message.trim().length > 0 ? message.trim().slice(0, 1000) : '',
    timestamp: new Date().toISOString(),
  };

  store.push(entry);

  // Rolling window — drop oldest when over limit
  if (store.length > MAX_ENTRIES) {
    store.shift();
  }

  return entry;
}

/**
 * Returns all stored feedback, newest first.
 */
function getAllFeedback() {
  return [...store].reverse();
}

/**
 * Returns aggregate counts by sentiment.
 */
function getSummary() {
  const counts = { positive: 0, neutral: 0, negative: 0, total: store.length };
  for (const entry of store) {
    if (entry.sentiment in counts) counts[entry.sentiment]++;
  }
  return counts;
}

module.exports = { addFeedback, getAllFeedback, getSummary };
