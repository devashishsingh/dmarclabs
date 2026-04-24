/**
 * In-memory scan statistics store.
 * Tracks aggregate usage without storing any PII or report content.
 */

const stats = {
  totalScans: 0,
  totalRecords: 0,           // IP records processed across all scans
  totalFileSizeBytes: 0,
  totalProcessingMs: 0,
  failedScans: 0,
  // Rolling daily buckets: { 'YYYY-MM-DD': count }
  daily: {},
};

/**
 * Record a completed scan.
 * @param {{ recordCount: number, fileSizeBytes: number, processingMs: number }} data
 */
function recordScan({ recordCount = 0, fileSizeBytes = 0, processingMs = 0 } = {}) {
  stats.totalScans++;
  stats.totalRecords += recordCount;
  stats.totalFileSizeBytes += fileSizeBytes;
  stats.totalProcessingMs += processingMs;

  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  stats.daily[day] = (stats.daily[day] || 0) + 1;

  // Keep only last 30 days
  const days = Object.keys(stats.daily).sort();
  if (days.length > 30) {
    delete stats.daily[days[0]];
  }
}

/**
 * Record a failed scan attempt.
 */
function recordFailedScan() {
  stats.failedScans++;
}

/**
 * Return a snapshot of current stats.
 */
function getStats() {
  const avgProcessingMs =
    stats.totalScans > 0 ? Math.round(stats.totalProcessingMs / stats.totalScans) : 0;

  const avgFileSizeMB =
    stats.totalScans > 0
      ? parseFloat((stats.totalFileSizeBytes / stats.totalScans / (1024 * 1024)).toFixed(2))
      : 0;

  // Build last-30-days array (fill missing days with 0)
  const today = new Date();
  const dailyChart = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    dailyChart.push({ date: key, scans: stats.daily[key] || 0 });
  }

  return {
    totalScans: stats.totalScans,
    totalRecords: stats.totalRecords,
    failedScans: stats.failedScans,
    avgProcessingMs,
    avgFileSizeMB,
    totalFileSizeMB: parseFloat((stats.totalFileSizeBytes / (1024 * 1024)).toFixed(2)),
    dailyChart,
  };
}

module.exports = { recordScan, recordFailedScan, getStats };
