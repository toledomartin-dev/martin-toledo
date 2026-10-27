import type { Project } from './types';

export const saldobus: Project = {
  key: 'saldobus',
  diagram: {
    height: 400,
    mobileHeight: 280,
    nodes: [
      { id: 'web', label: 'Boletería web', short: 'Boletería', icon: 'siPhp', at: [110, 90], m: [60, 40] },
      { id: 'soap', label: 'Sistema de cobro', short: 'Cobro', at: [110, 260], m: [60, 240] },
      { id: 'api', label: 'SaldoBus API', short: 'API', icon: 'siNodedotjs', at: [480, 175], m: [180, 140], core: true },
      { id: 'mysql', label: 'MySQL', icon: 'siMysql', at: [480, 340], m: [180, 240] },
      { id: 'app', label: 'App lectora', short: 'App', icon: 'siReact', at: [850, 90], m: [300, 40], core: true },
      { id: 'card', label: 'Tarjeta', at: [850, 260], m: [300, 240] },
    ],
    edges: [
      { id: 'ws', from: 'web', to: 'soap' },
      { id: 'wa', from: 'web', to: 'api' },
      { id: 'as', from: 'api', to: 'soap' },
      { id: 'aa', from: 'api', to: 'app' },
      { id: 'ac', from: 'app', to: 'card' },
      { id: 'am', from: 'api', to: 'mysql' },
    ],
    flow: [['ws'], ['wa'], ['as', '-as'], ['aa'], ['ac', '-ac', '-aa'], ['aa', 'ac'], ['as', 'am', '-wa']],
  },
  text: {
    es: {
      slug: 'saldobus',
      meta: {
        title: 'SaldoBus: recarga de tarjetas de transporte por NFC — Martín Toledo',
        description:
          'Cómo un celular con NFC escribe saldo en una tarjeta MIFARE de transporte: WebSockets, cifrado AES-256 y un sistema de cobro legacy por SOAP.',
      },
      kicker: 'SaldoBus',
      title: 'Cargar saldo en una tarjeta con un celular',
      lead: 'La boletería vende la recarga y un celular con NFC la escribe en la tarjeta de transporte. En el medio, un servidor que habla con el sistema de cobro de siempre y con el teléfono, sin que ningún dato sensible pase por el navegador.',
      facts: [
        { k: 'Rol', v: 'Diseño y desarrollo, solo' },
        { k: 'Stack', v: 'React Native · Node · WebSocket' },
        { k: 'Tarjeta', v: 'MIFARE Classic por NFC' },
        { k: 'Despliegue', v: 'Un entorno por cliente' },
      ],
      sections: [
        {
          h: 'El problema',
          p: [
            'La venta de recargas ya existía en un sistema web y un servicio SOAP legacy, pero escribir el saldo en la tarjeta dependía de lectores dedicados. La idea fue que cualquier celular con NFC hiciera ese trabajo, sin cambiar la forma de cobrar.',
          ],
        },
        {
          h: 'Nada sensible en el navegador',
          p: [
            'La boletería solo le manda al servidor el identificador del equipo. El servidor busca él mismo la operación pendiente en el sistema de cobro, obtiene las claves de la sesión y le habla al teléfono con mensajes cifrados con AES-256. Las claves de la tarjeta se derivan en el servidor y nunca llegan al navegador.',
          ],
        },
        {
          h: 'Portar la lógica de un sistema viejo',
          p: [
            'La forma de escribir la tarjeta venía de un sistema en PowerBuilder: qué sectores son críticos, cómo se codifican las fechas, sobre qué datos se calcula el CRC. Hubo que reproducirla con exactitud para que las tarjetas que ya estaban en la calle siguieran funcionando igual.',
          ],
        },
      ],
      diagram: {
        title: 'De la venta a la tarjeta',
        text: 'El recorrido de una recarga, desde que la boletería la cobra hasta que el saldo queda escrito y verificado en la tarjeta.',
        sub: {
          web: 'venta de recargas',
          soap: 'SOAP legacy',
          api: 'Node · WebSocket',
          mysql: 'sesiones y trabajos',
          app: 'React Native + NFC',
          card: 'MIFARE Classic',
        },
        edges: { ws: 'operación pendiente', wa: 'WebSocket · id', as: 'SOAP', aa: 'WebSocket · AES', ac: 'NFC', am: 'SQL' },
        flow: [
          'La boletería cobra la recarga y el sistema de siempre registra una operación pendiente.',
          'La web le avisa al servidor por WebSocket, pero solo con el identificador del equipo: ningún dato sensible pasa por el navegador.',
          'El servidor le pide al sistema de cobro, por SOAP, las claves de la sesión y la operación pendiente. Si todavía no está, reintenta con espera creciente y se cancela si la venta se cierra.',
          'Le manda el trabajo al celular por WebSocket, con los comandos cifrados con AES-256.',
          'El celular lee los sectores de la tarjeta de una vez. El servidor identifica el grupo de claves y calcula el contenido nuevo: saldo, viajes, tarifa y CRC.',
          'El celular escribe todos los sectores juntos y el servidor fuerza una relectura para verificar lo escrito.',
          'El resultado vuelve al sistema de cobro, queda registrado y la boletería muestra el saldo nuevo.',
        ],
      },
      stack: [
        {
          group: 'App lectora',
          items: [
            { name: 'React Native', icon: 'siReact', role: 'App en TypeScript para el puesto de venta' },
            { name: 'NFC Manager', role: 'Lectura y escritura de sectores MIFARE' },
            { name: 'Camera Kit', role: 'Lectura del QR del DNI' },
            { name: 'Notifee', role: 'Aviso cuando llega un trabajo en segundo plano' },
          ],
        },
        {
          group: 'Servidor',
          items: [
            { name: 'Node.js + TypeScript', icon: 'siNodedotjs', role: 'Express y WebSockets con tres roles de cliente' },
            { name: 'AES-256', role: 'Cifrado de punta a punta de los comandos' },
            { name: 'SOAP', role: 'Integración con el sistema de cobro legacy' },
            { name: 'MySQL', icon: 'siMysql', role: 'Sesiones, trabajos, permisos y transacciones' },
          ],
        },
        {
          group: 'Despliegue',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'Un stack por cliente' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Deploy por tag con rollback' },
          ],
        },
      ],
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'Cada viaje al NFC cuesta',
            d: 'Leer y escribir sector por sector hacía lenta cada operación. Mandar varios sectores por mensaje y cachear la lectura entre trabajos de la misma tarjeta la volvió casi instantánea.',
          },
          {
            t: 'Verificar es releer',
            d: 'Después de escribir, el servidor descarta el caché y obliga a leer la tarjeta de nuevo. Es la única forma de saber que las claves nuevas quedaron bien.',
          },
          {
            t: 'Dos sistemas, dos ritmos',
            d: 'La web crea la operación y el servidor la busca casi al mismo tiempo. Un sondeo con espera creciente, cancelable al cerrar la venta, resolvió la carrera.',
          },
          {
            t: 'La tarjeta no se mueve',
            d: 'La sesión NFC se mantiene entre trabajos con un pequeño margen, así el operador no tiene que levantar y volver a apoyar la tarjeta.',
          },
        ],
      },
    },
    en: {
      slug: 'saldobus',
      meta: {
        title: 'SaldoBus: recharging transport cards over NFC — Martín Toledo',
        description:
          'How an NFC phone writes balance to a MIFARE transport card: WebSockets, AES-256 encryption and a legacy SOAP payment system.',
      },
      kicker: 'SaldoBus',
      title: 'Recharging a card with a phone',
      lead: 'The ticket office sells the recharge and an NFC phone writes it to the transport card. In between, a server talks to the existing payment system and to the phone, without any sensitive data going through the browser.',
      facts: [
        { k: 'Role', v: 'Design and development, solo' },
        { k: 'Stack', v: 'React Native · Node · WebSocket' },
        { k: 'Card', v: 'MIFARE Classic over NFC' },
        { k: 'Deployment', v: 'One environment per client' },
      ],
      sections: [
        {
          h: 'The problem',
          p: [
            'Selling recharges already worked through a web system and a legacy SOAP service, but writing the balance to the card required dedicated readers. The idea was for any NFC phone to do that job, without changing how payments are taken.',
          ],
        },
        {
          h: 'Nothing sensitive in the browser',
          p: [
            "The ticket office only sends the server the device ID. The server looks up the pending operation in the payment system itself, gets the session keys and talks to the phone with AES-256 encrypted messages. Card keys are derived on the server and never reach the browser.",
          ],
        },
        {
          h: 'Porting the logic of an old system',
          p: [
            'How the card is written came from a PowerBuilder system: which sectors are critical, how dates are encoded, which data the CRC is computed over. It had to be reproduced exactly so the cards already in use kept working the same way.',
          ],
        },
      ],
      diagram: {
        title: 'From sale to card',
        text: 'The path of a recharge, from the moment the ticket office charges it until the balance is written and verified on the card.',
        sub: {
          web: 'recharge sales',
          soap: 'legacy SOAP',
          api: 'Node · WebSocket',
          mysql: 'sessions and jobs',
          app: 'React Native + NFC',
          card: 'MIFARE Classic',
        },
        edges: { ws: 'pending operation', wa: 'WebSocket · id', as: 'SOAP', aa: 'WebSocket · AES', ac: 'NFC', am: 'SQL' },
        flow: [
          'The ticket office charges the recharge and the existing system records a pending operation.',
          'The web app notifies the server over WebSocket, but only with the device ID: no sensitive data goes through the browser.',
          'The server asks the payment system over SOAP for the session keys and the pending operation. If it is not there yet, it retries with growing waits and cancels if the sale is closed.',
          'It sends the job to the phone over WebSocket, with AES-256 encrypted commands.',
          'The phone reads the card sectors in one go. The server identifies the key group and computes the new content: balance, trips, tariff and CRC.',
          'The phone writes all the sectors together and the server forces a re-read to verify what was written.',
          'The result goes back to the payment system, gets recorded and the ticket office shows the new balance.',
        ],
      },
      stack: [
        {
          group: 'Reader app',
          items: [
            { name: 'React Native', icon: 'siReact', role: 'TypeScript app for the point of sale' },
            { name: 'NFC Manager', role: 'Reads and writes MIFARE sectors' },
            { name: 'Camera Kit', role: 'Reads the QR on the national ID' },
            { name: 'Notifee', role: 'Alerts when a job arrives in the background' },
          ],
        },
        {
          group: 'Server',
          items: [
            { name: 'Node.js + TypeScript', icon: 'siNodedotjs', role: 'Express and WebSockets with three client roles' },
            { name: 'AES-256', role: 'End-to-end encryption of commands' },
            { name: 'SOAP', role: 'Integration with the legacy payment system' },
            { name: 'MySQL', icon: 'siMysql', role: 'Sessions, jobs, permissions and transactions' },
          ],
        },
        {
          group: 'Deployment',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'One stack per client' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Tag deploys with rollback' },
          ],
        },
      ],
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: 'Every NFC round trip costs',
            d: 'Reading and writing sector by sector made each operation slow. Sending several sectors per message and caching reads between jobs on the same card made it almost instant.',
          },
          {
            t: 'Verifying means re-reading',
            d: 'After writing, the server drops the cache and forces a fresh read of the card. It is the only way to know the new keys were written correctly.',
          },
          {
            t: 'Two systems, two paces',
            d: 'The web app creates the operation and the server looks for it at almost the same time. Polling with growing waits, cancellable when the sale closes, solved the race.',
          },
          {
            t: "The card doesn't move",
            d: 'The NFC session stays alive between jobs with a short grace period, so the operator never has to lift the card and place it again.',
          },
        ],
      },
    },
  },
};
