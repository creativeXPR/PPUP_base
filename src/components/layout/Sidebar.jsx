export default function Sidebar({ title, children }) {
  return (
    <aside className="sidebar">
      {title && <h2 className="sidebar-title">{title}</h2>}
      {children}
    </aside>
  )
}
