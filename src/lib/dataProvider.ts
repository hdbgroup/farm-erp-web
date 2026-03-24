/**
 * Data Provider Abstraction Layer
 *
 * This module automatically switches between mock data and real Firebase
 * based on the USE_MOCK_DATA configuration.
 *
 * Import from this file instead of directly from firebase.ts, auth.ts, or firestore.ts
 */

import { USE_MOCK_DATA } from './config'

// Import both mock and real services
import * as mockAuth from './mock/mockAuth'
import * as mockFirestore from './mock/mockFirestore'
import * as mockStorage from './mock/mockStorage'

import * as realAuth from './auth'
import * as realFirestore from './firestore'

// Select which implementation to use based on USE_MOCK_DATA
const auth = USE_MOCK_DATA ? mockAuth : realAuth
const firestore = USE_MOCK_DATA ? mockFirestore : realFirestore

// Storage available for future use
export const storage = USE_MOCK_DATA ? mockStorage : null

// Export auth functions
export const {
  initRecaptchaVerifier,
  sendOTP,
  verifyOTP,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  signOut,
  observeAuthState,
  hasRole,
  isAdmin,
} = auth

// Export Firestore functions
export const { firestoreHelpers, COLLECTIONS, where, orderBy, limit, serverTimestamp } =
  firestore

// Export mock-specific helpers in development
if (USE_MOCK_DATA && import.meta.env.DEV) {
  // @ts-ignore
  window.__mockAuth = mockAuth
  // @ts-ignore
  window.__mockFirestore = mockFirestore
  // @ts-ignore
  window.__mockStorage = mockStorage

  console.log(
    '🔧 Development Mode: Mock data helpers available on window.__mockAuth, __mockFirestore, __mockStorage'
  )

  // List available mock users
  if ('listMockUsers' in mockAuth) {
    ;(mockAuth as any).listMockUsers()
  }
}
