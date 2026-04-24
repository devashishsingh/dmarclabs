const { Resend } = require('resend');
const config = require('../config/env');

// Lazy-init so server boots even without a key in dev
let resendClient = null;

function getClient() {
  if (!resendClient) {
    if (!config.resendApiKey) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendClient = new Resend(config.resendApiKey);
  }
  return resendClient;
}

/**
 * Sends a new access request notification to the moderator.
 * @param {object} userData - { name, email, organization, fileSize, useCase }
 */
async function sendAccessRequest(userData) {
  const { name, email, organization, fileSize, useCase } = userData;

  const htmlBody = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #1e293b;">
      <h2 style="color: #06b6d4;">New DMARC Analyzer Access Request</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding: 8px; font-weight:600;">Name</td><td style="padding:8px;">${escapeHtml(name)}</td></tr>
        <tr style="background:#f8fafc"><td style="padding: 8px; font-weight:600;">Email</td><td style="padding:8px;">${escapeHtml(email)}</td></tr>
        <tr><td style="padding: 8px; font-weight:600;">Organization</td><td style="padding:8px;">${escapeHtml(organization)}</td></tr>
        <tr style="background:#f8fafc"><td style="padding: 8px; font-weight:600;">Requested File Size</td><td style="padding:8px;">${escapeHtml(String(fileSize))} MB</td></tr>
        <tr><td style="padding: 8px; font-weight:600;">Use Case</td><td style="padding:8px;">${escapeHtml(useCase)}</td></tr>
      </table>
      <p style="color:#64748b; font-size:12px; margin-top:24px;">Sent from DMARC Labs Access Request Form</p>
    </div>
  `;

  await getClient().emails.send({
    from: 'DMARC Labs <noreply@dmarcanalyzer.fly.dev>',
    to: [config.moderatorEmail],
    subject: `New DMARC Analyzer Access Request from ${name}`,
    html: htmlBody,
  });
}

/**
 * Sends a confirmation email to the user who submitted an access request.
 */
async function sendAccessConfirmation(userData) {
  const { name, email } = userData;

  const htmlBody = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; color: #1e293b;">
      <h2 style="color: #06b6d4;">Request Received — DMARC Labs</h2>
      <p>Hi ${escapeHtml(name)},</p>
      <p>We've received your access request for large file analysis. Our team will review and get back to you within 1–2 business days.</p>
      <p style="color:#64748b; font-size:12px; margin-top:24px;">DMARC Labs — Fast, Private, Free</p>
    </div>
  `;

  await getClient().emails.send({
    from: 'DMARC Labs <noreply@dmarcanalyzer.fly.dev>',
    to: [email],
    subject: 'DMARC Labs — Access Request Received',
    html: htmlBody,
  });
}

/** Basic HTML entity escaping to prevent XSS in email content. */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = { sendAccessRequest, sendAccessConfirmation };
