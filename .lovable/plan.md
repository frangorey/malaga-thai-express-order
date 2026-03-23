

## Plan: Create VideoMenuItemCard Component

### What
A new performance-optimized card component that plays a short video instead of a static image for featured dishes. Uses native IntersectionObserver to lazy-load and auto-play/pause videos based on viewport visibility.

### New file: `src/components/VideoMenuItemCard.tsx`

**Custom hook `useInViewport`** (inline in same file):
- Native IntersectionObserver with `threshold: 0.3`
- Returns `[ref, isVisible]`
- Cleans up observer on unmount

**Component logic:**
- `videoRef` for the `<video>` element
- `videoSrc` state starts as `""` — only set to the real URL when `isVisible` becomes true for the first time (true lazy loading, no wasted bandwidth)
- When `isVisible`: call `videoRef.current.play()`
- When not visible: call `videoRef.current.pause()`
- Video attributes: `muted`, `loop`, `playsInline`, `poster` (dish image)

**Props interface:**
```ts
{
  name: string;
  price: number;
  videoUrl: string;
  posterUrl: string;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  onAddToCart: () => void;
}
```

**UI design (Tailwind):**
- Rounded card with `overflow-hidden`, `aspect-[4/5]`, matching existing card style
- Video fills the card as background (`object-cover`, absolute positioned)
- Persistent gradient overlay at bottom (`bg-gradient-to-t from-black/80 via-black/30 to-transparent`)
- Bottom overlay contains: dish name (bold, white), price (neon-text), and a circular "+" add-to-cart button
- Vegetarian/spicy badges in top-right corner (matching existing MenuSection style)
- Subtle neon border on hover to match existing theme

### No other files modified
This is a standalone component. Integration into MenuSection/Index will be a separate step when you're ready to designate which dishes are "featured."

