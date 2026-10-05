import { useState } from 'react'
import StatusBadge from '../common/StatusBadge'
import Button from '../common/Button'
import { ConfirmModal } from '../common/Modal'
import { REPORT_STATUS } from '../../config/constants'
import { updateReportStatus } from '../../services/reportService'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'

export default function ReportAuditTable({ reports, locationNames = {} }) {
  const { user } = useAuth()
  const [pendingReject, setPendingReject] = useState(null)
  const [busyId, setBusyId] = useState(null)

  async function setStatus(id, status) {
    setBusyId(id)
    try {
      await updateReportStatus(id, status, user)
    } finally {
      setBusyId(null)
    }
  }

  async function confirmReject() {
    await setStatus(pendingReject.id, REPORT_STATUS.REJECTED)
    setPendingReject(null)
  }

  if (!reports.length) return <p className="muted">No reports to review.</p>

  return (
    <>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Submitted</th>
              <th>Location</th>
              <th>Type</th>
              <th>Details</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => {
              const closed = r.status === REPORT_STATUS.RESOLVED || r.status === REPORT_STATUS.REJECTED
              return (
                <tr key={r.id}>
                  <td>{formatDate(r.createdAt)}</td>
                  <td>{locationNames[r.locationId] ?? r.locationId}</td>
                  <td>{r.type}</td>
                  <td>{r.description}</td>
                  <td><StatusBadge status={r.status} /></td>
                  <td className="table-actions">
                    {r.status === REPORT_STATUS.OPEN && (
                      <Button variant="ghost" loading={busyId === r.id} onClick={() => setStatus(r.id, REPORT_STATUS.IN_REVIEW)}>
                        Review
                      </Button>
                    )}
                    {!closed && (
                      <>
                        <Button loading={busyId === r.id} onClick={() => setStatus(r.id, REPORT_STATUS.RESOLVED)}>
                          Resolve
                        </Button>
                        <Button variant="danger" disabled={busyId === r.id} onClick={() => setPendingReject(r)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <ConfirmModal
        open={!!pendingReject}
        title="Reject this report?"
        message="The report will be marked as rejected and closed."
        confirmLabel="Reject"
        loading={busyId === pendingReject?.id}
        onConfirm={confirmReject}
        onClose={() => setPendingReject(null)}
      />
    </>
  )
}
