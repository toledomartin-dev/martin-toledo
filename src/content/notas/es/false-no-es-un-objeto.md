---
title: 'Cuando el backend devuelve false y JavaScript no se queja'
description: 'La app sacaba al chofer del viaje en curso, de forma intermitente. La causa: una respuesta con data: false que pasaba por el parser sin hacer ruido.'
date: 2026-10-20
lang: es
key: false-no-es-un-objeto
slug: false-no-es-un-objeto
tags: ['JavaScript', 'TypeScript', 'Mobile']
---

Un bug de los peores: intermitente. De vez en cuando, en medio de un viaje, la app del chofer lo sacaba de la pantalla de seguimiento como si el viaje hubiera terminado. Sin errores en los logs, sin crashes.

## La respuesta que parecía válida

El endpoint que devuelve el estado del viaje hacía algo así:

```php
echo json_encode(['ok' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
```

Cuando la consulta no encuentra la fila, `fetch()` no devuelve `null` ni un array vacío: devuelve **`false`**. Y eso pasaba, por ejemplo, cuando la sesión del chofer se perdía y el filtro por usuario dejaba la consulta vacía. La respuesta era `{ "ok": true, "data": false }`: "todo bien, y acá no hay nada".

## JavaScript no se queja

En JavaScript, leer una propiedad de `false` **no tira un error**: devuelve `undefined`.

```js
const res = { ok: true, data: false };

const trip = { state: Number(res.data.state) }; // NaN, sin ningún error

if (![1, 2, 3].includes(trip.state)) {
  closeTrip(); // "no está en curso → el viaje terminó"
}
```

El parser armaba un objeto con aspecto válido y estado `NaN`. Y la pantalla decidía que todo lo que no fuera "en curso" era un viaje cerrado.

## Dos arreglos, dos lecciones

**1. Validar la forma antes de leer campos.** Si la respuesta no trae un objeto, eso es un error, no un dato:

```ts
function requireTripRow(data: unknown): TripRow {
  if (!data || typeof data !== 'object') throw new Error('Trip row missing');
  return data as TripRow;
}
```

Con TanStack Query, al tirar el error se conserva el último dato bueno y se reintenta solo. El chofer ni se entera.

**2. Las decisiones destructivas, solo con una lista explícita.** En vez de "todo lo que no sea en curso cierra el viaje", ahora el viaje se cierra únicamente si el estado está en la lista de estados finales. Lo desconocido no cierra nada.

## Lo que me llevo

- `ok: true` no garantiza que `data` sea lo que esperás.
- Los tipos de TypeScript no validan nada en tiempo de ejecución: lo que llega de la red hay que comprobarlo.
- Para acciones destructivas, permití solo lo conocido y rechazá todo lo demás.
