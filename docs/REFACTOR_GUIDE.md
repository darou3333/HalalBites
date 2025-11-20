# Halal Bites - Code Structure Refactor Guide

## What Changed

Your codebase has been restructured from a template-based structure to a **production-grade, scalable architecture**. Here's what's new:

### ✅ New Folders & Files Created

```
src/
├── types/               → Centralized TypeScript interfaces
├── contexts/            → Global state (Auth)
├── hooks/               → Custom React hooks
├── services/            → API service layer
├── utils/               → Utility functions & validators
├── components/
│   ├── ErrorBoundary.tsx → Error handling
│   ├── ErrorDisplay.tsx  → Error UI component
│   └── Loading.tsx       → Loading UI component
├── layouts/             → Layout components (empty, ready for structure)
└── pages/               → Page components (ready for migration)
```

### 📦 New TypeScript Files

1. **`src/types/index.ts`**
   - All type definitions in one place
   - User, Recipe, Comment, Auth types
   - API response types
   - Error types

2. **`src/services/api.ts`**
   - Centralized API calls
   - Error handling
   - TypeScript-typed endpoints
   - Services: auth, recipe, favorite, upvotes, comments, users

3. **`src/contexts/AuthContext.tsx`**
   - Global authentication state
   - useAuth hook
   - Login/register/logout logic

4. **`src/hooks/index.ts`**
   - `useFetch()` - Generic data fetching
   - `useAsync()` - Async operations
   - `useForm()` - Form state management
   - `useDebounce()` - Input debouncing
   - `useLocalStorage()` - Type-safe localStorage

5. **`src/utils/index.ts`**
   - Validators (email, password, username)
   - Formatters (date, time, numbers)
   - Storage utilities
   - String utilities (capitalize, truncate, slug)
   - Array utilities (chunk, unique, flatten)
   - Cookie utilities

### 🎨 New Components

- **ErrorBoundary.tsx** - Catches and displays React errors
- **ErrorDisplay.tsx** - Reusable error message component
- **Loading.tsx** - Reusable loading spinner component

### ⚙️ Configuration Updates

- **tsconfig.json** - Added path aliases (@/types, @/services, etc.)
- **.env** - Created environment file
- **.env.example** - Template for env variables
- **server/.env.example** - Backend env template

---

## How to Use

### 1. Authentication with Context

**Before:**
```tsx
const token = localStorage.getItem('token');
const handleLogin = async (email, password) => {
  const res = await authAPI.login(email, password);
  localStorage.setItem('token', res.token);
};
```

**After:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  
  const handleSubmit = async (email, password) => {
    await login(email, password);
  };
}
```

### 2. Type-Safe API Calls

**Before:**
```tsx
const recipes = await recipeAPI.getAll();
```

**After:**
```tsx
import { recipeService } from '@/services/api';
import { useFetch } from '@/hooks';

const { data: recipes, isLoading, error } = useFetch(() => recipeService.getAll());
```

### 3. Form Handling with Validation

**Before:**
```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

const handleChange = (e) => setEmail(e.target.value);
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!email.includes('@')) {
    setError('Invalid email');
    return;
  }
  // ... rest of logic
};
```

**After:**
```tsx
import { useForm } from '@/hooks';
import { validateLoginForm } from '@/utils';

const form = useForm({
  initialValues: { emailOrUsername: '', password: '' },
  validate: validateLoginForm,
  onSubmit: async (values) => {
    await authService.login(values.emailOrUsername, values.password);
  },
});

return (
  <form onSubmit={form.handleSubmit}>
    <input
      name="emailOrUsername"
      value={form.values.emailOrUsername}
      onChange={form.handleChange}
      onBlur={form.handleBlur}
    />
    {form.errors.emailOrUsername && <span>{form.errors.emailOrUsername}</span>}
  </form>
);
```

### 4. Centralized Error Handling

**Before:**
```tsx
try {
  // ... code
} catch (error) {
  alert(error.message);
}
```

**After:**
```tsx
import { ErrorDisplay } from '@/components/ErrorDisplay';

const { data, error, execute } = useFetch(fetchFn);

return (
  <>
    {error && <ErrorDisplay error={error} onRetry={execute} />}
    {data && <div>{data}</div>}
  </>
);
```

### 5. Error Boundary for Global Error Handling

Wrap your app with ErrorBoundary in `main.tsx`:

```tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';

<ErrorBoundary>
  <AuthProvider>
    <App />
  </AuthProvider>
</ErrorBoundary>
```

---

## Migration Checklist

### Phase 1: Setup
- [x] Create folder structure
- [x] Add TypeScript types
- [x] Create API service layer
- [x] Create Auth context
- [x] Create custom hooks
- [x] Add utility functions
- [ ] Update main.tsx with ErrorBoundary & AuthProvider

### Phase 2: Refactor Components
- [ ] LoginPage → use useAuth + useForm
- [ ] SignUpPage → use useAuth + useForm
- [ ] RecipeCard → simplify with types
- [ ] RecipeDetail → use hooks
- [ ] UserDashboard → use hooks
- [ ] etc.

### Phase 3: Implement React Router
- [ ] Install react-router-dom
- [ ] Create route structure
- [ ] Convert pages to use router
- [ ] Remove manual page state from App.tsx

### Phase 4: Backend TypeScript
- [ ] Convert routes to TypeScript
- [ ] Add type definitions
- [ ] Add error handling middleware
- [ ] Add request validation

### Phase 5: Testing
- [ ] Add Jest/Vitest
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] E2E tests

---

## Next Immediate Steps

1. **Update main.tsx:**
```tsx
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
```

2. **Refactor LoginPage.tsx:**
   - Use `useAuth()` instead of direct API calls
   - Use `useForm()` for form state
   - Use `ErrorDisplay` for errors

3. **Install React Router:**
```bash
npm install react-router-dom
npm install -D @types/react-router-dom
```

4. **Remove old api.js** (after migrating all components)

---

## File Organization Benefits

| Aspect | Before | After |
|--------|--------|-------|
| **Types** | Scattered in components | `src/types/index.ts` |
| **API calls** | `api.js` (JS only) | `src/services/api.ts` (TS + error handling) |
| **Auth state** | Manual localStorage + props | `AuthContext` + `useAuth()` |
| **Form logic** | In each component | `useForm()` hook |
| **Validation** | Repeated in components | `src/utils/validators.ts` |
| **Routing** | Manual page state | Ready for React Router |
| **Error handling** | Try-catch scattered | `ErrorBoundary` + `ErrorDisplay` |
| **Scalability** | Hard to maintain | Professional structure |

---

## Common Tasks

### Add a New API Endpoint
```tsx
// 1. Add type in src/types/index.ts
export interface MyData {
  id: number;
  // ...
}

// 2. Add service in src/services/api.ts
export const myService = {
  getAll: () => apiCall('/my-endpoint'),
  getById: (id: number) => apiCall(`/my-endpoint/${id}`),
};

// 3. Use in component
import { myService } from '@/services/api';
import { useFetch } from '@/hooks';

const { data, isLoading, error } = useFetch(() => myService.getAll());
```

### Add Form Validation
```tsx
// 1. Add validator in src/utils/index.ts
export const validateMyForm = (data) => {
  const errors = {};
  if (!data.field) errors.field = 'Field is required';
  return errors;
};

// 2. Use in component
const form = useForm({
  initialValues: { field: '' },
  validate: validateMyForm,
  onSubmit: async (values) => { /* ... */ },
});
```

### Handle Global Errors
```tsx
const { error, execute } = useFetch(fetchFn);

return (
  <>
    <ErrorDisplay error={error} onRetry={execute} />
    {/* content */}
  </>
);
```

---

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

---

## Performance Tips

1. **Use `useDebounce` for search:**
```tsx
const debouncedSearch = useDebounce(searchQuery, 500);

useEffect(() => {
  // Only search after user stops typing for 500ms
  fetchRecipes(debouncedSearch);
}, [debouncedSearch]);
```

2. **Use `useLocalStorage` for caching:**
```tsx
const [favorites, setFavorites] = useLocalStorage('favorites', []);
```

3. **Use `useFetch` with caching:**
```tsx
const { data: recipes, execute } = useFetch(
  () => recipeService.getAll(),
  { immediate: false } // Load on demand
);
```

---

## Troubleshooting

### Type errors with `@/` imports?
- Make sure tsconfig.json has path aliases set up ✓ (already done)

### `useAuth()` returns undefined?
- Wrap your app with `<AuthProvider>` in main.tsx

### Env variables not working?
- Restart dev server: `npm run dev`
- Use `VITE_` prefix for frontend env vars
- Vite variables are exposed at build time, not runtime

---

## Questions?

Refer to:
- `STRUCTURE.md` - Detailed folder structure
- Component examples in `src/components/`
- Utility examples in `src/utils/index.ts`
- Hook examples in `src/hooks/index.ts`

Happy coding! 🚀
