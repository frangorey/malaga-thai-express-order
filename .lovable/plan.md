## Fase 7C — Parte 2/3: Drawers con variante (Noodle, Rice, Salad)

Añade precarga de selecciones en modo edición a los 3 drawers que reciben prop de variante. Reutiliza el step `summary` como entrada en edición y propaga `cartItemId` para que el flujo REPLACE de Parte 1 funcione end-to-end.

### Huecos detectados en el prompt original (corregidos abajo)

1. **`EditingItem` no existe en `@/components/Cart`** → Hay que definirlo (ajuste mínimo a Cart.tsx, sin tocar UI ni payload).
2. **`Index.tsx` no pasa `editingItem` a los drawers** → Hay que añadirlo a las 3 llamadas (Noodle, Rice, Salad). Sin esto, el `useEffect` de precarga nunca recibe datos.

Ambos ajustes son no-funcionales para el carrito (no cambian dedupe, payload, BD ni edge functions) y son requisitos para que Parte 2/3 funcione.

---

### 1. `src/components/Cart.tsx` (ajuste mínimo)

Añadir tipo exportado bajo el bloque de tipos Fase 7B:

```ts
export interface EditingItem {
  cartItemId: string;
  customizationData: CustomizationData;
}
```

Nada más en este archivo.

### 2. `src/pages/Index.tsx` (ajuste mínimo)

- Importar `EditingItem` desde `@/components/Cart`.
- Calcular el `editingItem` derivado del state existente:
  ```ts
  const editingItem: EditingItem | undefined = editingCartItemId
    ? (() => {
        const it = cartItems.find(i => i.cartItemId === editingCartItemId);
        return it?.customizationData
          ? { cartItemId: it.cartItemId, customizationData: it.customizationData }
          : undefined;
      })()
    : undefined;
  ```
- Pasar `editingItem={editingItem}` SOLO a los 3 drawers de esta parte: `<NoodleCustomizerDrawer />`, `<RiceCustomizerDrawer />`, `<SaladCustomizerDrawer />` (Tonkatsu / PolloCoreano / PadKaPrao se cubren en Parte 3/3).

### 3. `src/components/NoodleCustomizerDrawer.tsx`

- Importar `EditingItem` desde `@/components/Cart` y `useEffect` desde `react`.
- Extender props: `editingItem?: EditingItem`.
- En `handleClose`: eliminar la llamada a `handleReset()`. Dejar solo `onClose()`.
- Nuevo `useEffect` con deps `[open, editingItem, bundle?.products?.length]`:
  - `if (!open) return;`
  - `if (editingItem)`:
    - Si `editingItem.customizationData.customizerType !== 'noodle'` → `handleReset()`; `return`.
    - Si `editingItem.customizationData.drawerVariant !== noodleType` → `handleReset()`; `return`.
    - Cargar `selections.protein`, `selections.sauce`, `selections.vegetables ?? []`, `selections.extras ?? []`.
    - `setCurrentStep('summary')`.
  - `else` → `handleReset()`.
- En `handleAddToCart`, ampliar el tipo del payload local con `cartItemId?: string` y, si `editingItem` existe, propagar `cartItemId: editingItem.cartItemId` dentro del objeto pasado a `onAddToCart`.
- Toast tras add/update: si `editingItem` → `toast({ title: '✅ ' + t('update_item'), description: customProduct.name })`. Si no, mantener actual.
- Botón summary: label dinámico `editingItem ? t('update_item') : t('add_to_cart')`.

### 4. `src/components/RiceCustomizerDrawer.tsx`

Mismo patrón que Noodle, con dos diferencias:

- Validar `drawerVariant === riceType`.
- En el `useEffect` existente `[riceType, handleReset]`, añadir guard al inicio: `if (editingItem) return;` para evitar que el reset por cambio de variante pise la precarga al abrir en modo edit. Ajustar deps a `[riceType, editingItem, handleReset]`.

### 5. `src/components/SaladCustomizerDrawer.tsx`

- Mismo patrón, pero Salad solo tiene `selectedProtein` (sin steps).
- Crear función local `resetSelections()` que haga `setSelectedProtein('')`. Actualizar las llamadas inline existentes (`setSelectedProtein('')` en `handleClose` y tras `handleAddToCart`) para usar `resetSelections()`.
- En `handleClose`: eliminar el reset inline → dejar solo `onClose()`.
- Nuevo `useEffect` con deps `[open, editingItem, templateProducts.length]`:
  - `if (!open) return;`
  - `if (editingItem)`:
    - Si `customizerType !== 'salad'` → `resetSelections()`; `return`.
    - Si `drawerVariant !== saladType` → `resetSelections()`; `return`.
    - Cargar SOLO `selections.protein` (Salad ignora vegetables/extras).
  - `else` → `resetSelections()`.
- En `handleAddToCart`, propagar `cartItemId: editingItem.cartItemId` cuando aplique. Cambiar toast y label como en Noodle.

---

### Restricciones (no hacer)

- No tocar BD, edge functions, ni `supabase/functions/create-whatsapp-order`.
- No alterar el payload del pedido (Index.tsx ya excluye `customizationData` y `cartItemId` al enviar).
- No modificar `findMatchingProduct` en ninguno de los 3 drawers.
- No añadir un step "edit"; reutilizar `summary`.
- No tocar `customizationsEqual` ni la rama de dedupe en `addToCart` (en modo edit la rama REPLACE corre primero y no entra a dedupe).
- No modificar Tonkatsu / PolloCoreano / PadKaPrao (Parte 3/3).
- No crear archivos nuevos.

### Validación manual

1. Tallarines Anchos pollo classic + huevo → añadir → en carrito aparece lápiz → pulsar → drawer abre en step `summary` con todo marcado.
2. Cancelar (X o backdrop) → carrito reabre, item intacto, mismo `cartItemId`.
3. Cambiar proteína a ternera → "Actualizar" → carrito reabre, fila reemplazada in-place, mismo `cartItemId`, quantity preservada.
4. Repetir flujo con Arroz Curry verde (con guard de `riceType` activo) y Ensalada César.
5. Añadir un item nuevo sin estar editando → comportamiento idéntico a Fase 7A (dedupe correcto).
6. Enviar pedido pickup → en `orders.items` no debe aparecer `cartItemId` ni `customizationData`.
