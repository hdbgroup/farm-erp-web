import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import type { InventoryItem } from '@/types'

export const InventoryDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [item, setItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItem = async () => {
      if (!id) return
      try {
        const data = await firestoreHelpers.getDocument<InventoryItem>(
          COLLECTIONS.INVENTORY,
          id
        )
        setItem(data)
      } catch (error) {
        console.error('Failed to load inventory item:', error)
      } finally {
        setLoading(false)
      }
    }
    loadItem()
  }, [id])

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      seeds: '🌱',
      plants: '🌿',
      trees: '🌳',
      equipment: '🔧',
    }
    return emojiMap[category] || '📦'
  }

  const getStageColor = (stage: string) => {
    const colorMap: Record<string, string> = {
      seed: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      watering: 'bg-blue-100 text-blue-800 border-blue-200',
      labelling: 'bg-purple-100 text-purple-800 border-purple-200',
      storage: 'bg-gray-100 text-gray-800 border-gray-200',
      growth_period: 'bg-green-100 text-green-800 border-green-200',
      mature: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      ready_for_sale: 'bg-green-200 text-green-900 border-green-300',
      sold: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-gray-200 text-gray-900 border-gray-300',
    }
    return colorMap[stage] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/inventory')}>
            ← Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/inventory')}>
            ← Back
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-500 text-lg">Item not found</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/inventory')}
          >
            Back to Inventory
          </Button>
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
          onClick={() => navigate('/inventory')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Inventory
        </Button>
      </div>

      {/* Main Info Card */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg pb-8">
          <div className="flex items-start gap-4">
            <div className="text-6xl">{getCategoryEmoji(item.category)}</div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{item.name}</CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-green-100 capitalize">{item.category}</span>
                <span className="text-green-200">•</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStageColor(
                    item.currentStage
                  )}`}
                >
                  {item.currentStage.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">{item.quantity}</div>
              <div className="text-green-100 text-sm mt-1">in stock</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            )}

            {/* Zone */}
            {item.zoneId && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Zone</h3>
                <p className="text-gray-600">{item.zoneId}</p>
              </div>
            )}

            {/* Growth Time */}
            {item.growthTime && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Growth Time</h3>
                <p className="text-gray-600">{item.growthTime}</p>
              </div>
            )}

            {/* QR Code */}
            {item.qrCode && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">QR Code</h3>
                <p className="text-gray-600 font-mono text-sm">{item.qrCode}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Care Instructions */}
        {item.careInstructions && (
          <InfoCard title="Care Instructions">
            <p className="text-gray-600 whitespace-pre-line">
              {item.careInstructions}
            </p>
          </InfoCard>
        )}

        {/* Ideal Conditions */}
        {item.idealConditions && (
          <InfoCard title="Ideal Conditions">
            <p className="text-gray-600 whitespace-pre-line">
              {item.idealConditions}
            </p>
          </InfoCard>
        )}

        {/* Botanical Description */}
        {item.botanicalDescription && (
          <InfoCard title="Botanical Description">
            <p className="text-gray-600 whitespace-pre-line">
              {item.botanicalDescription}
            </p>
          </InfoCard>
        )}

        {/* Maintenance Guide */}
        {item.maintenanceGuide && (
          <InfoCard title="Maintenance Guide">
            <p className="text-gray-600 whitespace-pre-line">
              {item.maintenanceGuide}
            </p>
          </InfoCard>
        )}
      </div>

      {/* Historical Notes */}
      {item.historicalNotes && item.historicalNotes.length > 0 && (
        <InfoCard title="Historical Notes">
          <ul className="space-y-2">
            {item.historicalNotes.map((note, index) => (
              <li key={index} className="flex gap-3">
                <span className="text-green-600 font-bold">•</span>
                <span className="text-gray-600">{note}</span>
              </li>
            ))}
          </ul>
        </InfoCard>
      )}

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <InfoCard title="Images">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {item.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${item.name} ${index + 1}`}
                className="rounded-lg object-cover w-full h-48 border border-gray-200"
              />
            ))}
          </div>
        </InfoCard>
      )}

      {/* Metadata */}
      <Card className="border-0 shadow-lg bg-gray-50">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium text-gray-900">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(item.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created By</p>
              <p className="font-medium text-gray-900">{item.createdBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
