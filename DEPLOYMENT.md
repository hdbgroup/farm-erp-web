# Firebase Deployment Guide

This guide covers deploying your Farm ERP application and Firebase configuration to production.

## Prerequisites

1. **Firebase CLI installed:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Logged in to Firebase:**
   ```bash
   firebase login
   ```

3. **Project configured:**
   The project is already configured to use the `farm-erp-web` Firebase project (see `.firebaserc`).

## Firebase Configuration Files

The following files are version-controlled and define your Firebase setup:

- **`firestore.rules`** - Security rules for Firestore database
- **`firestore.indexes.json`** - Composite indexes for Firestore queries
- **`storage.rules`** - Security rules for Cloud Storage
- **`firebase.json`** - Main Firebase configuration
- **`.firebaserc`** - Firebase project aliases

## Deployment Commands

### Deploy Everything

Deploy all Firebase services and hosting:

```bash
npm run build
firebase deploy
```

### Deploy Specific Services

**Deploy only Firestore rules and indexes:**
```bash
firebase deploy --only firestore
```

**Deploy only Storage rules:**
```bash
firebase deploy --only storage
```

**Deploy only Hosting:**
```bash
npm run build
firebase deploy --only hosting
```

### Deploy to Production

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase:**
   ```bash
   firebase deploy
   ```

3. **Verify deployment:**
   - Firestore rules: Firebase Console → Firestore Database → Rules
   - Storage rules: Firebase Console → Storage → Rules
   - Hosting: Visit your deployed URL

## First-Time Setup

### 1. Enable Firebase Services

Before deploying, ensure these services are enabled in Firebase Console:

- ✅ **Authentication** (Phone provider)
- ✅ **Firestore Database**
- ✅ **Cloud Storage**
- ✅ **Hosting**

### 2. Deploy Firebase Configuration

Deploy Firestore rules and indexes:

```bash
firebase deploy --only firestore
```

Deploy Storage rules:

```bash
firebase deploy --only storage
```

### 3. Create First Admin User

After deploying, create the first admin user:

1. Go to Firebase Console → Authentication
2. Add a test phone number OR use a real phone
3. Log in to the app at your deployed URL
4. Note your Firebase UID from Authentication → Users
5. Go to Firestore Database
6. Create a document in the `users` collection:
   ```
   Collection: users
   Document ID: <your-firebase-uid>
   Fields:
     - id: <your-firebase-uid> (string)
     - name: Your Name (string)
     - phoneNumber: +1234567890 (string)
     - role: admin (string)
     - email: your@email.com (string, optional)
     - createdAt: (timestamp - set to current time)
     - updatedAt: (timestamp - set to current time)
   ```

### 4. Test the Deployment

1. Visit your Firebase Hosting URL (shown after deployment)
2. Log in with your phone number
3. Verify you can access the dashboard

## Firestore Indexes

Composite indexes are defined in `firestore.indexes.json`. These are required for certain queries.

**Deploy indexes:**
```bash
firebase deploy --only firestore:indexes
```

**Key indexes created:**
- Inventory by category + stage + date
- Inventory by zone + date
- Orders by status + date
- Activities by user/type/entity + date
- Notifications by user + read status + date

Firebase will automatically create single-field indexes, but composite indexes must be defined.

## Security Rules

### Firestore Rules (`firestore.rules`)

Key features:
- Role-based access control (admin, farm_worker, inventory_manager, packing_staff)
- Activity logs are append-only (audit trail)
- Users can only see their own notifications
- Admins have elevated permissions

### Storage Rules (`storage.rules`)

Key features:
- 10MB file size limit
- Image type validation
- Role-based upload permissions
- Public read for product images
- Private read for internal documents

## Environment-Specific Deployments

### Using Multiple Environments

To set up separate dev/staging/prod environments:

1. **Create additional Firebase projects:**
   - farm-erp-web-dev
   - farm-erp-web-staging
   - farm-erp-web (production)

2. **Add project aliases:**
   ```bash
   firebase use --add
   ```

3. **Deploy to specific environment:**
   ```bash
   firebase use dev
   firebase deploy

   firebase use production
   firebase deploy
   ```

### Environment Variables

For different environments, create:
- `.env.local` - Local development
- `.env.development` - Development environment
- `.env.staging` - Staging environment
- `.env.production` - Production environment

Vite will automatically load the correct file based on the mode.

## Custom Domain Setup

### Add Custom Domain to Firebase Hosting

1. Go to Firebase Console → Hosting
2. Click **Add custom domain**
3. Enter your domain (e.g., `app.yourdomain.com`)
4. Follow the verification steps
5. Add the DNS records to your domain provider
6. Wait for SSL certificate provisioning (can take up to 24 hours)

### DNS Configuration

Add these records to your DNS provider:

```
Type: A
Name: app (or your subdomain)
Value: (provided by Firebase)

Type: TXT
Name: (provided by Firebase)
Value: (provided by Firebase)
```

## Continuous Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}

      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

**Get Firebase Token:**
```bash
firebase login:ci
```

Add the token to GitHub Secrets as `FIREBASE_TOKEN`.

## Monitoring and Rollback

### View Deployment History

```bash
firebase hosting:releases:list
```

### Rollback to Previous Version

```bash
firebase hosting:rollback
```

### Monitor Hosting

Visit Firebase Console → Hosting → Dashboard to see:
- Request count
- Bandwidth usage
- Response times
- Errors

## Troubleshooting

### "Permission Denied" Errors

- Check Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Verify user has correct role in Firestore users collection
- Check browser console for specific permission errors

### Indexes Not Created

- Deploy indexes: `firebase deploy --only firestore:indexes`
- Check Firebase Console → Firestore → Indexes
- May take a few minutes to build

### Hosting Not Updating

- Clear browser cache
- Check deployment succeeded: `firebase hosting:releases:list`
- Verify correct project: `firebase use`

### Storage Upload Failing

- Check Storage rules are deployed: `firebase deploy --only storage`
- Verify file size is under 10MB
- Check file type matches allowed types in rules

## Cost Monitoring

Firebase offers generous free tier limits:

**Firestore:**
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GiB storage

**Storage:**
- 5 GB storage
- 1 GB/day downloads

**Hosting:**
- 10 GB storage
- 360 MB/day bandwidth

Monitor usage in Firebase Console → Usage and Billing

## Security Checklist

Before going to production:

- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] All test accounts removed
- [ ] Environment variables secured (not in code)
- [ ] HTTPS enforced (automatic with Firebase Hosting)
- [ ] Custom domain with SSL configured
- [ ] Admin account created with strong authentication
- [ ] Billing alerts configured
- [ ] Backup strategy defined

## Support

For deployment issues:
- Check [Firebase Documentation](https://firebase.google.com/docs)
- Review [Firebase Status](https://status.firebase.google.com/)
- Contact your development team

---

Last updated: 2026-03-23
