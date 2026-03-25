import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InfoCard } from '@/components/ui/info-card'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import type { Order } from '@/types'

export const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return
      try {
        const data = await firestoreHelpers.getDocument<Order>(COLLECTIONS.ORDERS, id)
        setOrder(data)
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        setLoading(false)
      }
    }
    loadOrder()
  }, [id])

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')}>
            ← Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/orders')}>
            ← Back
          </Button>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-gray-500 text-lg">Order not found</p>
          <Button className="mt-4" onClick={() => navigate('/orders')}>
            Back to Orders
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
          onClick={() => navigate('/orders')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Orders
        </Button>
      </div>

      {/* Main Order Card */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg pb-8">
          <div className="flex items-start gap-4">
            <div className="text-6xl">{getFulfillmentIcon(order.fulfillmentType)}</div>
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">
                Order #{order.id.slice(-6)}
              </CardTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-green-100">{order.customerName}</span>
                <span className="text-green-200">•</span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold">
                ${order.totalAmount.toFixed(2)}
              </div>
              <div className="text-green-100 text-sm mt-1">total amount</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-gray-900">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-gray-900">{order.customerPhone}</p>
                </div>
                {order.customerEmail && (
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-900">{order.customerEmail}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fulfillment Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Fulfillment Information
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Type</p>
                  <p className="text-gray-900 capitalize">{order.fulfillmentType}</p>
                </div>
                {order.fulfillmentType === 'delivery' && order.deliveryAddress && (
                  <div>
                    <p className="text-xs text-gray-500">Delivery Address</p>
                    <p className="text-gray-900">{order.deliveryAddress}</p>
                  </div>
                )}
                {order.fulfillmentType === 'pickup' && order.pickupDate && (
                  <div>
                    <p className="text-xs text-gray-500">Pickup Date</p>
                    <p className="text-gray-900">
                      {new Date(order.pickupDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <InfoCard title="Order Items">
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-gray-50"
            >
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{item.itemName}</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Quantity: {item.quantity} × ${item.pricePerUnit.toFixed(2)}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg text-green-700">
                  ${item.totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 text-lg">Total Amount</p>
            <p className="font-bold text-2xl text-green-700">
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* Notes */}
      {order.notes && (
        <InfoCard title="Order Notes">
          <p className="text-gray-600 whitespace-pre-line">{order.notes}</p>
        </InfoCard>
      )}

      {/* Metadata */}
      <Card className="border-0 shadow-lg bg-gray-50">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Order Created</p>
              <p className="font-medium text-gray-900">
                {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Last Updated</p>
              <p className="font-medium text-gray-900">
                {new Date(order.updatedAt).toLocaleDateString()} at{' '}
                {new Date(order.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
