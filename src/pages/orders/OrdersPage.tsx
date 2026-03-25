import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import type { Order } from '@/types'

export const OrdersPage = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await firestoreHelpers.getCollection<Order>(COLLECTIONS.ORDERS)
        setOrders(data)
      } catch (error) {
        console.error('Failed to load orders:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      processing: 'bg-blue-100 text-blue-800 border-blue-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getFulfillmentIcon = (type: string) => {
    return type === 'delivery' ? '🚚' : '📦'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-green-100">Track and manage all customer orders</p>
      </div>

      {/* Orders List */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-500 text-lg">No orders yet</p>
              <p className="text-gray-400 text-sm mt-2">
                Orders will appear here when customers place them
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-4xl">
                      {getFulfillmentIcon(order.fulfillmentType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                          Order #{order.id.slice(-6)}
                        </h3>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {order.customerName} • {order.items.length} item
                        {order.items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {order.fulfillmentType}
                        {order.fulfillmentType === 'pickup' &&
                          order.pickupDate &&
                          ` • ${new Date(order.pickupDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-2xl text-green-700">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">total</p>
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
