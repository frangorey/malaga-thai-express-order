

## Plan: Maintenance Page Temporary

Add a maintenance overlay to `App.tsx` that blocks the entire app with a "Esta página web no está operativa. Disculpen las molestias" message.

### Implementation

**File: `src/App.tsx`**
- Add a maintenance mode flag (`const MAINTENANCE_MODE = true;`)
- When `true`, render only a full-screen centered message instead of the routes
- When you want to restore, just set it back to `false`

This approach is the simplest to revert — one single boolean change brings everything back.

