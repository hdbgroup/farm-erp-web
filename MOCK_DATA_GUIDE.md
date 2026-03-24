# Mock Data Guide

This guide explains how to use the mock data system for development without needing Firebase services.

## Overview

The Farm ERP application includes a complete mock data layer that simulates Firebase services in-memory. This allows you to:

- ✅ Develop without Firebase credentials
- ✅ Work offline
- ✅ Skip Firebase Storage setup (requires billing)
- ✅ Test features with realistic sample data
- ✅ Switch to real Firebase with a single flag

## Quick Start

### Enable Mock Data Mode

1. Open `.env.local`
2. Set `VITE_USE_MOCK_DATA=true`
3. Restart your dev server: `npm run dev`

```env
# .env.local
VITE_USE_MOCK_DATA=true
```

That's it! The app now runs with mock data.

### Disable Mock Data (Use Real Firebase)

1. Open `.env.local`
2. Set `VITE_USE_MOCK_DATA=false`
3. Ensure Firebase credentials are configured
4. Restart your dev server

```env
# .env.local
VITE_USE_MOCK_DATA=false
```

## Mock Data Features

### 🔐 Authentication

**Test Users:**

The mock system includes 4 pre-configured users:

| Name          | Role                | Phone          | User ID           |
|---------------|---------------------|----------------|-------------------|
| John Smith    | admin               | +15551234567   | user-admin-001    |
| Maria Garcia  | farm_worker         | +15551234568   | user-worker-001   |
| David Chen    | inventory_manager   | +15551234569   | user-manager-001  |
| Sarah Johnson | packing_staff       | +15551234570   | user-packing-001  |

**Login:**

1. Go to `/login`
2. Enter any phone number from above (or any phone number)
3. Enter OTP code: `123456` (always works in mock mode)
4. You'll be logged in!

**Quick Login (Browser Console):**

```javascript
// Instantly log in as admin (development only)
await window.__mockAuth.mockQuickLogin('user-admin-001')

// List all available users
window.__mockAuth.listMockUsers()
```

### 📦 Inventory

The mock database includes sample inventory items:

- **Tomato Seeds** - Cherry Red (Storage)
- **Basil Seedlings** - Sweet Genovese (Growing)
- **Lemon Tree** - Meyer (Mature)
- **Lettuce Mix** - Spring Greens (Ready for Sale)
- **Garden Hose** - Equipment
- **Strawberry Plants** - Everbearing (Mature)

All items have complete metadata, lifecycle stages, and historical notes.

### 🗺️ Zones

5 pre-configured zones:

- Seed Storage A
- Main Nursery
- Growth Beds - Section 1
- Equipment Storage
- Packing Area

Each with capacity tracking and current occupancy.

### 🛒 Orders

Sample orders in different states:

- Pending order from Green Valley Restaurant
- Ready for pickup order from Alice Williams
- Completed order from Organic Market Co-op

### 📝 Activities & Notifications

Recent activity logs and notifications are pre-populated.

## How It Works

### Architecture

```
Your Code
    ↓
dataProvider.ts (abstraction layer)
    ↓
    ├─ Mock Services (USE_MOCK_DATA=true)
    │   ├─ mockAuth.ts
    │   ├─ mockFirestore.ts
    │   └─ mockStorage.ts
    │
    └─ Real Firebase (USE_MOCK_DATA=false)
        ├─ auth.ts
        ├─ firestore.ts
        └─ storage.ts
```

### Data Provider

All data access goes through `src/lib/dataProvider.ts`, which automatically selects mock or real Firebase based on configuration.

**Import from dataProvider:**

```typescript
// ✅ Correct - uses mock or real Firebase automatically
import { observeAuthState, getUserProfile } from '@/lib/dataProvider'

// ❌ Wrong - bypasses abstraction layer
import { observeAuthState } from '@/lib/auth'
```

### Mock Database

Data is stored in-memory using JavaScript Maps:

```typescript
// src/lib/mock/data.ts
export const mockDatabase = {
  users: Map<string, User>
  inventory: Map<string, InventoryItem>
  zones: Map<string, Zone>
  orders: Map<string, Order>
  // ... etc
}
```

Changes persist during the session but reset on page refresh.

## Development Workflow

### Scenario 1: Pure Mock Development

Perfect for building features without Firebase.

```env
VITE_USE_MOCK_DATA=true
```

1. Start dev server: `npm run dev`
2. Login with OTP `123456`
3. All CRUD operations work in-memory
4. Data resets on page refresh

### Scenario 2: Firebase Development

Use real Firebase services.

```env
VITE_USE_MOCK_DATA=false
VITE_USE_FIREBASE_EMULATORS=false  # or true for local emulators
```

1. Ensure Firebase is configured
2. Start dev server: `npm run dev`
3. Login with real OTP (SMS sent)
4. Data persists in Firestore

### Scenario 3: Mixed Mode (Advanced)

You can even modify the code to use mock for some services and real Firebase for others, but the env flag approach is recommended.

## Adding Mock Data

### Add New Inventory Item

Edit `src/lib/mock/data.ts`:

```typescript
export const mockInventory: InventoryItem[] = [
  // ... existing items
  {
    id: 'inv-007',
    name: 'Your New Item',
    category: 'plants',
    description: 'Description here',
    zoneId: 'zone-002',
    quantity: 50,
    currentStage: 'growth_period',
    // ... other fields
  },
]
```

### Add New User

```typescript
export const mockUsers: User[] = [
  // ... existing users
  {
    id: 'user-new-001',
    phoneNumber: '+15559999999',
    name: 'New User',
    role: 'farm_worker',
    // ... other fields
  },
]
```

### Reset Mock Data

Mock data automatically resets when you refresh the page. To manually reset:

```javascript
// Browser console
window.__mockFirestore.resetMockData()
```

## API Compatibility

The mock services implement the same API as Firebase:

### Firestore Operations

```typescript
import { firestoreHelpers, where, orderBy } from '@/lib/dataProvider'

// Get document
const item = await firestoreHelpers.getDocument('inventory', 'inv-001')

// Query collection
const plants = await firestoreHelpers.getCollection('inventory', [
  where('category', '==', 'plants'),
  orderBy('createdAt', 'desc'),
])

// Add document
const id = await firestoreHelpers.addDocument('inventory', newItem)

// Update document
await firestoreHelpers.updateDocument('inventory', 'inv-001', { quantity: 100 })

// Delete document
await firestoreHelpers.deleteDocument('inventory', 'inv-001')

// Subscribe to real-time updates (mock returns immediately)
const unsubscribe = firestoreHelpers.subscribeToCollection(
  'inventory',
  (items) => console.log(items)
)
```

### Storage Operations

```typescript
import { storage } from '@/lib/dataProvider'

// Upload file (stored as data URL in mock mode)
const url = await storage.uploadFile('inventory/item-001/photo.jpg', file)

// Get download URL
const url = await storage.getDownloadURL('inventory/item-001/photo.jpg')

// Delete file
await storage.deleteFile('inventory/item-001/photo.jpg')
```

### Authentication

```typescript
import { sendOTP, verifyOTP, signOut } from '@/lib/dataProvider'

// Send OTP (mock always uses '123456')
const confirmation = await sendOTP(phoneNumber, recaptchaVerifier)

// Verify OTP
const result = await confirmation.confirm('123456')

// Sign out
await signOut()
```

## Browser Console Helpers

When `USE_MOCK_DATA=true` and in development mode:

```javascript
// Access mock services
window.__mockAuth        // Auth methods
window.__mockFirestore   // Firestore methods
window.__mockStorage     // Storage methods

// List available users
window.__mockAuth.listMockUsers()

// Quick login (bypasses OTP)
await window.__mockAuth.mockQuickLogin('user-admin-001')

// View all files
window.__mockStorage.listAllMockFiles()

// Access mock database directly
window.__mockFirestore.mockDatabase
```

## Limitations

### What Works

✅ All CRUD operations
✅ Basic queries (where, orderBy, limit)
✅ Authentication with test users
✅ File uploads (stored as data URLs)
✅ Real-time subscriptions (called once with current data)

### What's Simplified

⚠️ **Data persistence** - Resets on page refresh
⚠️ **Real-time updates** - Subscriptions don't update automatically
⚠️ **Complex queries** - Some advanced Firestore queries not supported
⚠️ **Transactions** - Not implemented
⚠️ **File size** - Large file uploads stored in memory (watch usage)

### What Doesn't Work

❌ **Cloud Functions** - No server-side code execution
❌ **SMS notifications** - No real SMS sent
❌ **Firebase Analytics** - No tracking
❌ **Data persistence** - Between sessions

## Switching to Production

When ready to deploy:

1. Set up all Firebase services (see `FIREBASE_SETUP.md`)
2. Update `.env.local`: `VITE_USE_MOCK_DATA=false`
3. Test thoroughly with real Firebase
4. Deploy with Firebase credentials in environment

## Best Practices

### ✅ Do's

- Use mock mode for rapid feature development
- Test with real Firebase before deploying
- Use the data provider abstraction layer consistently
- Add realistic mock data for your use cases
- Use quick login for faster development iteration

### ❌ Don'ts

- Don't commit sensitive data to mock files
- Don't rely on mock data persisting
- Don't bypass the data provider layer
- Don't use mock mode in production
- Don't forget to test with real Firebase eventually

## Troubleshooting

### Mock data not loading

- Check `VITE_USE_MOCK_DATA=true` in `.env.local`
- Restart dev server after changing `.env.local`
- Check browser console for "🔧 Data Source: Mock Data"

### "Cannot find module" errors

- Ensure `npm install` has been run
- Check that mock files exist in `src/lib/mock/`

### Changes not reflecting

- Refresh the page (mock data resets)
- Check you're editing the right mock data file
- Verify the import path

### Login not working

- Use OTP code: `123456`
- Or use quick login: `window.__mockAuth.mockQuickLogin('user-admin-001')`

## FAQ

**Q: Do I need Firebase credentials for mock mode?**
A: No! Mock mode works completely without Firebase.

**Q: Will my changes persist?**
A: No, mock data resets on page refresh. Use real Firebase for persistence.

**Q: Can I use mock mode in production?**
A: No, mock mode is for development only.

**Q: How do I add more test data?**
A: Edit `src/lib/mock/data.ts` and add to the arrays.

**Q: Can I mix mock and real Firebase?**
A: The system is designed for all-or-nothing, but you could modify the code to cherry-pick services.

**Q: Does mock mode work with the marketplace?**
A: Yes! All features work with mock data.

---

**Need help?** Check `FIREBASE_SETUP.md` for Firebase configuration or `README.md` for general setup.
