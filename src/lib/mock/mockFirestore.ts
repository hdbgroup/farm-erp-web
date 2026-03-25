import { mockDatabase } from './data'

/**
 * Mock Firestore Service
 *
 * Mimics Firestore API for development
 */

// Collection names (same as real Firestore)
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

// Helper to convert Date to Firestore-like timestamp
export const toDate = (timestamp: Date | undefined): Date | undefined => {
  return timestamp
}

export const toTimestamp = (date: Date | undefined): Date | undefined => {
  return date
}

// Get collection from mock database
const getCollection = (collectionName: string): Map<string, any> => {
  switch (collectionName) {
    case COLLECTIONS.USERS:
      return mockDatabase.users
    case COLLECTIONS.INVENTORY:
      return mockDatabase.inventory
    case COLLECTIONS.ZONES:
      return mockDatabase.zones
    case COLLECTIONS.ORDERS:
      return mockDatabase.orders
    case COLLECTIONS.CUSTOMERS:
      return mockDatabase.customers
    case COLLECTIONS.ACTIVITIES:
      return mockDatabase.activities
    case COLLECTIONS.NOTIFICATIONS:
      return mockDatabase.notifications
    case COLLECTIONS.STAGE_TRANSITIONS:
      return mockDatabase.stageTransitions
    default:
      throw new Error(`Unknown collection: ${collectionName}`)
  }
}

// Simulate network delay
const simulateDelay = (ms: number = 100) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generic CRUD operations
export const firestoreHelpers = {
  // Get a single document
  async getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    await simulateDelay()
    console.log(`📄 Mock: Getting document ${collectionName}/${id}`)

    const collection = getCollection(collectionName)
    const doc = collection.get(id)

    return doc ? ({ ...doc } as T) : null
  },

  // Get all documents in a collection (with simple filtering)
  async getCollection<T>(collectionName: string, constraints: any[] = []): Promise<T[]> {
    await simulateDelay()
    console.log(`📄 Mock: Getting collection ${collectionName}`)

    const collection = getCollection(collectionName)
    let results = Array.from(collection.values())

    // Apply basic where filters (simplified - doesn't handle complex queries)
    constraints.forEach((constraint) => {
      if (constraint.type === 'where') {
        results = results.filter((doc: any) => {
          const value = doc[constraint.field]
          switch (constraint.op) {
            case '==':
              return value === constraint.value
            case '!=':
              return value !== constraint.value
            case '>':
              return value > constraint.value
            case '>=':
              return value >= constraint.value
            case '<':
              return value < constraint.value
            case '<=':
              return value <= constraint.value
            case 'in':
              return constraint.value.includes(value)
            default:
              return true
          }
        })
      }

      if (constraint.type === 'orderBy') {
        results.sort((a: any, b: any) => {
          const aVal = a[constraint.field]
          const bVal = b[constraint.field]
          if (constraint.direction === 'desc') {
            return bVal > aVal ? 1 : -1
          }
          return aVal > bVal ? 1 : -1
        })
      }

      if (constraint.type === 'limit') {
        results = results.slice(0, constraint.value)
      }
    })

    return results.map((doc) => ({ ...doc })) as T[]
  },

  // Add a new document
  async addDocument<T extends Record<string, any>>(
    collectionName: string,
    data: T
  ): Promise<string> {
    await simulateDelay()
    console.log(`📄 Mock: Adding document to ${collectionName}`)

    const collection = getCollection(collectionName)
    const id = `${collectionName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newDoc = {
      ...data,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    collection.set(id, newDoc)

    return id
  },

  // Update a document
  async updateDocument<T extends Partial<Record<string, any>>>(
    collectionName: string,
    id: string,
    data: T
  ): Promise<void> {
    await simulateDelay()
    console.log(`📄 Mock: Updating document ${collectionName}/${id}`)

    const collection = getCollection(collectionName)
    const existingDoc = collection.get(id)

    if (!existingDoc) {
      throw new Error(`Document ${collectionName}/${id} not found`)
    }

    const updatedDoc = {
      ...existingDoc,
      ...data,
      updatedAt: new Date(),
    }

    collection.set(id, updatedDoc)
  },

  // Delete a document
  async deleteDocument(collectionName: string, id: string): Promise<void> {
    await simulateDelay()
    console.log(`📄 Mock: Deleting document ${collectionName}/${id}`)

    const collection = getCollection(collectionName)
    if (!collection.has(id)) {
      throw new Error(`Document ${collectionName}/${id} not found`)
    }

    collection.delete(id)
  },

  // Subscribe to a document in real-time (simplified - just returns current value)
  subscribeToDocument<T>(
    collectionName: string,
    id: string,
    callback: (data: T | null) => void
  ) {
    console.log(`📄 Mock: Subscribing to document ${collectionName}/${id}`)

    const collection = getCollection(collectionName)
    const doc = collection.get(id)

    // Call immediately with current value
    callback(doc ? ({ ...doc } as T) : null)

    // In a real implementation, this would watch for changes
    // For mock, we just return an unsubscribe function
    return () => {
      console.log(`📄 Mock: Unsubscribing from document ${collectionName}/${id}`)
    }
  },

  // Subscribe to a collection in real-time
  subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void,
    constraints: any[] = []
  ) {
    console.log(`📄 Mock: Subscribing to collection ${collectionName}`)

    // Get current data
    this.getCollection<T>(collectionName, constraints).then(callback)

    // Return unsubscribe function
    return () => {
      console.log(`📄 Mock: Unsubscribing from collection ${collectionName}`)
    }
  },
}

// Query constraint builders (to match Firestore API)
export const where = (field: string, op: string, value: any) => ({
  type: 'where',
  field,
  op,
  value,
})

export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => ({
  type: 'orderBy',
  field,
  direction,
})

export const limit = (value: number) => ({
  type: 'limit',
  value,
})

export const serverTimestamp = () => new Date()

// Collection/Document reference helpers (not used in mock but kept for API compatibility)
export const getCollectionRef = (collectionName: string) => {
  return { _collectionName: collectionName }
}

export const getDocRef = (collectionName: string, id: string) => {
  return { _collectionName: collectionName, _id: id }
}

export const createQuery = (collectionName: string, ...constraints: any[]) => {
  return { _collectionName: collectionName, _constraints: constraints }
}
