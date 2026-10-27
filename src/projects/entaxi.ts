import type { Project } from './types';

export const entaxi: Project = {
  key: 'entaxi',
  diagram: {
    height: 540,
    mobileHeight: 350,
    nodes: [
      { id: 'pass', label: 'Pasajeros', icon: 'siCapacitor', at: [110, 190], m: [60, 40] },
      { id: 'admin', label: 'Administración', short: 'Admin', icon: 'siFramework7', at: [110, 340], m: [180, 40] },
      { id: 'driver', label: 'App chofer', icon: 'siReact', at: [620, 480], m: [300, 40], core: true },
      { id: 'traefik', label: 'Traefik', icon: 'siTraefikproxy', at: [370, 190], m: [180, 130] },
      { id: 'server', label: 'entaxi_server', icon: 'siSocketdotio', at: [620, 190], m: [180, 220], core: true },
      { id: 'redis', label: 'Redis', icon: 'siRedis', at: [860, 190], m: [300, 220] },
      { id: 'fcm', label: 'Firebase', icon: 'siFirebase', at: [620, 70], m: [180, 310] },
      { id: 'php', label: 'PHP legacy', icon: 'siPhp', at: [370, 340], m: [60, 130] },
      { id: 'mysql', label: 'MySQL', icon: 'siMysql', at: [860, 340], m: [60, 220] },
      { id: 'proxy', label: 'Backend Node', short: 'Node', icon: 'siNodedotjs', at: [370, 480], m: [300, 130], core: true },
      { id: 'traccar', label: 'Traccar', icon: 'siTraccar', at: [860, 480] },
    ],
    edges: [
      { id: 'pt', from: 'pass', to: 'traefik' },
      { id: 'at', from: 'admin', to: 'traefik' },
      { id: 'dt', from: 'driver', to: 'traefik' },
      { id: 'ts', from: 'traefik', to: 'server' },
      { id: 'sr', from: 'server', to: 'redis' },
      { id: 'sf', from: 'server', to: 'fcm', dashed: true },
      { id: 'sm', from: 'server', to: 'mysql' },
      { id: 'pph', from: 'pass', to: 'php' },
      { id: 'aph', from: 'admin', to: 'php' },
      { id: 'pm', from: 'php', to: 'mysql' },
      { id: 'dp', from: 'driver', to: 'proxy' },
      { id: 'pp', from: 'proxy', to: 'php', wideOnly: true },
      { id: 'dg', from: 'driver', to: 'traccar' },
    ],
    flow: [
      ['pt', 'ts'],
      ['sr'],
      ['sm'],
      ['-ts', '-dt', 'sf'],
      ['dt', 'ts', 'sr'],
      ['sm', '-ts', '-at'],
      ['dg', '-ts', '-pt'],
      ['pph', 'aph', 'pm'],
      ['dp', 'pp', 'pm'],
    ],
  },
  text: {
    es: {
      slug: 'entaxi',
      meta: {
        title: 'Entaxi: app de taxis en tiempo real con React Native y Socket.IO — Martín Toledo',
        description:
          'Cómo funciona Entaxi por dentro: la app de choferes en React Native, las webs de pasajeros y administración, el servidor de viajes en tiempo real con Socket.IO y Redis, y el backend PHP legacy.',
      },
      kicker: 'Entaxi',
      title: 'Una plataforma de taxis en tiempo real',
      lead: 'Pasajeros, administración y choferes, conectados en vivo: la app nativa de choferes, las webs que siguen hablando con un backend legacy y el servidor que asigna los viajes por sockets.',
      facts: [
        { k: 'Rol', v: 'Líder técnico; hice la app de choferes' },
        { k: 'Escala', v: '~500 choferes · miles de viajes por mes' },
        { k: 'Stack', v: 'React Native · Node · Socket.IO · Redis' },
        { k: 'Estado', v: 'En producción, expandiéndose a San Juan' },
      ],
      sections: [
        {
          h: 'Tres aplicaciones, un mismo sistema',
          p: [
            'Los pasajeros piden el viaje desde una web o desde la app de Play Store, que es esa misma web empaquetada con Capacitor. La administración (la central) trabaja desde otra web, donde ve los móviles y los viajes en tiempo real. Los choferes usan una app nativa en React Native.',
            'Las dos webs hablan directo con el backend PHP legacy, que sigue atendiendo todo lo que no es tiempo real. Lo que pasa en vivo (pedidos, ofertas, posiciones) va por sockets a entaxi_server.',
          ],
        },
        {
          h: 'Cómo llegamos a una app nativa',
          p: [
            'En la empresa nadie había hecho una app nativa, y la decisión fue no sumar código nativo: si quien lo escribía se iba, nadie podría seguirlo. Era una preocupación razonable, sobre todo en un momento en que la IA recién empezaba a ayudar a programar. Yo hacía poco que trabajaba y fui aprendiendo con cada limitación.',
            'La app del chofer empezó siendo la web, instalada como PWA. El problema apareció enseguida: una web no puede mandar el GPS con la pantalla bloqueada. Primero lo resolvimos modificando en Kotlin la app de Traccar, que sí manda el GPS en segundo plano, para abrir la web desde ahí y enlazar las dos aplicaciones. Funcionó, pero eran dos apps para instalar, configurar y mantener vivas. Al final unificamos todo en una sola app nativa en React Native, con el manejo del hardware mucho más fino.',
            'Un backend Node en TypeScript hace de proxy entre la app nativa y el PHP: normaliza las respuestas, reutiliza la sesión de PHP y nos deja pasar comandos a Node de a uno, sin reescribir todo de golpe.',
          ],
        },
        {
          h: 'entaxi_server: los viajes en tiempo real',
          p: [
            'Pedir un viaje, ofrecérselo a un chofer y avisarle al pasajero cuando acepta pasa por entaxi_server, un servidor Node con Express y Socket.IO. Hoy corren dos instancias detrás de Traefik, y ahí aparece el problema clásico: dos instancias pueden querer darle el mismo chofer a dos viajes distintos.',
            'La solución es que el estado compartido viva en Redis. El adaptador de Socket.IO para Redis hace que un evento llegue aunque el destinatario esté conectado a la otra instancia. Los locks con TTL garantizan que un viaje y un chofer se asignen una sola vez, y las colas de BullMQ manejan los reintentos y los tiempos de espera, así sobreviven a un reinicio. Una máquina de estados define qué transiciones del viaje son válidas.',
            'Lidero técnicamente este servidor y conozco su funcionamiento de punta a punta. El paso a varias instancias lo implementó otro desarrollador del equipo; mi parte estuvo en el despliegue con Docker y Traefik, las notificaciones y la integración con la app.',
          ],
        },
        {
          h: 'La central, en vivo y sin trabarse',
          p: [
            'La administración también está conectada por socket: así ve moverse los móviles en el mapa sin recargar. Al principio, cada máquina de la central calculaba por su cuenta las consultas pesadas (viajes pendientes, estado de la flota), y con varias pantallas abiertas eso se notaba en todas.',
            'Pasamos esas consultas al servidor: se calculan una vez y se reparten por socket a todos los administradores. Además mejoramos cómo se dibujan los móviles y las zonas en el mapa, y cacheamos las consultas recurrentes que casi no cambian.',
          ],
        },
      ],
      related: {
        kicker: 'Nota técnica',
        title: 'De una web a una app nativa, en tres pasos',
        href: '/notas/de-una-web-a-una-app-nativa/',
      },
      diagram: {
        title: 'Cómo viaja un pedido',
        text: 'El recorrido de un viaje, desde que el pasajero lo pide hasta que el chofer cobra, y cómo lo sigue la central. En naranja, las piezas que construí o lidero.',
        sub: {
          pass: 'web o app (Capacitor)',
          admin: 'web de la central',
          driver: 'React Native',
          traefik: 'balanceo · sticky',
          server: 'Socket.IO · ×2',
          redis: 'locks y colas',
          fcm: 'push',
          php: 'API de comandos',
          mysql: 'datos de viajes',
          proxy: 'proxy TypeScript',
          traccar: 'GPS',
        },
        edges: { pt: 'Socket.IO', ts: 'sticky', sr: 'pub/sub', sf: 'si no hay socket', sm: 'SQL', aph: 'HTTP', pm: 'SQL', dp: 'HTTPS', pp: 'sesión PHP', dg: 'OsmAnd' },
        flow: [
          'El pasajero pide un viaje desde la web o la app, por Socket.IO. Traefik lo manda a una de las dos instancias de entaxi_server.',
          'La solicitud queda en Redis. El servidor reserva al chofer con un SET NX y toma dos locks, uno del viaje y otro del chofer, para que la otra instancia no lo asigne al mismo tiempo.',
          'Busca choferes activos en la parada o en la zona, filtrando por los tipos de servicio que acepta cada uno, y registra la asignación en MySQL.',
          'Le ofrece el viaje al chofer: por socket si está conectado (el adaptador de Redis lo encuentra en cualquier instancia) o por push si no.',
          'El chofer acepta. Un lock de 30 segundos descarta los toques duplicados y la máquina de estados solo permite pasar de pendiente a aceptado. Si rechaza o no responde, una tarea de BullMQ reinicia la búsqueda.',
          'La central ve todo en vivo por socket. Las consultas pesadas las hace el servidor una sola vez y las reparte a todos los administradores, en lugar de que cada máquina las calcule.',
          'Durante el viaje, un módulo nativo en Kotlin manda el GPS a Traccar desde una cola SQLite, y la posición le llega al pasajero por socket.',
          'Lo que no es tiempo real (cuentas, configuración, reportes) las webs de pasajeros y de la central lo piden directo al PHP legacy.',
          'Al cobrar, la app del chofer pasa por el backend Node, que traduce al PHP legacy. El cobro es idempotente: un reintento nunca cobra dos veces.',
        ],
      },
      stack: [
        {
          group: 'App de choferes',
          items: [
            { name: 'React Native', icon: 'siReact', role: 'App nativa con TypeScript, builds por marca (una por cliente)' },
            { name: 'MapLibre', icon: 'siMaplibre', role: 'Mapa en tiempo real' },
            { name: 'Kotlin', icon: 'siKotlin', role: 'Módulo GPS nativo en un proceso propio, con filtro de Kalman' },
            { name: 'SQLite', icon: 'siSqlite', role: 'Cola de GPS y taxímetro sin conexión' },
            { name: 'Zustand + TanStack Query', icon: 'siReactquery', role: 'Estado y datos del servidor' },
            { name: 'Sentry', icon: 'siSentry', role: 'Errores con source maps por versión' },
          ],
        },
        {
          group: 'Webs de pasajeros y central',
          items: [
            { name: 'Framework7', icon: 'siFramework7', role: 'Web del pasajero y panel de la central' },
            { name: 'Capacitor', icon: 'siCapacitor', role: 'La web del pasajero, publicada en Play Store' },
            { name: 'OpenLayers', icon: 'siOpenlayers', role: 'Mapa de la central con los móviles en vivo' },
          ],
        },
        {
          group: 'Tiempo real',
          items: [
            { name: 'Socket.IO', icon: 'siSocketdotio', role: 'Pedidos, ofertas, posiciones y datos de la central' },
            { name: 'Redis', icon: 'siRedis', role: 'Adaptador entre instancias, locks y reservas' },
            { name: 'BullMQ', role: 'Reintentos y tiempos de espera que sobreviven reinicios' },
            { name: 'Firebase + Web Push', icon: 'siFirebase', role: 'Avisos cuando el chofer no tiene socket' },
          ],
        },
        {
          group: 'Backend e infraestructura',
          items: [
            { name: 'Node.js + TypeScript', icon: 'siNodedotjs', role: 'Proxy entre la app y el legacy, con caché' },
            { name: 'PHP + MySQL', icon: 'siPhp', role: 'API legacy de las webs, viajes, choferes y cobros' },
            { name: 'Mercado Pago', icon: 'siMercadopago', role: 'Pagos de cuotas y de viajes' },
            { name: 'Traefik + Docker', icon: 'siTraefikproxy', role: 'Balanceo entre instancias, un stack por cliente' },
            { name: 'Traccar', icon: 'siTraccar', role: 'Posiciones GPS de la flota' },
          ],
        },
      ],
      built: {
        h: 'Qué construí',
        items: [
          'La app de choferes completa en React Native: mapa en tiempo real, ciclo del viaje por socket, cobro y calificación.',
          'Antes de eso, el puente entre la web y Traccar: la app de Traccar modificada en Kotlin para abrir la web y mandar el GPS en segundo plano.',
          'Un módulo GPS nativo en Kotlin que sobrevive en segundo plano, con una cola SQLite que garantiza el orden de los puntos hacia Traccar.',
          'Modo offline con SQLite para el taxímetro, pensado para municipios sin central, con el mismo cálculo que el servidor.',
          'Una sola base de código con builds por marca publicadas en Google Play.',
          'El backend Node que hace de proxy al PHP legacy y permite migrar comandos de a uno.',
          'En entaxi_server: el despliegue con Docker y Traefik, y el router que elige entre push nativo y Web Push.',
        ],
      },
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'Calcular una vez, repartir a todos',
            d: 'Si diez pantallas de la central hacen la misma consulta pesada, el servidor puede hacerla una vez y mandarla por socket. Menos carga en cada máquina y en la base.',
          },
          {
            t: 'Las restricciones también ordenan',
            d: 'No poder usar código nativo nos obligó a avanzar de a pasos: PWA, después Traccar enlazado, después la app nativa. Cada paso resolvió el problema más urgente con lo que el equipo podía sostener.',
          },
          {
            t: 'En la calle, la red falla',
            d: 'Una respuesta perdida no significa que la operación falló. El cobro responde "ya cobrado" si se reintenta, y ante la duda preferimos perder una comisión antes que cobrarla dos veces.',
          },
          {
            t: 'Con dos instancias, la memoria no alcanza',
            d: 'Un mutex en memoria solo protege a su proceso. Los locks en Redis con TTL se liberan solos si una instancia se cae, y cada uno lleva un token para que nadie borre el lock de otro.',
          },
        ],
      },
      links: [{ label: 'cbataxi.com', href: 'https://cbataxi.com' }],
    },
    en: {
      slug: 'entaxi',
      meta: {
        title: 'Entaxi: a real-time taxi platform with React Native and Socket.IO — Martín Toledo',
        description:
          'How Entaxi works inside: the React Native driver app, the passenger and dispatch web apps, the real-time trip server with Socket.IO and Redis, and the legacy PHP backend.',
      },
      kicker: 'Entaxi',
      title: 'A real-time taxi platform',
      lead: 'Passengers, dispatch and drivers, connected live: the native driver app, the web apps that still talk to a legacy backend and the server that dispatches trips over sockets.',
      facts: [
        { k: 'Role', v: 'Tech lead; built the driver app' },
        { k: 'Scale', v: '~500 drivers · thousands of trips a month' },
        { k: 'Stack', v: 'React Native · Node · Socket.IO · Redis' },
        { k: 'Status', v: 'In production, expanding to San Juan' },
      ],
      sections: [
        {
          h: 'Three apps, one system',
          p: [
            'Passengers request trips from a web app or from the Play Store app, which is that same web app packaged with Capacitor. Dispatch works from another web app, where it sees vehicles and trips in real time. Drivers use a native React Native app.',
            'Both web apps talk directly to the legacy PHP backend, which still handles everything that is not real time. What happens live (requests, offers, positions) goes over sockets to entaxi_server.',
          ],
        },
        {
          h: 'How we got to a native app',
          p: [
            'Nobody at the company had built a native app, and the decision was not to add native code: if whoever wrote it left, nobody could carry it on. It was a reasonable concern, especially at a time when AI was only starting to help with coding. I was fairly new to the job and learned with every limitation we hit.',
            'The driver app started as the web app, installed as a PWA. The problem showed up right away: a web app cannot send GPS with the screen locked. We first solved it by modifying the Traccar app in Kotlin, since it does send GPS in the background, so it would open the web app and link both apps together. It worked, but it meant two apps to install, configure and keep alive. In the end we unified everything into a single native React Native app, with much finer control of the hardware.',
            'A Node TypeScript backend acts as a proxy between the native app and PHP: it normalizes responses, reuses the PHP session and lets us move commands to Node one at a time, without rewriting everything at once.',
          ],
        },
        {
          h: 'entaxi_server: real-time trips',
          p: [
            'Requesting a trip, offering it to a driver and telling the passenger when it is accepted all go through entaxi_server, a Node server with Express and Socket.IO. Two instances run behind Traefik today, which brings the classic problem: both instances may try to give the same driver to two different trips.',
            'The answer is keeping shared state in Redis. The Socket.IO Redis adapter delivers an event even if the recipient is connected to the other instance. Locks with a TTL make sure a trip and a driver are assigned only once, and BullMQ queues handle retries and timeouts so they survive a restart. A state machine defines which trip transitions are valid.',
            'I lead this server technically and know how it works end to end. Another developer on the team implemented the move to multiple instances; my part was the Docker and Traefik deployment, notifications and the integration with the app.',
          ],
        },
        {
          h: 'Dispatch, live and responsive',
          p: [
            'Dispatch is connected over sockets too, so it sees vehicles moving on the map without reloading. At first, every dispatch machine ran the heavy queries on its own (pending trips, fleet status), and with several screens open every one of them felt it.',
            'We moved those queries to the server: they run once and are pushed over the socket to every dispatcher. We also improved how vehicles and zones are drawn on the map, and cached recurring queries that rarely change.',
          ],
        },
      ],
      related: {
        kicker: 'Technical note',
        title: 'From a web app to a native app, in three steps',
        href: '/en/notes/from-a-web-app-to-a-native-app/',
      },
      diagram: {
        title: 'How a request travels',
        text: 'The path of a trip, from the passenger request until the driver charges it, and how dispatch follows it. In orange, the pieces I built or lead.',
        sub: {
          pass: 'web or app (Capacitor)',
          admin: 'dispatch web app',
          driver: 'React Native',
          traefik: 'load balancing',
          server: 'Socket.IO · ×2',
          redis: 'locks and queues',
          fcm: 'push',
          php: 'command API',
          mysql: 'trip data',
          proxy: 'TypeScript proxy',
          traccar: 'GPS',
        },
        edges: { pt: 'Socket.IO', ts: 'sticky', sr: 'pub/sub', sf: 'if no socket', sm: 'SQL', aph: 'HTTP', pm: 'SQL', dp: 'HTTPS', pp: 'PHP session', dg: 'OsmAnd' },
        flow: [
          'The passenger requests a trip from the web or the app, over Socket.IO. Traefik sends it to one of the two entaxi_server instances.',
          'The request is stored in Redis. The server reserves the driver with SET NX and takes two locks, one for the trip and one for the driver, so the other instance cannot assign it at the same time.',
          'It looks for active drivers at the stop or in the zone, filtered by the service types each one accepts, and records the assignment in MySQL.',
          'It offers the trip to the driver: over the socket if connected (the Redis adapter finds them on any instance), or by push otherwise.',
          'The driver accepts. A 30-second lock discards duplicate taps and the state machine only allows pending → accepted. If the driver declines or does not answer, a BullMQ job restarts the search.',
          'Dispatch sees everything live over the socket. The server runs the heavy queries once and pushes them to every dispatcher, instead of each machine computing them.',
          'During the trip, a native Kotlin module sends GPS to Traccar from a SQLite queue, and the position reaches the passenger over the socket.',
          'What is not real time (accounts, settings, reports) the passenger and dispatch web apps request directly from the legacy PHP.',
          'To charge, the driver app goes through the Node backend, which translates to the legacy PHP. Charging is idempotent: a retry never charges twice.',
        ],
      },
      stack: [
        {
          group: 'Driver app',
          items: [
            { name: 'React Native', icon: 'siReact', role: 'Native app in TypeScript, one build per brand' },
            { name: 'MapLibre', icon: 'siMaplibre', role: 'Real-time map' },
            { name: 'Kotlin', icon: 'siKotlin', role: 'Native GPS module in its own process, with a Kalman filter' },
            { name: 'SQLite', icon: 'siSqlite', role: 'GPS queue and offline taximeter' },
            { name: 'Zustand + TanStack Query', icon: 'siReactquery', role: 'State and server data' },
            { name: 'Sentry', icon: 'siSentry', role: 'Errors with source maps per release' },
          ],
        },
        {
          group: 'Passenger and dispatch web apps',
          items: [
            { name: 'Framework7', icon: 'siFramework7', role: 'Passenger web app and dispatch panel' },
            { name: 'Capacitor', icon: 'siCapacitor', role: 'The passenger web app, published on Play Store' },
            { name: 'OpenLayers', icon: 'siOpenlayers', role: 'Dispatch map with live vehicles' },
          ],
        },
        {
          group: 'Real time',
          items: [
            { name: 'Socket.IO', icon: 'siSocketdotio', role: 'Requests, offers, positions and dispatch data' },
            { name: 'Redis', icon: 'siRedis', role: 'Cross-instance adapter, locks and reservations' },
            { name: 'BullMQ', role: 'Retries and timeouts that survive restarts' },
            { name: 'Firebase + Web Push', icon: 'siFirebase', role: 'Alerts when the driver has no socket' },
          ],
        },
        {
          group: 'Backend and infrastructure',
          items: [
            { name: 'Node.js + TypeScript', icon: 'siNodedotjs', role: 'Proxy between the app and the legacy, with caching' },
            { name: 'PHP + MySQL', icon: 'siPhp', role: 'Legacy API for the web apps, trips, drivers and payments' },
            { name: 'Mercado Pago', icon: 'siMercadopago', role: 'Fee and trip payments' },
            { name: 'Traefik + Docker', icon: 'siTraefikproxy', role: 'Load balancing, one stack per client' },
            { name: 'Traccar', icon: 'siTraccar', role: 'Fleet GPS positions' },
          ],
        },
      ],
      built: {
        h: 'What I built',
        items: [
          'The full React Native driver app: real-time map, socket-based trip lifecycle, payment and rating.',
          'Before that, the bridge between the web app and Traccar: the Traccar app modified in Kotlin to open the web app and send GPS in the background.',
          'A native Kotlin GPS module that survives in the background, with a SQLite queue that keeps points in order on their way to Traccar.',
          'An offline SQLite taximeter mode for towns without a dispatch center, using the same calculation as the server.',
          'A single codebase with per-brand builds published on Google Play.',
          'The Node backend that proxies the legacy PHP and lets us migrate commands one at a time.',
          'In entaxi_server: the Docker and Traefik deployment, and the router that picks native push or Web Push.',
        ],
      },
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: 'Compute once, share with everyone',
            d: 'If ten dispatch screens run the same heavy query, the server can run it once and push it over the socket. Less load on every machine and on the database.',
          },
          {
            t: 'Constraints also bring order',
            d: 'Not being able to use native code made us move in steps: PWA, then linked Traccar, then the native app. Each step solved the most urgent problem with what the team could maintain.',
          },
          {
            t: 'On the street, the network fails',
            d: 'A lost response does not mean the operation failed. Charging answers "already charged" on retry, and when in doubt we would rather lose a commission than charge it twice.',
          },
          {
            t: 'With two instances, memory is not enough',
            d: "An in-memory mutex only protects its own process. Redis locks with a TTL release themselves if an instance dies, and each one carries a token so nobody deletes someone else's lock.",
          },
        ],
      },
      links: [{ label: 'cbataxi.com', href: 'https://cbataxi.com' }],
    },
  },
};
