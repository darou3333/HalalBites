# Feature Analysis: Clickable Commenter Profile with Avatar

## 🎯 Feature Requirements
1. **Clickable Username**: When user clicks on a commenter's name, navigate to their profile page
2. **Profile Picture in Comments**: Display the commenter's profile image next to their name/comment

---

## 📊 Current State Analysis

### Database Schema
**Comments Table** (server/supabase-schema.sql)
```sql
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  recipe_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Status**: ✅ Stores `user_id` - can join with users table

### Backend Current Implementation

**File**: `server/routes/comments-supabase.js` (Lines 12-27)
```javascript
// GET comments for recipe
const { data: comments, error } = await supabase
  .from('comments')
  .select(`
    *,
    users:user_id(username)  // ⚠️ ONLY selects username
  `)
```

**Status**: ❌ Only joins `username`, missing `profile_image`

**File**: `server/routes/comments-supabase.js` (Lines 60-70)
```javascript
// POST create comment
const { data: comment, error } = await supabase
  .from('comments')
  .insert([...])
  .select(`
    *,
    users:user_id(username)  // ⚠️ ONLY selects username
  `)
```

**Status**: ❌ Only joins `username`, missing `profile_image`

### Frontend Current Implementation

**File**: `src/pages/RecipeDetail.tsx` (Lines 345-380)
```tsx
// Comments display
{comments.map((comment) => (
  <div key={comment.id} className="p-6 bg-stone-50 dark:bg-neutral-800 rounded-2xl...">
    <div className="flex items-center justify-between mb-3">
      <span className="text-lg text-neutral-900 dark:text-white">
        {comment.user}  {/* ⚠️ Just plain text, not clickable */}
      </span>
      <span className="text-neutral-500 dark:text-neutral-400">
        {new Date(comment.date).toLocaleDateString()}
      </span>
    </div>
    <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
      {comment.text}
    </p>
  </div>
))}
```

**Status**: ❌ No profile picture, no clickable link

### Type Definitions

**File**: `src/types/index.ts` (Lines 71-81)
```typescript
export interface Comment {
  id: number;
  user: string;           // ⚠️ Just username string
  text: string;
  date: string;
  user_id?: number;       // ✅ Already exists
  recipe_id?: number;
}
```

**Status**: ⚠️ Has `user_id` but missing `profile_image`

---

## 🔧 Required Changes

### 1. **Backend - Update Comment Queries**

**File**: `server/routes/comments-supabase.js`

**Changes Needed**:
- Modify SELECT in GET endpoint (lines 12-18) to include `profile_image`
- Modify SELECT in POST endpoint (lines 60-70) to include `profile_image`
- Transform response to include new fields

**Current**:
```javascript
.select(`
  *,
  users:user_id(username)
`)
```

**Required**:
```javascript
.select(`
  *,
  users:user_id(id, username, profile_image)
`)
```

**Transform response**:
```javascript
const transformedComments = comments.map(comment => ({
  id: comment.id,
  user: comment.users?.username || 'Unknown',
  user_id: comment.user_id,
  profile_image: comment.users?.profile_image,  // ✅ ADD THIS
  text: comment.text,
  date: comment.created_at,
  recipe_id: comment.recipe_id,
}));
```

### 2. **Frontend - Update Type Definition**

**File**: `src/types/index.ts` (Comment interface)

**Required**:
```typescript
export interface Comment {
  id: number;
  user: string;
  text: string;
  date: string;
  user_id?: number;
  recipe_id?: number;
  profile_image?: string;  // ✅ ADD THIS
}
```

### 3. **Frontend - Update Comment Display Component**

**File**: `src/pages/RecipeDetail.tsx` (Lines 345-380)

**Required**:
1. Add profile image display (thumbnail before username)
2. Make username clickable (link to profile page)
3. Use `navigate()` from react-router to go to profile

**Structure**:
```tsx
<div key={comment.id} className="p-6 bg-stone-50 dark:bg-neutral-800 rounded-2xl...">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-3">
      {/* Profile Image */}
      {comment.profile_image ? (
        <img
          src={comment.profile_image}
          alt={comment.user}
          className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80"
          onClick={() => navigate(`/profile/${comment.user_id}`)}
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
      
      {/* Username - Clickable */}
      <button
        onClick={() => navigate(`/profile/${comment.user_id}`)}
        className="text-lg text-neutral-900 dark:text-white hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer"
      >
        {comment.user}
      </button>
    </div>
    <span className="text-neutral-500 dark:text-neutral-400">
      {new Date(comment.date).toLocaleDateString()}
    </span>
  </div>
  <p className="text-lg text-neutral-700 dark:text-neutral-300 leading-relaxed">
    {comment.text}
  </p>
</div>
```

---

## ✅ SQL Verification (Optional)

If you need to manually verify the database has `profile_image`:

```sql
-- Check if profile_image column exists and has data
SELECT 
  u.id, 
  u.username, 
  u.profile_image,
  COUNT(c.id) as comment_count
FROM users u
LEFT JOIN comments c ON u.id = c.user_id
GROUP BY u.id, u.username, u.profile_image
HAVING COUNT(c.id) > 0;
```

---

## 🚀 Implementation Summary

| Component | Change | Impact | Required? |
|-----------|--------|--------|-----------|
| `comments-supabase.js` GET | Add `profile_image` to SELECT join | Backend | ✅ YES |
| `comments-supabase.js` POST | Add `profile_image` to SELECT join | Backend | ✅ YES |
| `src/types/index.ts` | Add `profile_image?: string` to Comment | Types | ✅ YES |
| `src/pages/RecipeDetail.tsx` | Update comment display with image + clickable link | Frontend | ✅ YES |

---

## 🔍 Additional Notes

- **No database migration needed** - `profile_image` already exists in users table
- **Navigation ready** - `ViewProfile.tsx` page already exists and accepts `userId` param
- **Image fallback** - If user has no profile image, show default avatar (already done in ViewProfile)
- **Responsive** - Profile images will be small (10x10 on desktop, can adjust)
- **Accessibility** - Click handlers should have hover states and cursor pointer

---

## 📝 Implementation Order

1. ✅ **First**: Update backend comment routes (both GET and POST)
2. ✅ **Second**: Update Comment type interface
3. ✅ **Third**: Update comment display in RecipeDetail.tsx
4. ✅ **Test**: Create comment, verify image shows, click username → navigate to profile

