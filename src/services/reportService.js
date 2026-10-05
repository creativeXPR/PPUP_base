import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { COLLECTIONS, REPORT_STATUS } from '../config/constants'

const reportsRef = collection(db, COLLECTIONS.REPORTS)

export function createReport({ locationId, type, description }, user) {
  return addDoc(reportsRef, {
    locationId,
    type,
    description,
    status: REPORT_STATUS.OPEN,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
  })
}

export function updateReportStatus(id, status, admin) {
  return updateDoc(doc(db, COLLECTIONS.REPORTS, id), {
    status,
    reviewedBy: admin.uid,
    reviewedAt: serverTimestamp(),
  })
}
