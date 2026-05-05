## Objetivo
Añadir botón "← Atrás" (a proteína) en el step `sauce` de Noodle y Rice. El auto-avance al seleccionar salsa se mantiene intacto.

## Cambios

### 1. `src/components/NoodleCustomizerDrawer.tsx`
Dentro del bloque `{currentStep === "sauce" && (...)}`, tras el `.map` de `sauces`, añadir:
```tsx
<div className="flex gap-2 mt-4">
  <Button variant="outline" size="sm" onClick={goBack} className="flex-1">
    ← {t("step_protein")}
  </Button>
</div>
```

### 2. `src/components/RiceCustomizerDrawer.tsx`
Idéntico cambio en su bloque `sauce`.

## No tocar
- `handleSauceSelect` ni el auto-avance.
- No añadir botón "Siguiente" en `sauce`.
- Otros steps (protein/vegetables/extras/summary).
- Salad / Tonkatsu / PolloCoreano / PadKaPrao.
- BD ni edge functions.
