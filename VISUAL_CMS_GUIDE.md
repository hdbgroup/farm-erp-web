# Visual CMS Guide - Website Content Management

## 🎯 Overview

The **Visual CMS** allows you to edit the landing page website content by viewing the actual website and clicking on sections to edit them inline. No need to navigate through forms - you see exactly what you're editing!

---

## ✨ Key Features

✅ **Visual Preview** - See the real website as you edit
✅ **Click-to-Edit** - Click any section to open the edit panel
✅ **Live Updates** - See changes immediately in the preview
✅ **Page Selector** - Switch between pages with a dropdown
✅ **Safe Editing** - Only edit content, not page structure
✅ **Publish Control** - Save and publish when ready

---

## 🚀 How to Use

### Step 1: Access the CMS

1. **Login to ERP**: Navigate to the ERP at `farm-erp-web.web.app` (or localhost during development)
2. **Authenticate**: Use your phone number + OTP
3. **Open CMS**: Click **"CMS Website"** in the sidebar

### Step 2: Select a Page

- Use the **"Page"** dropdown at the top to select which page to edit:
  - Home
  - About Us
  - Lilly Pilly Products
  - Other Natives
  - Exotics
  - Palms
  - Availability
  - Delivery
  - Councils
  - Pricing
  - Visit Us
  - Contact

The selected page will load in the preview iframe below.

### Step 3: Edit Content

1. **Hover over sections** in the preview - you'll see a green dashed border and a label (e.g., "✏️ hero")
2. **Click the section** you want to edit
3. **Edit panel slides in** from the right with fields:
   - **Title**: Main heading text
   - **Subtitle**: Subheading text
   - **Content**: Body content (can include HTML)
   - **Image URL**: Background or section image
   - **Visible**: Toggle section visibility
4. **Make your changes** in the edit panel
5. **Click "Update"** - changes appear immediately in the preview
6. **Repeat** for other sections

### Step 4: Save Changes

- **Edit multiple sections** if needed - all changes are tracked
- **"Unsaved Changes"** badge appears when you have pending edits
- **Click "Save Changes"** button at the top to persist all edits to Firestore
- **Success message** appears when saved
- **Iframe refreshes** to show the final saved content

### Step 5: Publish (Optional)

- Check the **badge** next to the page selector:
  - 🟢 **Published** - Content is live on the public website
  - ⚪ **Draft** - Content is saved but not public yet
- Publishing is managed separately (currently all pages auto-publish on save)

---

## 🎨 Visual Editing Experience

### In Edit Mode:
```
┌─────────────────────────────────────────────┐
│  CMS Website     Page: [Home ▼]       [Save]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  ✏️ hero    ← Click to edit         │   │
│  │  ──────────────────────────────      │   │
│  │                                     │   │
│  │  Growers of quality advanced...     │   │
│  │                                     │   │
│  ├─────────────────────────────────────┤   │
│  │  ✏️ about   ← Click to edit         │   │
│  │  ──────────────────────────────      │   │
│  │                                     │   │
│  │  Logan River Tree Farm specialises  │   │
│  │  in advanced screening trees...     │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Edit Panel - when section clicked] ────→ │
└─────────────────────────────────────────────┘
```

### Edit Panel:
```
┌──────────────────────────┐
│  Edit Section        [×] │
│  Section: hero           │
├──────────────────────────┤
│  Title:                  │
│  [Growers of quality...] │
│                          │
│  Subtitle:               │
│  [                    ]  │
│                          │
│  Content:                │
│  [                    ]  │
│  [                    ]  │
│                          │
│  Image URL:              │
│  [https://storage... ]   │
│  [Preview image]         │
│                          │
│  ☑ Visible on page       │
├──────────────────────────┤
│  [Cancel]      [Update]  │
└──────────────────────────┘
```

---

## 🔧 Technical Details

### How It Works

**1. Iframe Preview**
- The landing page is loaded in an iframe with `?editMode=true` parameter
- This activates "edit mode" in the landing page, making sections clickable

**2. Communication (postMessage)**
- **ERP → Iframe**: Send section updates
- **Iframe → ERP**: Send click events when sections are clicked
- Secure cross-origin communication using `window.postMessage()`

**3. EditableSection Component** (Landing Page)
- Wraps each editable section
- Shows visual indicators (borders, labels) in edit mode
- Sends click events to parent (ERP)
- Receives and applies live updates

**4. Edit Panel** (ERP)
- Slides in from right when section is clicked
- Shows current section data in form fields
- Sends updates to iframe on "Update" click
- Tracks unsaved changes

**5. Save Flow**
- All changes accumulated in memory
- "Save Changes" button writes to Firestore
- Iframe refreshes to show saved content
- Cache clears so public sees updates (after 5 minutes)

---

## 📊 Data Flow

```
User Action: Click section in iframe
     ↓
Iframe: EditableSection onClick handler
     ↓
Iframe → ERP: postMessage { type: 'SECTION_CLICKED', sectionKey: 'hero' }
     ↓
ERP: Handle message, open edit panel with section data
     ↓
User: Edit fields in panel
     ↓
User: Click "Update" button
     ↓
ERP → Iframe: postMessage { type: 'UPDATE_SECTION', data: {...} }
     ↓
Iframe: EditModeContext receives update, re-renders section
     ↓
User: See immediate visual feedback
     ↓
User: Click "Save Changes"
     ↓
ERP: Save all changes to Firestore
     ↓
ERP: Reload iframe to show persisted content
```

---

## 🎓 For Developers

### Landing Page Side

**Files:**
- `/src/contexts/EditModeContext.jsx` - Manages edit mode state
- `/src/components/cms/EditableSection.jsx` - Wrapper for editable sections
- `/src/components/cms/EditableSection.css` - Visual styles for edit mode

**Usage in Page Components:**
```jsx
import { useEditMode } from '../../contexts/EditModeContext';
import EditableSection from '../cms/EditableSection';

const MyPage = () => {
  const { getSectionData } = useEditMode();

  const heroSection = getSectionData('hero', defaultData);

  return (
    <EditableSection sectionKey="hero" data={heroSection}>
      <YourSectionContent data={heroSection} />
    </EditableSection>
  );
};
```

### ERP Side

**Files:**
- `/src/pages/cms-website/CmsWebsitePage.tsx` - Main visual editor page

**Key Functions:**
- `handleMessage()` - Listens for postMessage from iframe
- `handleSectionClick()` - Opens edit panel when section clicked
- `handleUpdateSection()` - Sends live updates to iframe
- `handleSave()` - Persists all changes to Firestore

---

## 🐛 Troubleshooting

### Sections not clickable in preview

**Issue**: Can't click sections to edit them
**Solutions**:
1. Check URL has `?editMode=true` parameter
2. Verify EditModeProvider wraps the app
3. Check console for errors

### Edit panel not appearing

**Issue**: Click section but panel doesn't open
**Solutions**:
1. Check browser console for postMessage errors
2. Verify iframe origin matches expected domain
3. Check EditableSection is properly wrapped

### Changes not saving

**Issue**: Click "Save Changes" but nothing happens
**Solutions**:
1. Check Firestore security rules are deployed
2. Verify user is authenticated in ERP
3. Check network tab for Firestore errors
4. Ensure pageData has valid `id` field

### Iframe not loading

**Issue**: Blank preview or error message
**Solutions**:
1. Check landing page dev server is running (localhost:5175)
2. Verify LANDING_PAGE_URL in CmsWebsitePage.tsx
3. Check for CORS issues in console
4. Try refreshing the ERP page

---

## 🔒 Security

### Origin Validation

The postMessage communication validates origins to prevent XSS:

```javascript
// Landing Page (EditModeContext.jsx)
const handleMessage = (event) => {
  // In production, verify event.origin
  if (!event.origin.startsWith('http://localhost') &&
      !event.origin.startsWith('https://farm-erp-web')) {
    return; // Reject unknown origins
  }
  // Process message...
};
```

**Production**: Update origin checks to use exact domains.

### Authentication

- Only authenticated ERP users can access CMS Website page
- Firestore rules enforce write permissions
- Edit mode URL parameter doesn't bypass security (only visual)

---

## 🎉 Benefits of Visual CMS

✅ **Intuitive** - No learning curve, click what you see
✅ **Fast** - Edit and see changes immediately
✅ **Safe** - Can't break page structure
✅ **Accurate** - See exactly what visitors will see
✅ **Efficient** - Edit multiple sections before saving
✅ **Professional** - Polished editing experience

---

## 📝 Summary

The Visual CMS provides a **WordPress-like editing experience** where you:
1. **See** the actual website
2. **Click** sections to edit them
3. **Update** content in a side panel
4. **Save** changes when ready
5. **Publish** to make live

**No code deployments needed** - content changes go live instantly (after cache expires)!

---

**Ready to edit? Head to "CMS Website" in the ERP sidebar and start clicking!** 🚀
