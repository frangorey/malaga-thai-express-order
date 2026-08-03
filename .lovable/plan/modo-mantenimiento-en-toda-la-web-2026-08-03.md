# Modo mantenimiento en toda la web

Activar el modo mantenimiento ya existente en la app, con el texto que has indicado, para todas las rutas (home, /admin, /waiter, /mesa/:n, /orders, pagos).

## Qué verá el visitante

Una pantalla centrada, sobre el fondo oscuro de la marca, con:

- Título: "Esta web está fuera de servicio, está en mantenimiento."
- Texto: "Esperamos poder resolver próximamente esta incidencia. Muchas gracias."

Nada más: ni menú, ni carrito, ni paneles internos.

## Detalle técnico

- Único archivo tocado: `src/App.tsx`.
- Cambiar la constante `MAINTENANCE_MODE` de `false` a `true` y actualizar el texto del bloque de mantenimiento con el mensaje nuevo.
- El bloque hace return antes del router, por lo que ninguna ruta se renderiza.
- No se toca base de datos, RLS, edge functions, i18n ni ningún componente del menú.

## Volver a la normalidad

Cuando me lo digas, pongo `MAINTENANCE_MODE = false` y la web vuelve exactamente al estado actual, sin pérdida de nada.

Recuerda publicar después del cambio para que se aplique en thaiiexpress.es.
