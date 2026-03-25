# Farm ERP - Admin System (MVP)

A modern web application for managing farm operations, inventory, and sales. Built with React, TypeScript, Vite, and Firebase.

## Overview

This is the Farm ERP admin system that allows farm staff to:
- Track inventory (seeds, plants, trees, equipment)
- Manage farm zones and locations
- Monitor item lifecycle from seed to sale
- Manage team members and roles
- Process customer orders
- Generate QR codes for inventory tracking

## Tech Stack

**Frontend:**
- ⚛️ React 19 with TypeScript
- ⚡ Vite 8 for lightning-fast development
- 🎨 Tailwind CSS 4 for styling
- 🧩 shadcn/ui for UI components
- 🛣️ React Router for navigation
- 📋 React Hook Form + Zod for forms
- 🔄 Zustand for state management

**Backend:**
- 🔥 Firebase Authentication (Phone OTP)
- 🗄️ Firestore (NoSQL database)
- 💾 Cloud Storage (file storage)
- ⚡ Cloud Functions (backend logic)
- 📱 Cloud Messaging (notifications)

## Project Structure

```
farm-erp-web/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── layout/      # Layout components
│   │   └── ProtectedRoute.tsx
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── features/        # Feature modules (future)
│   ├── hooks/           # Custom React hooks (future)
│   ├── lib/             # Utilities & Data layer
│   │   ├── config.ts    # App configuration
│   │   ├── dataProvider.ts  # Data abstraction layer
│   │   ├── firebase.ts  # Firebase initialization
│   │   ├── firestore.ts # Firestore helpers
│   │   ├── auth.ts      # Auth helpers
│   │   ├── storage.ts   # Storage helpers
│   │   ├── utils.ts     # General utilities
│   │   └── mock/        # Mock data services
│   │       ├── data.ts  # Sample data
│   │       ├── mockAuth.ts
│   │       ├── mockFirestore.ts
│   │       └── mockStorage.ts
│   ├── pages/           # Page components
│   │   ├── auth/        # Login & authentication
│   │   ├── dashboard/   # Dashboard
│   │   ├── inventory/   # Inventory management
│   │   ├── zones/       # Zone management
│   │   ├── team/        # Team management
│   │   └── orders/      # Order management
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .env.local           # Environment variables (not committed)
├── .env.example         # Environment variables template
├── firebase.json        # Firebase configuration
├── .firebaserc          # Firebase project aliases
├── firestore.rules      # Firestore security rules
├── firestore.indexes.json # Firestore indexes
├── storage.rules        # Cloud Storage security rules
├── FIREBASE_SETUP.md    # Firebase setup instructions
├── MOCK_DATA_GUIDE.md   # Mock data development guide
├── DEVELOPMENT.md       # 📘 Development guidelines & DRY principle
├── DEPLOYMENT.md        # Deployment guide
└── README.md            # This file
```

## 🚀 Quick Start (Mock Data Mode)

Want to start developing immediately without Firebase setup? Use **Mock Data Mode**:

```bash
npm install
npm run dev
```

The app runs with realistic sample data - no Firebase required! Login with any phone number and OTP code `123456`.

See [MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md) for details.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A code editor (VS Code recommended)
- **Optional:** A Firebase account (only needed when not using mock data)

### Installation

1. **Clone or navigate to the project:**
   ```bash
   cd farm-erp-web
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**

   Follow the detailed guide in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) to:
   - Create a Firebase project
   - Enable Phone Authentication
   - Set up Firestore Database
   - Configure Cloud Storage
   - Get your Firebase config credentials

4. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and fill in your Firebase credentials from step 3.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## Development

### Development Modes

The app supports three development modes:

#### 🧪 Mock Data Mode (Default)
- Perfect for development without Firebase
- Uses realistic in-memory sample data
- Login with OTP code: `123456`
- No setup required!

**Enable:**
```env
# .env.local
VITE_USE_MOCK_DATA=true
```

#### 🔥 Firebase Production Mode
- Uses real Firebase services
- Data persists in Firestore
- Real SMS OTP for authentication

**Enable:**
```env
# .env.local
VITE_USE_MOCK_DATA=false
```

#### 🛠️ Firebase Emulator Mode
- Uses Firebase emulators locally
- Data persists during emulator session
- No cloud costs

**Enable:**
```env
# .env.local
VITE_USE_MOCK_DATA=false
VITE_USE_FIREBASE_EMULATORS=true
```

Then run: `npm run emulators`

See [MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md) for complete details.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run deploy` - Build and deploy everything to Firebase
- `npm run deploy:hosting` - Deploy only the web app
- `npm run deploy:rules` - Deploy only Firestore and Storage rules
- `npm run deploy:firestore` - Deploy Firestore rules and indexes
- `npm run emulators` - Start Firebase emulators for local testing

### Code Style & Best Practices

This project follows strict coding standards to ensure maintainability and consistency.

**📘 Read [DEVELOPMENT.md](./DEVELOPMENT.md) for complete development guidelines**

Key principles:
- **DRY (Don't Repeat Yourself)** - Always create reusable components instead of duplicating code
- **Consistent Color System** - Use explicit colors from the approved palette
- **Component Composition** - Build on existing components before creating new ones
- **Type Safety** - All code must be properly typed with TypeScript

Tools:
- ESLint for code quality
- Prettier for code formatting (configured in `.prettierrc`)
- TypeScript strict mode for type safety

Format your code before committing:
```bash
npx prettier --write .
```

### Adding UI Components

We use shadcn/ui components. To add more components, you can manually create them in `src/components/ui/` following the shadcn/ui patterns, or reference the [shadcn/ui documentation](https://ui.shadcn.com/).

## Firebase Configuration

### Collections

The app uses the following Firestore collections:

- `users` - Team member profiles
- `inventory` - Inventory items (seeds, plants, trees, equipment)
- `zones` - Farm zones and locations
- `orders` - Customer orders
- `customers` - Customer information
- `activities` - Activity logs
- `notifications` - User notifications
- `stage_transitions` - Lifecycle stage history
- `product_info` - Product information for marketplace

### Security Rules

Basic Firestore security rules are provided in [FIREBASE_SETUP.md](./FIREBASE_SETUP.md). Review and customize them for your security requirements.

## Authentication

The app uses Firebase Phone Authentication with OTP (One-Time Password).

**Flow:**
1. User enters phone number
2. Firebase sends SMS with 6-digit code
3. User enters code to verify
4. User profile is fetched from Firestore
5. User is redirected to dashboard

**Roles:**
- `admin` - Full access to all features
- `farm_worker` - Access to inventory and zones
- `inventory_manager` - Manage inventory and orders
- `packing_staff` - View orders and fulfill them

## Features Status

### ✅ Phase 1 - Foundation (Completed)
- [x] Project setup with Vite + React + TypeScript
- [x] Tailwind CSS + shadcn/ui integration
- [x] Firebase configuration
- [x] Authentication context
- [x] Routing structure
- [x] Main layout with navigation
- [x] Basic pages (Dashboard, Inventory, Zones, Team, Orders)

### 🚧 Phase 2 - Core Features (Next Steps)
- [ ] Inventory Management CRUD
- [ ] Zone Management
- [ ] Lifecycle Pipeline System
- [ ] Team Management
- [ ] Dashboard with real data
- [ ] Order Management

### 📋 Phase 3 - Advanced Features (Planned)
- [ ] QR Code generation and scanning
- [ ] Product information management
- [ ] Notifications system
- [ ] Activity logging
- [ ] Search and filtering
- [ ] Bulk operations

### 🚀 Phase 4 - Enhancements (Future)
- [ ] Mobile responsive optimization
- [ ] Offline support
- [ ] Analytics and reporting
- [ ] Export functionality
- [ ] Integration with marketplace

## Contributing

This is an MVP project for a specific farm operation. If you're part of the team:

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Deploy everything:**
   ```bash
   npm run deploy
   ```

3. **Deploy only hosting:**
   ```bash
   npm run deploy:hosting
   ```

4. **Deploy only security rules:**
   ```bash
   npm run deploy:rules
   ```

### Firebase Configuration Files

The following files define your Firebase security and are version-controlled:

- **`firestore.rules`** - Database security rules with role-based access
- **`firestore.indexes.json`** - Composite indexes for complex queries
- **`storage.rules`** - File storage security rules
- **`firebase.json`** - Main Firebase configuration

These files are automatically deployed when you run `npm run deploy`.

### Custom Domain

Configure your custom domain (e.g., `app.yourdomain.com`) in the Firebase Console under Hosting settings. See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

## Troubleshooting

### Firebase Connection Issues

- Ensure `.env.local` has the correct Firebase credentials
- Restart the dev server after changing environment variables
- Check that all Firebase services are enabled in the console

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Ensure you're using Node 18+: `node --version`

### TypeScript Errors

- Run type checking: `npx tsc --noEmit`
- Check that all types are properly imported with `type` keyword

## Next Steps

### Option 1: Start with Mock Data (Recommended for Quick Start)

1. **Install dependencies** - `npm install`
2. **Start development** - `npm run dev`
3. **Login** - Use OTP code `123456`
4. **Build features** - Start developing immediately!

See [MOCK_DATA_GUIDE.md](./MOCK_DATA_GUIDE.md) for details.

### Option 2: Set up Real Firebase

1. **Set up Firebase** - Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
2. **Configure environment variables** - Fill in `.env.local`
3. **Disable mock mode** - Set `VITE_USE_MOCK_DATA=false`
4. **Start development** - Run `npm run dev`

## Support

For questions or issues:
1. Check the [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) guide
2. Review Firebase documentation
3. Contact the development team

## License

Proprietary - All rights reserved

---

Built with ❤️ for sustainable farming
