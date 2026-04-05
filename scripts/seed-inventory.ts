import { config } from 'dotenv'
import { resolve } from 'path'
import admin from 'firebase-admin'
import type { InventoryItem, Zone } from '../src/types'

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') })

// Initialize Firebase Admin SDK
// This uses Application Default Credentials or can use a service account
const projectId = process.env.VITE_FIREBASE_PROJECT_ID

if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: projectId,
  })
}

const db = admin.firestore()

// Sample zones to use for inventory items
const sampleZones = [
  {
    name: 'Nursery Zone A',
    type: 'nursery' as const,
    description: 'Main nursery area for seedlings and young plants',
    capacity: 500,
    currentOccupancy: 0,
  },
  {
    name: 'Growth Beds - Section 1',
    type: 'growth_beds' as const,
    description: 'Outdoor growth beds for mature plants',
    capacity: 200,
    currentOccupancy: 0,
  },
  {
    name: 'Seed Storage',
    type: 'seed_storage' as const,
    description: 'Climate-controlled seed storage area',
    capacity: 1000,
    currentOccupancy: 0,
  },
]

// Sample inventory items
const sampleInventoryItems = [
  {
    name: 'Tomato Seeds - Roma',
    category: 'seeds' as const,
    description: 'Premium Roma tomato seeds, ideal for warm climates',
    quantity: 500,
    currentStage: 'seed' as const,
    botanicalDescription: 'Solanum lycopersicum var. Roma',
    careInstructions: 'Plant in well-drained soil, water regularly, full sun exposure',
    idealConditions: 'Temperature: 21-27°C, Humidity: 60-70%, Full sunlight 6-8 hours',
    growthTime: '75-85 days to maturity',
    historicalNotes: ['Received from supplier on 2026-03-15', 'Quality check passed'],
  },
  {
    name: 'Basil Plants - Sweet Genovese',
    category: 'plants' as const,
    description: 'Sweet Genovese basil plants ready for transfer',
    quantity: 120,
    currentStage: 'watering' as const,
    botanicalDescription: 'Ocimum basilicum',
    careInstructions: 'Water daily, keep soil moist but not waterlogged, pinch flowers to promote leaf growth',
    idealConditions: 'Temperature: 18-24°C, Indirect sunlight, High humidity',
    growthTime: '60-90 days to maturity',
    historicalNotes: [
      'Seeded on 2026-02-20',
      'Transferred to nursery on 2026-03-01',
      'Currently in watering phase',
    ],
  },
  {
    name: 'Lemon Trees - Meyer',
    category: 'trees' as const,
    description: 'Meyer lemon trees, 2-year-old saplings',
    quantity: 25,
    currentStage: 'growth_period' as const,
    botanicalDescription: 'Citrus × meyeri',
    careInstructions: 'Water weekly, fertilize monthly with citrus fertilizer, prune as needed',
    idealConditions: 'Temperature: 13-27°C, Full sun 8-12 hours, Well-drained acidic soil',
    growthTime: '3-5 years to fruit production',
    historicalNotes: [
      'Received saplings on 2024-03-10',
      'Transplanted to growth beds on 2024-04-01',
      'First pruning completed 2025-09-15',
    ],
  },
  {
    name: 'Strawberry Plants - Albion',
    category: 'plants' as const,
    description: 'Albion strawberry plants, ready for sale',
    quantity: 80,
    currentStage: 'ready_for_sale' as const,
    botanicalDescription: 'Fragaria × ananassa',
    careInstructions: 'Water regularly, mulch around plants, remove runners for better fruit production',
    idealConditions: 'Temperature: 15-26°C, Full sun 6-8 hours, Well-drained soil pH 5.5-6.5',
    growthTime: '4-6 weeks to first harvest after planting',
    historicalNotes: [
      'Seeded on 2025-12-01',
      'Transferred to growth beds on 2026-01-15',
      'Quality inspection passed on 2026-03-25',
      'Ready for marketplace',
    ],
  },
  {
    name: 'Lettuce Seeds - Buttercrunch',
    category: 'seeds' as const,
    description: 'Buttercrunch lettuce seeds, crisp and sweet variety',
    quantity: 300,
    currentStage: 'storage' as const,
    botanicalDescription: 'Lactuca sativa var. capitata',
    careInstructions: 'Sow directly or start indoors, keep soil moist, thin seedlings to 8-10 inches apart',
    idealConditions: 'Temperature: 15-20°C, Partial shade in hot weather, Consistent moisture',
    growthTime: '55-60 days to maturity',
    historicalNotes: ['Ordered from organic seed supplier', 'Stored in climate-controlled area'],
  },
]

async function seedDatabase() {
  console.log('🌱 Starting database seeding...')

  try {
    // Check if zones exist
    const zonesRef = db.collection('zones')
    const zonesSnapshot = await zonesRef.limit(1).get()

    let defaultZoneId: string

    if (zonesSnapshot.empty) {
      console.log('📍 Creating sample zones...')
      const zoneIds: string[] = []

      for (const zone of sampleZones) {
        const docRef = await zonesRef.add({
          ...zone,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        })
        zoneIds.push(docRef.id)
        console.log(`   ✓ Created zone: ${zone.name} (${docRef.id})`)
      }

      defaultZoneId = zoneIds[0]
    } else {
      // Use existing zone
      defaultZoneId = zonesSnapshot.docs[0].id
      console.log(`📍 Using existing zone: ${defaultZoneId}`)
    }

    // Create inventory items
    console.log('\n🌿 Creating inventory items...')
    const inventoryRef = db.collection('inventory')

    // Use a default user ID for createdBy (you can change this to an actual user ID)
    const defaultUserId = 'system'

    for (const item of sampleInventoryItems) {
      const inventoryItem = {
        ...item,
        zoneId: defaultZoneId,
        createdBy: defaultUserId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }

      const docRef = await inventoryRef.add(inventoryItem)
      console.log(`   ✓ Created: ${item.name} (${docRef.id})`)
    }

    console.log('\n✅ Database seeding completed successfully!')
    console.log(`\n📊 Summary:`)
    console.log(`   - Zones created/used: 1 or more`)
    console.log(`   - Inventory items created: ${sampleInventoryItems.length}`)
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

// Run the seed script
seedDatabase()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Failed to seed database:', error)
    process.exit(1)
  })
