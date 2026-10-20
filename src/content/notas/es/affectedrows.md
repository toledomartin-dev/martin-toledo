---
title: 'Cuando affectedRows = 0 no significa «no existe»'
description: 'Un upsert armado con UPDATE + INSERT que duplicaba filas en silencio, y por qué la solución necesita sí o sí un índice único.'
date: 2026-10-20
lang: es
key: affectedrows
slug: cuando-affectedrows-es-cero
tags: ['MySQL', 'PHP', 'Bases de datos']
---

En el panel de una app de taxis empezaron a aparecer choferes repetidos: el mismo chofer, dos, tres, hasta cinco veces en el listado. Nadie insertaba duplicados a propósito. El culpable era un patrón que seguro viste alguna vez.

## El patrón

Cada vez que el celular de un chofer reporta su token de notificaciones, el backend lo guarda. Si ya existe, lo actualiza; si no, lo crea. La versión "obvia" (simplificada):

```php
$updated = $db->execute(
    'UPDATE device_tokens SET token = ?, updated_at = NOW() WHERE device_id = ?',
    [$token, $deviceId]
);

if ($updated === 0) {
    // "No había fila: la creamos"
    $db->execute(
        'INSERT INTO device_tokens (device_id, token, updated_at) VALUES (?, ?, NOW())',
        [$deviceId, $token]
    );
}
```

Se lee bien. El problema es lo que significa ese `0`.

## La trampa

En MySQL, `PDOStatement::rowCount()` después de un `UPDATE` devuelve las filas **modificadas**, no las **encontradas**. Si el `UPDATE` encuentra la fila pero le escribe exactamente los mismos valores, MySQL no la cuenta: devuelve `0`.

Acá el único campo que cambiaba era `updated_at = NOW()`, con precisión de segundos. Si el mismo celular reportaba dos veces dentro del mismo segundo, el segundo `UPDATE` no cambiaba nada, devolvía `0`, y el código entendía "no existe la fila" e insertaba otra. Así, en silencio, un dispositivo terminaba con cinco filas idénticas.

> Hay una opción de conexión, `PDO::MYSQL_ATTR_FOUND_ROWS`, que hace que `rowCount()` cuente las filas encontradas. Pero cambiarla afecta a todo el código que ya depende del comportamiento actual.

## Por qué no era solo cosmético

El listado del panel cruzaba los choferes con esa tabla con un `LEFT JOIN` sin agrupar. Cada fila duplicada multiplicaba al chofer en pantalla. Los duplicados no tiraban ningún error: simplemente se iban multiplicando, y el síntoma aparecía lejos de la causa.

## La solución

Un upsert de verdad, atómico, que no interpreta `affectedRows`:

```sql
-- Antes: limpiar los duplicados existentes (si no, el índice no se puede crear)
ALTER TABLE device_tokens ADD UNIQUE KEY uq_device (device_id);
```

```php
$db->execute(
    'INSERT INTO device_tokens (device_id, token, updated_at) VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE token = VALUES(token), updated_at = NOW()',
    [$deviceId, $token]
);
```

El detalle que no se puede olvidar: **`ON DUPLICATE KEY UPDATE` necesita un índice único** sobre la columna de conflicto. Sin él no hay conflicto que detectar, e inserta en cada llamada: duplica más que antes.

## Lo que me llevo

- En MySQL, `affectedRows = 0` después de un `UPDATE` puede significar "no cambió nada", no "no existe".
- Un upsert se resuelve con una sola sentencia atómica más una restricción única, no con dos consultas y una condición.
- Cuando encontrás un patrón así una vez, buscalo en todo el código: casi nunca está en un solo lugar.
