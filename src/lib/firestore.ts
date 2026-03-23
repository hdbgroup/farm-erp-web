import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import type {
  DocumentData,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
} from 'firebase/firestore'
import { db } from './firebase'

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  INVENTORY: 'inventory',
  ZONES: 'zones',
  ORDERS: 'orders',
  CUSTOMERS: 'customers',
  ACTIVITIES: 'activities',
  NOTIFICATIONS: 'notifications',
  STAGE_TRANSITIONS: 'stage_transitions',
  PRODUCT_INFO: 'product_info',
} as const

// Helper to convert Firestore timestamp to Date
export const toDate = (timestamp: Timestamp | Date | undefined): Date | undefined => {
  if (!timestamp) return undefined
  if (timestamp instanceof Date) return timestamp
  return timestamp.toDate()
}

// Helper to convert Date to Firestore timestamp
export const toTimestamp = (date: Date | undefined): Timestamp | undefined => {
  if (!date) return undefined
  return Timestamp.fromDate(date)
}

// Generic CRUD operations
export const firestoreHelpers = {
  // Get a single document
  async getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T
    }
    return null
  },

  // Get all documents in a collection
  async getCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...constraints)
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T))
  },

  // Add a new document
  async addDocument<T extends DocumentData>(
    collectionName: string,
    data: T
  ): Promise<string> {
    const collectionRef = collection(db, collectionName)
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    return docRef.id
  },

  // Update a document
  async updateDocument<T extends Partial<DocumentData>>(
    collectionName: string,
    id: string,
    data: T
  ): Promise<void> {
    const docRef = doc(db, collectionName, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    })
  },

  // Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    const docRef = doc(db, collectionName, id)
    await deleteDoc(docRef)
  },

  // Subscribe to a document in real-time
  subscribeToDocument<T>(
    collectionName: string,
    id: string,
    callback: (data: T | null) => void
  ) {
    const docRef = doc(db, collectionName, id)
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as T)
      } else {
        callback(null)
      }
    })
  },

  // Subscribe to a collection in real-time
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: QueryConstraint[] = []
  ) {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...constraints)
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T))
      callback(data)
    })
  },
}

// Collection-specific helpers
export const getCollectionRef = (collectionName: string): CollectionReference => {
  return collection(db, collectionName)
}

export const getDocRef = (collectionName: string, id: string): DocumentReference => {
  return doc(db, collectionName, id)
}

// Query helpers
export const createQuery = (
  collectionName: string,
  ...constraints: QueryConstraint[]
) => {
  const collectionRef = collection(db, collectionName)
  return query(collectionRef, ...constraints)
}

// Export common query functions
export { where, orderBy, limit, serverTimestamp }
