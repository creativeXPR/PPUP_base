import { useContext, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Loader from '../components/common/Loader'
import ReportForm from '../components/reports/ReportForm'
import { LocationContext } from '../context/LocationContext'

export default function ReportIssuePage() {
  const { locations, loading } = useContext(LocationContext)
  const [params] = useSearchParams()
  const [submitted, setSubmitted] = useState(false)

  return (
    <main className="page page-narrow">
      <h1>Report an issue</h1>
      {submitted && <p className="success">Thanks — your report was submitted.</p>}
      {loading ? (
        <Loader />
      ) : (
        <ReportForm
          locations={locations}
          defaultLocationId={params.get('location') ?? ''}
          onSubmitted={() => setSubmitted(true)}
        />
      )}
    </main>
  )
}
