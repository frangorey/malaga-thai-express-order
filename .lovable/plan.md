# Fix dark-mode legibility in WaiterDashboard

Single file: `src/components/waiter/WaiterDashboard.tsx`. No logic changes.

## Note on the prompt vs. real code

The prompt from the technical brain references some Tailwind classes that don't exist verbatim in the current file (e.g. `text-[9rem]`, `opacity-70` on title, `opacity-80 -mt-2` on count label). The current file already uses `text-foreground` on the title and `text-7xl` for the number. I'll apply the **intent** of the brief (remove pastel backgrounds, ensure dark-mode contrast) mapped onto the real classes — without inventing changes.

## Changes

### 1. `getCardClasses` — drop pastel fills, keep semaphore on the left strip

```ts
if (count === 0) {
  return 'border-l-neutral-400 dark:border-l-neutral-600 bg-muted/40';
}
const byPriority = [
  'border-l-emerald-500 bg-card',
  'border-l-amber-500 bg-card',
  'border-l-orange-500 bg-card',
  'border-l-red-600 bg-card animate-pulse',
];
```

Urgency is now communicated only via the 12px left border + `animate-pulse` on priority 3 + the timer/number color from `getTimerColor` (unchanged).

### 2. Text class touch-ups (current → new)

- Title `h2` (currently `text-2xl font-semibold tracking-tight text-foreground`) → **unchanged** (already correct).
- Subtitle `<p>` `text-sm text-muted-foreground` → `text-sm text-muted-foreground/90`.
- Big number `<span>` keeps `text-7xl font-bold leading-none ${getTimerColor(...)}` → **unchanged** (color comes from semaphore, already high-contrast in dark mode).
- Pending-count label `<span class="text-base text-foreground/80">` → `text-base text-muted-foreground`.
- Empty state (`CheckCircle2` + "Sin pedidos pendientes") → **unchanged**.
- Action `Button` currently `variant="outline"` for both cards → keep as-is (shadcn outline has correct contrast in both themes).

## Out of scope (explicitly not touched)

- `computeMetrics`, `calculatePriority`, props, JSX structure.
- `border-l-[12px]`, `animate-pulse` for priority 3.
- `getTimerColor` palette.
- i18n keys.

## Acceptance

- Dark mode: number "2", "{n} pendientes" and "Más antiguo: …" read clearly over `bg-card`.
- Empty card retains contrast via `bg-muted/40` + existing muted text.
- Light mode unaffected (`bg-card` / `bg-muted` are theme tokens).
- Red urgency still obvious via thick left strip + pulse.
