import nodemailer from 'nodemailer'
import { defineSecret, defineString } from 'firebase-functions/params'

// Set with: firebase functions:secrets:set SMTP_USER / SMTP_PASS
export const SMTP_USER = defineSecret('SMTP_USER')
export const SMTP_PASS = defineSecret('SMTP_PASS')
// Prompted on first deploy, stored in functions/.env.<project>
const SMTP_HOST = defineString('SMTP_HOST', { default: 'smtp.gmail.com' })
const SMTP_PORT = defineString('SMTP_PORT', { default: '465' })
const MAIL_FROM = defineString('MAIL_FROM', { default: 'ppup <no-reply@ppup.app>' })

let transporter

function getTransporter() {
  transporter ??= nodemailer.createTransport({
    host: SMTP_HOST.value(),
    port: Number(SMTP_PORT.value()),
    secure: Number(SMTP_PORT.value()) === 465,
    auth: { user: SMTP_USER.value(), pass: SMTP_PASS.value() },
  })
  return transporter
}

export function sendMail({ to, subject, html }) {
  if (!to || (Array.isArray(to) && !to.length)) return Promise.resolve(null)
  return getTransporter().sendMail({ from: MAIL_FROM.value(), to, subject, html })
}

const escape = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const templates = {
  reporterConfirmation: ({ report, locationName }) => ({
    subject: `We received your report: ${report.type}`,
    html: `
      <p>Thanks for your report on <strong>${escape(locationName)}</strong>.</p>
      <p><strong>${escape(report.type)}</strong> — ${escape(report.description)}</p>
      <p>We'll email you when an admin reviews it.</p>`,
  }),
  adminAlert: ({ report, locationName, reporterEmail }) => ({
    subject: `[ppup] New report: ${report.type} at ${locationName}`,
    html: `
      <p>A new report needs review.</p>
      <ul>
        <li><strong>Location:</strong> ${escape(locationName)}</li>
        <li><strong>Type:</strong> ${escape(report.type)}</li>
        <li><strong>Details:</strong> ${escape(report.description)}</li>
        <li><strong>Reporter:</strong> ${escape(reporterEmail ?? 'unknown')}</li>
      </ul>`,
  }),
}
