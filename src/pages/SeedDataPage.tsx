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

export const SeedDataPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleSeedInventory = async () => {
    setLoading(true)
    setResult(null)

    try {
      const itemIds = await seedInventoryItems(user?.id || 'system')
      setResult({
        type: 'success',
        message: `✅ Successfully seeded ${itemIds.length} inventory items!`,
      })
    } catch (error: any) {
      setResult({
        type: 'error',
        message: `❌ Error: ${error.message}`,
      })
    } finally {
      setLoading(false)
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
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Seeding...' : '🌱 Seed Inventory Items'}
            </Button>

            {result && (
              <div
                className={`rounded-lg p-4 ${
                  result.type === 'success'
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm ${
                    result.type === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.message}
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
