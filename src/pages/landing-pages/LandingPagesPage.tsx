import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { firestoreHelpers, COLLECTIONS } from '@/lib/firestore'
import { seedLandingPageData } from '@/lib/seedLandingPageData'
import { useAuth } from '@/contexts/AuthContext'
import type { LandingPageContent } from '@/types'

export const LandingPagesPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [pages, setPages] = useState<LandingPageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    const loadPages = async () => {
      try {
        const data = await firestoreHelpers.getCollection<LandingPageContent>(
          COLLECTIONS.LANDING_PAGE_CONTENT
        )
        setPages(data)
      } catch (error) {
        console.error('Failed to load landing pages:', error)
      } finally {
        setLoading(false)
      }
    }
    loadPages()
  }, [])

  const handleCreatePage = () => {
    navigate('/landing-pages/new')
  }

  const handleSeedData = async () => {
    if (!user) return

    if (!confirm('This will create initial landing page content. Continue?')) {
      return
    }

    setSeeding(true)
    try {
      const results = await seedLandingPageData(user.id)

      if (results.errors.length > 0) {
        alert(`Seeded with some errors:\n${results.errors.join('\n')}`)
      } else {
        alert(`Successfully created ${results.success.length} pages!`)
      }

      // Reload pages
      const data = await firestoreHelpers.getCollection<LandingPageContent>(
        COLLECTIONS.LANDING_PAGE_CONTENT
      )
      setPages(data)
    } catch (error) {
      console.error('Failed to seed data:', error)
      alert('Failed to seed data. Check console for details.')
    } finally {
      setSeeding(false)
    }
  }

  const getPageIcon = (slug: string) => {
    const iconMap: Record<string, string> = {
      home: '🏠',
      about: 'ℹ️',
      'products-lilly-pilly': '🌺',
      'products-other-natives': '🌿',
      'products-exotics': '🌴',
      'products-palms': '🌴',
      availability: '📊',
      delivery: '🚚',
      councils: '🏛️',
      pricing: '💰',
      'visit-us': '📍',
      contact: '📧',
    }
    return iconMap[slug] || '📄'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Landing Pages CMS</h1>
            <p className="text-green-100">
              Manage content for the public landing page website
            </p>
          </div>
          <div className="flex gap-2">
            {pages.length === 0 && (
              <Button
                onClick={handleSeedData}
                disabled={seeding}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-semibold"
              >
                {seeding ? 'Seeding...' : '🌱 Seed Initial Data'}
              </Button>
            )}
            <Button
              onClick={handleCreatePage}
              className="bg-white text-green-700 hover:bg-green-50 font-semibold shadow-lg"
            >
              + Create Page
            </Button>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 text-lg">No landing pages yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Create your first landing page to get started
              </p>
              <Button
                onClick={handleCreatePage}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white"
              >
                Create First Page
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  onClick={() => navigate(`/landing-pages/${page.id}`)}
                  className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{getPageIcon(page.pageSlug)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {page.pageTitle}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            page.published
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {page.published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {page.sections.length} section{page.sections.length !== 1 ? 's' : ''}
                        {' • '}
                        <span className="capitalize">{page.pageSlug.replace(/-/g, ' ')}</span>
                      </p>
                      {page.metaDescription && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                          {page.metaDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-gray-500">
                      Last updated
                    </p>
                    <p className="font-medium text-sm text-gray-700">
                      {page.updatedAt
                        ? new Date(page.updatedAt).toLocaleDateString()
                        : 'Never'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold text-green-900 mb-1">
                How It Works
              </h3>
              <p className="text-sm text-green-800">
                Content changes made here will automatically appear on the public landing
                page at <strong>lrtf-landing.web.app</strong>. No code deployment
                required. Click on any page to edit its content, manage images, and
                reorder sections.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
