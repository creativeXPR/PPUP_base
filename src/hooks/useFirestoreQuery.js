import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'

// Live-subscribes to a Firestore query. Memoize the query with useMemo so it isn't rebuilt every render.
export function useFirestoreQuery(firestoreQuery) {
  const [state, setState] = useState({ data: [], loading: true, error: null })

  useEffect(() => {
    if (!firestoreQuery) return
    return onSnapshot(
      firestoreQuery,
      (snap) =>
        setState({ data: snap.docs.map((d) => ({ id: d.id, ...d.data() })), loading: false, error: null }),
      (error) => setState({ data: [], loading: false, error }),
    )
  }, [firestoreQuery])

  return state
}
