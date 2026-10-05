import { onDocumentCreated } from 'firebase-functions/v2/firestore'
import { logger } from 'firebase-functions'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { sendMail, templates, SMTP_USER, SMTP_PASS } from './mailer.js'

// Dual notification: confirmation to the reporter + alert to every admin.
export const onReportCreated = onDocumentCreated(
  { document: 'reports/{reportId}', secrets: [SMTP_USER, SMTP_PASS] },
  async (event) => {
    const report = event.data?.data()
    if (!report) return

    const db = getFirestore()
    const [locationSnap, adminsSnap, reporter] = await Promise.all([
      db.doc(`locations/${report.locationId}`).get(),
      db.collection('users').where('role', '==', 'admin').get(),
      getAuth().getUser(report.createdBy).catch(() => null),
    ])

    const locationName = locationSnap.get('name') ?? report.locationId
    const reporterEmail = reporter?.email
    const adminEmails = adminsSnap.docs.map((d) => d.get('email')).filter(Boolean)

    const results = await Promise.allSettled([
      sendMail({ to: reporterEmail, ...templates.reporterConfirmation({ report, locationName }) }),
      sendMail({ to: adminEmails, ...templates.adminAlert({ report, locationName, reporterEmail }) }),
    ])

    const failed = results.filter((r) => r.status === 'rejected')
    failed.forEach((r) => logger.error('Report notification failed', { reportId: event.params.reportId, error: r.reason?.message }))

    await event.data.ref.update({
      notifiedAt: FieldValue.serverTimestamp(),
      notificationErrors: failed.length,
    })
  },
)
