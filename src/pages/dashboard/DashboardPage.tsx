import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { useAuth } from '@/contexts/AuthContext'
import { firestoreHelpers, COLLECTIONS } from '@/lib/dataProvider'
import type { InventoryItem, Order } from '@/types'

export const DashboardPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [inventoryData, ordersData] = await Promise.all([
          firestoreHelpers.getCollection<InventoryItem>(COLLECTIONS.INVENTORY),
          firestoreHelpers.getCollection<Order>(COLLECTIONS.ORDERS),
        ])
        setInventory(inventoryData)
        setOrders(ordersData)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const stats = {
    totalInventory: inventory.length,
    activeGrowth: inventory.filter((item) => item.currentStage === 'growth_period').length,
    readyForSale: inventory.filter((item) => item.currentStage === 'ready_for_sale').length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-green-100 text-lg">
              Here's what's happening with the farm today
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl">🌱</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory"
          value={loading ? '...' : stats.totalInventory}
          subtitle="items in stock"
          icon="📦"
          variant="green"
        />

        <StatCard
          title="Active Growth"
          value={loading ? '...' : stats.activeGrowth}
          subtitle="items growing"
          icon="🌿"
          variant="emerald"
        />

        <StatCard
          title="Ready for Sale"
          value={loading ? '...' : stats.readyForSale}
          subtitle="items available"
          icon="✅"
          variant="green"
        />

        <StatCard
          title="Pending Orders"
          value={loading ? '...' : stats.pendingOrders}
          subtitle="orders to fulfill"
          icon="🛒"
          variant="emerald"
        />
      </div>

      {/* Quick Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-green-50/30 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 font-semibold">
                Inventory Overview
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/inventory')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : inventory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No inventory items yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/inventory/${item.id}`)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">
                        {item.currentStage.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-base text-green-700">
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

        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-green-50/30 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-gray-900 font-semibold">
                Recent Orders
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/orders')}
                className="text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No orders yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        Order #{order.id.slice(-6)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.customerName}</p>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : order.status === 'ready'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : order.status === 'completed'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
