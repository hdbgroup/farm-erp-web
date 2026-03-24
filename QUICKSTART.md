# Quick Start Guide

## Start the App

```bash
npm run dev
```

Open your browser to: `http://localhost:5173`

**IMPORTANT:** Open the browser console (Press `F12` or `Cmd+Option+I` on Mac) to see debug logs!

## Login

You'll see a blue box saying **"🧪 Mock Data Mode"** on the login page.

### Step 1: Enter Phone Number
Enter **any** phone number (e.g., `+15551234567`)

**Tip:** Use one of the pre-loaded test users for instant login:
- `+15551234567` - John Smith (admin)
- `+15551234568` - Maria Garcia (farm_worker)
- `+15551234569` - David Chen (inventory_manager)
- `+15551234570` - Sarah Johnson (packing_staff)

### Step 2: Click "Send OTP"

Watch the console - you should see:
```
🔐 Mock: Sending OTP to +15551234567
📱 Mock OTP Code: 123456 (use this to log in)
```

### Step 3: Enter OTP Code
Enter: **`123456`**

### Step 4: Click "Verify OTP"

Watch the console - you should see:
```
🔐 Mock: Verifying code 123456 for +15551234567
🔐 Mock: Found existing user: {name: "John Smith", role: "admin", ...}
🔐 Mock: Setting currentUser: {uid: "user-admin-001", ...}
🔐 Mock: Notifying 1 listeners
✅ Login successful: {uid: "user-admin-001", ...}
```

Then:
```
🔐 AuthContext: Auth state changed: {uid: "user-admin-001", ...}
🔐 AuthContext: Fetching user profile for user-admin-001
🔐 AuthContext: User profile loaded: {name: "John Smith", ...}
🛡️ ProtectedRoute: User authenticated: John Smith
🛡️ ProtectedRoute: Access granted
```

### You're now logged in! 🎉

You should be redirected to the dashboard automatically.

## Explore the App

After login, you'll see:

- **Dashboard** - Overview with stats (currently showing zeros - we'll build this next!)
- **Inventory** - Coming soon
- **Zones** - Coming soon
- **Team** - Coming soon
- **Orders** - Coming soon

## Mock Data Available

Your app has pre-loaded realistic data:

### Test Users (Login with these phone numbers)
- `+15551234567` - John Smith (admin)
- `+15551234568` - Maria Garcia (farm_worker)
- `+15551234569` - David Chen (inventory_manager)
- `+15551234570` - Sarah Johnson (packing_staff)

### 6 Inventory Items
- Tomato Seeds, Basil Seedlings, Lemon Tree, Lettuce Mix, Garden Hose, Strawberry Plants

### 5 Zones
- Seed Storage, Nursery, Growth Beds, Equipment Storage, Packing Area

### 3 Sample Orders
Orders in different states (pending, ready, completed)

## Developer Console

Open browser console (F12) to see:

```javascript
// Quick login as admin (bypasses OTP)
await window.__mockAuth.mockQuickLogin('user-admin-001')

// List all available test users
window.__mockAuth.listMockUsers()

// Access mock database directly
window.__mockFirestore.mockDatabase
```

## Switch to Real Firebase

When you're ready to use real Firebase (for Storage, etc.):

1. Open `.env.local`
2. Change: `VITE_USE_MOCK_DATA=false`
3. Restart dev server: `npm run dev`

## Troubleshooting

### Nothing happens after clicking "Verify OTP"

**Check the browser console for these logs:**

1. **If you see "🔐 Mock: Verifying code..."** - Good! Authentication is working
2. **If you see "🔐 AuthContext: Auth state changed..."** - Good! Auth context is updating
3. **If you see "🛡️ ProtectedRoute: User authenticated..."** - Good! You should see the dashboard

**If stuck on "Loading..." screen:**
- Check console for errors
- Verify `.env.local` has `VITE_USE_MOCK_DATA=true`
- Restart dev server: `Ctrl+C` then `npm run dev`

**If redirected back to login:**
- Check console for "🛡️ ProtectedRoute: No user"
- This means auth state isn't persisting
- Try refreshing the page after login

**If you see TypeScript errors:**
- Run: `npm run build` to check for build errors
- Fix any type errors shown

### Login button does nothing
- Open browser console (F12) for error messages
- Check network tab for failed requests
- Restart dev server: `npm run dev`

### "Cannot find module" errors
- Run: `npm install`
- Delete `node_modules` and run `npm install` again
- Restart dev server

### Changes not appearing
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Restart dev server

### Still having issues?
1. Open browser console (F12)
2. Copy all error messages
3. Check the mock data is loading: Type `window.__mockAuth.listMockUsers()` in console
4. Try the quick login: `await window.__mockAuth.mockQuickLogin('user-admin-001')`

## Next Steps

Start building features! The mock data layer is ready.

See:
- `MOCK_DATA_GUIDE.md` - Complete mock data documentation
- `README.md` - Full project documentation
- `FIREBASE_SETUP.md` - When ready for real Firebase

---

Happy coding! 🚀
