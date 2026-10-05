import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="page page-center">
      <h1>404</h1>
      <p className="muted">This page doesn't exist.</p>
      <Link to="/">Back to dashboard</Link>
    </main>
  )
}
