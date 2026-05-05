## Fase 7C — Parte 1/3: UI de edición en Cart + Index + i18n

Implementa la UX de edición end-to-end (botón "Editar" + flujo REPLACE preservando `quantity`) sin tocar todavía la precarga interna de los 6 drawers (eso queda para partes 2 y 3). Al pulsar "Editar" se cerrará el carrito y se abrirá el drawer correspondiente; al confirmar, el item se reemplaza in-place conservando su `cartItemId` y cantidad.

---

### 1. `src/components/Cart.tsx`

- Importar `Pencil` desde `lucide-react` (junto a Minus/Plus/X).
- Extender `CartProps`:
  ```ts
  onEditItem?: (cartItemId: string) => void;
  ```
- Desestructurar `onEditItem` en el componente.
- En la card de cada item (línea ~256, justo antes del botón destructive `X`), insertar:
  ```tsx
  {item.customizationData && onEditItem && (
    <Button
      size="sm"
      variant="ghost"
      onClick={() => onEditItem(item.cartItemId)}
      aria-label={t('edit_item')}
    >
      <Pencil className="w-3 h-3" />
    </Button>
  )}
  ```
- No tocar nada más de Cart.tsx (ni `handleOrder`, ni payload, ni dedupe).

### 2. `src/pages/Index.tsx`

- Nuevo state:
  ```ts
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  ```
- Feature flag bajo el state:
  ```ts
  const EDIT_ENABLED: Record<'noodle'|'rice'|'salad'|'tonkatsu'|'pollo_coreano'|'pad_ka_prao', boolean> = {
    noodle: true, rice: true, salad: true, tonkatsu: true, pollo_coreano: true, pad_ka_prao: true,
  };
  ```
- `handleEditItem(cartItemId)`:
  - Localiza el item en `cartItems` por `cartItemId`.
  - Si no tiene `customizationData` o el flag está desactivado → `return`.
  - `setEditingCartItemId(cartItemId)` + `setIsCartOpen(false)`.
  - `switch` sobre `customizationData.customizerType` y abre el drawer adecuado usando `drawerVariant` con fallback:
    - `noodle` → `setNoodleCustomizer({ open: true, type: (drawerVariant ?? 'Anchos') as NoodleType })`
    - `rice` → `setRiceCustomizer({ open: true, type: (drawerVariant ?? 'frito') as RiceType })`
    - `salad` → `setSaladCustomizer({ open: true, type: (drawerVariant ?? 'cesar') as SaladType })`
    - `tonkatsu` → `setTonkatsuDrawerOpen(true)`
    - `pollo_coreano` → `setPolloCoreanoDrawerOpen(true)`
    - `pad_ka_prao` → `setPadKaPraoDrawerOpen(true)`
- `handleCancelEdit()`:
  ```ts
  setEditingCartItemId(null);
  setIsCartOpen(true);
  ```
- Refactor `addToCart` con rama REPLACE preservando quantity:
  ```ts
  const addToCart = (product: SupabaseProductWithCustomization) => {
    setCartItems(prev => {
      if (editingCartItemId) {
        const original = prev.find(i => i.cartItemId === editingCartItemId);
        const preservedQty = original?.quantity ?? 1;
        return prev.map(item =>
          item.cartItemId === editingCartItemId
            ? {
                ...product,
                quantity: preservedQty,
                customizations: product.customizations,
                customizationData: product.customizationData,
                cartItemId: editingCartItemId,
              } as SupabaseCartItem
            : item
        );
      }
      // Lógica original Fase 7A (dedupe por customizationsEqual) — intacta.
      const incomingCustomizations = product.customizations;
      const incomingCustomizationData = product.customizationData;
      const existing = prev.find(item =>
        item.id === product.id &&
        item.name === product.name &&
        item.price === product.price &&
        customizationsEqual(item.customizations, incomingCustomizations)
      );
      if (existing) {
        return prev.map(item =>
          item.cartItemId === existing.cartItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        { ...product, quantity: 1, customizations: incomingCustomizations, customizationData: incomingCustomizationData, cartItemId: crypto.randomUUID() } as SupabaseCartItem,
      ];
    });
    if (editingCartItemId) {
      setEditingCartItemId(null);
      setIsCartOpen(true);
    }
  };
  ```
- En `<Cart … />` añadir prop `onEditItem={handleEditItem}`.
- En los 6 drawers, envolver `onClose` para detectar cancelación de edit, p.ej:
  ```tsx
  onClose={() => {
    setNoodleCustomizer(prev => ({ ...prev, open: false }));
    if (editingCartItemId) handleCancelEdit();
  }}
  ```
  Aplicar el mismo patrón a Rice, Salad, Tonkatsu, PolloCoreano y PadKaPrao con su setter respectivo.
- NO añadir aún la prop `editingItem` a los drawers (parte 2 y 3).

### 3. `src/contexts/LanguageContext.tsx`

Añadir keys en los 5 idiomas (es/en/fr/de/ru):

| key | es | en | fr | de | ru |
|---|---|---|---|---|---|
| `edit_item` | Editar | Edit | Modifier | Bearbeiten | Редактировать |
| `update_item` | Actualizar | Update | Mettre à jour | Aktualisieren | Обновить |
| `cancel` (verificar; añadir si falta) | Cancelar | Cancel | Annuler | Abbrechen | Отмена |

---

### Restricciones (no hacer)

- No tocar BD, edge functions, ni `supabase/functions/create-whatsapp-order`.
- No alterar el payload enviado al pedido.
- No cambiar la firma de `addToCart`.
- No crear archivos nuevos.
- No modificar `customizationsEqual` ni la lógica de dedupe.
- En modo "añadir nuevo" (sin `editingCartItemId`) el comportamiento debe ser idéntico al actual.

### Validación manual

1. Añadir un Pad Thai personalizado → aparece icono lápiz en el carrito.
2. Pulsar lápiz → carrito se cierra y se abre el drawer adecuado (sin precarga visible aún, esperado en parte 1).
3. Confirmar en drawer → item se reemplaza preservando quantity y `cartItemId`.
4. Cancelar drawer (cerrar) → carrito se reabre con el item original intacto.
5. Añadir un item nuevo sin estar editando → flujo Fase 7A intacto (dedupe correcto).