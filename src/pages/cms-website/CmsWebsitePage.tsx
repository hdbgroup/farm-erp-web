import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

// Use local landing site in dev, production in prod
const LANDING_PAGE_URL = import.meta.env.DEV
  ? 'http://localhost:5174'
  : 'https://lrtf-landing.web.app'

export const CmsWebsitePage = () => {
  const { pageSlug } = useParams<{ pageSlug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [selectedPage, setSelectedPage] = useState(pageSlug || 'home')
  const [pageData, setPageData] = useState<LandingPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Edit panel state
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<LandingPageSection>>({})
  const [iframeReady, setIframeReady] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Load page data from Firestore (optional - works without it)
  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      setIframeReady(false)
      setIframeError(false)

      try {
        const data = await firestoreHelpers.getCollection<LandingPageContent>(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          [
            // Query for the specific page slug
            // Note: This requires an index or we can just load all and filter
          ]
        )

        const page = data.find((p) => p.pageSlug === selectedPage)
        if (page) {
          console.log('✅ Loaded page data from Firestore:', page)
          setPageData(page)
        } else {
          console.log('ℹ️ No Firestore data found for page:', selectedPage, '(will use fallback data from iframe)')
          setPageData(null)
        }
      } catch (error) {
        console.error('Failed to load page:', error)
        setPageData(null)
      } finally {
        setLoading(false)
      }
    }

    loadPage()

    // Set timeout to detect if iframe doesn't load (30 seconds for production)
    const timeout = setTimeout(() => {
      setIframeError((currentError) => {
        // Only set error if iframe is not ready yet
        if (!iframeReady && !currentError) {
          console.warn('⚠️ Iframe timeout - landing page taking too long to load')
          return true
        }
        return currentError
      })
    }, 30000) // 30 second timeout for production site

    return () => clearTimeout(timeout)
  }, [selectedPage])

  // Handle page selection change
  const handlePageChange = (slug: string) => {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Continue?')) {
        return
      }
    }
    setSelectedPage(slug)
    navigate(`/cms-website/${slug}`, { replace: true })
    setHasUnsavedChanges(false)
    setEditPanelOpen(false)
  }

  // Helper function to strip HTML tags from content
  const stripHtmlTags = (html: string): string => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  // Handle section click from iframe - using ref to avoid dependency issues
  const handleSectionClickRef = useRef((payload: { sectionKey: string; currentData?: any }) => {
    console.log('🔧 handleSectionClick called with:', payload);
    console.log('📊 Current data from iframe:', payload.currentData);

    // Use the data sent from the iframe (works with fallback data)
    if (payload.currentData) {
      const section: LandingPageSection = {
        id: payload.currentData.id || payload.sectionKey,
        sectionKey: payload.sectionKey,
        title: payload.currentData.title || '',
        subtitle: payload.currentData.subtitle || '',
        content: payload.currentData.content || '',
        imageUrl: payload.currentData.imageUrl || '',
        imagePath: payload.currentData.imagePath || '',
        visible: payload.currentData.visible ?? true,
        order: payload.currentData.order || 0,
        metadata: payload.currentData.metadata || {},
      }

      console.log('✅ Opening edit panel for section:', section);
      setEditingSection(section)
      // Strip HTML tags from content for editing
      setEditFormData({
        ...section,
        content: stripHtmlTags(section.content || '')
      })
      setEditPanelOpen(true)
    } else {
      console.error('❌ No section data provided in payload');
    }
  })

  // Update the ref when dependencies change
  useEffect(() => {
    handleSectionClickRef.current = (payload: { sectionKey: string; currentData?: any }) => {
      console.log('🔧 handleSectionClick called with:', payload);
      console.log('📊 Current data from iframe:', payload.currentData);

      if (payload.currentData) {
        const section: LandingPageSection = {
          id: payload.currentData.id || payload.sectionKey,
          sectionKey: payload.sectionKey,
          title: payload.currentData.title || '',
          subtitle: payload.currentData.subtitle || '',
          content: payload.currentData.content || '',
          imageUrl: payload.currentData.imageUrl || '',
          imagePath: payload.currentData.imagePath || '',
          visible: payload.currentData.visible ?? true,
          order: payload.currentData.order || 0,
          metadata: payload.currentData.metadata || {},
        }

        console.log('✅ Opening edit panel for section:', section);
        setEditingSection(section)
        setEditFormData({
          ...section,
          content: stripHtmlTags(section.content || '')
        })
        setEditPanelOpen(true)
      } else {
        console.error('❌ No section data provided in payload');
      }
    }
  })

  // Listen for postMessage events from iframe - only set up once
  useEffect(() => {
    console.log('🎧 Setting up message listener...');

    const handleMessage = (event: MessageEvent) => {
      console.log('📥 Message received from iframe:', event.data, 'origin:', event.origin);

      // Security: verify origin (allow both local dev and production)
      const allowedOrigins = [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://lrtf-landing.web.app'
      ]
      if (!allowedOrigins.some(origin => event.origin === origin)) {
        console.warn('⚠️ Message rejected - invalid origin:', event.origin);
        return
      }

      const { type, payload } = event.data

      console.log('✅ Message accepted - type:', type);

      switch (type) {
        case 'SECTION_CLICKED':
          console.log('🎯 Section clicked event received:', payload);
          handleSectionClickRef.current(payload)
          break
        case 'EDIT_MODE_READY':
          console.log('✅ Edit mode ready in iframe')
          setIframeReady(true)
          setIframeError(false)
          break
        default:
          console.log('ℹ️ Unknown message type:', type);
          break
      }
    }

    window.addEventListener('message', handleMessage)
    console.log('✅ Message listener attached');

    return () => {
      console.log('🔇 Removing message listener');
      window.removeEventListener('message', handleMessage)
    }
  }, []) // Empty dependency array - only set up once

  // Update section in local state
  const handleUpdateSection = () => {
    if (!editingSection) return

    // If no pageData exists yet, create a new one
    if (!pageData) {
      const newPageData: LandingPageContent = {
        id: '',
        pageSlug: selectedPage as any,
        pageTitle: PAGES.find(p => p.slug === selectedPage)?.label || selectedPage,
        sections: [{ ...editingSection, ...editFormData }],
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: user?.id || 'system',
      }
      setPageData(newPageData)
    } else {
      // Update existing pageData
      const existingSection = pageData.sections.find(s => s.sectionKey === editingSection.sectionKey)

      let updatedSections: LandingPageSection[]
      if (existingSection) {
        // Update existing section
        updatedSections = pageData.sections.map((s) =>
          s.sectionKey === editingSection.sectionKey
            ? { ...s, ...editFormData }
            : s
        )
      } else {
        // Add new section
        updatedSections = [...pageData.sections, { ...editingSection, ...editFormData }]
      }

      setPageData({ ...pageData, sections: updatedSections })
    }

    setHasUnsavedChanges(true)

    // Send update to iframe
    const iframe = document.getElementById('website-preview') as HTMLIFrameElement
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        {
          type: 'UPDATE_SECTION',
          payload: {
            sectionKey: editingSection.sectionKey,
            data: editFormData,
          },
        },
        LANDING_PAGE_URL
      )
    }

    setEditPanelOpen(false)
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
        // Create new page if doesn't exist
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

      // Reload iframe to show saved content
      const iframe = document.getElementById('website-preview') as HTMLIFrameElement
      if (iframe) {
        iframe.src = iframe.src
      }
    } catch (error) {
      console.error('Failed to save:', error)
      alert('Failed to save changes. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Map page slugs to actual routes
  const PAGE_ROUTES: Record<string, string> = {
    'home': '/',
    'about': '/about-us',
    'products-lilly-pilly': '/lilly-pilly',
    'products-other-natives': '/other-natives',
    'products-exotics': '/exotics',
    'products-palms': '/palms',
    'availability': '/availability',
    'delivery': '/tree-delivery-planters-landscapers',
    'councils': '/councils',
    'pricing': '/prices',
    'visit-us': '/contact', // Assuming visit-us maps to contact
    'contact': '/contact',
  }

  const route = PAGE_ROUTES[selectedPage] || '/'
  const iframeUrl = `${LANDING_PAGE_URL}${route}?editMode=true`

  // Handle iframe load error
  const handleIframeError = () => {
    setIframeError(true)
    setIframeReady(false)
  }

  // Refresh preview
  const handleRefreshPreview = () => {
    setIframeReady(false)
    setIframeError(false)
    const iframe = document.getElementById('website-preview') as HTMLIFrameElement
    if (iframe) {
      iframe.src = iframe.src
    }
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5MB')
      return
    }

    setUploadingImage(true)

    try {
      // Create unique filename with timestamp
      const timestamp = Date.now()
      const filename = `landing-page-images/${selectedPage}/${timestamp}-${file.name}`
      const storageRef = ref(storage, filename)

      // Upload file
      const snapshot = await uploadBytes(storageRef, file)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      // Update form data with new image URL
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

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white shadow-xl flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">CMS Website</h1>
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
            <Badge variant={pageData.published ? 'default' : 'secondary'}>
              {pageData.published ? 'Published' : 'Draft'}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {iframeReady && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
              ✓ Ready
            </Badge>
          )}
          {iframeError && (
            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
              ⚠ Connection Error
            </Badge>
          )}
          {hasUnsavedChanges && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Unsaved Changes
            </Badge>
          )}
          <Button
            onClick={handleRefreshPreview}
            variant="outline"
            size="sm"
            className="bg-white text-gray-700 hover:bg-gray-50"
            title="Refresh preview"
          >
            🔄
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || saving}
            className="bg-white text-green-700 hover:bg-green-50 font-semibold"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Main Content: Iframe + Edit Panel */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading page preview...</p>
            <p className="text-gray-400 text-sm mt-2">Connecting to landing page...</p>
          </div>
        ) : (
          <>
            {/* Connection Error Message */}
            {iframeError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 z-10">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Loading Landing Page...
                </h3>
                <p className="text-gray-600 mb-4 text-center max-w-md">
                  The landing page is taking longer than expected to load.
                </p>
                <div className="flex gap-3">
                  <Button onClick={handleRefreshPreview} className="bg-green-600 hover:bg-green-700 text-white">
                    🔄 Retry Connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(LANDING_PAGE_URL, '_blank')}
                  >
                    Open Landing Page in New Tab
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-6">
                  Loading from: {LANDING_PAGE_URL}
                </p>
              </div>
            )}

            {/* Iframe Preview */}
            <iframe
              id="website-preview"
              src={iframeUrl}
              className="absolute inset-0 w-full h-full border-0"
              title="Website Preview"
              style={{ minHeight: '100%' }}
              onError={handleIframeError}
            />

            {/* Instructions Overlay (shows when ready but not editing) */}
            {iframeReady && !editPanelOpen && !hasUnsavedChanges && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
                <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                  <span className="text-2xl">👆</span>
                  <span className="font-medium">
                    Hover over sections and click to edit
                  </span>
                </div>
              </div>
            )}

            {/* Edit Panel (Sliding from right) */}
            {editPanelOpen && editingSection && (
              <div className="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in z-50">
                {/* Panel Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Edit Section</h3>
                    <button
                      onClick={() => setEditPanelOpen(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Section: {editingSection.sectionKey}
                  </p>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                      className="w-full min-h-[150px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                            className="w-full h-32 object-cover rounded-md border border-gray-300"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="edit-image"
                          className="flex-1 cursor-pointer"
                        >
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
                      {editFormData.imageUrl && (
                        <p className="text-xs text-gray-500 truncate">
                          {editFormData.imagePath || editFormData.imageUrl}
                        </p>
                      )}
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
                </div>

                {/* Panel Footer */}
                <div className="border-t border-gray-200 p-4 flex gap-2">
                  <Button
                    onClick={() => setEditPanelOpen(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateSection}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    Update
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
