import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, googleProvider } from '../config/firebase'
import { COLLECTIONS, ROLES } from '../config/constants'

export async function signInWithGoogle() {
  const { user } = await signInWithPopup(auth, googleProvider)
  const ref = doc(db, COLLECTIONS.USERS, user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: ROLES.USER,
      createdAt: serverTimestamp(),
    })
  }
  return user
}

export const logout = () => signOut(auth)

export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback)

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}
