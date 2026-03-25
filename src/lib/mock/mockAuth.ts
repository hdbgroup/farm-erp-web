import type { User } from '@/types'
import { mockDatabase } from './data'

/**
 * Mock Authentication Service
 *
 * Mimics Firebase Authentication API for development
 */

// Simulated auth state
let currentUser: { uid: string; phoneNumber: string } | null = null
const authStateListeners: Array<(user: any) => void> = []

// Check if phone number is registered
export const isPhoneNumberRegistered = async (phoneNumber: string): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 100)) // Simulate network delay
  const exists = Array.from(mockDatabase.users.values()).some(
    (u) => u.phoneNumber === phoneNumber
  )
  console.log(`🔐 Mock: Phone ${phoneNumber} registered:`, exists)
  return exists
}

// Mock RecaptchaVerifier
export class MockRecaptchaVerifier {
  elementId: string
  options: any

  constructor(elementId: string, options: any = {}) {
    this.elementId = elementId
    this.options = options
    console.log('🔐 Mock RecaptchaVerifier initialized')
  }
}

// Mock ConfirmationResult
export class MockConfirmationResult {
  private phoneNumber: string
  private expectedCode: string

  constructor(phoneNumber: string, expectedCode: string) {
    this.phoneNumber = phoneNumber
    this.expectedCode = expectedCode
  }

  async confirm(code: string) {
    console.log(`🔐 Mock: Verifying code ${code} for ${this.phoneNumber}`)

    if (code !== this.expectedCode) {
      throw new Error('Invalid verification code')
    }

    // Find or create user
    const existingUser = Array.from(mockDatabase.users.values()).find(
      (u) => u.phoneNumber === this.phoneNumber
    )

    if (existingUser) {
      console.log(`🔐 Mock: Found existing user:`, existingUser)
      currentUser = {
        uid: existingUser.id,
        phoneNumber: this.phoneNumber,
      }
    } else {
      // Create new user with basic info
      const newUserId = `user-${Date.now()}`
      console.log(`🔐 Mock: Creating new user with ID:`, newUserId)

      const newUser: User = {
        id: newUserId,
        phoneNumber: this.phoneNumber,
        name: 'New User',
        role: 'farm_worker',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Add to mock database
      mockDatabase.users.set(newUserId, newUser)

      currentUser = {
        uid: newUserId,
        phoneNumber: this.phoneNumber,
      }
    }

    console.log(`🔐 Mock: Setting currentUser:`, currentUser)

    // Notify listeners - defer to next tick to ensure React state updates properly
    console.log(`🔐 Mock: Notifying ${authStateListeners.length} listeners`)
    // Use setTimeout to ensure notification happens after React render cycle
    setTimeout(() => {
      console.log(`🔐 Mock: Executing deferred notification to ${authStateListeners.length} listeners`)
      authStateListeners.forEach((listener) => listener(currentUser))
    }, 0)

    return { user: currentUser }
  }
}

// Initialize RecaptchaVerifier
export const initRecaptchaVerifier = (elementId: string): MockRecaptchaVerifier => {
  return new MockRecaptchaVerifier(elementId)
}

// Send OTP
export const sendOTP = async (
  phoneNumber: string,
  _recaptchaVerifier: MockRecaptchaVerifier
): Promise<MockConfirmationResult> => {
  console.log(`🔐 Mock: Sending OTP to ${phoneNumber}`)

  // For mock, always use code "123456"
  const mockCode = '123456'

  console.log(`📱 Mock OTP Code: ${mockCode} (use this to log in)`)

  return new MockConfirmationResult(phoneNumber, mockCode)
}

// Verify OTP (confirmation result handles this)
export const verifyOTP = async (confirmationResult: MockConfirmationResult, code: string) => {
  return await confirmationResult.confirm(code)
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
  console.log(`🔐 Mock: Getting user profile for ${userId}`)
  const user = mockDatabase.users.get(userId)
  return user || null
}

// Create user profile
export const createUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  console.log(`🔐 Mock: Creating user profile for ${userId}`)

  const newUser: User = {
    id: userId,
    phoneNumber: data.phoneNumber || '',
    name: data.name || 'New User',
    role: data.role || 'farm_worker',
    email: data.email,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  mockDatabase.users.set(userId, newUser)
}

// Update user profile
export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<void> => {
  console.log(`🔐 Mock: Updating user profile for ${userId}`)

  const user = mockDatabase.users.get(userId)
  if (!user) {
    throw new Error('User not found')
  }

  const updatedUser = {
    ...user,
    ...data,
    updatedAt: new Date(),
  }

  mockDatabase.users.set(userId, updatedUser)
}

// Sign out
export const signOut = async (): Promise<void> => {
  console.log('🔐 Mock: Signing out')
  currentUser = null
  // Defer notification to ensure React state updates properly
  setTimeout(() => {
    console.log(`🔐 Mock: Notifying ${authStateListeners.length} listeners of sign out`)
    authStateListeners.forEach((listener) => listener(null))
  }, 0)
}

// Auth state observer
export const observeAuthState = (callback: (user: any) => void) => {
  console.log('🔐 Mock: Setting up auth state observer')
  console.log('🔐 Mock: Total listeners before adding:', authStateListeners.length)

  authStateListeners.push(callback)

  console.log('🔐 Mock: Total listeners after adding:', authStateListeners.length)
  console.log('🔐 Mock: Current user at observer setup:', currentUser)

  // Immediately call with current state
  callback(currentUser)

  // Return unsubscribe function
  return () => {
    const index = authStateListeners.indexOf(callback)
    if (index > -1) {
      authStateListeners.splice(index, 1)
      console.log('🔐 Mock: Unsubscribed listener, remaining:', authStateListeners.length)
    }
  }
}

// Check if user has role
export const hasRole = (user: User | null, roles: string[]): boolean => {
  if (!user) return false
  return roles.includes(user.role)
}

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ['admin'])
}

// Helper: Quick login for development (bypasses OTP)
export const mockQuickLogin = async (userId: string) => {
  console.log(`🔐 Mock: Quick login as ${userId}`)

  const user = mockDatabase.users.get(userId)
  if (!user) {
    throw new Error('User not found')
  }

  currentUser = {
    uid: user.id,
    phoneNumber: user.phoneNumber,
  }

  // Defer notification to ensure React state updates properly
  setTimeout(() => {
    console.log(`🔐 Mock: Quick login - notifying ${authStateListeners.length} listeners`)
    authStateListeners.forEach((listener) => listener(currentUser))
  }, 0)

  return currentUser
}

// Get current user
export const getCurrentUser = () => currentUser

// Development helper: List available users
export const listMockUsers = () => {
  console.log('📋 Available mock users:')
  Array.from(mockDatabase.users.values()).forEach((user) => {
    console.log(`  - ${user.name} (${user.role}) - ID: ${user.id}`)
  })
}
