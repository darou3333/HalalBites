# Bug Analysis: Missing Stats Display on Trending Page

## 🔍 Issue
The Trending page shows 4 stat cards (Total Recipes, Categories, Community Recipes, Active Users) but they all display **0** because the backend returns different field names than the frontend expects.

---

## 📊 Current State Analysis

### Frontend (TrendingPage.tsx)
**Expected fields** (Lines 13-20):
```typescript
interface TrendingStats {
  totalRecipes: number;
  totalCategories: number;
  communityRecipes: number;
  activeUsers: number;
}
```

**Usage** (Lines 140-153):
```tsx
<p>{stats.totalRecipes}</p>
<p>{stats.totalCategories}</p>
<p>{stats.communityRecipes}</p>
<p>{stats.activeUsers}</p>
```

### Backend (stats-supabase.js)
**Returned fields** (Lines 76-81):
```javascript
const stats = {
  trending: sortedTrending,
  totalRecipes: recipeCount?.length || 0,        // ❌ Only counts VERIFIED recipes
  totalUsers: userCount?.length || 0,            // ❌ Called "totalUsers" not "activeUsers"
  totalComments: commentCount?.length || 0       // ❌ Missing "totalCategories" and "communityRecipes"
};
```

---

## ❌ Problems Identified

| Frontend Expects | Backend Returns | Status | Issue |
|------------------|-----------------|--------|-------|
| `totalRecipes` | `totalRecipes` | ✅ | Counts only verified recipes |
| `totalCategories` | ❌ NOT RETURNED | ❌ | Missing entirely |
| `communityRecipes` | ❌ NOT RETURNED | ❌ | Missing entirely |
| `activeUsers` | `totalUsers` (wrong name) | ❌ | Field name mismatch |

---

## 🔧 Required Fixes

### Backend Fix (stats-supabase.js)

**Current return** (Lines 76-81):
```javascript
const stats = {
  trending: sortedTrending,
  totalRecipes: recipeCount?.length || 0,
  totalUsers: userCount?.length || 0,
  totalComments: commentCount?.length || 0
};
```

**Required changes**:

1. **Count unique categories** - Need SQL query:
   ```sql
   -- Add this query to get distinct category count
   SELECT COUNT(DISTINCT category) as category_count FROM recipes WHERE is_verified = 1 AND is_archived = 0;
   ```

2. **Count community (non-admin) recipes** - Need SQL query:
   ```sql
   -- Count recipes from non-admin users
   SELECT COUNT(r.id) as community_count
   FROM recipes r
   JOIN users u ON r.user_id = u.id
   WHERE r.is_verified = 1 AND r.is_archived = 0 AND u.role = 'user';
   ```

3. **Count active users** - Users with at least 1 action (recipe, comment, upvote):
   ```sql
   -- Count active users (with recipes, comments, or upvotes)
   SELECT COUNT(DISTINCT u.id) as active_count
   FROM users u
   WHERE EXISTS (SELECT 1 FROM recipes WHERE user_id = u.id)
      OR EXISTS (SELECT 1 FROM comments WHERE user_id = u.id)
      OR EXISTS (SELECT 1 FROM upvotes WHERE user_id = u.id);
   ```

**Return object should be**:
```javascript
const stats = {
  trending: sortedTrending,
  totalRecipes: recipeCount?.length || 0,
  totalCategories: categoryCount?.[0]?.category_count || 0,  // ✅ ADD THIS
  communityRecipes: communityCount?.[0]?.community_count || 0,  // ✅ ADD THIS
  activeUsers: activeUserCount?.[0]?.active_count || 0  // ✅ RENAME THIS
};
```

---

## 📋 Implementation Steps

1. **Add database queries** in stats-supabase.js (getStats function)
   - Query for distinct categories count
   - Query for community recipes (user role = 'user')
   - Query for active users (with activity)

2. **Update response object** to match frontend expectations
   - Change `totalUsers` → `activeUsers`
   - Add `totalCategories` field
   - Add `communityRecipes` field

3. **No frontend changes needed** - Already expects correct field names

---

## 🎯 Impact

✅ All 4 stats cards will display real data instead of 0
✅ "Active Users" will show users with actual engagement
✅ "Community Recipes" will show non-admin contributed recipes
✅ "Categories" will show diversity of recipes

---

## ❓ Questions Before Implementation

**Do you want me to:**
1. Implement all SQL queries in the backend?
2. Should "activeUsers" count ALL users or only users with activity?
3. Should "communityRecipes" include admin recipes or only user recipes?

**My recommendation:**
- activeUsers = users with any activity (recipes, comments, upvotes)
- communityRecipes = recipes from both admins and users (all verified recipes)

