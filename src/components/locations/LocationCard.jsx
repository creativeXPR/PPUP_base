import { formatDistance } from '../../utils/formatters'

export default function LocationCard({ location, active, onClick }) {
  return (
    <button className={`location-card${active ? ' active' : ''}`} onClick={() => onClick?.(location)}>
      {location.imageUrl && <img src={location.imageUrl} alt="" className="location-card-img" />}
      <div>
        <h3>{location.name}</h3>
        {location.description && <p>{location.description}</p>}
        {location.distance != null && <small>{formatDistance(location.distance)} away</small>}
      </div>
    </button>
  )
}
