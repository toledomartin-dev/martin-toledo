---
title: 'De una web a una app nativa, en tres pasos'
description: 'La app de choferes empezó como una PWA, pasó por una app de Traccar modificada en Kotlin y terminó en React Native. Por qué cada paso tuvo sentido en su momento.'
date: 2026-10-27
lang: es
key: pwa-a-nativa
slug: de-una-web-a-una-app-nativa
tags: ['Mobile', 'Arquitectura', 'Android']
---

Una app de choferes de taxi pasa el día entero abierta y tiene que mandar la posición GPS todo el tiempo, también con la pantalla bloqueada. Hoy esa app es nativa, en React Native. No empezó así, y el camino explica más que el resultado.

## El punto de partida

En la empresa nadie había hecho una app nativa, y la decisión fue no sumar código nativo: si quien lo escribía se iba, nadie podría seguirlo y el proyecto quedaba a medias. Era una preocupación razonable. La IA recién empezaba a ayudar a programar, y yo hacía poco que trabajaba: estaba aprendiendo mientras construía.

Así que la regla era clara: todo en la web.

## Paso 1: la web, instalada como PWA

El chofer usaba la misma web que el resto del sistema, instalada en el celular como PWA. Para casi todo alcanzaba: ver el viaje, aceptarlo, cobrarlo.

El problema apareció enseguida. Cuando el chofer bloquea la pantalla o cambia de app, el navegador congela la página para ahorrar batería, y con ella el GPS. Android, además, cierra las pestañas en segundo plano cuando necesita memoria. Para una app que vive de la posición del auto, era un límite de fondo, no un detalle.

## Paso 2: dos apps enlazadas

Traccar Client, una app de código abierto en Kotlin, ya resolvía justamente eso: mandar el GPS en segundo plano de forma confiable. En lugar de escribir una app nativa desde cero, la modificamos para que abriera nuestra web desde adentro y enlazara las dos aplicaciones: Traccar mandaba la posición y la web hacía todo lo demás.

Funcionó, y por un buen tiempo. Pero tenía un costo que se notaba todos los días:

- Eran dos apps para instalar, configurar y dar permisos.
- Si el chofer cerraba una y no la otra, el sistema quedaba a medias.
- Cada error había que buscarlo en dos lugares.

## Paso 3: una sola app nativa

Con el sistema ya andando, el paso siguiente fue unificar todo en una sola app en React Native. La elección no fue casual: React Native se escribe en TypeScript, que el equipo ya conocía, y lo nativo de verdad quedó acotado a un módulo chico, el del GPS, en Kotlin. Eso respondía a la preocupación original: si alguien se va, el resto del código lo puede seguir cualquiera del equipo.

Con acceso directo al hardware, el GPS pasó a correr en su propio proceso, con una cola en SQLite que no pierde puntos sin señal, y el manejo de la batería, las notificaciones y el estado de la red dejó de depender de capas intermedias.

## Lo que me llevo

- **La restricción era razonable.** Respetarla nos hizo avanzar de a pasos, y cada paso resolvió el problema más urgente con lo que el equipo podía sostener.
- **Antes de escribir algo nativo, buscá quién ya lo resolvió.** Modificar Traccar nos dio GPS en segundo plano mucho antes de tener una app propia.
- **Lo nativo, acotado.** Un módulo chico y bien delimitado es mucho más fácil de mantener que una app entera en un lenguaje que el equipo no domina.
