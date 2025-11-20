# Halal Bites - Full Stack Application

## Project Structure

```
halal-bites/
├── src/                    # Frontend React app
│   ├── components/        # React components
│   ├── api.js            # API service layer
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── server/               # Backend Node.js/Express server
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── db.js            # Database initialization
│   ├── server.js        # Server entry point
│   ├── package.json     # Backend dependencies
│   └── halal-bites.db   # SQLite database (auto-created)
└── package.json         # Frontend dependencies
```

## Setup & Running

### Frontend Setup
```bash
cd e:\halal bites
npm install
npm run dev
# Open http://localhost:5173/
```

### Backend Setup
```bash
cd e:\halal bites\server
npm install
npm run dev
# Server runs at http://localhost:5000
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Recipes
- `GET /api/recipes` - Get all recipes
- `GET /api/recipes/trending` - Get trending recipes
- `GET /api/recipes/:id` - Get single recipe
- `POST /api/recipes` - Create recipe (authenticated)
- `PUT /api/recipes/:id` - Update recipe (authenticated)
- `DELETE /api/recipes/:id` - Delete recipe (authenticated)

### Favorites
- `GET /api/favorites` - Get user's favorites (authenticated)
- `POST /api/favorites/:recipeId` - Add to favorites (authenticated)
- `DELETE /api/favorites/:recipeId` - Remove from favorites (authenticated)

## Database

Uses SQLite3 with the following tables:
- **users** - User accounts and authentication
- **recipes** - Recipe data with ingredients and instructions
- **favorites** - User favorite recipes
- **recipe_stats** - Recipe view counts for trending

## Authentication

Uses JWT (JSON Web Tokens) for authentication. When logging in or registering, you receive a token that must be sent in the `Authorization: Bearer <token>` header for protected endpoints.

## Environment Variables

**Server (.env file in /server directory):**
```
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

## Using the API from Frontend

The `src/api.js` file exports services for all API endpoints:

```javascript
import { authAPI, recipeAPI, favoriteAPI } from './api.js';

// Login
const result = await authAPI.login('user@email.com', 'password');
const token = result.token;

// Get recipes
const recipes = await recipeAPI.getAll();

// Create recipe (requires token)
const newRecipe = await recipeAPI.create({
  title: 'My Recipe',
  ingredients: [...],
  instructions: '...',
  ...
}, token);

// Add to favorites (requires token)
await favoriteAPI.add(recipeId, token);
```

## Next Steps

1. Connect frontend components to API endpoints
2. Store auth token in localStorage
3. Add error handling and loading states
4. Implement image upload functionality
5. Add validation on frontend and backend
