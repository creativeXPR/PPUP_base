import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'

export async function uploadImage(file, folder) {
  const path = `${folder}/${Date.now()}-${file.name}`
  const snapshot = await uploadBytes(ref(storage, path), file)
  const url = await getDownloadURL(snapshot.ref)
  return { path, url }
}

export const deleteImage = (path) => deleteObject(ref(storage, path))
