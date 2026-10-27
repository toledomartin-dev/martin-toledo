import type { Project } from './types';
import { site } from '../i18n/content';

const talk = `https://www.youtube.com/watch?v=${site.talkVideoId}`;

export const gps: Project = {
  key: 'gps',
  diagram: {
    height: 470,
    mobileHeight: 350,
    nodes: [
      { id: 'machine', label: 'Máquina', at: [110, 100], m: [60, 40] },
      { id: 'tcp', label: 'Micro TCP', at: [370, 100], m: [180, 40] },
      { id: 'queue', label: 'La pila', at: [620, 100], m: [300, 40] },
      { id: 'faz', label: 'Micro FAZ', at: [860, 100], m: [300, 130] },
      { id: 'backup', label: 'TCP respaldo', short: 'Respaldo', at: [110, 260], m: [60, 130] },
      { id: 'db', label: 'Base del cliente', short: 'Base', at: [860, 260], m: [300, 220] },
      { id: 'replica', label: 'Réplica', at: [860, 400], m: [300, 310] },
      { id: 'web', label: 'Web de la flota', short: 'Web flota', at: [620, 400], m: [180, 220], core: true },
    ],
    edges: [
      { id: 'mt', from: 'machine', to: 'tcp' },
      { id: 'tq', from: 'tcp', to: 'queue' },
      { id: 'qf', from: 'queue', to: 'faz' },
      { id: 'fd', from: 'faz', to: 'db' },
      { id: 'dr', from: 'db', to: 'replica' },
      { id: 'rw', from: 'replica', to: 'web' },
      { id: 'wd', from: 'web', to: 'db', dashed: true },
      { id: 'mb', from: 'machine', to: 'backup', dashed: true },
      { id: 'bq', from: 'backup', to: 'queue', dashed: true, wideOnly: true },
    ],
    flow: [['mt'], ['tq', '-mt'], ['qf'], ['fd'], ['dr'], ['rw'], ['wd', 'fd', '-qf', '-tq', '-mt'], ['mb', 'bq']],
  },
  text: {
    es: {
      slug: 'gps-colectivos',
      meta: {
        title: 'Del hardware a la nube: 7.000 máquinas hablando a la vez — Martín Toledo',
        description:
          'Cómo recibimos y guardamos los datos GPS y de pagos de toda una flota de colectivos sin perder una sola trama: tramas binarias, ACK, una pila que absorbe los picos y una base por cliente.',
      },
      kicker: 'GPS de colectivos · TECOM 2026',
      title: 'Del hardware a la nube: 7.000 máquinas hablando a la vez',
      lead: 'Cómo funciona el sistema de Micronauta que recibe, ordena y guarda los datos de toda una flota de colectivos (posiciones GPS y pagos) sin perder una sola trama, incluso en hora pico. Lo investigué de punta a punta para contarlo en TECOM 2026.',
      facts: [
        { k: 'Mi parte', v: 'Mejoré la web de la flota y armé la charla' },
        { k: 'Escala', v: '~7.000 máquinas a bordo' },
        { k: 'Pico', v: '~1.400 tramas por segundo' },
        { k: 'Infraestructura', v: '11 servidores (9 locales + 2 virtuales)' },
      ],
      sections: [
        {
          h: 'El problema',
          p: [
            'Cada colectivo lleva una máquina a bordo que registra su posición GPS y cada pago, y lo manda por red celular. Un urbano reporta cada ~3 segundos; un interurbano, cada ~6.',
            'El desafío no es una máquina: es que miles hablen a la vez, todo el día, y que nada se pierda. Una trama de transacción es plata: si se pierde, la recaudación no cierra.',
          ],
        },
        {
          h: 'La trama: cada byte cuenta',
          p: [
            'Las máquinas no mandan JSON: mandan tramas binarias compactas, de 40 a 1.200 bytes. Por red celular, un formato de texto multiplicaría el tráfico y el costo. Cada trama ya trae adentro qué tipo de dato es y de qué máquina viene.',
            'Simplificada, una trama tiene un byte de inicio, el tipo (GPS o pago), el ID de la máquina, los datos, una verificación y un byte de fin.',
          ],
        },
        {
          h: 'El ACK: el permiso para avanzar',
          p: [
            'La máquina guarda cada trama en su propia cola y la manda de a una. Solo pasa a la siguiente cuando el servidor le responde ACK («la tengo, seguí»). Si se queda sin señal, sigue registrando y reenvía todo cuando vuelve la conexión.',
          ],
        },
        {
          h: 'Dos microservicios y una pila en el medio',
          p: [
            'La entrada tiene que ser rápida; el procesamiento, ordenado. Separar esas dos cosas es lo que hace que el sistema aguante los picos.',
            'La Micro TCP es la puerta de entrada, liviana a propósito: no procesa nada. Recibe la trama, responde el ACK y la deja en la pila, así la máquina nunca espera a que la base termine de escribir. La pila es una base que funciona como cola: si en un pico entran más tramas de las que se pueden procesar, esperan ahí, en orden. La TCP apila y la FAZ desapila, y nadie se pisa.',
            'La Micro FAZ saca tramas de la pila, las interpreta y pone cada dato en la base de su cliente según el ID que viene en la trama. Trabaja a su ritmo: si hay pico, la pila espera. Cada base tiene una réplica espejo: la FAZ escribe en la principal y el front consulta la réplica, así una consulta pesada nunca frena la escritura, y si la principal falla, los datos siguen ahí.',
          ],
        },
        {
          h: 'Un día cualquiera',
          p: [
            'Unas 7.000 máquinas en la calle, alrededor de 1.400 tramas por segundo en hora pico y unos 30 GB guardados y replicados por día. Y cero tramas perdidas: ninguna se da por entregada sin su ACK.',
          ],
        },
        {
          h: 'Mi parte',
          p: [
            'Este sistema ya existía cuando llegué. Mi trabajo fue mejorar la web de la flota, donde el equipo de soporte ve cada coche en el mapa, revisa reportes y manda órdenes a las máquinas. Para la charla, que presentamos en equipo en TECOM 2026, investigué cómo funcionaba todo el recorrido dentro de la empresa, armé la presentación y expuse el lado servidor.',
          ],
        },
      ],
      diagram: {
        title: 'El viaje de una trama',
        text: 'Desde que la máquina del colectivo manda una posición o un pago hasta que soporte lo ve en el mapa. En naranja, la parte en la que trabajé.',
        sub: {
          machine: 'a bordo del colectivo',
          tcp: 'recibe y responde ACK',
          queue: 'absorbe los picos',
          faz: 'enruta por cliente',
          backup: 'toma el flujo',
          db: 'escrituras',
          replica: 'lecturas del front',
          web: 'mapa y reportes',
        },
        edges: { mt: 'trama/ACK', tq: 'apila', qf: 'desapila', fd: 'por cliente', dr: 'espejo', rw: 'lecturas', wd: 'órdenes', mb: 'si se cae' },
        flow: [
          'La máquina manda una trama binaria por red celular: entre 40 y 1.200 bytes, con el tipo de dato y el ID de la máquina adentro.',
          'La Micro TCP no procesa nada: deja la trama en la pila y responde ACK. Recién ahí la máquina manda la siguiente.',
          'La Micro FAZ saca las tramas de la pila a su ritmo. En un pico, las tramas esperan en orden y nadie se pisa.',
          'Interpreta cada trama y escribe el dato en la base de su cliente, según el ID. Cada cliente tiene su propia base.',
          'Cada base tiene una réplica espejo, así las lecturas nunca frenan la escritura.',
          'La web de la flota consulta la réplica: soporte ve cada coche en el mapa y revisa los reportes.',
          'Las órdenes a las máquinas (horarios, firmware) quedan pendientes en la base y viajan junto con el próximo ACK. Lo que no puede esperar, como el mapa del pasajero, va por WebSockets.',
          'Si la TCP principal se cae, una de respaldo toma el flujo y el camino sigue igual. La máquina ni se entera.',
        ],
      },
      stack: [
        {
          group: 'Protocolo',
          items: [
            { name: 'Tramas binarias', role: 'De 40 a 1.200 bytes, con tipo e ID de máquina' },
            { name: 'TCP + ACK', role: 'Una trama a la vez; sin ACK no se da por entregada' },
            { name: 'WebSockets', role: 'Lo que no puede esperar, como el mapa del pasajero' },
          ],
        },
        {
          group: 'Servidor',
          items: [
            { name: 'Micro TCP', role: 'Entrada liviana, con una de respaldo' },
            { name: 'La pila', role: 'Base usada como cola para absorber picos' },
            { name: 'Micro FAZ', role: 'Interpreta y enruta cada dato a su cliente' },
          ],
        },
        {
          group: 'Datos',
          items: [
            { name: 'Una base por cliente', role: 'Separación física, no solo lógica' },
            { name: 'Réplica espejo', role: 'Lecturas del front sin frenar la escritura' },
            { name: '11 servidores', icon: 'siLinux', role: '9 locales y 2 virtuales' },
          ],
        },
        {
          group: 'Web de la flota',
          items: [{ name: 'Mapa, reportes y órdenes', role: 'Donde soporte sigue cada coche y le manda órdenes a las máquinas' }],
        },
      ],
      built: {
        h: 'Qué hice',
        items: [
          'Mejoré la web de la flota, donde el equipo de soporte ve cada coche en el mapa, revisa reportes y manda órdenes a las máquinas.',
          'Investigué cómo funcionaba todo el recorrido dentro de la empresa, del hardware a la nube.',
          'Armé la presentación y expuse el lado servidor en la charla que dimos en equipo en TECOM 2026.',
        ],
      },
      lessons: {
        h: 'Las decisiones que lo hicieron escalar',
        items: [
          {
            t: 'Todo en el mismo servidor',
            d: 'Se probó separar la TCP, la FAZ y las bases en servidores distintos. El traspaso de datos por la red local era tanto que la red colapsaba. Juntos, los datos viajan por dentro del servidor.',
          },
          {
            t: 'Una base por cliente',
            d: 'Los datos de un cliente nunca comparten base con otro: separación física, no solo lógica. Es seguridad y, además, escalabilidad. Un cliente grande recibe su propia FAZ y no frena al resto.',
          },
          {
            t: 'Siempre hay respaldo',
            d: 'Si la TCP principal se cae, una de respaldo toma el flujo y el camino sigue igual. La máquina ni se entera.',
          },
          {
            t: 'La máquina pregunta, el servidor responde',
            d: 'Para mandarle horarios o un firmware nuevo no se le habla directo: la orden queda pendiente en la base y viaja junto con el próximo ACK. Lo que no puede esperar, como el mapa del pasajero, va por WebSockets.',
          },
        ],
      },
      links: [{ label: 'Ver la charla', href: talk }],
    },
    en: {
      slug: 'bus-gps',
      meta: {
        title: 'From hardware to the cloud: 7,000 machines talking at once — Martín Toledo',
        description:
          'How we receive and store GPS and payment data from an entire bus fleet without losing a single frame: binary frames, ACKs, a queue that absorbs peaks and one database per client.',
      },
      kicker: 'Bus fleet GPS · TECOM 2026',
      title: 'From hardware to the cloud: 7,000 machines talking at once',
      lead: "How Micronauta's system receives, sorts and stores data from an entire bus fleet (GPS positions and payments) without losing a single frame, even at rush hour. I researched it end to end to present it at TECOM 2026.",
      facts: [
        { k: 'My part', v: 'Improved the fleet web app and built the talk' },
        { k: 'Scale', v: '~7,000 on-board machines' },
        { k: 'Peak', v: '~1,400 frames per second' },
        { k: 'Infrastructure', v: '11 servers (9 on-prem + 2 virtual)' },
      ],
      sections: [
        {
          h: 'The problem',
          p: [
            'Every bus carries an on-board machine that records its GPS position and every payment, and sends it over the cellular network. A city bus reports every ~3 seconds; an intercity bus, every ~6.',
            "The challenge isn't one machine: it's thousands talking at once, all day long, with nothing lost. A transaction frame is money: if it's lost, the fare collection doesn't add up.",
          ],
        },
        {
          h: 'The frame: every byte counts',
          p: [
            "The machines don't send JSON: they send compact binary frames, 40 to 1,200 bytes long. Over a cellular network, a text format would multiply traffic and cost. Each frame already carries its data type and the machine it comes from.",
            'Simplified, a frame has a start byte, the type (GPS or payment), the machine ID, the data, a checksum and an end byte.',
          ],
        },
        {
          h: 'The ACK: permission to move on',
          p: [
            'The machine keeps every frame in its own queue and sends them one at a time. It only moves to the next one when the server answers ACK ("got it, go on"). If it loses signal, it keeps recording and resends everything once the connection is back.',
          ],
        },
        {
          h: 'Two microservices with a queue in the middle',
          p: [
            'Ingestion has to be fast; processing has to be orderly. Splitting those two concerns is what lets the system absorb the peaks.',
            'Micro TCP is the front door, lightweight on purpose: it does no processing. It receives the frame, answers the ACK and drops it in the queue, so a machine never waits for the database to finish writing. The queue is a database working as a queue: if more frames arrive at peak than can be processed, they wait there, in order. TCP pushes and FAZ pops, and they never step on each other.',
            'Micro FAZ pulls frames from the queue, parses them and writes each record into its client database based on the ID inside the frame. It works at its own pace: at peak, the queue waits. Every database has a mirror replica: FAZ writes to the primary and the front end reads from the replica, so a heavy query never slows down writes, and if the primary fails, the data is still there.',
          ],
        },
        {
          h: 'Any given day',
          p: [
            'About 7,000 machines on the street, around 1,400 frames per second at rush hour and about 30 GB stored and replicated per day. And zero lost frames: none counts as delivered without its ACK.',
          ],
        },
        {
          h: 'My part',
          p: [
            'This system was already running when I joined. My work was improving the fleet web app, where the support team sees every bus on the map, reviews reports and sends orders to the machines. For the talk, which we presented as a team at TECOM 2026, I researched how the whole pipeline worked across the company, built the slides and presented the server side.',
          ],
        },
      ],
      diagram: {
        title: 'The journey of a frame',
        text: "From the moment the bus machine sends a position or a payment until support sees it on the map. In orange, the part I worked on.",
        sub: {
          machine: 'on board the bus',
          tcp: 'receives and ACKs',
          queue: 'absorbs peaks',
          faz: 'routes per client',
          backup: 'takes over',
          db: 'writes',
          replica: 'front-end reads',
          web: 'map, reports, orders',
        },
        edges: { mt: 'frame/ACK', tq: 'push', qf: 'pop', fd: 'per client', dr: 'mirror', rw: 'reads', wd: 'orders', mb: 'if it fails' },
        flow: [
          'The machine sends a binary frame over the cellular network: 40 to 1,200 bytes, with the data type and the machine ID inside.',
          'Micro TCP does no processing: it drops the frame in the queue and answers ACK. Only then does the machine send the next one.',
          'Micro FAZ pulls frames from the queue at its own pace. At peak, frames wait in order and nothing steps on anything else.',
          'It parses each frame and writes the record into its client database, based on the ID. Every client has its own database.',
          'Every database has a mirror replica, so reads never slow down writes.',
          'The fleet web app reads from the replica: support sees every bus on the map and reviews reports.',
          "Orders to the machines (schedules, firmware) wait in the database and ride along with the next ACK. What can't wait, like the passenger map, goes over WebSockets.",
          "If the primary TCP goes down, a backup one takes over the stream and the path stays the same. The machine doesn't even notice.",
        ],
      },
      stack: [
        {
          group: 'Protocol',
          items: [
            { name: 'Binary frames', role: '40 to 1,200 bytes, with type and machine ID' },
            { name: 'TCP + ACK', role: 'One frame at a time; no ACK, not delivered' },
            { name: 'WebSockets', role: "What can't wait, like the passenger map" },
          ],
        },
        {
          group: 'Server',
          items: [
            { name: 'Micro TCP', role: 'Lightweight ingestion, with a backup' },
            { name: 'The queue', role: 'A database used as a queue to absorb peaks' },
            { name: 'Micro FAZ', role: 'Parses and routes each record to its client' },
          ],
        },
        {
          group: 'Data',
          items: [
            { name: 'One database per client', role: 'Physical isolation, not just logical' },
            { name: 'Mirror replica', role: 'Front-end reads without slowing writes' },
            { name: '11 servers', icon: 'siLinux', role: '9 on-prem and 2 virtual' },
          ],
        },
        {
          group: 'Fleet web app',
          items: [{ name: 'Map, reports and orders', role: 'Where support follows every bus and sends orders to the machines' }],
        },
      ],
      built: {
        h: 'What I did',
        items: [
          'Improved the fleet web app, where the support team sees every bus on the map, reviews reports and sends orders to the machines.',
          'Researched how the whole pipeline worked across the company, from hardware to the cloud.',
          'Built the slides and presented the server side in the talk we gave as a team at TECOM 2026.',
        ],
      },
      lessons: {
        h: 'The decisions that made it scale',
        items: [
          {
            t: 'Everything on the same server',
            d: 'Splitting TCP, FAZ and the databases across different servers was tried. So much data moved over the local network that it collapsed. Together, data travels inside the server.',
          },
          {
            t: 'One database per client',
            d: "One client's data never shares a database with another's: physical isolation, not just logical. That's security and also scalability. A large client gets its own FAZ and doesn't slow anyone down.",
          },
          {
            t: 'There is always a backup',
            d: "If the primary TCP goes down, a backup one takes over the stream and the path stays the same. The machine doesn't even notice.",
          },
          {
            t: 'The machine asks, the server answers',
            d: "To send it schedules or new firmware we never talk to it directly: the order waits in the database and rides along with the next ACK. What can't wait, like the passenger map, goes over WebSockets.",
          },
        ],
      },
      links: [{ label: 'Watch the talk (in Spanish)', href: talk }],
    },
  },
};
