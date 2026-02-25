

## Diagnosis

The "Tramitar pedido" button fails because of a **CHECK constraint** on the `order_status` column in the `orders` table.

The constraint `orders_order_status_check` only allows these values:
- `received`, `preparing`, `ready`, `delivered`, `cancelled`

But the WaiterPanel tries to set `order_status = 'confirmed'` — which violates the constraint and causes a database error.

## Solution

Add `'confirmed'` to the allowed values in the CHECK constraint. This also affects the `out_for_delivery` status used by the `OrderStatusTracker` and `useOrderRealtime` hook, so we should add that too.

### Step 1: Update the CHECK constraint (database migration)

Drop and recreate `orders_order_status_check` with the full list of statuses:

```sql
ALTER TABLE public.orders DROP CONSTRAINT orders_order_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_order_status_check
  CHECK (order_status = ANY (ARRAY[
    'received', 'confirmed', 'preparing', 'ready',
    'out_for_delivery', 'delivered', 'cancelled'
  ]));
```

### Step 2: No code changes needed

The WaiterPanel code, AdminPanel, and OrderStatusTracker already use these statuses correctly — the only issue is the database constraint blocking them.

## Files to change
- Database migration only (one SQL statement)

## Risks
- None: this is purely additive — adding new allowed values doesn't break existing data

