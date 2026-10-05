import {
  addDoc, collection, deleteDoc, doc, endAt, getDocs, orderBy, query, serverTimestamp, startAt, updateDoc,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { COLLECTIONS } from '../config/constants'
import { toGeohash, queryBoundsFor, distanceMeters } from '../utils/geohash'
import { uploadImage } from './storageService'

const locationsRef = collection(db, COLLECTIONS.LOCATIONS)

export async function createLocation({ name, description, lat, lng, imageFile }, user) {
  const image = imageFile ? await uploadImage(imageFile, 'locations') : null
  return addDoc(locationsRef, {
    name,
    description,
    lat,
    lng,
    geohash: toGeohash(lat, lng),
    imageUrl: image?.url ?? null,
    imagePath: image?.path ?? null,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  })
}

export const updateLocation = (id, data) => updateDoc(doc(db, COLLECTIONS.LOCATIONS, id), data)

export const deleteLocation = (id) => deleteDoc(doc(db, COLLECTIONS.LOCATIONS, id))

// Geohash range queries return a superset; filter by true distance afterwards.
export async function getNearbyLocations(lat, lng, radiusM) {
  const bounds = queryBoundsFor(lat, lng, radiusM)
  const snaps = await Promise.all(
    bounds.map(([start, end]) =>
      getDocs(query(locationsRef, orderBy('geohash'), startAt(start), endAt(end))),
    ),
  )
  const results = []
  for (const snap of snaps) {
    for (const d of snap.docs) {
      const data = d.data()
      const distance = distanceMeters([data.lat, data.lng], [lat, lng])
      if (distance <= radiusM) results.push({ id: d.id, ...data, distance })
    }
  }
  return results.sort((a, b) => a.distance - b.distance)
}
