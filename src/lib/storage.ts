import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Firebase Storage Helper Functions
 */

// Upload a file to Firebase Storage
export const uploadFile = async (path: string, file: File): Promise<string> => {
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

// Get download URL for a file
export const getFileURL = async (path: string): Promise<string> => {
  const storageRef = ref(storage, path)
  return await getDownloadURL(storageRef)
}

// Delete a file
export const deleteFile = async (path: string): Promise<void> => {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

// List all files in a path
export const listFiles = async (path: string): Promise<string[]> => {
  const storageRef = ref(storage, path)
  const result = await listAll(storageRef)
  return result.items.map((item) => item.fullPath)
}

// Upload image helper
export const uploadImage = async (folder: string, file: File): Promise<string> => {
  const timestamp = Date.now()
  const fileName = `${timestamp}-${file.name}`
  const path = `${folder}/${fileName}`
  return await uploadFile(path, file)
}

// Upload multiple files
export const uploadMultipleFiles = async (
  folder: string,
  files: File[]
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImage(folder, file))
  return await Promise.all(uploadPromises)
}
