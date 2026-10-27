import type { Project } from './types';

export const bicicba: Project = {
  key: 'bicicba',
  diagram: {
    height: 490,
    mobileHeight: 270,
    nodes: [
      { id: 'rider', label: 'App del usuario', short: 'Usuario', icon: 'siPwa', at: [110, 90], m: [60, 40] },
      { id: 'op', label: 'Operador', at: [110, 260], m: [60, 135] },
      { id: 'admin', label: 'Administración', short: 'Admin', icon: 'siBootstrap', at: [110, 420], m: [60, 230] },
      { id: 'vedi', label: 'VeDi', at: [480, 90], m: [180, 40] },
      { id: 'php', label: 'Web PHP', icon: 'siPhp', at: [480, 260], m: [180, 135], core: true },
      { id: 'map', label: 'Mapa en vivo', short: 'Mapa', icon: 'siOpenlayers', at: [480, 420], m: [180, 230], core: true },
      { id: 'iot', label: 'Rastreadores', short: 'GPS', at: [850, 90], m: [300, 40] },
      { id: 'mysql', label: 'MySQL', icon: 'siMysql', at: [850, 260], m: [300, 135] },
      { id: 'reports', label: 'Reportes', icon: 'siChartdotjs', at: [850, 420], m: [300, 230], core: true },
    ],
    edges: [
      { id: 'rp', from: 'rider', to: 'php' },
      { id: 'op', from: 'op', to: 'php' },
      { id: 'ap', from: 'admin', to: 'php' },
      { id: 'pv', from: 'php', to: 'vedi' },
      { id: 'pm', from: 'php', to: 'mysql' },
      { id: 'im', from: 'iot', to: 'mysql', dashed: true },
      { id: 'pl', from: 'php', to: 'map' },
      { id: 'pr', from: 'php', to: 'reports' },
    ],
    flow: [['rp', 'pv'], ['op', 'pm'], ['pm'], ['im'], ['pl', '-pm'], ['ap', 'pm'], ['pr', '-pm']],
  },
  text: {
    es: {
      slug: 'bicicba',
      meta: {
        title: 'BiciCba: el sistema de bicicletas públicas de Córdoba — Martín Toledo',
        description:
          'El sistema de bicicletas públicas de Córdoba por dentro: préstamos con QR, mapa en vivo de la flota con GPS y once reportes. PHP, MySQL, OpenLayers y Chart.js.',
      },
      kicker: 'BiciCba',
      title: 'Las bicis públicas de Córdoba, por dentro',
      lead: 'Mi primer proyecto, de punta a punta: el sitio, la app con la que el usuario retira una bici, los paneles con los que los operadores la prestan y la reciben en cada estación, el mapa de la flota y los reportes con los que el sistema se mide.',
      facts: [
        { k: 'Rol', v: 'Desarrollo completo, solo' },
        { k: 'Stack', v: 'PHP · MySQL · OpenLayers' },
        { k: 'Reportes', v: '11, con exportación' },
        { k: 'Estado', v: 'En producción' },
      ],
      sections: [
        {
          h: 'El sistema',
          p: [
            'El usuario entra con su cuenta de ciudadano digital (VeDi) y genera un QR para retirar una bici. El operador de la estación lo escanea, el sistema verifica que el usuario esté habilitado, que no tenga sanciones y que la estación todavía esté abierta para un viaje completo, y registra el préstamo. A la vuelta, el operador anota la devolución y si la bici volvió con algún daño.',
            'Detrás hay movimientos de bicis entre estaciones y talleres, validación de los documentos de cada usuario, sanciones con vencimiento y la configuración de toda la flota.',
            'Lo desarrollé de punta a punta. Empezó antes de que la empresa usara Git, así que el código se subió al repositorio tiempo después; hoy el equipo lo mantiene con Docker y deploys por tag.',
          ],
        },
        {
          h: 'Un QR que no dice quién sos',
          p: [
            'El QR no lleva datos personales: es un token aleatorio que vence a los 15 minutos. El operador lo lee con la cámara del celular desde el navegador, y recién el servidor sabe a quién pertenece y muestra la foto del documento para confirmarlo.',
          ],
        },
        {
          h: 'Bicis en un sistema de rastreo de autos',
          p: [
            'La empresa ya tenía un esquema de rastreo de flotas para colectivos. En lugar de armar otro, cada bici entra en esas mismas tablas con un número de serie propio, así el historial de posiciones y las herramientas existentes funcionan sin cambios. Un proceso programado trae las posiciones de los rastreadores, las empareja por IMEI y descarta las que no cambiaron.',
          ],
        },
        {
          h: 'Permisos por pantalla',
          p: [
            'Cada acción del sistema tiene un código de permiso que se verifica en el servidor antes de ejecutarla, y el menú solo muestra lo que cada uno puede usar. Los permisos se heredan por grupo y se pueden dar por un tiempo limitado, así un operador de estación, un supervisor y la administración comparten la misma aplicación con accesos distintos.',
          ],
        },
      ],
      diagram: {
        title: 'Una bici, de la estación al reporte',
        text: 'Cómo un préstamo en una estación termina en el mapa y en los reportes. En naranja, lo que construí.',
        sub: {
          rider: 'QR de 15 minutos',
          op: 'escanea y presta',
          admin: 'permisos por acción',
          vedi: 'ciudadano digital',
          php: 'paneles y API',
          map: 'OpenLayers · 35 s',
          iot: 'GPS por IMEI',
          mysql: 'viajes y usuarios',
          reports: 'Chart.js · PDF · Excel',
        },
        edges: { rp: 'QR', op: 'préstamo', pv: 'login', pm: 'SQL', im: 'cada pocos min', pl: 'JSON', pr: 'consultas' },
        flow: [
          'El usuario entra con su cuenta de ciudadano digital y genera un QR: un token aleatorio que vence en 15 minutos, sin datos personales.',
          'El operador lo escanea desde el navegador. El servidor verifica que el usuario esté habilitado, que no tenga sanciones y que la estación cierre después del tiempo mínimo de viaje.',
          'El préstamo queda registrado con la estación, la ubicación y la devolución esperada, y la bici pasa a "en viaje".',
          'Un proceso programado trae las posiciones de los rastreadores, las empareja con cada bici por IMEI y las guarda en el esquema de rastreo de flotas que la empresa ya usaba.',
          'El mapa en vivo se actualiza cada 35 segundos: dónde está cada bici, quién la lleva, su batería y si el GPS dejó de reportar.',
          'La administración recibe devoluciones con daños, mueve bicis entre estaciones y talleres (en una sola transacción), valida usuarios y aplica sanciones.',
          'Once reportes cierran el ciclo: viajes, disponibilidad por estación, uso por hora, calificaciones y sancionados, con exportación a PDF, Excel y CSV.',
        ],
      },
      stack: [
        {
          group: 'Aplicación',
          items: [
            { name: 'PHP', icon: 'siPhp', role: 'Paneles y endpoints por módulo, que responden JSON' },
            { name: 'MySQL', icon: 'siMysql', role: 'Préstamos, movimientos, usuarios, sanciones y posiciones' },
            { name: 'JavaScript', icon: 'siJavascript', role: 'Interfaz sin frameworks, con fetch a los endpoints' },
            { name: 'Bootstrap 5', icon: 'siBootstrap', role: 'Interfaz con modo oscuro, instalable como PWA' },
          ],
        },
        {
          group: 'QR, mapas y datos',
          items: [
            { name: 'html5-qrcode + QRious', role: 'Leer y generar los QR desde el navegador' },
            { name: 'OpenLayers', icon: 'siOpenlayers', role: 'Mapa en vivo de bicis y estaciones' },
            { name: 'Chart.js', icon: 'siChartdotjs', role: 'Gráficos de los reportes' },
            { name: 'jsPDF', role: 'Exportación de las tablas a PDF' },
          ],
        },
        {
          group: 'Integraciones',
          items: [
            { name: 'VeDi', role: 'Login con la cuenta de ciudadano digital de Córdoba' },
            { name: 'API de rastreadores', role: 'Posiciones y batería de cada bici' },
          ],
        },
        {
          group: 'Despliegue',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'Imagen PHP con sesiones persistentes' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Deploy por tag con rollback' },
          ],
        },
      ],
      built: {
        h: 'Qué construí',
        items: [
          'El préstamo y la devolución con QR, con las validaciones de usuario, sanciones y horario de la estación.',
          'El mapa en vivo de la flota y la integración con los rastreadores GPS.',
          'Los once reportes, con un componente de tabla propio que busca, filtra por fecha, ordena, pagina y exporta.',
          'La gestión de estaciones, talleres, bicis, usuarios, sanciones y permisos.',
          'La app del usuario: historial de viajes, estadísticas personales, calificaciones y estaciones en el mapa.',
        ],
      },
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'El GPS miente un poco',
            d: 'Para saber cuántos kilómetros hizo cada viaje, el sistema recorre sus puntos y descarta los saltos menores a 50 metros y los que implicarían más de 144 km/h. El resultado se guarda la primera vez y después no se recalcula.',
          },
          {
            t: 'Reutilizar antes de construir',
            d: 'Meter las bicis en el esquema de rastreo de los colectivos nos dio historial de posiciones y herramientas listas desde el primer día.',
          },
          {
            t: 'Los reportes son el producto',
            d: 'Para quien administra el sistema, el valor está en los números: cuántos viajes, en qué estaciones, cuánto CO₂ se evitó. Son los mismos datos que se ven en el inicio de este sitio.',
          },
          {
            t: 'El primer cliente enseña todo',
            d: 'Fue mi primer proyecto en producción: relevar con el cliente, entender una operación que pasa en la calle y convertirla en pantallas que un operador usa todo el día.',
          },
        ],
      },
      links: [{ label: 'bicicba.com', href: 'https://bicicba.com' }],
    },
    en: {
      slug: 'bicicba',
      meta: {
        title: "BiciCba: Córdoba's public bike-sharing system — Martín Toledo",
        description:
          "Córdoba's public bike-sharing system from the inside: QR rentals, a live GPS fleet map and eleven reports. PHP, MySQL, OpenLayers and Chart.js.",
      },
      kicker: 'BiciCba',
      title: "Córdoba's public bikes, from the inside",
      lead: 'My first project, end to end: the website, the app riders use to pick up a bike, the panels operators use to lend and receive bikes at each station, the fleet map and the reports the system is measured by.',
      facts: [
        { k: 'Role', v: 'Built it all, solo' },
        { k: 'Stack', v: 'PHP · MySQL · OpenLayers' },
        { k: 'Reports', v: '11, with export' },
        { k: 'Status', v: 'In production' },
      ],
      sections: [
        {
          h: 'The system',
          p: [
            "Riders log in with their digital citizen account (VeDi) and generate a QR code to pick up a bike. The station operator scans it, the system checks that the rider is enabled, has no penalties and that the station is still open long enough for a full trip, and records the rental. On return, the operator logs it and notes any damage.",
            "Behind that there are bike movements between stations and workshops, review of each rider's documents, penalties with an end date and the configuration of the whole fleet.",
            'I built it end to end. It started before the company used Git, so the code reached the repository later; today the team maintains it with Docker and tag deploys.',
          ],
        },
        {
          h: "A QR code that doesn't say who you are",
          p: [
            "The QR code carries no personal data: it is a random token that expires after 15 minutes. The operator reads it with the phone camera from the browser, and only the server knows who it belongs to and shows the rider's ID photo to confirm.",
          ],
        },
        {
          h: 'Bikes in a vehicle-tracking system',
          p: [
            'The company already had a fleet-tracking schema for buses. Instead of building another one, every bike goes into those same tables with its own serial number, so position history and the existing tools work unchanged. A scheduled job pulls positions from the trackers, matches them by IMEI and skips the ones that did not change.',
          ],
        },
        {
          h: 'Permissions per screen',
          p: [
            'Every action in the system has a permission code checked on the server before it runs, and the menu only shows what each person can use. Permissions are inherited by group and can be granted for a limited time, so a station operator, a supervisor and administration share the same app with different access.',
          ],
        },
      ],
      diagram: {
        title: 'A bike, from the station to the report',
        text: 'How a rental at a station ends up on the map and in the reports. In orange, what I built.',
        sub: {
          rider: '15-minute QR code',
          op: 'scans and lends',
          admin: 'per-action permissions',
          vedi: 'digital citizen',
          php: 'panels and API',
          map: 'OpenLayers · 35 s',
          iot: 'GPS by IMEI',
          mysql: 'trips and users',
          reports: 'Chart.js · PDF · Excel',
        },
        edges: { rp: 'QR', op: 'rental', pv: 'login', pm: 'SQL', im: 'every few min', pl: 'JSON', pr: 'queries' },
        flow: [
          'The rider logs in with their digital citizen account and generates a QR code: a random token that expires in 15 minutes, with no personal data.',
          'The operator scans it from the browser. The server checks that the rider is enabled, has no penalties and that the station closes after the minimum trip time.',
          'The rental is recorded with the station, the location and the expected return, and the bike switches to "on a trip".',
          'A scheduled job pulls positions from the trackers, matches each one to a bike by IMEI and stores it in the fleet-tracking schema the company already used.',
          'The live map refreshes every 35 seconds: where each bike is, who has it, its battery and whether the GPS stopped reporting.',
          'Administration receives returns with damage, moves bikes between stations and workshops (in a single transaction), validates riders and applies penalties.',
          'Eleven reports close the loop: trips, availability per station, usage by hour, ratings and penalties, with PDF, Excel and CSV export.',
        ],
      },
      stack: [
        {
          group: 'Application',
          items: [
            { name: 'PHP', icon: 'siPhp', role: 'Panels and per-module endpoints that answer JSON' },
            { name: 'MySQL', icon: 'siMysql', role: 'Rentals, movements, users, penalties and positions' },
            { name: 'JavaScript', icon: 'siJavascript', role: 'Framework-free interface, with fetch to the endpoints' },
            { name: 'Bootstrap 5', icon: 'siBootstrap', role: 'Interface with dark mode, installable as a PWA' },
          ],
        },
        {
          group: 'QR, maps and data',
          items: [
            { name: 'html5-qrcode + QRious', role: 'Read and generate QR codes in the browser' },
            { name: 'OpenLayers', icon: 'siOpenlayers', role: 'Live map of bikes and stations' },
            { name: 'Chart.js', icon: 'siChartdotjs', role: 'Report charts' },
            { name: 'jsPDF', role: 'Table export to PDF' },
          ],
        },
        {
          group: 'Integrations',
          items: [
            { name: 'VeDi', role: "Login with Córdoba's digital citizen account" },
            { name: 'Tracker API', role: 'Position and battery of every bike' },
          ],
        },
        {
          group: 'Deployment',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'PHP image with persistent sessions' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Tag deploys with rollback' },
          ],
        },
      ],
      built: {
        h: 'What I built',
        items: [
          'QR rentals and returns, with rider, penalty and station-hours checks.',
          'The live fleet map and the GPS tracker integration.',
          'The eleven reports, with a custom table component that searches, filters by date, sorts, paginates and exports.',
          'Management of stations, workshops, bikes, riders, penalties and permissions.',
          'The rider app: trip history, personal stats, ratings and stations on the map.',
        ],
      },
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: 'GPS lies a little',
            d: 'To know how many kilometres each trip covered, the system walks its points and drops jumps under 50 metres and any that would imply more than 144 km/h. The result is stored the first time and never recomputed.',
          },
          {
            t: 'Reuse before building',
            d: 'Putting bikes into the bus-tracking schema gave us position history and ready-made tools from day one.',
          },
          {
            t: 'The reports are the product',
            d: 'For whoever runs the system, the value is in the numbers: how many trips, at which stations, how much CO₂ was avoided. They are the same data shown on this site’s home page.',
          },
          {
            t: 'The first client teaches you everything',
            d: 'It was my first production project: gathering requirements with the client, understanding an operation that happens on the street and turning it into screens an operator uses all day.',
          },
        ],
      },
      links: [{ label: 'bicicba.com', href: 'https://bicicba.com' }],
    },
  },
};
