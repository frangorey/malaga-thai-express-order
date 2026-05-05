## Objetivo
En modo edición, abrir el drawer en el paso `protein` (en vez de `summary`) para que el cliente recorra los 4 pasos con las selecciones ya precargadas.

## Cambios

### 1. `src/components/NoodleCustomizerDrawer.tsx`
En el `useEffect` con deps `[open, editingItem, bundle?.products?.length]`:
- Reemplazar `setCurrentStep('summary')` por `setCurrentStep('protein')`.

### 2. `src/components/RiceCustomizerDrawer.tsx`
En el `useEffect` equivalente:
- Reemplazar `setCurrentStep('summary')` por `setCurrentStep('protein')`.

## No tocar
- SaladCustomizerDrawer.
- Tonkatsu / PolloCoreano / PadKaPrao.
- Lógica de selecciones, precarga de protein/sauce/vegetables/extras, validaciones de `customizerType`/`drawerVariant`, ni UI.
- `handleAddToCart`, `findMatchingProduct`, ni el `cartItemId` propagado.

Cambio total: 2 líneas (una por archivo).
