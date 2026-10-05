export default function Loader({ label = 'Loading…', fullScreen = false }) {
  return (
    <div className={fullScreen ? 'loader loader-full' : 'loader'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
