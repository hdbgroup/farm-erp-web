# Firebase Setup Guide

This guide will walk you through setting up Firebase for your Farm ERP application.

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter your project name (e.g., "Farm ERP")
4. Click **Continue**
5. (Optional) Enable Google Analytics if you want usage tracking
6. Click **Create project**
7. Wait for the project to be created, then click **Continue**

## Step 2: Register Your Web App

1. From your Firebase project dashboard, click the **Web icon (</>)** to add a web app
2. Enter an app nickname (e.g., "Farm ERP Web")
3. **Check** the box for "Also set up Firebase Hosting" (optional but recommended)
4. Click **Register app**
5. You'll see your Firebase configuration object - **keep this page open**, you'll need these values

## Step 3: Configure Environment Variables

1. In your project, copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your Firebase configuration values from Step 2:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_actual_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   VITE_FIREBASE_APP_ID=your_actual_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
   ```

3. Save the file

## Step 4: Enable Authentication

1. In the Firebase Console, go to **Build → Authentication**
2. Click **Get started**
3. Go to the **Sign-in method** tab
4. Click on **Phone** provider
5. Click the **Enable** toggle
6. Click **Save**

### Configure Phone Authentication

For production:
- You'll need to add your app's domain to the authorized domains list
- Consider setting up App Check to prevent abuse

For development:
- Firebase will work on `localhost` automatically
- You can add test phone numbers under **Phone numbers for testing**

## Step 5: Set Up Firestore Database

1. In the Firebase Console, go to **Build → Firestore Database**
2. Click **Create database**
3. Select **Start in production mode** (we'll add security rules later)
4. Choose a Cloud Firestore location (select the one closest to your users)
5. Click **Enable**

### Initialize Firestore Security Rules

After your database is created, go to the **Rules** tab and update with these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAdmin() || isOwner(userId);
      allow delete: if isAdmin();
    }

    // Inventory collection
    match /inventory/{itemId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Zones collection
    match /zones/{zoneId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Orders collection
    match /orders/{orderId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated();
    }

    // Activities collection
    match /activities/{activityId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow write: if isAuthenticated();
    }
  }
}
```

Click **Publish** to save the rules.

## Step 6: Set Up Cloud Storage

1. In the Firebase Console, go to **Build → Storage**
2. Click **Get started**
3. Select **Start in production mode**
4. Use the default storage location
5. Click **Done**

### Configure Storage Rules

Go to the **Rules** tab and update:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

## Step 7: Set Up Cloud Functions (Optional for MVP)

Cloud Functions will be needed for:
- Sending SMS notifications
- Processing complex business logic
- Scheduled tasks (e.g., checking for items ready for next stage)

To set up later:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize functions: `firebase init functions`

## Step 8: Enable Firebase Hosting (Optional)

If you checked "Set up Firebase Hosting" in Step 2:

1. Install Firebase CLI (if not already): `npm install -g firebase-tools`
2. In your project directory, run: `firebase init hosting`
3. Select your Firebase project
4. Set the public directory to: `dist`
5. Configure as a single-page app: **Yes**
6. Don't overwrite index.html: **No**

## Step 9: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. The app should load without Firebase errors in the console

3. If you see errors:
   - Check that all environment variables are set correctly
   - Ensure you've enabled Phone Authentication
   - Verify Firestore is created
   - Check the browser console for specific error messages

## Step 10: Optional - Set Up Firebase Emulators for Local Development

Firebase Emulators allow you to develop locally without affecting your production data:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Initialize emulators: `firebase init emulators`
3. Select emulators to set up:
   - ✅ Authentication Emulator
   - ✅ Firestore Emulator
   - ✅ Storage Emulator
   - ✅ Functions Emulator (if using)

4. Use default ports or customize

5. Create `firebase.json` in your project root:
```json
{
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "functions": {
      "port": 5001
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

6. Start emulators: `firebase emulators:start`

7. In your `.env.local`, set:
   ```env
   VITE_USE_FIREBASE_EMULATORS=true
   ```

## Next Steps

- Set up your first user account with admin role
- Start creating inventory items
- Define your zones
- Configure lifecycle stages

## Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- Check that `VITE_FIREBASE_API_KEY` in `.env.local` is correct
- Restart your dev server after changing `.env.local`

### "Missing or insufficient permissions"
- Review your Firestore security rules
- Ensure you're authenticated before accessing data

### "reCAPTCHA verification failed"
- For development, add test phone numbers in Firebase Console
- For production, ensure your domain is authorized

### Environment variables not loading
- File must be named `.env.local` exactly
- Variables must start with `VITE_`
- Restart the dev server after changes

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication - Phone](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Emulators](https://firebase.google.com/docs/emulator-suite)
