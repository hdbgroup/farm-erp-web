# UI Components

This directory contains all reusable UI components for the Farm ERP application.

## ⚠️ DRY Principle - Don't Repeat Yourself

**Before creating a new component, check if a similar one already exists!**

Read [DEVELOPMENT.md](../../../DEVELOPMENT.md) for complete guidelines.

## Available Components

### Base Components

- **`button.tsx`** - Standard button with variants (default, ghost, outline, destructive)
- **`input.tsx`** - Form input with consistent styling (white background, gray border)
- **`label.tsx`** - Form label with consistent styling (gray-700 text)
- **`card.tsx`** - Base card container (use sparingly, prefer InfoCard)
- **`spinner.tsx`** - Loading spinner

### Composite Components (DRY!)

- **`info-card.tsx`** - Card with title header and content
  - **Use this instead of repeating Card + CardHeader + CardTitle + CardContent**
  - Props: `title`, `children`, `className`
  - Example:
    ```tsx
    <InfoCard title="Basic Information">
      <p>Content here</p>
    </InfoCard>
    ```

- **`stat-card.tsx`** - Dashboard metric card
  - **Use this for all dashboard statistics**
  - Props: `title`, `value`, `subtitle`, `icon`, `variant`
  - Example:
    ```tsx
    <StatCard
      title="Total Inventory"
      value={250}
      subtitle="items in stock"
      icon="📦"
      variant="green"
    />
    ```

- **`breadcrumbs.tsx`** - Auto-generated breadcrumb navigation
  - **Automatically used in MainLayout**
  - No need to manually implement breadcrumbs

## Creating New Components

### When to Create a New Reusable Component

✅ Create a new component when:
- The same pattern appears **2 or more times**
- You find yourself copying and pasting code
- Multiple pages need the same visual element
- You need consistent behavior across the app

❌ Don't create a new component when:
- It's used only once
- It's too specific to a single page
- It would be more complex than just inline code

### Component Template

```tsx
import { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface MyComponentProps {
  title: string
  children: ReactNode
  className?: string
  // Add more props as needed
}

export const MyComponent = ({ title, children, className = '' }: MyComponentProps) => {
  return (
    <Card className={`border-0 shadow-lg bg-white ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
```

### Styling Guidelines

**Always use explicit colors from the approved palette:**

```tsx
// ✅ GOOD - Explicit colors
bg-white
text-gray-900
border-gray-300

// ❌ BAD - CSS variables (can change in dark mode)
bg-background
text-foreground
border-input
```

**Approved Color Palette:**

```tsx
// Backgrounds
bg-white, bg-gray-50, bg-gray-100

// Text
text-gray-900 (primary)
text-gray-700 (labels)
text-gray-600 (secondary)
text-gray-500 (muted)
text-gray-400 (placeholder)

// Borders
border-gray-200, border-gray-300

// Brand (Green)
bg-green-600, text-green-700, ring-green-500

// Status Colors
bg-green-100 text-green-800 border-green-200 (active/success)
bg-yellow-100 text-yellow-800 border-yellow-200 (warning)
bg-red-100 text-red-800 border-red-200 (error)
bg-gray-100 text-gray-800 border-gray-200 (inactive)
```

## Common Patterns

### Gradient Header (all pages use this)

```tsx
<div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
  <h1 className="text-3xl font-bold mb-2">Page Title</h1>
  <p className="text-green-100">Page subtitle</p>
</div>
```

**TODO:** This should become a `PageHeader` component!

### Clickable List Item

```tsx
<div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer">
  {/* Content */}
</div>
```

### Status Badge

```tsx
<span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border bg-green-100 text-green-800 border-green-200">
  Active
</span>
```

**TODO:** This should become a `StatusBadge` component!

## Components That Need to Be Created

Based on repeated patterns in the codebase, these components should be created to follow DRY:

- [ ] **`FormField`** - Wrapper for Label + Input + Error message
- [ ] **`Select`** - Dropdown matching Input styling
- [ ] **`StatusBadge`** - Reusable status indicator with color mapping
- [ ] **`PageHeader`** - Green gradient header used on all pages
- [ ] **`EmptyState`** - "No items" placeholder with icon
- [ ] **`PhoneInput`** - Phone number input with formatting
- [ ] **`DateInput`** - Date picker with consistent styling

## Before You Code

1. ✅ Check this directory for existing components
2. ✅ Read the component documentation
3. ✅ Look for similar patterns in other pages
4. ✅ Consider if the pattern appears 2+ times
5. ✅ Create a reusable component if yes
6. ✅ Document it here!

---

**Remember: The best code is code you don't have to write twice.**
