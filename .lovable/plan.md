

## Plan: Optimize Index.tsx Rendering Structure

### Changes to `src/pages/Index.tsx`

**What changes:**
1. Remove unnecessary `useEffect` for initial category
2. Simplify table number parsing variables
3. Add `setTimeout` to `scrollToCategory` for reliable scroll after render
4. Remove redundant individual handler functions (`handleRiceCustomization`, etc.) — use `addToCart` directly
5. **Restructure rendering flow**: Header + Hero always render immediately (no loading gate). Loading/error states only affect the menu section below, improving perceived performance
6. Show a skeleton loader inside the menu area instead of a full-page loading screen
7. Remove unused `getCategoryDescription` function at the bottom
8. Remove `SupabaseCartItem` type annotation from `useState` (use inference)

### Why
- Better UX: users see the header, hero, and branding instantly while the menu loads from Supabase
- Cleaner code: removes redundant wrapper functions and dead code
- More reliable scroll behavior with `setTimeout`

### Files modified
- `src/pages/Index.tsx` — full rewrite as specified

