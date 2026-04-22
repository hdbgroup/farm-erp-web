import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { firestoreHelpers, COLLECTIONS } from '@/lib/firestore'
import { useAuth } from '@/contexts/AuthContext'
import type { LandingPageContent, LandingPageSlug, LandingPageSection } from '@/types'

const PAGE_TEMPLATES: Record<LandingPageSlug, Partial<LandingPageContent>> = {
  home: {
    pageSlug: 'home',
    pageTitle: 'Home Page',
    metaDescription: 'Sydney Lily Pilly Supply - Wholesale & Retail Nursery',
    sections: [
      { id: '1', sectionKey: 'hero', title: 'Sydney Lily Pilly Supply', subtitle: 'Wholesale & Retail Nursery', visible: true, order: 1 },
      { id: '2', sectionKey: 'about', title: 'About Us', content: '', visible: true, order: 2 },
    ],
  },
  about: {
    pageSlug: 'about',
    pageTitle: 'About Us',
    metaDescription: 'Learn more about Sydney Lily Pilly Supply',
    sections: [],
  },
  'products-lilly-pilly': {
    pageSlug: 'products-lilly-pilly',
    pageTitle: 'Lilly Pilly Products',
    metaDescription: 'Browse our selection of Lilly Pilly plants',
    sections: [],
  },
  'products-other-natives': {
    pageSlug: 'products-other-natives',
    pageTitle: 'Other Native Products',
    metaDescription: 'Browse our selection of native Australian plants',
    sections: [],
  },
  'products-exotics': {
    pageSlug: 'products-exotics',
    pageTitle: 'Exotic Products',
    metaDescription: 'Browse our selection of exotic plants',
    sections: [],
  },
  'products-palms': {
    pageSlug: 'products-palms',
    pageTitle: 'Palm Products',
    metaDescription: 'Browse our selection of palm trees',
    sections: [],
  },
  availability: {
    pageSlug: 'availability',
    pageTitle: 'Product Availability',
    metaDescription: 'Check current stock availability',
    sections: [],
  },
  delivery: {
    pageSlug: 'delivery',
    pageTitle: 'Delivery Information',
    metaDescription: 'Delivery zones and information',
    sections: [],
  },
  councils: {
    pageSlug: 'councils',
    pageTitle: 'Council Delivery Areas',
    metaDescription: 'View our council delivery coverage',
    sections: [],
  },
  pricing: {
    pageSlug: 'pricing',
    pageTitle: 'Pricing',
    metaDescription: 'View our pricing information',
    sections: [],
  },
  'visit-us': {
    pageSlug: 'visit-us',
    pageTitle: 'Visit Us',
    metaDescription: 'Find our location and opening hours',
    sections: [],
  },
  contact: {
    pageSlug: 'contact',
    pageTitle: 'Contact Us',
    metaDescription: 'Get in touch with us',
    sections: [],
  },
}

export const LandingPageEditorPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [page, setPage] = useState<LandingPageContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showNewPageForm, setShowNewPageForm] = useState(false)

  useEffect(() => {
    const loadPage = async () => {
      if (!id) return

      // Handle "new" page creation
      if (id === 'new') {
        setShowNewPageForm(true)
        setLoading(false)
        return
      }

      try {
        const data = await firestoreHelpers.getDocument<LandingPageContent>(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          id
        )
        setPage(data)
      } catch (error) {
        console.error('Failed to load landing page:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPage()
  }, [id])

  const handleSave = async () => {
    if (!page || !user) return

    setSaving(true)
    try {
      if (page.id && page.id !== 'new') {
        // Update existing page
        await firestoreHelpers.updateDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          page.id,
          {
            ...page,
            updatedBy: user.id,
          }
        )
      } else {
        // Create new page
        const newId = await firestoreHelpers.addDocument(
          COLLECTIONS.LANDING_PAGE_CONTENT,
          {
            ...page,
            published: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: user.id,
          }
        )
        navigate(`/landing-pages/${newId}`, { replace: true })
      }
      alert('Page saved successfully!')
    } catch (error) {
      console.error('Failed to save page:', error)
      alert('Failed to save page. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async () => {
    if (!page || !user) return

    const newPublishedState = !page.published
    setPage({ ...page, published: newPublishedState })

    try {
      await firestoreHelpers.updateDocument(
        COLLECTIONS.LANDING_PAGE_CONTENT,
        page.id,
        {
          published: newPublishedState,
          updatedBy: user.id,
        }
      )
      alert(`Page ${newPublishedState ? 'published' : 'unpublished'} successfully!`)
    } catch (error) {
      console.error('Failed to toggle publish status:', error)
      alert('Failed to update publish status. Please try again.')
      setPage({ ...page, published: !newPublishedState }) // Revert on error
    }
  }

  const handleCreateFromTemplate = (slug: LandingPageSlug) => {
    const template = PAGE_TEMPLATES[slug]
    const newPage: LandingPageContent = {
      id: 'new',
      pageSlug: slug,
      pageTitle: template.pageTitle || '',
      metaDescription: template.metaDescription || '',
      metaKeywords: '',
      sections: template.sections || [],
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      updatedBy: user?.id || '',
    }
    setPage(newPage)
    setShowNewPageForm(false)
  }

  const handleUpdateSection = (sectionId: string, field: keyof LandingPageSection, value: any) => {
    if (!page) return
    setPage({
      ...page,
      sections: page.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      ),
    })
  }

  const handleAddSection = () => {
    if (!page) return
    const newSection: LandingPageSection = {
      id: `section-${Date.now()}`,
      sectionKey: 'new-section',
      title: 'New Section',
      content: '',
      visible: true,
      order: page.sections.length + 1,
    }
    setPage({
      ...page,
      sections: [...page.sections, newSection],
    })
  }

  const handleDeleteSection = (sectionId: string) => {
    if (!page) return
    if (confirm('Are you sure you want to delete this section?')) {
      setPage({
        ...page,
        sections: page.sections.filter((section) => section.id !== sectionId),
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/landing-pages')}>
          ← Back
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // New page selection
  if (showNewPageForm) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/landing-pages')}>
          ← Back
        </Button>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardTitle className="text-2xl">Create New Landing Page</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-600 mb-6">
              Select a page template to get started:
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(PAGE_TEMPLATES).map(([slug, template]) => (
                <Card
                  key={slug}
                  className="cursor-pointer hover:border-green-500 hover:shadow-md transition-all"
                  onClick={() => handleCreateFromTemplate(slug as LandingPageSlug)}
                >
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {template.pageTitle}
                    </h3>
                    <p className="text-sm text-gray-500">/{slug}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/landing-pages')}>
          ← Back
        </Button>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-500 text-lg">Page not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate('/landing-pages')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Landing Pages
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant={page.published ? 'default' : 'secondary'}>
            {page.published ? 'Published' : 'Draft'}
          </Badge>
          <Button
            variant="outline"
            onClick={handleTogglePublish}
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            {page.published ? 'Unpublish' : 'Publish'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Page Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="text-2xl">{page.pageTitle}</CardTitle>
          <p className="text-green-100 text-sm">/{page.pageSlug}</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={page.pageTitle}
                onChange={(e) => setPage({ ...page, pageTitle: e.target.value })}
                placeholder="Enter page title"
              />
            </div>
            <div>
              <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
              <Input
                id="metaDescription"
                value={page.metaDescription || ''}
                onChange={(e) =>
                  setPage({ ...page, metaDescription: e.target.value })
                }
                placeholder="Enter meta description for SEO"
              />
            </div>
            <div>
              <Label htmlFor="metaKeywords">Meta Keywords (SEO)</Label>
              <Input
                id="metaKeywords"
                value={page.metaKeywords || ''}
                onChange={(e) => setPage({ ...page, metaKeywords: e.target.value })}
                placeholder="Enter keywords separated by commas"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Page Sections</CardTitle>
            <Button onClick={handleAddSection} variant="outline" size="sm">
              + Add Section
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {page.sections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No sections yet. Click "Add Section" to get started.</p>
            </div>
          ) : (
            page.sections.map((section) => (
              <Card key={section.id} className="border-gray-200">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Section Key</Label>
                          <Input
                            value={section.sectionKey}
                            onChange={(e) =>
                              handleUpdateSection(section.id, 'sectionKey', e.target.value)
                            }
                            placeholder="e.g., hero, about, features"
                          />
                        </div>
                        <div>
                          <Label>Order</Label>
                          <Input
                            type="number"
                            value={section.order}
                            onChange={(e) =>
                              handleUpdateSection(section.id, 'order', parseInt(e.target.value))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={section.title || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, 'title', e.target.value)
                          }
                          placeholder="Section title"
                        />
                      </div>
                      <div>
                        <Label>Subtitle</Label>
                        <Input
                          value={section.subtitle || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, 'subtitle', e.target.value)
                          }
                          placeholder="Section subtitle"
                        />
                      </div>
                      <div>
                        <Label>Content</Label>
                        <textarea
                          className="w-full min-h-[100px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          value={section.content || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, 'content', e.target.value)
                          }
                          placeholder="Section content"
                        />
                      </div>
                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={section.imageUrl || ''}
                          onChange={(e) =>
                            handleUpdateSection(section.id, 'imageUrl', e.target.value)
                          }
                          placeholder="Image URL"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`visible-${section.id}`}
                          checked={section.visible}
                          onChange={(e) =>
                            handleUpdateSection(section.id, 'visible', e.target.checked)
                          }
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <Label htmlFor={`visible-${section.id}`}>Visible on page</Label>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteSection(section.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Save Button at Bottom */}
      <div className="flex justify-end gap-3 pb-8">
        <Button
          variant="outline"
          onClick={() => navigate('/landing-pages')}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  )
}
