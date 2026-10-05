export default function Button({ variant = 'primary', loading = false, children, disabled, ...props }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || loading} {...props}>
      {loading ? 'Working…' : children}
    </button>
  )
}
