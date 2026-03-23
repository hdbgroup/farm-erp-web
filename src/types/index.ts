// User and Authentication Types
export type UserRole = 'admin' | 'farm_worker' | 'inventory_manager' | 'packing_staff'

export interface User {
  id: string
  phoneNumber: string
  name: string
  role: UserRole
  email?: string
  createdAt: Date
  updatedAt: Date
}

// Inventory Types
export type InventoryCategory = 'seeds' | 'plants' | 'trees' | 'equipment'

export type LifecycleStage =
  | 'seed'
  | 'watering'
  | 'labelling'
  | 'storage'
  | 'growth_period'
  | 'mature'
  | 'ready_for_sale'
  | 'sold'
  | 'completed'

export interface InventoryItem {
  id: string
  name: string
  category: InventoryCategory
  description: string
  zoneId: string
  quantity: number
  currentStage: LifecycleStage
  qrCode?: string
  maintenanceGuide?: string
  botanicalDescription?: string
  careInstructions?: string
  idealConditions?: string
  growthTime?: string
  historicalNotes: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
  images?: string[]
}

// Zone/Location Types
export type ZoneType =
  | 'seed_storage'
  | 'nursery'
  | 'growth_beds'
  | 'equipment_storage'
  | 'packing_area'
  | 'custom'

export interface Zone {
  id: string
  name: string
  type: ZoneType
  description?: string
  capacity?: number
  currentOccupancy: number
  createdAt: Date
  updatedAt: Date
}

// Lifecycle Processing Types
export interface LifecycleStageDefinition {
  id: string
  name: string
  stage: LifecycleStage
  description: string
  order: number
  estimatedDuration?: number // in days
  requiredActions?: string[]
}

export interface StageTransition {
  id: string
  itemId: string
  fromStage: LifecycleStage
  toStage: LifecycleStage
  completedBy: string
  completedAt: Date
  notes?: string
  duration?: number // actual duration in days
}

export interface ItemProcessingRecord {
  id: string
  itemId: string
  stage: LifecycleStage
  status: 'pending' | 'in_progress' | 'completed'
  assignedTo?: string
  startedAt?: Date
  completedAt?: Date
  notes?: string
}

// Team/Activity Types
export interface TeamMember extends User {
  assignedTasks: string[]
  activityLog: ActivityLog[]
}

export type ActivityType =
  | 'item_created'
  | 'item_updated'
  | 'item_moved'
  | 'stage_transitioned'
  | 'zone_created'
  | 'zone_updated'
  | 'order_created'
  | 'order_fulfilled'

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  type: ActivityType
  description: string
  entityType: 'inventory' | 'zone' | 'order' | 'team'
  entityId: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

// Marketplace Types
export type CustomerType = 'retail' | 'wholesale'

export interface Customer {
  id: string
  name: string
  type: CustomerType
  phoneNumber?: string
  email?: string
  companyName?: string // for wholesale
  approved: boolean // for wholesale
  createdAt: Date
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled'
export type FulfillmentType = 'delivery' | 'pickup'

export interface OrderItem {
  itemId: string
  itemName: string
  quantity: number
  pricePerUnit: number
  totalPrice: number
}

export interface Order {
  id: string
  customerId?: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  fulfillmentType: FulfillmentType
  deliveryAddress?: string
  pickupDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// Product Information (for marketplace)
export interface ProductInfo {
  itemId: string
  available: boolean
  price: number
  wholesalePrice?: number
  minWholesaleQuantity?: number
  featured: boolean
  displayOrder: number
}

// Notification Types
export type NotificationType =
  | 'stage_ready'
  | 'low_inventory'
  | 'new_order'
  | 'task_assigned'
  | 'item_ready_for_pickup'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  actionUrl?: string
  createdAt: Date
}

// Dashboard Types
export interface DashboardStats {
  totalInventory: number
  itemsByCategory: Record<InventoryCategory, number>
  itemsByStage: Record<LifecycleStage, number>
  itemsReadyForSale: number
  pendingOrders: number
  activeGrowthCycles: number
  lowInventoryAlerts: number
}

export interface RecentActivity extends ActivityLog {
  urgent: boolean
}
