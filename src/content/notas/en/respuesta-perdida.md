---
title: 'A lost response is not a failed operation'
description: 'Drivers stuck on a trip that was already paid: how we made state changes idempotent, and what to do with the parts that cannot be.'
date: 2026-10-20
lang: en
key: respuesta-perdida
slug: a-lost-response
tags: ['Architecture', 'Mobile', 'Idempotency']
---

A driver finishes a trip and taps "Charge". The app sends the request, the server marks the trip as paid… and the response never arrives. A tunnel, a dropped signal, the app going to the background, or a 20-second timeout. As far as the app knows, the request failed.

The driver retries. The server looks for the trip **in the "in progress" state** to charge it, doesn't find it (it's already paid) and returns an error. The driver is stuck in front of a trip that's already closed, with no way out.

## The idea: repeating must not break anything

An operation is **idempotent** if doing it twice leaves the same result as doing it once. On the street the network fails all the time, so every state change has to be safely repeatable. Simplified:

```php
$trip = $db->fetch('SELECT state FROM trips WHERE id = ? AND driver_id = ?', [$tripId, $driverId]);

if ($trip['state'] === 'paid') {
    // Already paid: the previous request arrived, only the response was lost
    releaseDriver($driverId);
    return ['ok' => true, 'alreadyPaid' => true];
}
```

If the trip is already in the target state, the server answers success without writing anything again.

## Second trap: "answering ok" is not enough

The first version of that branch returned `ok` and nothing else. But the normal path, besides charging, also **released the driver** for the next trip. If the previous attempt was cut right between the two, the driver stayed "busy" with a paid trip, and the app sent them back to the tracking screen over and over.

The rule: the "already done" branch has to leave the world **exactly like the normal path does**. You repeat the side effects that are idempotent too. Releasing the driver, for example, is two `UPDATE`s to fixed values: doing them twice changes nothing.

## Third trap: what can't be repeated

When charging, the system also adds the trip's commission to the driver's balance. That addition **is not idempotent**: it doesn't record which trip each amount came from, so repeating it charges the commission twice.

Since the server can't answer "did I already add it?", the app keeps the doubt itself: if the commission request didn't complete, it flags the trip locally, and the retry closes the trip **without** adding it again. We chose the lesser error on purpose: **losing a commission is better than charging it twice**.

The real fix is to add the commission inside the same operation that charges the trip, so both happen together or neither does.

## What I took away

- Design every state change assuming the response can be lost.
- Idempotent doesn't mean "return ok": it means leaving the system exactly as the normal path would.
- For what can't be repeated, choose on purpose which error you prefer, instead of letting chance choose.
