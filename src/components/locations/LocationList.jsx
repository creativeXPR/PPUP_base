import LocationCard from './LocationCard'

export default function LocationList({ locations, selectedId, onSelect, emptyText = 'No pins nearby yet.' }) {
  if (!locations.length) return <p className="muted">{emptyText}</p>

  return (
    <ul className="location-list">
      {locations.map((loc) => (
        <li key={loc.id}>
          <LocationCard location={loc} active={loc.id === selectedId} onClick={onSelect} />
        </li>
      ))}
    </ul>
  )
}
