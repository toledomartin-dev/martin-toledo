---
title: 'From a web app to a native app, in three steps'
description: 'The driver app started as a PWA, went through a Traccar app modified in Kotlin and ended up in React Native. Why each step made sense at the time.'
date: 2026-10-27
lang: en
key: pwa-a-nativa
slug: from-a-web-app-to-a-native-app
tags: ['Mobile', 'Architecture', 'Android']
---

A taxi driver app stays open all day and has to send its GPS position all the time, even with the screen locked. Today that app is native, built in React Native. It did not start that way, and the path explains more than the result.

## The starting point

Nobody at the company had built a native app, and the decision was not to add native code: if whoever wrote it left, nobody could carry it on and the project would be left half done. It was a reasonable concern. AI was only starting to help with coding, and I was fairly new to the job: I was learning while building.

So the rule was clear: everything on the web.

## Step 1: the web app, installed as a PWA

Drivers used the same web app as the rest of the system, installed on the phone as a PWA. For almost everything it was enough: seeing the trip, accepting it, charging it.

The problem showed up right away. When the driver locks the screen or switches apps, the browser freezes the page to save battery, and the GPS with it. Android also kills background tabs when it needs memory. For an app that lives on the car's position, it was a fundamental limit, not a detail.

## Step 2: two linked apps

Traccar Client, an open-source Kotlin app, already solved exactly that: sending GPS reliably in the background. Instead of writing a native app from scratch, we modified it to open our web app from inside and link the two apps together: Traccar sent the position and the web app did everything else.

It worked, and for quite a while. But it had a cost we felt every day:

- Two apps to install, configure and grant permissions to.
- If the driver closed one and not the other, the system was left half working.
- Every bug had to be hunted in two places.

## Step 3: a single native app

With the system already running, the next step was to unify everything into a single React Native app. The choice was deliberate: React Native is written in TypeScript, which the team already knew, and the truly native part stayed limited to one small module, the GPS one, in Kotlin. That answered the original concern: if someone leaves, anyone on the team can carry on with the rest of the code.

With direct hardware access, GPS moved to its own process, with a SQLite queue that never drops points without signal, and battery handling, notifications and network status stopped depending on intermediate layers.

## What I take away

- **The constraint was reasonable.** Respecting it made us move in steps, and each step solved the most urgent problem with what the team could maintain.
- **Before writing something native, look for who already solved it.** Modifying Traccar gave us background GPS long before we had our own app.
- **Keep native code small.** A small, well-bounded module is far easier to maintain than a whole app in a language the team doesn't know.
