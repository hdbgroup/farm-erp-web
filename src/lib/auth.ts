import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth'
import type { ConfirmationResult, User as FirebaseUser } from 'firebase/auth'
import { auth, db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { User, UserRole } from '@/types'
import { COLLECTIONS } from './firestore'

// Initialize RecaptchaVerifier (call this once when the component mounts)
export const initRecaptchaVerifier = (elementId: string): RecaptchaVerifier => {
  return new RecaptchaVerifier(auth, elementId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with phone auth
    },
  })
}

// Send OTP to phone number
export const sendOTP = async (
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
  try {
    const confirmationResult = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      recaptchaVerifier
    )
    return confirmationResult
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw error
  }
}

// Verify OTP code
export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  code: string
): Promise<FirebaseUser> => {
  try {
    const result = await confirmationResult.confirm(code)
    return result.user
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
}

// Get or create user profile
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))
    if (userDoc.exists()) {
      return userDoc.data() as User
    }
    return null
  } catch (error) {
    console.error('Error getting user profile:', error)
    return null
  }
}

// Create user profile (called after first login)
export const createUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    await setDoc(userRef, {
      id: userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error creating user profile:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<void> => {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: new Date(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Sign out
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Auth state observer
export const observeAuthState = (
  callback: (user: FirebaseUser | null) => void
) => {
  return onAuthStateChanged(auth, callback)
}

// Check if user has required role
export const hasRole = (user: User | null, roles: UserRole[]): boolean => {
  if (!user) return false
  return roles.includes(user.role)
}

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ['admin'])
}
