    # 🚀 Quick Start Guide - New Architecture

## TL;DR

Your code is now professional, scalable, and production-ready. Here's what changed and how to use it.

---

## What Changed?

| Old | New |
|-----|-----|
| `import { recipeAPI }` | `import { recipeService } from '@/services/api'` |
| `localStorage.getItem('token')` | `const { token } = useAuth()` |
| Scattered types | `import type { Recipe, User } from '@/types'` |
| Form validation scattered | `import { validateLoginForm } from '@/utils'` |
| Try-catch everywhere | `<ErrorBoundary>` wrapper |

---

## 5-Minute Setup

### 1. Update main.tsx
```tsx
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthProvider } from './contexts/AuthContext'

<ErrorBoundary>
  <AuthProvider>
    <App />
  </AuthProvider>
</ErrorBoundary>
```

### 2. Pick a Component to Refactor
Reference: `src/components/EXAMPLE_LoginPageRefactored.tsx`

### 3. Import What You Need
```typescript
import { useAuth } from '@/contexts/AuthContext'
import { useForm, useFetch } from '@/hooks'
import { recipeService } from '@/services/api'
import { validators } from '@/utils'
import type { Recipe, User } from '@/types'
```

### 4. Use the New Patterns
```typescript
// Auth
const { user, isAuthenticated, login, logout } = useAuth()

// Data fetching
const { data, isLoading, error } = useFetch(() => recipeService.getAll())

// Forms
const form = useForm({
  initialValues: { email: '', password: '' },
  validate: validateLoginForm,
  onSubmit: async (values) => { /* ... */ },
})

// Errors
<ErrorDisplay error={error} onRetry={execute} />
```

---

## New Files & What They Do

### Types (`src/types/index.ts`)
All your type definitions in one place. Import what you need:
```typescript
import type { User, Recipe, Comment, ApiError, AuthResponse } from '@/types'
```

### Services (`src/services/api.ts`)
Organize your API calls by resource:
```typescript
recipeService.getAll()
recipeService.getById(1)
recipeService.create(data)

favoriteService.add(recipeId)
favoriteService.getAll()

authService.login(email, password)
authService.register(email, username, password)
```

### Hooks (`src/hooks/index.ts`)
Reusable logic patterns:
```typescript
useAuth()              // Get auth state
useFetch(fn)          // Fetch data
useAsync(fn)          // Run async code
useForm(config)       // Manage forms
useDebounce(value)    // Debounce input
useLocalStorage(key)  // Type-safe storage
```

### Utils (`src/utils/index.ts`)
Helpers and validators:
```typescript
validators.email(email)           // Validate email
format.time(120)                  // 2h
format.date(date)                 // Nice format
storage.get('key')                // From localStorage
string.capitalize('hello')        // Hello
```

### Contexts (`src/contexts/AuthContext.tsx`)
Global state:
```typescript
useAuth() // { user, token, isLoading, isAuthenticated, login, logout, register }
```

### Components
Error & Loading UI:
```typescript
<ErrorBoundary>...</ErrorBoundary>
<ErrorDisplay error={error} />
<Loading />
```

---

## Common Tasks

### Task: Login Page
```tsx
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from '@/hooks'
import { validateLoginForm } from '@/utils'

const form = useForm({
  initialValues: { emailOrUsername: '', password: '' },
  validate: validateLoginForm,
  onSubmit: async (values) => {
    await login(values.emailOrUsername, values.password)
  },
})
```

### Task: Show Recipes
```tsx
import { recipeService } from '@/services/api'
import { useFetch } from '@/hooks'

const { data: recipes, isLoading, error } = useFetch(() => recipeService.getAll())
```

### Task: Search with Debounce
```tsx
import { useDebounce } from '@/hooks'

const debouncedSearch = useDebounce(searchQuery, 500)

useEffect(() => {
  fetchRecipes(debouncedSearch)
}, [debouncedSearch])
```

### Task: Check If Logged In
```tsx
import { useAuth } from '@/contexts/AuthContext'

const { isAuthenticated, user } = useAuth()

if (!isAuthenticated) return <LoginPage />
```

### Task: Save to LocalStorage
```tsx
import { useLocalStorage } from '@/hooks'

const [favorites, setFavorites] = useLocalStorage('favorites', [])
```

### Task: Show Error
```tsx
import { ErrorDisplay } from '@/components/ErrorDisplay'

<ErrorDisplay 
  error={error} 
  onRetry={() => execute()}
  variant="alert"
/>
```

---

## Path Aliases (No More ../)

Instead of:
```typescript
import { useAuth } from '../../../../contexts/AuthContext'
```

Use:
```typescript
import { useAuth } from '@/contexts/AuthContext'
```

Available aliases:
- `@/types` → src/types
- `@/contexts` → src/contexts
- `@/hooks` → src/hooks
- `@/services` → src/services
- `@/utils` → src/utils
- `@/components` → src/components

---

## Folder Structure You Should Know

```
src/
├── types/          → Type definitions (import from here)
├── contexts/       → Global state (AuthContext)
├── hooks/          → Custom React hooks
├── services/       → API calls
├── utils/          → Validators, formatters, helpers
├── components/     → React components
│   ├── ui/        → Radix UI wrappers
│   └── figma/     → Custom components
├── layouts/        → Layout components (for future use)
├── pages/          → Page components (for future use)
└── data/           → Static data
```

---

## Migration Checklist

- [ ] Update `main.tsx` with ErrorBoundary & AuthProvider
- [ ] Replace `api.js` imports with `@/services/api`
- [ ] Use `useAuth()` instead of `localStorage.getItem('token')`
- [ ] Use `useForm()` for form components
- [ ] Use `useFetch()` for data loading
- [ ] Add `<ErrorDisplay />` for error messages
- [ ] Add type imports from `@/types`
- [ ] Use validators from `@/utils`
- [ ] Test everything

---

## Debugging Tips

### Error: `useAuth() returns undefined`
→ Make sure app is wrapped with `<AuthProvider>` in main.tsx

### Error: Can't find module `@/types`
→ Restart dev server: `npm run dev`

### Error: Types not showing up
→ Check tsconfig.json has path aliases (should be there)

### Error: Old API still being called
→ Check imports still point to old `api.js` instead of `@/services/api`

---

## VS Code Setup (Optional but Recommended)

Add to `.vscode/settings.json`:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

---

## Next Steps

1. **Immediate:** Update main.tsx (5 min)
2. **Short term:** Refactor LoginPage using example (30 min)
3. **Medium term:** Refactor all components (few hours)
4. **Long term:** Add React Router for proper routing

---

## Need More Detail?

- **STRUCTURE.md** - Full architecture explanation
- **REFACTOR_GUIDE.md** - Step-by-step migration
- **EXAMPLE_LoginPageRefactored.tsx** - Complete component example
- **CODE_REFACTOR_SUMMARY.md** - Comprehensive overview

---

## Pro Tips

✅ Use TypeScript even if new
✅ Always add types to function parameters
✅ Use validators before submitting
✅ Handle errors with ErrorDisplay
✅ Use custom hooks to reduce component code
✅ Keep components small (<200 lines)
✅ Use path aliases to avoid ../../../
✅ Follow the folder structure

---

**You're all set! Start refactoring! 🚀**
