# Landing Page CMS - Setup & Usage Guide

## 🎯 Overview

A complete Content Management System (CMS) has been integrated into the Farm ERP to manage the content of the landing page website (`lrtf-landing.web.app`). This allows authorized users to edit text, images, and page layouts without requiring code deployments.

---

## ✅ What's Been Implemented

### 1. **ERP CMS Module** (`farm-erp-web`)

#### Files Created/Modified:
- **Types**: `/src/types/index.ts` - Added `LandingPageContent`, `LandingPageSection`, `LandingPageMedia`
- **Firestore**: `/src/lib/firestore.ts` - Added `LANDING_PAGE_CONTENT`, `LANDING_PAGE_MEDIA` collections
- **Security Rules**: `/firestore.rules` - Public read, authenticated write
- **Navigation**: `/src/components/layout/MainLayout.tsx` - Added "Landing Pages" menu item
- **Routes**: `/src/App.tsx` - Added `/landing-pages` routes
- **Pages**:
  - `/src/pages/landing-pages/LandingPagesPage.tsx` - List view
  - `/src/pages/landing-pages/LandingPageEditorPage.tsx` - Content editor
- **Seed Data**: `/src/lib/seedLandingPageData.ts` - Initial content population

#### Features:
✅ Create, edit, delete landing pages
✅ Manage sections (title, subtitle, content, images)
✅ Reorder sections by order number
✅ Show/hide sections dynamically
✅ Publish/unpublish workflow
✅ SEO metadata (title, description, keywords)
✅ Seed initial data with one click

### 2. **Landing Page Integration** (`lrtf-website`)

#### Files Created/Modified:
- **Firebase Config**: `/src/config/firebase.js` - Firebase initialization
- **Data Fetching**: `/src/utils/firestore.js` - Firestore helpers with caching
- **Custom Hook**: `/src/hooks/useLandingPage.js` - React hook for page data
- **Home Page**: `/src/components/pages/Home.jsx` - Refactored to use CMS
- **Environment**:
  - `.env` - Firebase credentials (gitignored)
  - `.env.example` - Template for credentials
  - `.gitignore` - Updated to exclude .env files

#### Features:
✅ Dynamic content loading from Firestore
✅ 5-minute caching to reduce Firestore reads
✅ Fallback to hardcoded data if CMS unavailable
✅ Loading states
✅ Error handling

### 3. **Firebase Security**

#### Firestore Rules (Deployed ✅):
```javascript
match /landing_page_content/{pageId} {
  allow read: if true;  // Public read
  allow create, update: if isAuthenticated();  // ERP users only
  allow delete: if isAdmin();  // Admins only
}

match /landing_page_media/{mediaId} {
  allow read: if true;
  allow create, update: if isAuthenticated();
  allow delete: if isAdmin();
}
```

---

## 🚀 How to Use the CMS

### Step 1: Access the CMS

1. **Login to ERP**: Navigate to `farm-erp-web.web.app`
2. **Authenticate**: Use your phone number + OTP
3. **Open CMS**: Click "Landing Pages" in the sidebar

### Step 2: Seed Initial Data (First Time Only)

On first visit, you'll see an empty page list:

1. Click the **"🌱 Seed Initial Data"** button
2. Confirm the action
3. Wait for success message
4. Initial pages will be created (Home, About, Products, Contact)

### Step 3: Edit a Page

1. **Select Page**: Click on any page card (e.g., "Home")
2. **Edit Metadata**:
   - Page Title
   - Meta Description (for SEO)
   - Meta Keywords (for SEO)
3. **Manage Sections**:
   - Edit existing sections (title, subtitle, content, images)
   - Add new sections with "+ Add Section"
   - Delete sections with "Delete" button
   - Reorder by changing the "Order" number
   - Toggle visibility with "Visible on page" checkbox
4. **Save Changes**: Click "Save Changes" button
5. **Publish**: Click "Publish" to make changes live

### Step 4: View Changes on Landing Page

1. **Landing Page**: Open `http://localhost:5175/` (dev) or `lrtf-landing.web.app` (production)
2. **Content Updates**: Changes appear immediately (cached for 5 minutes)
3. **No Deployment**: Content changes don't require code deployment!

---

## 📊 Data Structure

### LandingPageContent (Firestore Document)

```typescript
{
  id: string  // Auto-generated
  pageSlug: 'home' | 'about' | 'products-lilly-pilly' | ...
  pageTitle: string
  metaDescription?: string
  metaKeywords?: string
  sections: LandingPageSection[]
  published: boolean
  createdAt: Date
  updatedAt: Date
  updatedBy: string  // User ID
}
```

### LandingPageSection (Nested in Page)

```typescript
{
  id: string
  sectionKey: string  // e.g., 'hero', 'about', 'features'
  title?: string
  subtitle?: string
  content?: string  // HTML content
  imageUrl?: string
  imagePath?: string  // Firebase Storage path
  visible: boolean
  order: number  // Display order (1, 2, 3...)
  metadata?: Record<string, any>  // Custom fields
}
```

---

## 🔧 Technical Details

### Landing Page Caching

- **Cache Duration**: 5 minutes
- **Purpose**: Reduce Firestore read costs
- **Location**: `src/utils/firestore.js` - `getCachedLandingPage()`
- **Clear Cache**: Call `clearContentCache()` if needed

### Fallback Mechanism

Each page component has fallback data embedded:

```javascript
const FALLBACK_DATA = {
  pageSlug: 'home',
  sections: [/* hardcoded sections */]
};

const { pageData } = useLandingPage('home', FALLBACK_DATA);
```

This ensures the site still works if:
- Firestore is unavailable
- No CMS data has been created yet
- Network issues occur

### Dynamic vs Static Content

**Currently Dynamic (CMS-Managed):**
- ✅ Home page (`/`)

**Still Static (Hardcoded):**
- About, Products, Contact, etc.

To make other pages dynamic, follow the Home page pattern:

1. Import `useLandingPage` hook
2. Add fallback data
3. Replace hardcoded content with dynamic data
4. Use `getSection()` to retrieve specific sections

---

## 📝 Next Steps & Roadmap

### Immediate (Ready to Use):
1. ✅ ERP CMS is ready
2. ✅ Home page is dynamic
3. ✅ Security rules deployed
4. ✅ Seed data available

### Future Enhancements:

#### Phase 1: Content Management
- [ ] Add rich text editor (TipTap/Quill) for formatted content
- [ ] Implement image upload to Firebase Storage
- [ ] Add drag-and-drop for section reordering
- [ ] Preview mode before publishing

#### Phase 2: Additional Pages
- [ ] Refactor About page to use CMS
- [ ] Refactor Product pages to use CMS
- [ ] Refactor Contact page to use CMS
- [ ] Create page templates for common layouts

#### Phase 3: Advanced Features
- [ ] Version history / rollback
- [ ] Scheduled publishing
- [ ] Multi-language support
- [ ] Page analytics integration

#### Phase 4: Media Management
- [ ] Media library UI
- [ ] Image cropping/resizing
- [ ] Bulk upload
- [ ] CDN integration

---

## 🐛 Troubleshooting

### "Page not found" in CMS

**Issue**: Page doesn't exist in Firestore
**Solution**: Click "🌱 Seed Initial Data" button

### Changes not appearing on landing page

**Issue**: Cache or publish status
**Solutions**:
1. Check page is marked "Published" in CMS
2. Wait 5 minutes for cache to expire
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+F5)
4. Check browser console for errors

### Firebase permission errors

**Issue**: Security rules not deployed
**Solution**:
```bash
cd /Users/fehbrito/work/lrtf/farm-erp-web
firebase deploy --only firestore:rules
```

### Landing page not loading

**Issue**: Missing .env file
**Solution**:
```bash
cd /Users/fehbrito/work/lrtf/lrtf-website
cp .env.example .env
# Edit .env and add Firebase credentials
```

---

## 📚 File Reference

### ERP Files
```
farm-erp-web/
├── src/
│   ├── types/index.ts (+ CMS types)
│   ├── lib/
│   │   ├── firestore.ts (+ collections)
│   │   └── seedLandingPageData.ts (new)
│   ├── pages/landing-pages/
│   │   ├── LandingPagesPage.tsx (new)
│   │   └── LandingPageEditorPage.tsx (new)
│   └── components/layout/MainLayout.tsx (+ nav item)
├── firestore.rules (+ CMS rules)
└── CMS_SETUP.md (this file)
```

### Landing Page Files
```
lrtf-website/
├── src/
│   ├── config/firebase.js (new)
│   ├── utils/firestore.js (new)
│   ├── hooks/useLandingPage.js (new)
│   └── components/pages/Home.jsx (refactored)
├── .env (new, gitignored)
└── .env.example (new)
```

---

## 🎓 Learning Resources

- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [React Hooks Guide](https://react.dev/reference/react)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)

---

## ✨ Summary

The CMS is **fully functional** and ready to use!

**Admin Workflow:**
1. Login to ERP → Landing Pages
2. Create/Edit pages and sections
3. Publish when ready

**Result:**
- Content appears instantly on landing page
- No code changes needed
- SEO metadata managed
- Secure and scalable

**Next Action:** Login to the ERP and try editing the Home page! 🚀
