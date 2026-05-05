## Fase 7B — Modelo estructurado de `customizationData` en el carrito

Refactor que enriquece cada item del carrito con metadata tipada (`customizationData`) sin cambiar la firma `onAddToCart(product)` ni el payload enviado a la edge function. Sienta las bases para Fase 7C (carrito editable).

### Archivos a modificar (8)

**1. `src/components/Cart.tsx`** — añadir tipos exportados antes de `SupabaseCartItem` y ampliar la interfaz:

```ts
export type CustomizerType =
  | 'noodle' | 'rice' | 'salad'
  | 'tonkatsu' | 'pollo_coreano' | 'pad_ka_prao';

export type NoodleVariant = 'Anchos' | 'Finos' | 'Glass' | 'Udon';
export type RiceVariant = 'frito' | 'curry';
export type SaladVariant = 'cesar' | 'classic' | 'crispy' | 'fruta' | 'malaysia' | 'thailandia';
export type DrawerVariant = NoodleVariant | RiceVariant | SaladVariant;

export interface CustomizationData {
  customizerType: CustomizerType;
  drawerVariant?: DrawerVariant;
  selections: {
    protein?: string;
    sauce?: string;
    garnish?: string;
    vegetables?: string[];
    extras?: string[];
  };
}

export type SupabaseProductWithCustomization = SupabaseProduct & {
  customizations?: string[];
  customizationData?: CustomizationData;
};

export interface SupabaseCartItem extends SupabaseProduct {
  quantity: number;
  customizations?: string[];
  cartItemId: string;
  customizationData?: CustomizationData;   // NUEVO
}
```

`handleOrder` y el `cartItems.map` que envía a `create-whatsapp-order` **no se tocan** — el map ya proyecta solo `{id, name, price, quantity, customizations}`, así que `customizationData` queda fuera del payload automáticamente (igual que `cartItemId`).

**2. `src/pages/Index.tsx`** — importar `SupabaseProductWithCustomization` desde `@/components/Cart`, cambiar la firma de `addToCart` a:

```ts
const addToCart = (product: SupabaseProductWithCustomization) => { ... }
```

Sustituir el cast actual `(product as SupabaseProduct & { customizations?: string[] }).customizations` por uso directo de `product.customizations` y `product.customizationData`. Al pushear nuevo item, incluir `customizationData: product.customizationData`. La comparación de duplicados **sigue** usando `customizationsEqual` sobre `customizations: string[]` — `customizationData` no participa en la igualdad.

**3–8. Seis customizer drawers** — en cada uno:

- Cambiar el tipo de prop:
  ```ts
  onAddToCart: (product: SupabaseProductWithCustomization) => void;
  ```
  e importar `SupabaseProductWithCustomization` y `CustomizationData` desde `@/components/Cart`.

- En `handleAddToCart`, construir `customizationData` y devolver un `customProduct` spread (en Tonkatsu/PolloCoreano/PadKaPrao/Salad hoy se hace `onAddToCart(base)` directamente — pasa a `onAddToCart({ ...base, customizationData })`):

| Drawer | customizerType | drawerVariant | selections |
|---|---|---|---|
| `NoodleCustomizerDrawer` | `'noodle'` | `noodleType` | `protein`, `sauce`, `vegetables`, `extras` |
| `RiceCustomizerDrawer` | `'rice'` | `riceType` | `protein`, `sauce`, `vegetables`, `extras` |
| `SaladCustomizerDrawer` | `'salad'` | `saladType` | `protein` |
| `TonkatsuCustomizerDrawer` | `'tonkatsu'` | — | `garnish`, `sauce` |
| `PolloCoreanoCustomizerDrawer` | `'pollo_coreano'` | — | `garnish`, `sauce` |
| `PadKaPraoCustomizerDrawer` | `'pad_ka_prao'` | — | `protein` |

Arrays vacíos y strings vacíos se normalizan a `undefined` (`selectedVegetables.length ? selectedVegetables : undefined`, `selectedProtein || undefined`, etc.).

En Noodle/Rice, donde ya existe `customProduct`, se mantiene la estructura y se añade el campo `customizationData` junto a `customizations: allCustomizations`.

### Restricciones (obligatorias)

- No tocar `supabase/functions/create-whatsapp-order/index.ts`.
- No eliminar `customizations: string[]` (cocina y edge function dependen de él).
- No usar `customizationData` en la comparación de duplicados.
- No cambiar la firma a `(product, customizationData)` — sigue siendo 1 argumento.
- No añadir lógica de edición desde el carrito (eso es Fase 7C).
- Sin cambios en BD, RLS, `src/integrations/supabase/types.ts`, ni i18n.

### Validación

- TS compila estricto sin warnings.
- Carrito visualmente idéntico.
- `orders.items` en Supabase no contiene `customizationData` ni `cartItemId`.
- React DevTools: cada `SupabaseCartItem` del estado de `Index.tsx` muestra `customizationData` poblado según el drawer de origen.
- Comportamiento de merge de Fase 7A intacto: 2× mismo plato sin extras → 1 fila qty 2; mismo plato con/sin extras → 2 filas separadas.