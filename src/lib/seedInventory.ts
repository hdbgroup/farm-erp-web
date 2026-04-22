/**
 * Seed Inventory Script
 *
 * Seeds sample inventory items to Firestore for development/testing
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

const sampleInventoryItems = [
  {
    name: 'Tomato Seeds - Roma Variety',
    category: 'seeds' as const,
    description: 'Premium Roma tomato seeds, perfect for hot climates. High yield variety.',
    zoneId: 'zone-001',
    quantity: 500,
    currentStage: 'seed' as const,
    maintenanceGuide: 'Store in cool, dry place. Keep away from direct sunlight.',
    botanicalDescription: 'Solanum lycopersicum, determinate variety',
    careInstructions: 'Plant 1/4 inch deep, 18-24 inches apart. Water regularly.',
    idealConditions: 'Full sun (6-8 hours), temperature 70-85°F, well-drained soil pH 6.0-6.8',
    growthTime: '75-80 days from transplant to harvest',
    historicalNotes: ['Received from supplier on 15/01/2024', 'Quality inspection passed'],
    images: [],
  },
  {
    name: 'Basil Plants - Sweet Genovese',
    category: 'plants' as const,
    description: 'Healthy basil seedlings ready for transplanting. Aromatic and fast-growing.',
    zoneId: 'zone-002',
    quantity: 150,
    currentStage: 'growth_period' as const,
    maintenanceGuide: 'Water daily, pinch off flowers to encourage leaf growth.',
    botanicalDescription: 'Ocimum basilicum, annual herb',
    careInstructions: 'Keep soil moist but not waterlogged. Harvest leaves regularly to promote bushier growth.',
    idealConditions: 'Full sun to partial shade, temperature 60-90°F, rich well-drained soil',
    growthTime: '60-90 days from seed to harvest',
    historicalNotes: [
      'Germinated on 20/02/2024',
      'Transplanted to 4-inch pots on 05/03/2024',
      'Ready for sale or further transplanting',
    ],
    images: [],
  },
  {
    name: 'Lemon Trees - Meyer Variety',
    category: 'trees' as const,
    description: '2-year-old Meyer lemon trees in 5-gallon pots. Fruit-bearing age.',
    zoneId: 'zone-003',
    quantity: 25,
    currentStage: 'ready_for_sale' as const,
    qrCode: 'LEM-2024-001',
    maintenanceGuide: 'Water deeply once per week. Fertilize monthly during growing season.',
    botanicalDescription: 'Citrus × meyeri, dwarf citrus hybrid',
    careInstructions: 'Prune dead branches, protect from frost. Requires full sun for fruit production.',
    idealConditions: 'Full sun (8+ hours), temperature 50-85°F, slightly acidic soil pH 5.5-6.5',
    growthTime: 'Bears fruit within 1-2 years when mature',
    historicalNotes: [
      'Received from nursery on 10/11/2023',
      'Repotted to 5-gallon containers on 15/01/2024',
      'First blooms observed on 01/03/2024',
      'Quality inspection passed - ready for sale',
    ],
    images: [],
  },
]

export const seedInventoryItems = async (userId: string = 'system') => {
  try {
    console.log('🌱 Starting inventory seed...')

    const inventoryCollection = collection(db, 'inventory')
    const addedItems: string[] = []

    for (const item of sampleInventoryItems) {
      const docData = {
        ...item,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: userId,
      }

      const docRef = await addDoc(inventoryCollection, docData)
      addedItems.push(docRef.id)
      console.log(`✅ Added: ${item.name} (${docRef.id})`)
    }

    console.log(`🎉 Successfully seeded ${addedItems.length} inventory items!`)
    return addedItems
  } catch (error) {
    console.error('❌ Error seeding inventory:', error)
    throw error
  }
}

// Function to run from browser console
export const runInventorySeed = async () => {
  try {
    await seedInventoryItems()
    alert('✅ Inventory seeded successfully! Check the console for details.')
  } catch (error) {
    alert('❌ Failed to seed inventory. Check the console for errors.')
  }
}
