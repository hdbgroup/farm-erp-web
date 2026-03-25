import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import type { InventoryItem } from '@/types'

export const InventoryPage = () => {
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await firestoreHelpers.getCollection<InventoryItem>(
          COLLECTIONS.INVENTORY
        )
        setInventory(data)
      } catch (error) {
        console.error('Failed to load inventory:', error)
      } finally {
        setLoading(false)
      }
    }
    loadInventory()
  }, [])

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
        <p className="text-green-100">
          Track and manage all your farm inventory items
        </p>
      </div>

      {/* Inventory List */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading inventory...</p>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-gray-500 text-lg">No inventory items yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Start adding items to track your farm inventory
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inventory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/inventory/${item.id}`)}
                  className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">{getCategoryEmoji(item.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          {item.name}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStageColor(
                            item.currentStage
                          )}`}
                        >
                          {item.currentStage.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 capitalize">
                        {item.category}
                        {item.description && ` • ${item.description}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-2xl text-green-700">
                      {item.quantity}
                    </p>
                    <p className="text-xs text-gray-500">in stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
