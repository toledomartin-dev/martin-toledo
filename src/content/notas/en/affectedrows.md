---
title: 'When affectedRows = 0 does not mean "not found"'
description: 'An upsert built from UPDATE + INSERT that silently duplicated rows, and why the fix absolutely needs a unique index.'
date: 2026-10-20
lang: en
key: affectedrows
slug: when-affectedrows-is-zero
tags: ['MySQL', 'PHP', 'Databases']
---

Repeated drivers started showing up in a taxi app's admin panel: the same driver two, three, even five times in the list. Nobody was inserting duplicates on purpose. The culprit was a pattern you have probably seen before.

## The pattern

Every time a driver's phone reports its push token, the back end stores it. If it exists, update it; if not, create it. The "obvious" version (simplified):

```php
$updated = $db->execute(
    'UPDATE device_tokens SET token = ?, updated_at = NOW() WHERE device_id = ?',
    [$token, $deviceId]
);

if ($updated === 0) {
    // "No row there: create it"
    $db->execute(
        'INSERT INTO device_tokens (device_id, token, updated_at) VALUES (?, ?, NOW())',
        [$deviceId, $token]
    );
}
```

It reads fine. The problem is what that `0` actually means.

## The trap

In MySQL, `PDOStatement::rowCount()` after an `UPDATE` returns the rows **changed**, not the rows **matched**. If the `UPDATE` finds the row but writes exactly the same values, MySQL doesn't count it: it returns `0`.

Here the only changing field was `updated_at = NOW()`, with one-second precision. If the same phone reported twice within the same second, the second `UPDATE` changed nothing, returned `0`, and the code concluded "the row doesn't exist" and inserted another one. Silently, one device ended up with five identical rows.

> There is a connection option, `PDO::MYSQL_ATTR_FOUND_ROWS`, that makes `rowCount()` count matched rows. But changing it affects every piece of code that already relies on the current behavior.

## Why it wasn't just cosmetic

The panel's list joined drivers to that table with a `LEFT JOIN` and no grouping. Every duplicate row multiplied the driver on screen. The duplicates never threw an error: they just kept multiplying, and the symptom showed up far away from the cause.

## The fix

A real, atomic upsert that doesn't interpret `affectedRows`:

```sql
-- First: clean up existing duplicates (otherwise the index can't be created)
ALTER TABLE device_tokens ADD UNIQUE KEY uq_device (device_id);
```

```php
$db->execute(
    'INSERT INTO device_tokens (device_id, token, updated_at) VALUES (?, ?, NOW())
     ON DUPLICATE KEY UPDATE token = VALUES(token), updated_at = NOW()',
    [$deviceId, $token]
);
```

The detail you can't forget: **`ON DUPLICATE KEY UPDATE` needs a unique index** on the conflict column. Without one there is no conflict to detect, and it inserts on every call: it duplicates even more than before.

## What I took away

- In MySQL, `affectedRows = 0` after an `UPDATE` can mean "nothing changed", not "not found".
- An upsert is one atomic statement plus a unique constraint, not two queries and an if.
- When you find a pattern like this once, search the whole codebase: it's almost never in just one place.
