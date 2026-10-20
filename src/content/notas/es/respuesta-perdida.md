---
title: 'Una respuesta perdida no es una operación fallida'
description: 'Choferes trabados con un viaje que ya estaba cobrado: cómo hicimos idempotentes los cambios de estado, y qué hacer con lo que no puede serlo.'
date: 2026-10-20
lang: es
key: respuesta-perdida
slug: una-respuesta-perdida
tags: ['Arquitectura', 'Mobile', 'Idempotencia']
---

Un chofer termina un viaje y toca "Cobrar". La app manda el pedido, el servidor marca el viaje como cobrado… y la respuesta nunca llega. Un túnel, un corte de señal, la app que pasó a segundo plano o un timeout de 20 segundos. Para la app, el pedido falló.

El chofer reintenta. El servidor busca el viaje **en estado "en curso"** para cobrarlo, no lo encuentra (ya está cobrado) y responde error. El chofer queda trabado frente a un viaje que ya está cerrado, y no hay forma de destrabarlo.

## La idea: que repetir no rompa nada

Una operación es **idempotente** si hacerla dos veces deja el mismo resultado que hacerla una. En la calle la red falla todo el tiempo, así que cada cambio de estado tiene que poder repetirse. Simplificado:

```php
$trip = $db->fetch('SELECT state FROM trips WHERE id = ? AND driver_id = ?', [$tripId, $driverId]);

if ($trip['state'] === 'paid') {
    // Ya estaba cobrado: el pedido anterior llegó, solo se perdió la respuesta
    releaseDriver($driverId);
    return ['ok' => true, 'alreadyPaid' => true];
}
```

Si el viaje ya está en el estado destino, el servidor responde que salió bien, sin volver a escribir nada.

## Segunda trampa: "responder ok" no alcanza

La primera versión de esa rama devolvía `ok` y nada más. Pero el camino normal, además de cobrar, **liberaba al chofer** para el próximo viaje. Si el intento anterior se cortó justo entre las dos cosas, el chofer quedaba "ocupado" con un viaje ya cobrado, y la app lo mandaba de nuevo a la pantalla de seguimiento, una y otra vez.

La regla: la rama de "ya estaba hecho" tiene que dejar el mundo **igual que el camino normal**. Hay que repetir los efectos secundarios que también son idempotentes. Liberar al chofer, por ejemplo, son dos `UPDATE` a valores fijos: hacerlos dos veces no cambia nada.

## Tercera trampa: lo que no se puede repetir

Al cobrar, el sistema también suma la comisión del viaje a la cuota del chofer. Esa suma **no es idempotente**: no guarda de qué viaje vino cada monto, así que repetirla le cobra la comisión dos veces.

Como el servidor no puede responder "¿ya la sumé?", la app se guarda la duda: si el pedido de comisión no terminó, marca el viaje localmente, y el reintento cierra el viaje **sin** volver a sumar. Elegimos explícitamente el error menos malo: **perder una comisión es preferible a cobrarla dos veces**.

La solución de fondo es sumar la comisión dentro de la misma operación que cobra el viaje, para que las dos cosas pasen juntas o ninguna.

## Lo que me llevo

- Diseñá cada cambio de estado asumiendo que la respuesta se puede perder.
- Idempotente no significa "devolver ok": significa dejar el sistema igual que el camino normal.
- Para lo que no puede repetirse, elegí a propósito qué error preferís, en lugar de dejar que lo elija el azar.
