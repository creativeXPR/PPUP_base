import { useMemo, useState } from 'react'
import { collection, orderBy, query, where } from 'firebase/firestore'
import { db } from '../config/firebase'
import { COLLECTIONS, REPORT_STATUS } from '../config/constants'
import { useFirestoreQuery } from '../hooks/useFirestoreQuery'
import Loader from '../components/common/Loader'
import ReportAuditTable from '../components/reports/ReportAuditTable'
import { formatStatus } from '../utils/formatters'

const FILTERS = ['all', ...Object.values(REPORT_STATUS)]

export default function AdminPanelPage() {
  const [filter, setFilter] = useState(REPORT_STATUS.OPEN)

  const reportsQuery = useMemo(() => {
    const ref = collection(db, COLLECTIONS.REPORTS)
    return filter === 'all'
      ? query(ref, orderBy('createdAt', 'desc'))
      : query(ref, where('status', '==', filter), orderBy('createdAt', 'desc'))
  }, [filter])
  const locationsQuery = useMemo(() => collection(db, COLLECTIONS.LOCATIONS), [])

  const reports = useFirestoreQuery(reportsQuery)
  const locations = useFirestoreQuery(locationsQuery)
  const locationNames = useMemo(
    () => Object.fromEntries(locations.data.map((l) => [l.id, l.name])),
    [locations.data],
  )

  return (
    <main className="page">
      <h1>Admin</h1>
      <div className="tabs">
        {FILTERS.map((f) => (
          <button key={f} className={f === filter ? 'tab active' : 'tab'} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : formatStatus(f)}
          </button>
        ))}
      </div>
      {reports.error && <p className="error">{reports.error.message}</p>}
      {reports.loading ? <Loader /> : <ReportAuditTable reports={reports.data} locationNames={locationNames} />}
    </main>
  )
}
