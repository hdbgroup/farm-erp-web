/**
 * Application Configuration
 *
 * Toggle between mock data and real Firebase services
 */

// Set to true to use mock data (no Firebase required)
// Set to false to use real Firebase services
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'

// Firebase emulators (only used when USE_MOCK_DATA is false)
export const USE_FIREBASE_EMULATORS = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true'

// Configuration info
export const getDataSource = () => {
  if (USE_MOCK_DATA) {
    return 'Mock Data (Development Mode)'
  }
  if (USE_FIREBASE_EMULATORS) {
    return 'Firebase Emulators (Local)'
  }
  return 'Firebase Production'
}

// Log current configuration on startup
if (import.meta.env.DEV) {
  console.log(`🔧 Data Source: ${getDataSource()}`)
  console.log(`   USE_MOCK_DATA: ${USE_MOCK_DATA}`)
  console.log(`   USE_FIREBASE_EMULATORS: ${USE_FIREBASE_EMULATORS}`)
}
