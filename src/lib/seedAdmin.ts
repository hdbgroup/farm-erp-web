/**
 * Seed Admin User Script
 *
 * Creates a test admin user in Firestore for development.
 * Run this after Firebase authentication to set up the admin profile.
 */

import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { User } from '@/types'

export const seedAdminUser = async (userId: string, phoneNumber: string) => {
  try {
    // Check if user already exists
    const userRef = doc(db, 'users', userId)
    const userDoc = await getDoc(userRef)

    if (userDoc.exists()) {
      console.log('✅ Admin user already exists:', userDoc.data())
      return userDoc.data() as User
    }

    // Create admin user
    const adminUser: User = {
      id: userId,
      phoneNumber: phoneNumber,
      name: 'Admin User',
      role: 'admin',
      email: 'admin@farmexample.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(userRef, {
      ...adminUser,
      createdAt: adminUser.createdAt.toISOString(),
      updatedAt: adminUser.updatedAt.toISOString(),
    })

    console.log('✅ Admin user created successfully:', adminUser)
    return adminUser
  } catch (error) {
    console.error('❌ Error seeding admin user:', error)
    throw error
  }
}

// Helper function to seed a specific phone number as admin
export const createTestAdmin = async (phoneNumber: string = '+15551234567') => {
  // Generate a consistent ID from phone number
  const userId = `user-${phoneNumber.replace(/\D/g, '')}`
  return await seedAdminUser(userId, phoneNumber)
}
