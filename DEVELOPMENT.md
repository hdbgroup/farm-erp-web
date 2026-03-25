# Development Guidelines

This document outlines the coding standards and best practices for the Farm ERP project.

## Core Principles

### DRY - Don't Repeat Yourself

**ALWAYS follow the DRY principle throughout the codebase.**

The DRY principle states that "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

#### Why DRY Matters

- **Maintainability**: Changes only need to be made in one place
- **Consistency**: Ensures uniform behavior across the application
- **Reduced Bugs**: Less code duplication = fewer places for bugs to hide
- **Easier Testing**: Centralized logic is easier to test
- **Better Readability**: Less code = easier to understand

#### Examples of DRY in This Project

##### ✅ GOOD: Reusable Components

```tsx
// Instead of repeating card structure everywhere
<InfoCard title="Basic Information">
  <p className="text-gray-600">{content}</p>
</InfoCard>

// Instead of:
<Card className="border-0 shadow-lg bg-white">
  <CardHeader>
    <CardTitle className="text-lg text-gray-900">Basic Information</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-gray-600">{content}</p>
  </CardContent>
</Card>
```

##### ✅ GOOD: Reusable Utilities

```tsx
// Centralized status color logic
const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    // ...
  }
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200'
}
```

##### ❌ BAD: Repeated Logic

```tsx
// Don't repeat the same logic in multiple places
// Component A
<span className={status === 'active' ? 'bg-green-100...' : 'bg-gray-100...'}>

// Component B
<span className={status === 'active' ? 'bg-green-100...' : 'bg-gray-100...'}>

// Component C
<span className={status === 'active' ? 'bg-green-100...' : 'bg-gray-100...'}>
```

##### ❌ BAD: Repeated Form Fields

```tsx
// Don't repeat this pattern:
<div className="space-y-2">
  <Label htmlFor="field1">Label</Label>
  <Input id="field1" value={value1} onChange={...} />
</div>
<div className="space-y-2">
  <Label htmlFor="field2">Label</Label>
  <Input id="field2" value={value2} onChange={...} />
</div>

// Instead create a FormField component
```

### When to Create Reusable Components

Create a reusable component when you notice:

1. **Pattern Repetition**: Same structure appears 2+ times
2. **Similar Logic**: Multiple places need the same behavior
3. **Consistent Styling**: Same visual pattern across pages
4. **Related Functionality**: Group of elements that work together

#### Component Hierarchy

```
UI Components (Most Reusable)
├── Base Components (Button, Input, Card)
├── Composite Components (FormField, InfoCard, StatCard)
├── Feature Components (EmployeeCard, InventoryCard)
└── Page Components (TeamDetailPage, InventoryPage)
```

### Existing Reusable Components

#### UI Components (`src/components/ui/`)

- **`InfoCard`**: Card with title header and content
  - Use for: Any section with a title and content
  - Props: `title`, `children`, `className`

- **`StatCard`**: Metric display card for dashboard
  - Use for: Dashboard statistics
  - Props: `title`, `value`, `subtitle`, `icon`, `variant`

- **`Input`**: Standard form input
  - Use for: All text/email/tel/date inputs
  - Consistent styling with white background

- **`Button`**: Standard button
  - Variants: `default`, `ghost`, `outline`, `destructive`

- **`Card`**: Base card container
  - Use sparingly, prefer InfoCard for consistency

#### Future Components Needed

Based on the DRY principle, these should be created:

- [ ] **`FormField`**: Label + Input + Error wrapper
- [ ] **`Select`**: Dropdown component matching Input styling
- [ ] **`StatusBadge`**: Reusable status indicator
- [ ] **`PageHeader`**: Green gradient header (used on all pages)
- [ ] **`EmptyState`**: "No items" placeholder with icon

## Code Organization

### File Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components (DRY!)
│   ├── layout/          # Layout components
│   └── [feature]/       # Feature-specific components
├── pages/
│   └── [feature]/       # Page components (use reusable components!)
├── lib/
│   ├── utils.ts         # Shared utilities (DRY!)
│   └── dataProvider.ts  # Data access layer
├── types/
│   └── index.ts         # Shared TypeScript types (DRY!)
└── contexts/            # React contexts
```

### Naming Conventions

- **Components**: PascalCase (`InfoCard`, `TeamDetailPage`)
- **Files**: Match component name (`InfoCard.tsx`, `TeamDetailPage.tsx`)
- **Utilities**: camelCase (`getStatusColor`, `formatDate`)
- **Constants**: UPPER_SNAKE_CASE (`COLLECTIONS`, `USER_ROLES`)

## Styling Guidelines

### Consistent Color System

**Always use explicit colors, not CSS variables that change in dark mode.**

#### Approved Color Palette

```tsx
// Backgrounds
bg-white           // Cards, inputs
bg-gray-50         // Page background
bg-gray-100        // Subtle backgrounds

// Text
text-gray-900      // Primary text
text-gray-700      // Labels
text-gray-600      // Secondary text
text-gray-500      // Muted text
text-gray-400      // Placeholder text

// Borders
border-gray-200    // Card borders
border-gray-300    // Input borders

// Brand Colors (Green)
bg-green-600       // Primary buttons, headers (gradient start)
bg-emerald-600     // Headers (gradient end)
text-green-700     // Values, metrics
ring-green-500     // Focus rings

// Status Colors
// Active/Success
bg-green-100 text-green-800 border-green-200

// Warning/Pending
bg-yellow-100 text-yellow-800 border-yellow-200

// Error/Terminated
bg-red-100 text-red-800 border-red-200

// Inactive
bg-gray-100 text-gray-800 border-gray-200
```

#### Common Patterns

```tsx
// Gradient Header (all pages)
className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl"

// White Card
className="border-0 shadow-lg bg-white"

// Input Field
className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"

// Clickable List Item
className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-white hover:border-green-200 hover:bg-green-50/50 transition-all cursor-pointer"
```

## Before Creating New Code

Ask yourself:

1. ✅ **Does this pattern already exist?** Check existing components first
2. ✅ **Will I use this in 2+ places?** Consider making it reusable
3. ✅ **Is the styling consistent?** Use the approved color palette
4. ✅ **Can this be composed from existing components?** Build on what exists
5. ✅ **Is the logic duplicated?** Extract to a shared utility

## Code Review Checklist

- [ ] No repeated code blocks (DRY principle followed)
- [ ] Reusable components used where appropriate
- [ ] Consistent color system (no dark mode CSS variables)
- [ ] TypeScript types defined (no `any`)
- [ ] Props properly typed
- [ ] Component names are clear and descriptive
- [ ] No console.logs (use proper error handling)

## Resources

- [DRY Principle Explanation](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- [React Component Composition](https://reactjs.org/docs/composition-vs-inheritance.html)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)

---

**Remember: Write code that is easy to change, not just easy to write.**
