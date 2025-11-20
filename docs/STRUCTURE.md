# Project Structure Documentation

## Directory Organization

```
src/
├── types/               # TypeScript type definitions and interfaces
│   └── index.ts        # All shared types (User, Recipe, Auth, etc.)
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Global auth state management
├── hooks/              # Custom React hooks
│   └── index.ts        # useAuth, useFetch, useForm, useDebounce, etc.
├── services/           # API service layer
│   └── api.ts          # Centralized fetch calls with error handling
├── utils/              # Utility functions
│   └── index.ts        # Validators, formatters, storage utils, etc.
├── layouts/            # Layout components (RootLayout, etc.)
├── pages/              # Page components (to be created)
├── components/         # Reusable UI components (existing)
│   ├── ui/            # Radix UI wrapper components
│   └── figma/         # Custom components
├── data/              # Static data and mock data
├── styles/            # Global styles
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global CSS
```

## Key Improvements

### 1. Type Safety (`src/types/`)
- **Before**: Types scattered across components
- **After**: Centralized in `types/index.ts`
- **Benefit**: Single source of truth, easier refactoring

### 2. State Management (`src/contexts/`)
- **Before**: Manual state in App.tsx
- **After**: AuthContext for authentication
- **Benefit**: Global state without prop drilling

### 3. Data Fetching (`src/services/`)
- **Before**: Fetch calls in api.js
- **After**: TypeScript service layer with error handling
- **Benefit**: Type-safe API calls, consistent error handling

### 4. Custom Hooks (`src/hooks/`)
- **useFetch**: Generic data fetching with loading/error states
- **useAsync**: Async operations wrapper
- **useForm**: Form state management with validation
- **useDebounce**: Debounce search/filter inputs
- **useLocalStorage**: Type-safe localStorage access
- **Benefit**: Reusable logic, less boilerplate in components

### 5. Utilities (`src/utils/`)
- **validators**: Email, password, username validation
- **format**: Date, time, number formatting
- **storage**: localStorage operations
- **string**: String utilities (capitalize, truncate, slug)
- **array**: Array utilities (chunk, unique, flatten)
- **Benefit**: DRY principle, reusable functions

## Usage Examples

### Using AuthContext
```tsx
import { useAuth } from '@/contexts/AuthContext';

export function Dashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) return <Redirect to="/login" />;
  
  return <div>Welcome, {user?.username}</div>;
}
```

### Using Custom Hooks
```tsx
import { useForm } from '@/hooks';
import { validateLoginForm } from '@/utils';

export function LoginForm() {
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
}
```

### Using API Services
```tsx
import { recipeService } from '@/services/api';
import { useFetch } from '@/hooks';

export function RecipeList() {
  const { data: recipes, isLoading, error } = useFetch(() => recipeService.getAll());

  if (isLoading) return <Loader />;
  if (error) return <ErrorMessage error={error} />;

  return recipes?.map(recipe => <RecipeCard key={recipe.id} recipe={recipe} />);
}
```

## Migration Guide

### Step 1: Update Imports
Replace old imports:
```tsx
// Old
import { recipeAPI } from '../api.js';

// New
import { recipeService } from '@/services/api';
```

### Step 2: Use AuthContext Instead of localStorage
```tsx
// Old
const token = localStorage.getItem('token');

// New
const { token, isAuthenticated } = useAuth();
```

### Step 3: Use Custom Hooks
```tsx
// Old
const [recipes, setRecipes] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  recipeAPI.getAll().then(setRecipes).catch(setError).finally(() => setLoading(false));
}, []);

// New
const { data: recipes, isLoading: loading, error } = useFetch(() => recipeService.getAll());
```

### Step 4: Use Validators
```tsx
// Old
if (!email.includes('@')) {
  setError('Invalid email');
}

// New
import { validators, ValidationErrors } from '@/utils';
import { useForm } from '@/hooks';

const form = useForm({
  validate: (values) => {
    const errors: ValidationErrors = {};
    if (!validators.email(values.email)) {
      errors.email = 'Invalid email';
    }
    return errors;
  },
});
```

## Next Steps

1. **Create Page Components** in `src/pages/`:
   - `LoginPage.tsx`
   - `DashboardPage.tsx`
   - `RecipeDetailPage.tsx`
   - etc.

2. **Implement React Router** for proper routing

3. **Add Error Boundary** component

4. **Create Layout Component** for consistent page structure

5. **Convert Backend to TypeScript**

6. **Add Testing** with Jest/Vitest

## Backend Structure (Next Phase)

```
server/
├── src/
│   ├── types/          # TypeScript interfaces
│   ├── services/       # Business logic
│   ├── controllers/    # Route handlers
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utilities
│   ├── errors/         # Error classes
│   └── db.ts          # Database setup
├── .env.example        # Environment template
├── tsconfig.json       # TypeScript config
└── package.json
```
