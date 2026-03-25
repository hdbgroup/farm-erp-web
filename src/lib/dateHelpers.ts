/**
 * Date Helper Functions
 *
 * Handles conversion between JavaScript Dates and Firestore Timestamps
 */

import { Timestamp } from 'firebase/firestore'

/**
 * Convert Firestore Timestamp to JavaScript Date
 * Handles multiple input types safely
 */
export const toDate = (value: any): Date | undefined => {
  if (!value) return undefined

  // Already a Date object
  if (value instanceof Date) {
    return value
  }

  // Firestore Timestamp
  if (value?.toDate && typeof value.toDate === 'function') {
    return value.toDate()
  }

  // ISO string
  if (typeof value === 'string') {
    const date = new Date(value)
    return isNaN(date.getTime()) ? undefined : date
  }

  // Unix timestamp (seconds)
  if (typeof value === 'number') {
    return new Date(value * 1000)
  }

  // Firestore Timestamp object structure
  if (value?.seconds !== undefined) {
    return new Date(value.seconds * 1000)
  }

  return undefined
}

/**
 * Convert JavaScript Date to Firestore Timestamp
 */
export const toTimestamp = (date: Date | string | undefined): Timestamp | undefined => {
  if (!date) return undefined

  if (typeof date === 'string') {
    const parsedDate = new Date(date)
    return isNaN(parsedDate.getTime()) ? undefined : Timestamp.fromDate(parsedDate)
  }

  if (date instanceof Date) {
    return isNaN(date.getTime()) ? undefined : Timestamp.fromDate(date)
  }

  return undefined
}

/**
 * Convert date to ISO string for input fields (YYYY-MM-DD)
 * Safe version that handles invalid dates
 */
export const toDateInputValue = (value: any): string => {
  const date = toDate(value)
  if (!date) return ''

  try {
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

/**
 * Convert date to DD/MM/YYYY format
 */
export const toLocaleDateString = (value: any): string => {
  const date = toDate(value)
  if (!date) return ''

  try {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return ''
  }
}

/**
 * Convert date to DD/MM/YYYY HH:MM format
 */
export const toLocaleString = (value: any): string => {
  const date = toDate(value)
  if (!date) return ''

  try {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return ''
  }
}

/**
 * Check if a value is a valid date
 */
export const isValidDate = (value: any): boolean => {
  const date = toDate(value)
  return date !== undefined && !isNaN(date.getTime())
}
