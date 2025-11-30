# Halal Bites - Complete Project Analysis

## 📋 Project Overview

**Halal Bites** is a full-stack web application for discovering, sharing, and managing authentic halal recipes. It combines modern React frontend with a Node.js/Express backend and SQLite database.

### Core Purpose
A community-driven platform where users can:
- Browse and search verified halal recipes
- Upload and share their own recipes
- Mark recipes as favorites
- Upvote and comment on recipes
- Report inappropriate content
- View trending recipes
- View other users' profiles

### Key Innovation
The platform includes **haram ingredient detection** - a curated list of forbidden ingredients that are automatically flagged and managed by admins to ensure halal compliance.

---

## 🏗️ Architecture Overview

### Tech Stack

**Frontend:**
- React 18.2 with TypeScript
- Vite (build tool)
- React Router DOM v7 (routing)
- TailwindCSS + Radix UI (styling & components)
- React Hook Form (form management)
- Recharts (data visualization)

**Backend:**
- Node.js/Express
- SQLite3 (database)
- JWT (authentication)
- bcryptjs (password hashing)

**Development:**
- TypeScript for type safety
- Path aliases for imports (@/ prefix)
- Centralized API service layer
- Error boundaries and global error handling

---

## 📁 Project Structure

### Frontend (src/)

```
src/
├── App.tsx                 # Main app routing
├── main.tsx               # Entry point with providers
├── index.css              # Global styles
│
├── types/
│   └── index.ts          # All TypeScript interfaces & types
│
├── contexts/
│   └── AuthContext.tsx   # Global authentication state
│
├── services/
│   └── api.ts            # Centralized API calls
│
├── hooks/
│   └── index.ts          # Custom React hooks
│
├── utils/
│   └── index.ts          # Helpers, validators, formatters
│
├── components/
│   ├── Navigation.tsx     # Main nav bar
│   ├── RecipeCard.tsx    # Recipe display card
│   ├── ErrorBoundary.tsx # Error handling
│   ├── RecipeVerification.tsx
│   ├── ReportModal.tsx
│   ├── ReportManagement.tsx
│   ├── shared/
│   │   ├── ErrorDisplay.tsx
│   │   └── Loading.tsx
│   └── ui/               # Radix UI components (50+ UI components)
│
├── pages/
│   ├── LandingPage.tsx      # Public hero page
│   ├── LoginPage.tsx
│   ├── SignUpPage.tsx
│   ├── UserDashboard.tsx    # Main recipe feed
│   ├── AdminDashboard.tsx   # Admin management panel
│   ├── UploadRecipe.tsx     # Recipe creation
│   ├── TrendingPage.tsx     # Trending recipes
│   ├── RecipeDetail.tsx     # Single recipe view
│   ├── FavoritesPage.tsx
│   ├── UserProfile.tsx      # User's own profile
│   └── ViewProfile.tsx      # Other users' profiles
│
└── styles/
    └── globals.css
```

### Backend (server/)

```
server/
├── server.js             # Express app & routes setup
├── db.js                 # Database initialization & schema
├── package.json          # Backend dependencies
│
├── middleware/
│   └── auth.js          # JWT verification middleware
│
└── routes/              # API endpoints
    ├── auth.js          # Register, Login, Profile update
    ├── recipes.js       # CRUD operations
    ├── favorites.js     # Favorite management
    ├── comments.js      # Comment operations
    ├── upvotes.js       # Upvote system
    ├── users.js         # User management
    ├── reports.js       # Content reporting
    ├── haram-ingredients.js  # Forbidden ingredient management
    └── stats.js         # Platform statistics
```

### Database (data/)
- SQLite database file: `halal-bites.db`

---

## 🔐 Authentication Flow

### Registration & Login
1. User provides email/username and password
2. Backend hashes password with bcryptjs (salt: 10)
3. JWT token generated (expires in 7 days)
4. Token & user data stored in localStorage
5. Token sent in Authorization header for all authenticated requests

### Protected Routes
```typescript
<ProtectedRoute requiredRole="user">
  <Component />
</ProtectedRoute>
```

### Roles
- **User**: Regular users (default)
- **Admin**: Full system access (can verify recipes, manage ingredients, etc.)

---

## 📊 Database Schema

### Users Table
```sql
id, email, password, username, role, bio, specialty, profile_image, created_at
```

### Recipes Table
```sql
id, title, description, category, ingredients, instructions, 
prep_time, cook_time, servings, image_url, user_id, is_verified, 
is_archived, created_at
```

### Supporting Tables
- **favorites**: Many-to-many user-recipe relationship
- **comments**: User comments on recipes
- **upvotes**: Like/upvote system
- **recipe_stats**: View counts for trending
- **reports**: User reports for inappropriate content
- **recipe_verifications**: Admin verification history
- **haram_ingredients**: Curated list of forbidden ingredients

### Data Relationships
- Users → Recipes (one-to-many via user_id)
- Users → Favorites (many-to-many)
- Users → Comments (one-to-many)
- Users → Upvotes (one-to-many)
- Recipes → Comments (one-to-many)
- Recipes → Reports (one-to-many)
- Recipes → Recipe Stats (one-to-one)

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `PUT /profile` - Update user profile

### Recipes (`/api/recipes`)
- `GET /` - Get all verified recipes
- `GET /trending` - Get trending recipes (by view count)
- `GET /admin/all` - Get all recipes (admin only)
- `GET /admin/pending` - Get unverified recipes (admin only)
- `GET /own` - Get user's own recipes
- `GET /user/:userId` - Get user's public recipes
- `GET /:id` - Get recipe details
- `POST /` - Create recipe
- `PUT /:id` - Update recipe
- `DELETE /:id` - Delete recipe
- `PUT /:id/archive` - Archive recipe
- `PUT /:id/verify` - Verify/reject recipe (admin)

### Favorites (`/api/favorites`)
- `GET /` - Get user's favorites
- `POST /:recipeId` - Add to favorites
- `DELETE /:recipeId` - Remove from favorites

### Comments (`/api/comments`)
- `GET /:recipeId` - Get comments for recipe
- `POST /:recipeId` - Create comment
- `DELETE /:commentId` - Delete comment

### Upvotes (`/api/upvotes`)
- `GET /:recipeId` - Get upvote count
- `GET /:recipeId/check` - Check if user upvoted
- `POST /:recipeId` - Add upvote
- `DELETE /:recipeId` - Remove upvote

### Users (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /:id` - Get user profile
- `PUT /profile` - Update own profile
- `PUT /:id/deactivate` - Deactivate user (admin)
- `PUT /:id/reactivate` - Reactivate user (admin)
- `DELETE /:id` - Delete user (admin)

### Reports (`/api/reports`)
- `POST /:recipeId` - Create report
- `GET /` - Get all reports (admin)
- `PUT /:reportId` - Update report status (admin)
- `DELETE /:reportId` - Delete report (admin)

### Haram Ingredients (`/api/haram-ingredients`)
- `GET /` - Get all forbidden ingredients
- `POST /` - Add ingredient (admin)
- `DELETE /:id` - Remove ingredient (admin)

### Stats (`/api/stats`)
- `GET /` - Get platform statistics

---

## 🎨 Frontend Components

### Page Structure

**LandingPage** (Public)
- Hero section with gradient background
- CTA buttons for login/signup
- Animation effects

**LoginPage & SignUpPage** (Public)
- Form validation
- Error handling
- Redirect to dashboard on success

**UserDashboard** (Protected)
- Recipe feed with search & filter
- Category filtering
- Favoriting & upvoting
- Sort by recent/trending/popular

**AdminDashboard** (Protected - Admin Only)
- User management table
- Recipe verification interface
- Haram ingredient management
- Report management
- Content moderation tools

**UploadRecipe** (Protected)
- Recipe form with validation
- Image upload support
- Ingredient list input
- Recipe metadata (prep time, servings, etc.)

**TrendingPage** (Public)
- Top recipes by view count
- Recipe cards with stats

**RecipeDetail** (Protected)
- Full recipe view
- Comments section
- Upvote system
- Report recipe button

**FavoritesPage** (Protected)
- User's bookmarked recipes
- Same card interface as dashboard

**UserProfile & ViewProfile** (Protected)
- User profile information
- User's recipes
- Bio, specialty, profile image
- Edit capability (own profile)

### Shared Components

**RecipeCard**
- Recipe image, title, category
- Upvote button with count
- Bookmark button
- View count
- Click to view details

**Navigation**
- Logo & branding
- Nav items (Home, Trending, Favorites, Upload, Admin)
- User profile button
- Logout button
- Mobile responsive menu

**ErrorBoundary**
- Catches React errors
- Fallback UI
- Error logging

**ErrorDisplay**
- Displays error messages
- Retry button
- Different variants (alert, card, etc.)

**Loading**
- Skeleton loaders
- Loading spinners

---

## 🔄 User Flows

### Upload Recipe Flow
1. User clicks "Upload Recipe" → UploadRecipe page
2. Fills form (title, ingredients, instructions, etc.)
3. Submits → Backend validates
4. Recipe created with `is_verified = 0`
5. Admin reviews on AdminDashboard
6. Admin approves/rejects
7. If approved, recipe visible to all users

### Search & Filter Flow
1. User types search query
2. Input triggers filter on client side
3. Filters by title or ingredients
4. Filters by category
5. Results update instantly (no API call)

### Favorite Flow
1. User views recipe
2. Clicks bookmark icon
3. API call to add to favorites
4. Favorite ID added to Set in state
5. UI updates immediately

### Report Flow
1. User views recipe
2. Clicks "Report" button
3. Modal appears with report form
4. User selects reason & description
5. Submitted to backend
6. Admin reviews on AdminDashboard
7. Admin can approve/dismiss/take action

---

## 🔑 Key Features

### User Features
- ✅ User registration & authentication
- ✅ Recipe browsing with search
- ✅ Recipe upload & management
- ✅ Favorites/bookmarking
- ✅ Upvoting recipes
- ✅ Commenting on recipes
- ✅ User profiles & following
- ✅ Report inappropriate recipes
- ✅ View trending recipes

### Admin Features
- ✅ Recipe verification system
- ✅ User management (deactivate, delete)
- ✅ Manage haram ingredients
- ✅ Review & handle reports
- ✅ View platform statistics
- ✅ Archive recipes
- ✅ View all recipes

### Platform Features
- ✅ JWT authentication with 7-day expiry
- ✅ Role-based access control
- ✅ Recipe categorization
- ✅ View count tracking
- ✅ Ingredient validation
- ✅ Image support
- ✅ Dark mode ready (TailwindCSS)
- ✅ Responsive design
- ✅ Error boundaries

---

## 🛠️ Development Patterns

### Service Layer Architecture
```typescript
// All API calls centralized in services/api.ts
export const recipeService = {
  getAll(): Promise<Recipe[]>,
  getById(id): Promise<Recipe>,
  create(data): Promise<Recipe>,
  // ... etc
}
```

### Type Safety
```typescript
// All types in types/index.ts
interface Recipe { id, title, ... }
interface User { id, email, ... }
interface ApiResponse<T> { data?, error? }
```

### Context API for State
```typescript
// AuthContext manages auth globally
useAuth() // { user, token, isAuthenticated, login, logout, register }
```

### Error Handling
```typescript
// Custom error classes
throw new ApiError(status, message)
throw new ValidationError(fields, message)
```

### Form Management
- React Hook Form for forms
- Validation helpers
- Error handling

---

## 🔐 Security Measures

1. **Password Security**: bcryptjs hashing (salt: 10)
2. **Authentication**: JWT tokens (7-day expiry)
3. **Authorization**: Role-based access control (user/admin)
4. **Protected Routes**: Frontend & backend validation
5. **CORS**: Enabled for safe cross-origin requests
6. **Input Validation**: Frontend & backend validation
7. **Token Storage**: localStorage (consider secure cookie for production)

---

## 📈 Performance Considerations

### Current Implementation
- Client-side filtering (search, category)
- View count tracking in recipe_stats table
- Trending calculated on-the-fly via ORDER BY view_count
- No pagination implemented (all recipes loaded)

### Potential Optimizations
1. Add pagination to recipe endpoints
2. Implement server-side search with text indices
3. Cache trending results
4. Lazy load images
5. Implement virtual scrolling for large lists
6. Add database indices on frequently queried fields

---

## 🚀 Running the Project

### Frontend
```bash
npm install
npm run dev    # Start dev server (port 5173)
npm run build  # Build for production
```

### Backend
```bash
cd server
npm install
npm run dev    # Start with watch mode
npm start      # Start normally (port 5000)
```

### Default Admin Credentials
- Username: `admin`
- Password: `admin123`

---

## 📚 Important Files to Know

### Frontend
- `src/services/api.ts` - All API calls
- `src/contexts/AuthContext.tsx` - Auth state management
- `src/types/index.ts` - Type definitions
- `src/App.tsx` - Route configuration
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration

### Backend
- `server/server.js` - Express app setup
- `server/db.js` - Database schema & initialization
- `server/middleware/auth.js` - JWT verification
- `server/routes/*.js` - API endpoints

---

## 📝 Documentation Files

Located in `docs/`:
- `QUICK_START.md` - Quick reference guide
- `STRUCTURE.md` - Detailed folder structure
- `BACKEND_SETUP.md` - Backend setup instructions
- `IMPLEMENTATION_CHECKLIST.md` - Feature checklist
- `CODE_REFACTOR_SUMMARY.md` - Code quality improvements

---

## 🎯 Code Quality

### Current State
✅ Modular component structure
✅ Centralized API service
✅ Type-safe with TypeScript
✅ Error boundaries for error handling
✅ Context API for global state
✅ Responsive design
✅ Consistent styling with Tailwind

### Areas for Enhancement
- Add more comprehensive error handling
- Implement loading states for async operations
- Add input validation on forms
- Add unit/integration tests
- Improve accessibility (a11y)
- Add analytics

---

## 🔗 Dependencies Summary

### Key Frontend Dependencies
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `react-hook-form` - Form handling
- `tailwindcss` & Radix UI - Styling & components
- `recharts` - Charts & graphs
- `lucide-react` - Icons

### Key Backend Dependencies
- `express` - Web framework
- `sqlite3` & `sqlite` - Database
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `cors` - Cross-origin requests
- `dotenv` - Environment variables

---

## 🎓 Learning Resources

### For Maintaining This Project
1. **React** - Components, hooks, context
2. **TypeScript** - Types, interfaces, enums
3. **Express.js** - Routing, middleware
4. **SQLite** - Schema design, queries
5. **JWT** - Token generation & verification
6. **REST APIs** - Endpoint design, HTTP methods
7. **TailwindCSS** - Utility-first CSS
8. **Vite** - Fast build tool

---

## ✅ Summary

**Halal Bites** is a well-structured, modern full-stack application with:

- Clean separation of concerns (frontend/backend)
- Type-safe development with TypeScript
- Centralized API service layer
- Global state management with Context API
- Protected routes with JWT authentication
- Role-based access control
- Responsive, accessible UI with modern components
- Database design with proper relationships
- Error handling and validation

The project is production-ready and provides a solid foundation for a halal recipe community platform.
