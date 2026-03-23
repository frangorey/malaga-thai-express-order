

## Plan: Connect TikTok Menu to Real Supabase Products

### Problem
The TikTok-style menu currently shows generic mock data ("Arroz #1", "Arroz #2" with random prices). You want to see the actual dishes with their real names, descriptions, and prices from your database.

### Approach
Replace the mock data generator with real Supabase data. The `useProducts` hook already fetches all products from the `products` table. We need to wire it into `Index.tsx` and map the category IDs from the nav to the actual category names in the database.

### Changes

**1. `src/pages/Index.tsx`**
- Import and use the `useProducts` hook to fetch real products from Supabase
- Create a mapping from nav category IDs (`arroz`, `tallarines`, `sopas`, etc.) to Supabase category names (`Arroces`, `Tallarines`, `Sopas`, `Pokes`, `Ensaladas`, `Currys`, `Postres`, `Entrantes`, `Bebidas`, `Otras del Mundo`)
- Convert each real `SupabaseProduct` into the `FeaturedItem` format expected by `TikTokStyleMenu`, using the temporary video URL and the product's `image_url` as the poster
- Remove the import of `getCategoryVideoItems` from mockVideoItems
- Add a loading state while products load

**2. `src/utils/mockVideoItems.ts`**
- Can be kept as fallback or deleted. Will remove the import from Index.

### Category ID to DB Mapping
```text
Nav ID        →  DB category
─────────────────────────────
entrantes     →  Entrantes
arroz         →  Arroces
tallarines    →  Tallarines
sopas         →  Sopas
pokes         →  Pokes
ensaladas     →  Ensaladas
postres       →  Postres
otras         →  Otras del Mundo / Currys
bebidas       →  Bebidas
```

Note: "Currys" exists in `menuData.ts` but the nav has "otras" (Otras del Mundo). We need to verify which categories actually exist in the DB. The plan will query all available categories and map accordingly.

### Data Flow
```text
Supabase products table
  → useProducts() hook (already exists)
    → getProductsByCategory(mappedName)
      → map to FeaturedItem[] with temp video + image_url as poster
        → TikTokStyleMenu → VideoMenuCard
```

### Technical Detail
- Each product gets the temporary video URL (same one used now)
- The product's `image_url` from Supabase is used as the video `poster` (so users see the real dish photo before video plays)
- The `addToCart` function continues to receive the real `SupabaseProduct` object, maintaining full cart functionality
- Vegetarian/spicy badges come from the real `is_vegetarian`/`is_spicy` fields

