import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { firestoreHelpers, COLLECTIONS } from '@/lib/firestore'
import { useAuth } from '@/contexts/AuthContext'
import { storage } from '@/lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import type { LandingPageContent, LandingPageSection } from '@/types'

// Available pages to edit
const PAGES = [
  { slug: 'home', label: 'Home' },
  { slug: 'about', label: 'About Us' },
  { slug: 'products-lilly-pilly', label: 'Lilly Pilly Products' },
  { slug: 'products-other-natives', label: 'Other Natives' },
  { slug: 'products-exotics', label: 'Exotics' },
  { slug: 'products-palms', label: 'Palms' },
  { slug: 'availability', label: 'Availability' },
  { slug: 'delivery', label: 'Delivery' },
  { slug: 'councils', label: 'Councils' },
  { slug: 'pricing', label: 'Pricing' },
  { slug: 'visit-us', label: 'Visit Us' },
  { slug: 'contact', label: 'Contact' },
]

// Default sections for new pages
const DEFAULT_SECTIONS: Record<string, LandingPageSection[]> = {
  home: [
    {
      id: 'hero',
      sectionKey: 'hero',
      title: 'Growers of quality advanced trees and shrubs',
      subtitle: '',
      content: '',
      imageUrl: 'https://storage.googleapis.com/farm-erp-web.firebasestorage.app/wp-content/uploads/2023/03/Aerial1.jpg',
      visible: true,
      order: 1,
    },
    {
      id: 'about',
      sectionKey: 'about',
      title: '',
      subtitle: '',
      content: 'Logan River Tree Farm specialises in advanced screening trees and shrubs, streetscape, landscaping trees and hedging plants. Varieties of Lilly Pilly make up a large percentage of our trees and shrubs.',
      imageUrl: 'https://storage.googleapis.com/farm-erp-web.firebasestorage.app/wp-content/uploads/2023/03/Aerial.png',
      visible: true,
      order: 2,
    },
  ],
}

export const CmsWebsitePageV2 = () => {
  const { user } = useAuth()
  const [selectedPage, setSelectedPage] = useState('home')
  const [pageData, setPageData] = useState<LandingPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<LandingPageSection>>({})
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load page data from Firestore
  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      try {
        const data = await firestoreHelpers.getCollection<LandingPageContent>(
          COLLECTIONS.LANDING_PAGE_CONTENT
        )

        const page = data.find((p) => p.pageSlug === selectedPage)
        if (page) {
          console.log('✅ Loaded page data from Firestore:', page)
          setPageData(page)
        } else {
          // Create new page with default sections
          console.log('📝 Creating new page with default sections')
          const defaultSections = DEFAULT_SECTIONS[selectedPage] || []
          const newPage: LandingPageContent = {
            id: '',
            pageSlug: selectedPage as any,
            pageTitle: PAGES.find(p => p.slug === selectedPage)?.label || selectedPage,
            sections: defaultSections,
            published: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user?.id || 'system',
          }
          setPageData(newPage)
        }
      } catch (error) {
        console.error('Failed to load page:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [selectedPage, user])

  // Handle page selection change
  const handlePageChange = (slug: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Continue?')) {
        return
      }
    }
    setSelectedPage(slug)
    setHasUnsavedChanges(false)
    setEditingSection(null)
  }

  // Open edit panel for a section
  const handleEditSection = (section: LandingPageSection) => {
    setEditingSection(section)
    setEditFormData({ ...section })
  }

  // Add new section
  const handleAddSection = () => {
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}`,
      sectionKey: `section-${Date.now()}`,
      title: 'New Section',
      subtitle: '',
      content: '',
      visible: true,
      order: (pageData?.sections.length || 0) + 1,
    }
    setEditingSection(newSection)
    setEditFormData(newSection)
  }

  // Update section in pageData
  const handleUpdateSection = () => {
    if (!editingSection || !pageData) return

    const existingIndex = pageData.sections.findIndex(
      s => s.sectionKey === editingSection.sectionKey
    )

    let updatedSections: LandingPageSection[]
    if (existingIndex >= 0) {
      // Update existing section
      updatedSections = pageData.sections.map((s, i) =>
        i === existingIndex ? { ...s, ...editFormData } as LandingPageSection : s
      )
    } else {
      // Add new section
      updatedSections = [...pageData.sections, editFormData as LandingPageSection]
    }

    setPageData({ ...pageData, sections: updatedSections })
    setHasUnsavedChanges(true)
    setEditingSection(null)
  }

  // Delete section
  const handleDeleteSection = (sectionKey: string) => {
    if (!pageData) return
    if (!confirm('Are you sure you want to delete this section?')) return

    const updatedSections = pageData.sections.filter(s => s.sectionKey !== sectionKey)
    setPageData({ ...pageData, sections: updatedSections })
    setHasUnsavedChanges(true)
    if (editingSection?.sectionKey === sectionKey) {
      setEditingSection(null)
    }
  }

  // Save all changes to Firestore
  const handleSave = async () => {
    if (!pageData || !user) return

    setSaving(true)
    try {
      if (pageData.id) {
        await firestoreHelpers.updateDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          pageData.id,
          {
            ...pageData,
            updatedBy: user.id,
          }
        )
      } else {
        const id = await firestoreHelpers.addDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          {
            ...pageData,
            published: false,
            updatedBy: user.id,
          }
        )
        setPageData({ ...pageData, id })
      }

      setHasUnsavedChanges(false)
      alert('Changes saved successfully!')
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Publish page
  const handlePublish = async () => {
    if (!pageData || !user) return

    if (!confirm('Publish this page? It will be visible on the live website.')) return

    setSaving(true)
    try {
      const updatedData = { ...pageData, published: true }

      if (pageData.id) {
        await firestoreHelpers.updateDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          pageData.id,
          {
            ...updatedData,
            updatedBy: user.id,
          }
        )
      } else {
        const id = await firestoreHelpers.addDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          {
            ...updatedData,
            updatedBy: user.id,
          }
        )
        setPageData({ ...updatedData, id })
      }

      setPageData(updatedData)
      setHasUnsavedChanges(false)
      alert('Page published successfully!')
    } catch (error) {
      console.error('Failed to publish:', error)
      alert('Failed to publish page. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      const timestamp = Date.now()
      const filename = `landing-page-images/${selectedPage}/${timestamp}-${file.name}`
      const storageRef = ref(storage, filename)

      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      setEditFormData({
        ...editFormData,
        imageUrl: downloadURL,
        imagePath: filename
      })

      console.log('✅ Image uploaded:', downloadURL)
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white shadow-lg flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">CMS Website Editor</h1>
          <div className="flex items-center gap-2">
            <Label htmlFor="page-selector" className="text-white text-sm">
              Page:
            </Label>
            <select
              id="page-selector"
              value={selectedPage}
              onChange={(e) => handlePageChange(e.target.value)}
              className="px-3 py-1.5 rounded-md bg-white text-gray-900 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            >
              {PAGES.map((page) => (
                <option key={page.slug} value={page.slug}>
                  {page.label}
                </option>
              ))}
            </select>
          </div>
          {pageData && (
            <Badge variant={pageData.published ? 'default' : 'secondary'} className="bg-white text-green-700">
              {pageData.published ? '✓ Published' : 'Draft'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className="bg-white text-green-700 hover:bg-green-50 font-semibold"
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            onClick={handlePublish}
            disabled={saving}
            className="bg-yellow-500 text-white hover:bg-yellow-600 font-semibold"
          >
            {saving ? 'Publishing...' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sections List */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <Button
              onClick={handleAddSection}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              + Add Section
            </Button>
          </div>

          <div className="p-4 space-y-2">
            {pageData?.sections.map((section, index) => (
              <div
                key={section.sectionKey}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  editingSection?.sectionKey === section.sectionKey
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleEditSection(section)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">#{index + 1}</span>
                      <h4 className="font-medium text-sm">
                        {section.title || section.sectionKey}
                      </h4>
                    </div>
                    {section.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{section.subtitle}</p>
                    )}
                    {!section.visible && (
                      <Badge variant="secondary" className="mt-1 text-xs">Hidden</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(!pageData?.sections || pageData.sections.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <p>No sections yet</p>
                <p className="text-xs mt-1">Click "Add Section" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Edit Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {editingSection ? (
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Edit Section: {editingSection.sectionKey}
                  </h2>
                  <Button
                    onClick={() => handleDeleteSection(editingSection.sectionKey)}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Title</Label>
                    <Input
                      id="edit-title"
                      value={editFormData.title || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      placeholder="Section title"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-subtitle">Subtitle</Label>
                    <Input
                      id="edit-subtitle"
                      value={editFormData.subtitle || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, subtitle: e.target.value })
                      }
                      placeholder="Section subtitle"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-content">Content</Label>
                    <textarea
                      id="edit-content"
                      value={editFormData.content || ''}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, content: e.target.value })
                      }
                      placeholder="Section content"
                      className="w-full min-h-[200px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-image">Image</Label>
                    <div className="space-y-2">
                      {editFormData.imageUrl && (
                        <div className="relative">
                          <img
                            src={editFormData.imageUrl}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-md border border-gray-300"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label htmlFor="edit-image" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            {uploadingImage ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                <span className="text-sm text-gray-600">Uploading...</span>
                              </>
                            ) : (
                              <>
                                <span className="text-lg">📁</span>
                                <span className="text-sm text-gray-700">
                                  {editFormData.imageUrl ? 'Replace Image' : 'Upload Image'}
                                </span>
                              </>
                            )}
                          </div>
                          <input
                            id="edit-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-visible"
                      checked={editFormData.visible ?? true}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, visible: e.target.checked })
                      }
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label htmlFor="edit-visible">Visible on page</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => setEditingSection(null)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateSection}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Update Section
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-lg">Select a section to edit</p>
                <p className="text-sm mt-2">or click "Add Section" to create a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
