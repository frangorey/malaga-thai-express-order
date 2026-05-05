# Fase 7 — Drawer Pad Ka Prao (proteína única, precio dinámico)

Convierte la card "Pad Ka Prao" de standalone (id=270) a template-driven con drawer de 7 proteínas y precio dinámico (13.50€–16.20€).

## 1. Crear `src/components/PadKaPraoCustomizerDrawer.tsx`

Clon visual de `PolloCoreanoCustomizerDrawer.tsx` con simplificaciones:
- **Un único selector** (proteína) en lugar de dos (guarnición + salsa)
- **Precio dinámico** leído de `matched.price` (NO constante)
- Hero multimedia, summary, sticky add-to-cart idénticos al patrón validado

**Constantes y tipos:**
```ts
const SLUG = "pad_ka_prao";
type ProteinId = "pollo"|"ternera"|"gambas"|"pollo_ternera"
               | "pollo_gambas"|"ternera_gambas"|"pollo_ternera_gambas";

const proteins = [
  { id:"pollo",                nameKey:"protein_chicken",             emoji:"🍗",   matchToken:"con pollo" },
  { id:"ternera",              nameKey:"protein_beef",                emoji:"🥩",   matchToken:"con ternera" },
  { id:"gambas",               nameKey:"protein_shrimp",              emoji:"🦐",   matchToken:"con gambas" },
  { id:"pollo_ternera",        nameKey:"protein_chicken_beef",        emoji:"🍗🥩",  matchToken:"mix 2 con pollo y ternera" },
  { id:"pollo_gambas",         nameKey:"protein_chicken_shrimp",      emoji:"🍗🦐",  matchToken:"mix 2 con pollo y gambas" },
  { id:"ternera_gambas",       nameKey:"protein_beef_shrimp",         emoji:"🥩🦐",  matchToken:"mix 2 con ternera y gambas" },
  { id:"pollo_ternera_gambas", nameKey:"protein_chicken_beef_shrimp", emoji:"🍗🥩🦐", matchToken:"mix 3 con pollo, ternera y gambas" },
];
```

**Matching con guard anti-colisión MIX (CRÍTICO):**
```ts
const SIMPLE_IDS: ProteinId[] = ["pollo","ternera","gambas"];

const findProductFor = (id: ProteinId): SupabaseProduct | null => {
  const sel = proteins.find(p => p.id === id);
  if (!sel) return null;
  const token = sel.matchToken.toLowerCase();
  const isSimple = SIMPLE_IDS.includes(id);
  return templateProducts.find(p => {
    const n = p.name.toLowerCase();
    if (!n.includes(token)) return false;
    if (isSimple && n.includes("mix")) return false; // guard colisión
    return true;
  }) ?? null;
};

const matched = selectedProtein ? findProductFor(selectedProtein) : null;
const totalPrice = matched?.price ?? 0;
```

Cada botón del grid de proteínas calcula su precio con `findProductFor(p.id)`; si retorna null, el botón se oculta.

**UI:** DrawerTitle "🌶️ Pad Ka Prao", hero (video → img → ImageOff), sección `{t("padkaprao_choose_protein")}`, grid 1col / sm:2col con 7 botones, summary + sticky bottom con `totalPrice`. Estados isLoading / isError / empty con `error_loading_variants`, `error_no_variants_available`. Click en add-to-cart sin matched → toast destructivo `error_variant_not_found`.

**Props:** `{ open, onClose, onAddToCart }` idénticas al patrón.

## 2. Modificar `src/pages/Index.tsx`

- Import: `import { PadKaPraoCustomizerDrawer } from "@/components/PadKaPraoCustomizerDrawer";`
- Estado: `const [padKaPraoDrawerOpen, setPadKaPraoDrawerOpen] = useState(false);`
- En `WORLD_CARDS`, sustituir entry `{ kind:"standalone", productId:270, ... }` por:
  ```ts
  { kind:"template", slug:"pad_ka_prao", displayNameKey:"world_pad_ka_prao_card",
    emoji:"🌶️", onCustomize: () => setPadKaPraoDrawerOpen(true) }
  ```
- Montar `<PadKaPraoCustomizerDrawer open={...} onClose={...} onAddToCart={addToCart} />` junto a Tonkatsu / PolloCoreano.

Nota: el producto 269 (Curry Piña) sigue como standalone — la card actual `world_pad_ka_prao_card` ocupa el slot que en el código vigente referencia productId 270 (en el código actual el productId 270 está mapeado a `world_pad_ka_prao_card`, NO a `world_curry_pina_card` como aparece en otra entry; se respeta el mapping existente y solo se altera la entry de Pad Ka Prao).

## 3. Modificar `src/contexts/LanguageContext.tsx`

Añadir UNA sola clave nueva `padkaprao_choose_protein` en los 5 bloques de idioma (es, en, fr, de, ru). Insertar cerca de las otras claves de customizer existentes.

| Idioma | Valor |
|--------|-------|
| es | "Elige tu proteína" |
| en | "Choose your protein" |
| fr | "Choisissez votre protéine" |
| de | "Wähle dein Protein" |
| ru | "Выберите белок" |

Si existe union `TranslationKey`, añadir `"padkaprao_choose_protein"`.

## Restricciones

- NO tocar Noodle/Rice/Salad/Tonkatsu/PolloCoreano drawers ni `useDishTemplate`.
- NO redefinir claves `protein_*` ni `world_pad_ka_prao_card` (existen).
- NO añadir italiano. NO añadir extras/salsas/guarniciones.
- Total siempre desde `matched.price`, nunca constante.

## Validación post-build

1. TS limpio.
2. Categoría "Otras del Mundo" sigue mostrando 4 cards.
3. Click en Pad Ka Prao abre drawer con 7 proteínas y precios correctos (13.50 / 13.70 / 14.70 / 15.80 ×3 / 16.20).
4. Seleccionar "Pollo" añade producto id=270 (NO el MIX 2 pollo+ternera) — guard anti-colisión funciona.
5. Seleccionar cada MIX añade el producto correcto.
