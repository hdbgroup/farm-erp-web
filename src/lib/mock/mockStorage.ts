/**
 * Mock Storage Service
 *
 * Mimics Firebase Storage API for development
 * Files are stored as data URLs in memory
 */

// In-memory file storage
const mockStorage = new Map<string, { url: string; metadata: any }>()

// Simulate network delay
const simulateDelay = (ms: number = 200) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Convert File to data URL
const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Upload file
export const uploadFile = async (path: string, file: File): Promise<string> => {
  await simulateDelay()
  console.log(`📁 Mock: Uploading file to ${path}`)

  const dataURL = await fileToDataURL(file)

  const metadata = {
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date(),
  }

  mockStorage.set(path, { url: dataURL, metadata })

  console.log(`✅ Mock: File uploaded successfully to ${path}`)
  return dataURL
}

// Get download URL
export const getDownloadURL = async (path: string): Promise<string> => {
  await simulateDelay(50)
  console.log(`📁 Mock: Getting download URL for ${path}`)

  const file = mockStorage.get(path)

  if (!file) {
    throw new Error(`File not found: ${path}`)
  }

  return file.url
}

// Delete file
export const deleteFile = async (path: string): Promise<void> => {
  await simulateDelay()
  console.log(`📁 Mock: Deleting file ${path}`)

  if (!mockStorage.has(path)) {
    throw new Error(`File not found: ${path}`)
  }

  mockStorage.delete(path)
  console.log(`✅ Mock: File deleted successfully`)
}

// List files in a path
export const listFiles = async (path: string): Promise<string[]> => {
  await simulateDelay()
  console.log(`📁 Mock: Listing files in ${path}`)

  const files: string[] = []

  mockStorage.forEach((_, key) => {
    if (key.startsWith(path)) {
      files.push(key)
    }
  })

  return files
}

// Get file metadata
export const getMetadata = async (path: string) => {
  await simulateDelay(50)
  console.log(`📁 Mock: Getting metadata for ${path}`)

  const file = mockStorage.get(path)

  if (!file) {
    throw new Error(`File not found: ${path}`)
  }

  return file.metadata
}

// Storage reference builder (for API compatibility)
export const storageRef = (path: string) => ({
  _path: path,
  upload: (file: File) => uploadFile(path, file),
  getDownloadURL: () => getDownloadURL(path),
  delete: () => deleteFile(path),
  listAll: () => listFiles(path),
  getMetadata: () => getMetadata(path),
})

// Clear all stored files (for testing/reset)
export const clearAllFiles = () => {
  console.log('📁 Mock: Clearing all files')
  mockStorage.clear()
}

// Helper: Upload image from URL (useful for seeding mock data)
export const uploadImageFromURL = async (path: string, imageURL: string) => {
  console.log(`📁 Mock: Uploading image from URL to ${path}`)

  const metadata = {
    name: path.split('/').pop() || 'image',
    size: 0,
    type: 'image/jpeg',
    uploadedAt: new Date(),
  }

  mockStorage.set(path, { url: imageURL, metadata })

  return imageURL
}

// Development helper: List all files
export const listAllMockFiles = () => {
  console.log('📋 All mock files:')
  mockStorage.forEach((file, path) => {
    console.log(`  - ${path} (${file.metadata.type}, ${file.metadata.size} bytes)`)
  })
}
