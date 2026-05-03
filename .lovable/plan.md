## Objetivo

Reemplazar el toast actual de "Delivery no disponible" en el carrito por un modal multilingüe que redirige al usuario a Uber Eats (Thaii Express Málaga Centro), conservando el carrito si el usuario vuelve.

Solo se tocan dos archivos: `src/components/Cart.tsx` y `src/contexts/LanguageContext.tsx`. Ningún cambio en lógica de pedidos, RLS, edge functions, tipos o estilos del resto del carrito.

## Cambios

### 1. `src/contexts/LanguageContext.tsx` — añadir 5 claves en los 5 idiomas

Añadir, al final de cada bloque (`es`, `en`, `fr`, `de`, `ru`), antes del `}` de cierre (líneas 536, 1017, 1492, 1967, 2442 respectivamente):

- `delivery_service_title`
- `delivery_service_description`
- `go_to_uber_eats`
- `back_to_cart`
- `via_uber_eats`

Textos exactos (ES / EN / FR / DE / RU) tal y como los proporcionó el cerebro técnico. Sin tocar ninguna otra clave existente.

### 2. `src/components/Cart.tsx`

**a) Imports (línea 1-14):** añadir
```ts
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
```

**b) Estado (junto a `useState` existentes, ~línea 44):**
```ts
const [showDeliveryModal, setShowDeliveryModal] = useState(false);
```

**c) Botón Delivery (líneas 273-287):**
- Quitar `opacity-60` del `className`.
- Sustituir `onClick` (toast) por `onClick={() => setShowDeliveryModal(true)}`.
- Sustituir `<span ...>{t('not_available')}</span>` por `<span className="text-xs opacity-80">{t('via_uber_eats')}</span>`.

**d) Modal:** insertar un `<Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>` con:
- `DialogTitle` = `t('delivery_service_title')`
- `DialogDescription` = `t('delivery_service_description')`
- Botón `variant="neon"` con icono `Truck` (ya importado): abre `window.open(URL_UBER_EATS, "_blank")` y cierra el modal.
- Botón `variant="outline"` con `t('back_to_cart')` que solo cierra el modal.

URL exacta de Uber Eats (Thaii Express Málaga Plaza de la Solidaridad 9) según el encargo.

Ubicación: justo antes del cierre del `return` del componente, fuera del flujo del carrito, para que funcione tanto si `tableNumber` está presente como no.

## Optimización aplicada al encargo

Una sola desviación respecto al prompt original, mínima y justificada:

- El prompt indica colocar el `<Dialog>` "antes del último `</div>` del componente". Como `Dialog` de shadcn se renderiza en un portal, su posición en el árbol no afecta visualmente, pero lo coloco como hermano del root del componente (envuelto en un fragment) para evitar interferir con el layout flex/scroll del panel del carrito. Comportamiento idéntico al pedido.

Todo lo demás (claves i18n, textos, URL, variantes de botón, criterios de aceptación) se mantiene literal.

## Restricciones respetadas

- Solo se modifican `Cart.tsx` y `LanguageContext.tsx`.
- No se añaden dependencias (Dialog y Truck ya existen en el proyecto).
- No se altera `handleOrder`, validaciones, ni la lógica de `orderType`.
- El estado del carrito sobrevive a abrir/cerrar el modal.

## Criterios de aceptación

1. Pulsar "Delivery" abre el modal (no toast).
2. Los textos del modal cambian con el idioma activo (es/en/fr/de/ru).
3. "Ir a Uber Eats" abre nueva pestaña con la URL exacta y cierra el modal.
4. "Volver al carrito" cierra el modal sin alterar items.
5. `LanguageContext.tsx` contiene las 5 claves nuevas en los 5 bloques de idioma.
