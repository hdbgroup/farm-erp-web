/**
 * Seed Data Page
 *
 * Temporary page for seeding test data to Firestore
 * Access via /seed-data route
 */

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { seedInventoryItems } from '@/lib/seedInventory'
import { seedLandingPageData } from '@/lib/seedLandingPageData'

export const SeedDataPage = () => {
  const { user } = useAuth()
  const [loadingInventory, setLoadingInventory] = useState(false)
  const [loadingLandingPages, setLoadingLandingPages] = useState(false)
  const [inventoryResult, setInventoryResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [landingPageResult, setLandingPageResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSeedInventory = async () => {
    setLoadingInventory(true)
    setInventoryResult(null)

    try {
      const itemIds = await seedInventoryItems(user?.id || 'system')
      setInventoryResult({
        type: 'success',
        message: `✅ Successfully seeded ${itemIds.length} inventory items!`,
      })
    } catch (error: any) {
      setInventoryResult({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      })
    } finally {
      setLoadingInventory(false)
    }
  }

  const handleSeedLandingPages = async () => {
    setLoadingLandingPages(true)
    setLandingPageResult(null)

    try {
      const results = await seedLandingPageData(user?.id || 'system')
      setLandingPageResult({
        type: 'success',
        message: `✅ Successfully seeded ${results.success.length} landing pages!${results.errors.length > 0 ? ` (${results.errors.length} errors)` : ''}`,
      })
    } catch (error: any) {
      setLandingPageResult({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      })
    } finally {
      setLoadingLandingPages(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">🌱 Seed Test Data</h1>
          <p className="text-green-100">Populate Firestore with sample data for development</p>
        </div>

        {/* Warning */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900">Development Tool</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  This page is for seeding test data to Firestore during development.
                  Remove this route before deploying to production.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Landing Pages Seed */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Landing Page Content</h3>
              <p className="text-sm text-gray-600 mb-4">
                Seeds CMS content for landing pages:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Home page with hero, about, and parallax sections</li>
                <li>About Us page</li>
                <li>Lilly Pilly Products page</li>
                <li>Contact page</li>
              </ul>
            </div>

            <Button
              onClick={handleSeedLandingPages}
              disabled={loadingLandingPages}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loadingLandingPages ? 'Seeding...' : '🌐 Seed Landing Pages'}
            </Button>

            {landingPageResult && (
              <div
                className={`rounded-lg p-4 ${
                  landingPageResult.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    landingPageResult.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {landingPageResult.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Inventory Seed */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="pt-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">Inventory Items</h3>
              <p className="text-sm text-gray-600 mb-4">
                Seeds 3 sample inventory items:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Tomato Seeds - Roma Variety (500 units)</li>
                <li>Basil Plants - Sweet Genovese (150 units)</li>
                <li>Lemon Trees - Meyer Variety (25 units)</li>
              </ul>
            </div>

            <Button
              onClick={handleSeedInventory}
              disabled={loadingInventory}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loadingInventory ? 'Seeding...' : '🌱 Seed Inventory Items'}
            </Button>

            {inventoryResult && (
              <div
                className={`rounded-lg p-4 ${
                  inventoryResult.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    inventoryResult.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {inventoryResult.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-2">ℹ️ How to Use</h3>
            <ol className="text-sm text-gray-600 space-y-2 ml-4 list-decimal">
              <li>Make sure you're logged in with an admin account</li>
              <li>Click the "Seed" button above</li>
              <li>Check the Firestore console to verify data was added</li>
              <li>Navigate to the Inventory page to see the items</li>
              <li>Remove this /seed-data route before production deployment</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
