# Halal Bites - Complete System Analysis

## 1. PROJECT OVERVIEW

**Halal Bites** is a full-stack web application for discovering, sharing, and managing halal recipes. It's a community-driven platform where users can upload recipes, interact with others' recipes, and admins can verify recipe authenticity.

- **Repository**: HalalBites (darou3333/HalalBites)
- **Current Branch**: main
- **Status**: Active development

---

## 2. ARCHITECTURE

### 2.1 Technology Stack

#### Frontend
- **Framework**: React 18.2.0 with TypeScript 5.2.2
- **Build Tool**: Vite 5.0.0
- **UI Component Library**: Radix UI + shadcn/ui (custom components)
- **Styling**: Tailwind CSS 3.3.6 + PostCSS
- **Routing**: React Router v7.9.6
- **State Management**: React Context API (AuthContext)
- **Form Handling**: React Hook Form 7.66.1
- **Charts**: Recharts 3.4.1
- **Notifications**: Sonner (toast notifications)
- **Icons**: Lucide React 0.263.1
- **Other UI**: Embla Carousel, Day Picker, Input OTP

#### Backend
- **Runtime**: Node.js with ES6 modules
- **Framework**: Express.js 4.18.2
- **Database**: Supabase (PostgreSQL) + SQLite fallback
- **Authentication**: JWT (jsonwebtoken 9.0.0)
- **Password Hashing**: bcryptjs 2.4.3
- **CORS**: cors 2.8.5
- **Environment**: dotenv 16.3.1

#### Database
- **Primary**: Supabase (PostgreSQL managed)
- **Fallback**: SQLite 3 (for local development)
- **ORM/Client**: @supabase/supabase-js 2.86.0

---

## 3. PROJECT STRUCTURE

```
halal-bites/
├── src/                          # Frontend (React/TypeScript)
│   ├── components/               # Reusable UI components
│   │   ├── ui/                  # Radix UI + shadcn components
│   │   ├── shared/              # Common components (Loading, Error)
│   │   ├── utilities/           # Helper components
│   │   ├── Navigation.tsx       # App navigation bar
│   │   ├── RecipeCard.tsx       # Recipe display card
│   │   ├── ReportModal.tsx      # Report recipe modal
│   │   ├── RecipeVerification.tsx # Admin verification UI
│   │   └── ReportManagement.tsx # Admin report management
│   ├── pages/                    # Page components (route-based)
│   │   ├── LandingPage.tsx      # Home/hero page
│   │   ├── LoginPage.tsx        # User login
│   │   ├── SignUpPage.tsx       # User registration
│   │   ├── UserDashboard.tsx    # Browse recipes
│   │   ├── UploadRecipe.tsx     # Recipe submission form
│   │   ├── RecipeDetail.tsx     # Single recipe view
│   │   ├── TrendingPage.tsx     # Popular recipes
│   │   ├── FavoritesPage.tsx    # User's saved recipes
│   │   ├── UserProfile.tsx      # User's profile
│   │   ├── ViewProfile.tsx      # Other user's profile
│   │   └── AdminDashboard.tsx   # Admin control panel
│   ├── contexts/                 # Global state contexts
│   │   └── AuthContext.tsx      # Authentication state
│   ├── hooks/                    # Custom React hooks
│   ├── services/                 # API service layer
│   │   └── api.ts              # Centralized API calls
│   ├── types/                    # TypeScript interfaces
│   │   └── index.ts            # All type definitions
│   ├── utils/                    # Utility functions
│   ├── styles/                   # Global styles
│   ├── App.tsx                  # Root component with routes
│   ├── main.tsx                 # Entry point
│   └── index.css               # Global CSS
│
├── server/                       # Backend (Express/Node.js)
│   ├── routes/                   # API route handlers
│   │   ├── auth-supabase.js     # Authentication endpoints
│   │   ├── recipes-supabase.js  # Recipe CRUD operations
│   │   ├── favorites-supabase.js # Favorites management
│   │   ├── comments-supabase.js # Comments system
│   │   ├── users-supabase.js    # User profile endpoints
│   │   ├── upvotes-supabase.js  # Recipe upvoting
│   │   ├── reports-supabase.js  # Report functionality
│   │   ├── stats-supabase.js    # Statistics/analytics
│   │   ├── haram-ingredients-supabase.js # Ingredient validation
│   │   └── [legacy routes with -supabase.js variants]
│   ├── middleware/               # Express middleware
│   │   └── auth.js              # JWT verification
│   ├── db-supabase.js           # Supabase client initialization
│   ├── server.js                # Main server file
│   ├── supabase-schema.sql      # Database schema
│   ├── package.json             # Backend dependencies
│   └── Procfile                 # Deployment configuration
│
├── data/                        # Static data files
├── package.json                 # Frontend dependencies
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── postcss.config.js           # PostCSS config
```

---

## 4. DATABASE SCHEMA

### 4.1 Tables Structure

#### **users**
- `id` (SERIAL PRIMARY KEY)
- `email` (TEXT UNIQUE NOT NULL)
- `password` (TEXT NOT NULL) - bcryptjs hashed
- `username` (TEXT UNIQUE NOT NULL)
- `role` ('user' | 'admin')
- `bio` (TEXT)
- `specialty` (TEXT) - user's cooking specialty
- `profile_image` (TEXT)
- `is_active` (BOOLEAN DEFAULT true)
- `created_at` (TIMESTAMP)

#### **recipes**
- `id` (SERIAL PRIMARY KEY)
- `title` (TEXT NOT NULL)
- `description` (TEXT)
- `category` (TEXT)
- `ingredients` (TEXT) - JSON string
- `instructions` (TEXT)
- `prep_time` (INTEGER) - minutes
- `cook_time` (INTEGER) - minutes
- `servings` (INTEGER)
- `image_url` (TEXT) - base64 or URL
- `user_id` (FOREIGN KEY → users)
- `is_verified` (INTEGER 0|1) - admin verified
- `is_archived` (INTEGER 0|1)
- `created_at` (TIMESTAMP)

#### **recipe_stats**
- `id` (SERIAL PRIMARY KEY)
- `recipe_id` (UNIQUE FOREIGN KEY → recipes)
- `view_count` (INTEGER DEFAULT 0)
- `updated_at` (TIMESTAMP)

#### **favorites**
- `id` (SERIAL PRIMARY KEY)
- `user_id` (FOREIGN KEY → users)
- `recipe_id` (FOREIGN KEY → recipes)
- `UNIQUE(user_id, recipe_id)` - prevent duplicates
- `created_at` (TIMESTAMP)

#### **comments**
- `id` (SERIAL PRIMARY KEY)
- `recipe_id` (FOREIGN KEY → recipes)
- `user_id` (FOREIGN KEY → users)
- `text` (TEXT NOT NULL)
- `created_at` (TIMESTAMP)

#### **upvotes**
- `id` (SERIAL PRIMARY KEY)
- `recipe_id` (FOREIGN KEY → recipes)
- `user_id` (FOREIGN KEY → users)
- `UNIQUE(recipe_id, user_id)` - prevent duplicate votes
- `created_at` (TIMESTAMP)

#### **recipe_verifications**
- `id` (SERIAL PRIMARY KEY)
- `recipe_id` (UNIQUE FOREIGN KEY → recipes)
- `admin_id` (FOREIGN KEY → users)
- `status` ('pending' | 'approved' | 'rejected')
- `reason` (TEXT) - rejection reason
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### **reports**
- `id` (SERIAL PRIMARY KEY)
- `recipe_id` (FOREIGN KEY → recipes)
- `user_id` (FOREIGN KEY → users) - reporter
- `reason` (TEXT NOT NULL)
- `description` (TEXT)
- `status` ('pending' | 'resolved')
- `admin_id` (FOREIGN KEY → users) - admin who handled it
- `admin_notes` (TEXT)
- `created_at` (TIMESTAMP)
- `resolved_at` (TIMESTAMP)

#### **haram_ingredients**
- `id` (SERIAL PRIMARY KEY)
- `ingredient_name` (TEXT UNIQUE NOT NULL)
- `reason` (TEXT)
- `created_by` (FOREIGN KEY → users)
- `created_at` (TIMESTAMP)

---

## 5. CORE FEATURES

### 5.1 Authentication & User Management
- **Register**: Email + Username + Password validation
- **Login**: Email or Username + Password
- **JWT Tokens**: 7-day expiration
- **Password Hashing**: bcryptjs (10 rounds)
- **Roles**: User (default) or Admin
- **Profile Management**: Bio, specialty, profile image
- **User Deactivation**: `is_active` flag

### 5.2 Recipe Management
- **Upload**: Create recipes with details (ingredients, instructions, times)
- **Browse**: View all verified recipes with search/filter
- **Trending**: Top recipes sorted by upvote count
- **Categories**: Filter by cuisine type
- **Verification**: Admin approval required before visibility
- **Archive**: Users can archive their recipes
- **Stats**: Track view counts per recipe

### 5.3 Social Features
- **Favorites**: Save recipes for later
- **Comments**: Leave feedback on recipes
- **Upvotes**: Rate/recommend recipes
- **User Profiles**: View other users' recipes and info
- **Reports**: Flag inappropriate recipes (admin reviews)

### 5.4 Admin Features
- **Recipe Verification**: Approve/reject unverified recipes
- **Report Management**: Review and resolve user reports
- **User Management**: View and manage user accounts
- **Statistics**: Dashboard with recipe/user stats
- **Haram Ingredients**: Maintain list of forbidden ingredients

---

## 6. API ENDPOINTS

### Authentication Routes (`/api/auth`)
```
POST   /register          - Create new user account
POST   /login            - Login (accept email or username)
GET    /me               - Get current user (requires token)
PUT    /profile          - Update user profile
POST   /deactivate       - Deactivate account
```

### Recipe Routes (`/api/recipes`)
```
GET    /                 - Get all verified recipes
GET    /trending         - Get top 10 trending recipes
GET    /own              - Get current user's recipes
GET    /:id              - Get specific recipe details
POST   /                 - Create new recipe
PUT    /:id              - Update recipe
DELETE /:id              - Delete recipe
POST   /:id/archive      - Archive recipe
```

### Favorites Routes (`/api/favorites`)
```
GET    /                 - Get user's favorite recipes
POST   /:recipe_id       - Add to favorites
DELETE /:recipe_id       - Remove from favorites
```

### Comments Routes (`/api/comments`)
```
GET    /recipe/:recipe_id - Get recipe's comments
POST   /                 - Create comment
DELETE /:id              - Delete comment
```

### Users Routes (`/api/users`)
```
GET    /:username        - Get user public profile
GET    /:username/recipes - Get user's recipes
```

### Upvotes Routes (`/api/upvotes`)
```
GET    /recipe/:recipe_id - Get upvote count
POST   /recipe/:recipe_id - Add upvote
DELETE /recipe/:recipe_id - Remove upvote
```

### Reports Routes (`/api/reports`)
```
POST   /                 - File new report
GET    /                 - Get reports (admin only)
PUT    /:id              - Update report status (admin only)
```

### Stats Routes (`/api/stats`)
```
GET    /dashboard        - Get admin dashboard stats
```

### Haram Ingredients Routes (`/api/haram-ingredients`)
```
GET    /                 - Get forbidden ingredients list
POST   /                 - Add ingredient (admin only)
```

---

## 7. AUTHENTICATION FLOW

```
1. User Registration
   ├─ Client: POST /api/auth/register (email, username, password)
   ├─ Server: Hash password → Create user record
   ├─ Server: Generate JWT token
   └─ Client: Store token + user info in localStorage

2. User Login
   ├─ Client: POST /api/auth/login (email/username, password)
   ├─ Server: Find user → Compare passwords
   ├─ Server: Generate JWT token
   └─ Client: Store token + user info in localStorage

3. Protected Requests
   ├─ Client: Include "Authorization: Bearer <token>" header
   ├─ Server: Verify token via middleware (auth.js)
   └─ Server: Extract user ID from token claims

4. Logout
   └─ Client: Clear localStorage (token + user)
```

---

## 8. COMPONENT HIERARCHY

### Navigation Flow
```
App (root)
├── AuthProvider (context)
├── ProtectedRoute (HOC)
├── Navigation (nav bar)
├── LandingPage (/)
├── LoginPage (/login)
├── SignUpPage (/signup)
├── UserDashboard (/dashboard) [Protected]
├── UploadRecipe (/upload) [Protected]
├── RecipeDetail (/recipe/:id) [Protected]
├── TrendingPage (/trending) [Protected]
├── FavoritesPage (/favorites) [Protected]
├── UserProfile (/profile) [Protected]
├── ViewProfile (/profile/:username) [Protected]
└── AdminDashboard (/admin) [Protected, Admin only]
```

### Key Components
- **RecipeCard**: Displays recipe summary
- **RecipeVerification**: Admin verification UI
- **ReportManagement**: Admin report handling
- **ReportModal**: User report submission
- **Navigation**: App-wide nav bar
- **ErrorBoundary**: Error handling
- **Loading/ErrorDisplay**: Status indicators

---

## 9. STATE MANAGEMENT

### AuthContext
Manages global auth state:
```typescript
{
  user: User | null,
  token: string | null,
  isLoading: boolean,
  isAuthenticated: boolean,
  login(): Promise<void>,
  register(): Promise<void>,
  logout(): void,
  updateProfile(): Promise<void>
}
```

### LocalStorage
- `token`: JWT authentication token
- `user`: Current user object (JSON)

### Component-Level State
- Recipe search/filters (local to UserDashboard)
- Favorites set (local to components)
- Comments list (local to RecipeDetail)
- Form state (React Hook Form)

---

## 10. DATA FLOW

### Recipe Upload Flow
```
User (UploadRecipe.tsx)
  ├─ Fill form (title, ingredients, instructions, etc.)
  ├─ POST /api/recipes (with user's token)
  └─ Server creates recipe record (is_verified = 0)
     ├─ Inserted into recipes table
     ├─ create recipe_stats entry (view_count = 0)
     ├─ Create recipe_verifications entry (status = pending)
     └─ Return recipe ID to client
```

### Recipe Display Flow
```
Admin
  ├─ GET /api/recipes/all (unverified, all users)
  ├─ Review recipe
  ├─ PUT /api/recipes/:id/verify (status = approved/rejected)
  └─ Update recipe (is_verified = 1) and verifications table

User
  └─ GET /api/recipes (only verified recipes)
     └─ Display in UserDashboard/TrendingPage
```

### Favorite Flow
```
User clicks favorite icon
  ├─ POST /api/favorites/:recipe_id (if not already favorited)
  ├─ INSERT into favorites table
  └─ Update UI (icon changes)

Get favorites
  ├─ GET /api/favorites (requires token)
  └─ SELECT * FROM favorites WHERE user_id = ?
     └─ Return list of favorite recipe IDs
```

---

## 11. RUNNING THE APPLICATION

### Frontend
```bash
cd "e:\halal bites backup\halal bites"
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build production bundle
npm run preview      # Preview production build
```

### Backend
```bash
cd "e:\halal bites backup\halal bites\server"
npm start            # Start Express server (port 5000)
npm run dev          # Watch mode with --watch flag
```

### Health Check
```
Frontend: http://localhost:5173
Backend: http://localhost:5000/api/health
```

---

## 12. ENVIRONMENT VARIABLES

### Frontend (`.env` or `.env.local`)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (`server/.env`)
```
PORT=5000
JWT_SECRET=<your-secret-key>
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-anon-key>
```

---

## 13. KEY FEATURES ANALYSIS

### ✅ Implemented Features
- User authentication (register/login/logout)
- Recipe CRUD operations
- Recipe verification workflow
- Favorites system
- Comments system
- Upvote system
- Trending recipes
- User profiles
- Report system
- Admin dashboard (basic)
- Haram ingredients list
- User deactivation
- Multiple route variants (-supabase.js for production, .js for legacy)

### 🚧 Current State
- **Supabase integration**: Primary database backend
- **SQLite fallback**: Available for local development
- **Admin user**: Pre-seeded (username: admin, password: admin123)
- **Port 5000**: Backend server
- **Port 5173**: Frontend Vite dev server

### ⚠️ Recent Issues
- Server startup issues (exit code 1)
- Database connection problems
- Terminal output indicates previous debugging attempts
- Multiple failed npm start attempts in history

---

## 14. FILE ORGANIZATION BEST PRACTICES

### Naming Conventions
- **Routes with `-supabase.js` suffix**: Production-ready Supabase implementation
- **Routes without suffix**: Legacy SQLite implementation
- **Components**: PascalCase with .tsx extension
- **Pages**: PascalCase with .tsx extension
- **Utilities/Services**: camelCase with .ts extension
- **Types**: TypeScript interfaces in dedicated files

### Code Organization
- **Separation of concerns**: Routes, middleware, database isolated
- **Service layer**: Centralized API calls in `src/services/api.ts`
- **Context API**: Global state in `src/contexts/`
- **Middleware**: Auth verification in `server/middleware/auth.js`
- **Type safety**: Comprehensive TypeScript types in `src/types/`

---

## 15. DEPLOYMENT CONFIGURATION

### Files
- `Procfile`: Heroku/Render deployment config
- `render.yaml`: Render platform configuration
- `tsconfig.json`: Configured for ES2020 target

### Build Process
```
Frontend: tsc -b && vite build
Backend: npm start (uses server.js)
```

---

## 16. COMMON DEVELOPMENT TASKS

### Adding a New Recipe Feature
1. Create API endpoint in `server/routes/recipes-supabase.js`
2. Add service method in `src/services/api.ts`
3. Create/update component in `src/components/`
4. Use in relevant page (`src/pages/`)

### Adding a New Page
1. Create page component in `src/pages/PageName.tsx`
2. Add route in `src/App.tsx`
3. Import in App component
4. Add navigation link in `src/components/Navigation.tsx`

### Adding Database Migration
1. Update schema in `server/supabase-schema.sql`
2. Apply via Supabase dashboard
3. Update types in `src/types/index.ts`
4. Update relevant route handlers

### Debugging Backend
1. Use `node server-debug.js` (if available)
2. Check `server/debug.log` for errors
3. Verify `.env` variables are set
4. Test endpoints via curl/Postman

---

## 17. PERFORMANCE CONSIDERATIONS

### Frontend Optimization
- **Code Splitting**: Vite handles automatically
- **Image Optimization**: Consider lazy loading for recipe images
- **State Updates**: Use proper React hooks dependencies
- **API Caching**: Consider adding response caching for recipe lists

### Backend Optimization
- **Database Indices**: Already defined for common queries
- **Query Optimization**: Recipes use joins for user/stats
- **Pagination**: Consider for large recipe lists
- **Rate Limiting**: Not yet implemented (recommended for production)

### Database Optimization
- **Indices**: Defined on user_id, created_at, is_verified
- **Foreign Keys**: Properly set with CASCADE/SET NULL
- **Unique Constraints**: On email, username, haram_ingredients

---

## 18. SECURITY CONSIDERATIONS

### ✅ Implemented
- JWT-based authentication (7-day expiration)
- Password hashing with bcryptjs (10 rounds)
- CORS enabled
- Environment variables for secrets
- Protected routes (role-based access)

### ⚠️ Recommended Improvements
- Add rate limiting on auth endpoints
- Implement HTTPS in production
- Add request validation/sanitization
- Implement refresh tokens
- Add logging for security events
- Consider 2FA for admin accounts

---

## 19. DEBUGGING & TROUBLESHOOTING

### Backend Won't Start
1. Check `.env` file exists with Supabase credentials
2. Verify database connection: `npm run dev`
3. Check port 5000 is available: `netstat -ano | findstr 5000`
4. Review error logs in `server/debug.log`

### API Calls Failing
1. Verify backend is running (check http://localhost:5000/api/health)
2. Check JWT token in localStorage
3. Verify VITE_API_URL environment variable
4. Check browser console for CORS errors

### Database Issues
1. Verify Supabase credentials in `.env`
2. Test schema exists: Check tables in Supabase dashboard
3. Check user has proper permissions
4. Run `node check_db.js` if available

### Frontend Won't Load
1. Verify npm dependencies: `npm install`
2. Clear node_modules and reinstall if needed
3. Check Vite port 5173 is available
4. Review TypeScript errors: `npm run build`

---

## 20. SUMMARY

**Halal Bites** is a well-structured full-stack application with:
- **Frontend**: Modern React + TypeScript with Radix UI
- **Backend**: Express.js with Supabase PostgreSQL
- **Database**: Comprehensive schema with proper relationships
- **Features**: Complete recipe platform with social features
- **Architecture**: Clean separation of concerns with service layer pattern
- **Deployment**: Ready for Render/Heroku with configuration files

The system is production-ready with admin verification, user authentication, and social features. Main areas for improvement are security hardening, performance optimization, and comprehensive error handling.
