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
  { slug: 'home', label: 'Home', route: '/' },
  { slug: 'about', label: 'About Us', route: '/about-us' },
  { slug: 'products-lilly-pilly', label: 'Lilly Pilly Products', route: '/lilly-pilly' },
  { slug: 'products-other-natives', label: 'Other Natives', route: '/other-natives' },
  { slug: 'products-exotics', label: 'Exotics', route: '/exotics' },
  { slug: 'products-palms', label: 'Palms', route: '/palms' },
  { slug: 'availability', label: 'Availability', route: '/availability' },
  { slug: 'tree-delivery', label: 'Tree Delivery', route: '/tree-delivery-planters-landscapers' },
  { slug: 'councils', label: 'Councils', route: '/councils' },
  { slug: 'prices', label: 'Prices', route: '/prices' },
  { slug: 'contact', label: 'Contact', route: '/contact' },
]

// Use local landing site in dev, production in prod
const LANDING_PAGE_URL = import.meta.env.DEV
  ? 'http://localhost:5174'
  : 'https://lrtf-landing.web.app'

export const CmsWebsitePageV3 = () => {
  const { user } = useAuth()
  const [selectedPage, setSelectedPage] = useState('home')
  const [pageData, setPageData] = useState<LandingPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editPanelOpen, setEditPanelOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<LandingPageSection | null>(null)
  const [editFormData, setEditFormData] = useState<Partial<LandingPageSection>>({})
  const [uploadingImage, setUploadingImage] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)

  // Load page data from Firestore
  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      setIframeReady(false)

      try {
        const data = await firestoreHelpers.getCollection<LandingPageContent>(
          COLLECTIONS.LANDING_PAGE_CONTENT
        )

        const page = data.find((p) => p.pageSlug === selectedPage)
        if (page) {
          console.log('✅ Loaded page data from Firestore:', page)
          setPageData(page)
        } else {
          console.log('ℹ️ No Firestore data found for page:', selectedPage)
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
  }, [selectedPage])

  // Listen for messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: verify origin
      const allowedOrigins = [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://lrtf-landing.web.app'
      ]
      if (!allowedOrigins.some(origin => event.origin === origin)) {
        return
      }

      const { type, payload } = event.data

      switch (type) {
        case 'SECTION_CLICKED':
          handleSectionClick(payload)
          break
        case 'EDIT_MODE_READY':
          setIframeReady(true)
          break
        default:
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [pageData])

  // Handle section click from iframe
  const handleSectionClick = (payload: { sectionKey: string; currentData?: any; allSections?: any[] }) => {
    if (!payload.currentData) return

    console.log('📥 Received payload with all sections:', payload.allSections?.length || 0)

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

    setEditingSection(section)

    // Store all sections from the iframe (includes fallback data)
    if (payload.allSections && payload.allSections.length > 0) {
      // Update pageData to include all sections from the iframe
      if (!pageData || !pageData.id) {
        // No Firestore document yet - use all sections from iframe
        setPageData({
          id: '',
          pageSlug: selectedPage as any,
          pageTitle: PAGES.find(p => p.slug === selectedPage)?.label || selectedPage,
          sections: payload.allSections,
          published: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: user?.id || 'system',
        })
      }
    }

    // Strip HTML tags from content for editing
    const tmp = document.createElement('div')
    tmp.innerHTML = section.content || ''
    const plainText = tmp.textContent || tmp.innerText || ''

    setEditFormData({
      ...section,
      content: plainText
    })
    setEditPanelOpen(true)
  }

  // Handle page selection change
  const handlePageChange = (slug: string) => {
    setSelectedPage(slug)
    setEditPanelOpen(false)
  }

  // Publish section changes immediately
  const handlePublishSection = async () => {
    if (!editingSection || !user) return

    setSaving(true)
    try {
      console.log('🚀 Publishing section...', editingSection.sectionKey)

      // Convert plain text content back to HTML paragraphs
      const formattedContent = editFormData.content
        ? editFormData.content.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('\n')
        : editFormData.content

      const updatedSection = {
        ...editingSection,
        ...editFormData,
        content: formattedContent
      }

      console.log('📝 Updated section:', updatedSection)

      // Prepare data for Firestore (exclude timestamps, they're added by helpers)
      let dataToSave: any
      const hasExistingDocument = pageData && pageData.id && pageData.id !== ''

      // Merge updated section with existing sections (from Firestore or fallback data)
      const existingSections = pageData?.sections || []
      const existingSection = existingSections.find(s => s.sectionKey === editingSection.sectionKey)
      let updatedSections: LandingPageSection[]

      if (existingSection) {
        // Update existing section
        updatedSections = existingSections.map((s) =>
          s.sectionKey === editingSection.sectionKey
            ? updatedSection
            : s
        )
      } else {
        // Add new section
        updatedSections = [...existingSections, updatedSection]
      }

      if (!hasExistingDocument) {
        // Creating new page document (preserve all sections from fallback)
        dataToSave = {
          pageSlug: selectedPage,
          pageTitle: PAGES.find(p => p.slug === selectedPage)?.label || selectedPage,
          sections: updatedSections,
          published: true,
          updatedBy: user.id,
        }

        console.log('➕ Creating new document:', dataToSave)
        const id = await firestoreHelpers.addDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          dataToSave
        )
        console.log('✅ Document created with ID:', id)

        setPageData({ ...dataToSave, id, createdAt: new Date(), updatedAt: new Date() })
      } else {
        // Updating existing page document
        dataToSave = {
          pageSlug: pageData.pageSlug,
          pageTitle: pageData.pageTitle,
          sections: updatedSections,
          published: true,
          updatedBy: user.id,
        }

        console.log('🔄 Updating document:', pageData.id, dataToSave)
        await firestoreHelpers.updateDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          pageData.id,
          dataToSave
        )
        console.log('✅ Document updated')

        setPageData({ ...pageData, ...dataToSave, updatedAt: new Date() })
      }

      setEditPanelOpen(false)

      // Reload iframe to show saved changes
      console.log('🔄 Reloading iframe...')
      const iframe = document.getElementById('website-preview') as HTMLIFrameElement
      if (iframe) {
        const currentUrl = new URL(iframe.src)
        currentUrl.searchParams.set('t', Date.now().toString())
        iframe.src = currentUrl.toString()
      }

      alert('Changes published successfully!')
    } catch (error) {
      console.error('❌ Failed to publish:', error)
      alert(`Failed to publish changes: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try again.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Refresh preview
  const handleRefreshPreview = () => {
    setIframeReady(false)
    const iframe = document.getElementById('website-preview') as HTMLIFrameElement
    if (iframe) {
      const currentUrl = new URL(iframe.src)
      currentUrl.searchParams.set('t', Date.now().toString())
      iframe.src = currentUrl.toString()
    }
  }

  const currentPageRoute = PAGES.find(p => p.slug === selectedPage)?.route || '/'
  const iframeUrl = `${LANDING_PAGE_URL}${currentPageRoute}?editMode=true`

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
          <Button
            onClick={handleRefreshPreview}
            variant="outline"
            size="sm"
            className="bg-white text-gray-700 hover:bg-gray-50"
          >
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Main Content: Preview + Edit Panel */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden min-h-0 flex">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Loading page preview...</p>
          </div>
        ) : (
          <>
            {/* Live Preview Iframe */}
            <div className="flex-1 relative">
              <iframe
                id="website-preview"
                src={iframeUrl}
                className="absolute inset-0 w-full h-full border-0"
                title="Website Preview"
              />

              {/* Instructions Overlay */}
              {iframeReady && !editPanelOpen && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none">
                  <div className="bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce">
                    <span className="text-2xl">👆</span>
                    <span className="font-medium">
                      Click on sections to edit
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Edit Panel (Sliding from right) */}
            {editPanelOpen && editingSection && (
              <div className="w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50 overflow-hidden">
                {/* Panel Header */}
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Edit Section</h3>
                    <button
                      onClick={() => setEditPanelOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {editingSection.sectionKey}
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
                        <img
                          src={editFormData.imageUrl}
                          alt="Preview"
                          className="w-full h-32 object-cover rounded-md border border-gray-300"
                        />
                      )}
                      <label htmlFor="edit-image" className="cursor-pointer block">
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                          {uploadingImage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                              <span className="text-sm">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <span>📁</span>
                              <span className="text-sm">
                                {editFormData.imageUrl ? 'Replace' : 'Upload'} Image
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

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-visible"
                      checked={editFormData.visible ?? true}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, visible: e.target.checked })
                      }
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="edit-visible">Visible on page</Label>
                  </div>
                </div>

                {/* Panel Footer */}
                <div className="border-t border-gray-200 p-4 flex gap-2 flex-shrink-0">
                  <Button
                    onClick={() => setEditPanelOpen(false)}
                    variant="outline"
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePublishSection}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={saving}
                  >
                    {saving ? 'Publishing...' : '✓ Publish Changes'}
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
