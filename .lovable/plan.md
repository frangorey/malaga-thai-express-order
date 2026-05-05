## Fase 7A — `cartItemId` único en el carrito (bug fix de merge)

### Problema
Items con el mismo `product.id` pero distintas `customizations` se mergeen en `quantity: 2` y se pierde el segundo set de customizaciones.

### Solución
Asignar un `cartItemId` (UUID) único por entrada del carrito. El merge sólo ocurre cuando `id + name + price + customizations` coinciden 100%.

### Archivos a modificar (solo 2)

**1. `src/components/Cart.tsx`**
- Ampliar `SupabaseCartItem` con `cartItemId: string`.
- Cambiar `CartProps.onUpdateQuantity` y `onRemoveItem` a `(cartItemId: string, ...)`.
- En el render de items (línea 199 en adelante): `key={item.cartItemId}` y los 3 botones (`-`, `+`, eliminar, líneas 215/223/230) usan `item.cartItemId`.
- En `handleOrder` (línea 149): `items.forEach(item => onRemoveItem(item.cartItemId))`.
- El `cartItems.map` que se envía a la edge function (línea ~114) **NO** incluye `cartItemId` — payload intacto: `{id, name, price, quantity, customizations}`.

**2. `src/pages/Index.tsx`**
- Añadir helper puro `customizationsEqual(a, b)` (compara arrays ordenados).
- Reescribir `addToCart`: busca existente por `id + name + price + customizationsEqual`; si existe, incrementa por `cartItemId`; si no, push con `crypto.randomUUID()`.
- Reescribir `updateQuantity(cartItemId, quantity)` y `removeFromCart(cartItemId)` para filtrar/mapear por `cartItemId`.
- El `<Cart .../>` mount no cambia (las firmas matchean por inferencia).

### NO se toca
- Edge function `create-whatsapp-order` (ya ignora campos extra; igualmente no enviamos `cartItemId`).
- Drawers `*CustomizerDrawer` (la firma `onAddToCart(product)` no cambia).
- BD, RLS, `src/integrations/supabase/types.ts`, i18n.

### Validación
- TS compila strict sin warnings.
- 2× mismo plato sin extras → 1 fila qty 2.
- Mismo plato con/sin extras → 2 filas separadas, qty 1 cada una.
- +/- en una fila no afecta a la otra.
- Pedido `pickup` llega a `orders.items` sin `cartItemId` y con items separados.
