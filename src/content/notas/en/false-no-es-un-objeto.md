---
title: "When the back end returns false and JavaScript doesn't complain"
description: 'The app kicked drivers out of their current trip, intermittently. The cause: a response with data: false that went through the parser without a sound.'
date: 2026-10-20
lang: en
key: false-no-es-un-objeto
slug: false-is-not-an-object
tags: ['JavaScript', 'TypeScript', 'Mobile']
---

One of the worst kinds of bug: intermittent. Every now and then, in the middle of a trip, the driver app would kick them out of the tracking screen as if the trip had ended. No errors in the logs, no crashes.

## The response that looked valid

The endpoint returning the trip state did something like this:

```php
echo json_encode(['ok' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC)]);
```

When the query finds no row, `fetch()` doesn't return `null` or an empty array: it returns **`false`**. And that happened, for example, when the driver's session was lost and the per-user filter left the query empty. The response was `{ "ok": true, "data": false }`: "all good, and there's nothing here".

## JavaScript doesn't complain

In JavaScript, reading a property of `false` **doesn't throw**: it returns `undefined`.

```js
const res = { ok: true, data: false };

const trip = { state: Number(res.data.state) }; // NaN, no error at all

if (![1, 2, 3].includes(trip.state)) {
  closeTrip(); // "not in progress → the trip is over"
}
```

The parser built a valid-looking object with state `NaN`. And the screen decided that anything not "in progress" was a closed trip.

## Two fixes, two lessons

**1. Validate the shape before reading fields.** If the response doesn't carry an object, that's an error, not data:

```ts
function requireTripRow(data: unknown): TripRow {
  if (!data || typeof data !== 'object') throw new Error('Trip row missing');
  return data as TripRow;
}
```

With TanStack Query, throwing keeps the last good data and retries on its own. The driver never notices.

**2. Destructive decisions only from an explicit list.** Instead of "anything not in progress closes the trip", the trip now closes only if its state is in the list of final states. Anything unknown closes nothing.

## What I took away

- `ok: true` doesn't guarantee that `data` is what you expect.
- TypeScript types validate nothing at runtime: whatever comes over the network has to be checked.
- For destructive actions, allow only what you know and reject everything else.
