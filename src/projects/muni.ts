import type { Project } from './types';

export const muni: Project = {
  key: 'muni',
  diagram: {
    height: 480,
    mobileHeight: 360,
    nodes: [
      { id: 'citizen', label: 'Conductor', at: [110, 90], m: [60, 40] },
      { id: 'spa', label: 'Tu Libreta', icon: 'siFramework7', at: [370, 90], m: [180, 40], core: true },
      { id: 'php', label: 'Backend PHP', short: 'PHP', icon: 'siPhp', at: [620, 90], m: [180, 130], core: true },
      { id: 'vedi', label: 'VeDi', at: [860, 90], m: [300, 130] },
      { id: 'tracking', label: 'Rastreo', icon: 'siMysql', at: [370, 260], m: [60, 130] },
      { id: 'api', label: 'API Node', icon: 'siNodedotjs', at: [620, 260], m: [180, 225], core: true },
      { id: 'itv', label: 'ITV y fotos', short: 'ITV', at: [860, 260], m: [300, 225] },
      { id: 'vpn', label: 'Conexión', icon: 'siDocker', at: [620, 420], m: [180, 320], core: true },
      { id: 'sql', label: 'Municipio', at: [860, 420], m: [300, 320] },
    ],
    edges: [
      { id: 'cs', from: 'citizen', to: 'spa' },
      { id: 'sp', from: 'spa', to: 'php' },
      { id: 'pv', from: 'php', to: 'vedi' },
      { id: 'pa', from: 'php', to: 'api' },
      { id: 'pt', from: 'php', to: 'tracking' },
      { id: 'ai', from: 'api', to: 'itv' },
      { id: 'av', from: 'api', to: 'vpn' },
      { id: 'vs', from: 'vpn', to: 'sql' },
    ],
    flow: [['cs', 'sp'], ['pv'], ['pa'], ['av', 'vs'], ['ai'], ['pt'], ['-sp', '-cs']],
  },
  text: {
    es: {
      slug: 'municipalidad',
      meta: {
        title: 'Tu Libreta Digital: la libreta de taxistas de la Municipalidad de Córdoba — Martín Toledo',
        description:
          'La libreta digital de conductores y titulares de taxis, remises y transporte escolar de Córdoba: Framework7, PHP y una API Node conectada a los sistemas del municipio.',
      },
      kicker: 'Municipalidad de Córdoba',
      title: 'La libreta del taxista, en el celular',
      lead: 'Tu Libreta Digital reemplaza los papeles de conductores y titulares de taxis, remises, transporte urbano y escolar de Córdoba: sus chapas, su carnet, la verificación técnica del vehículo y su estado en el sistema de rastreo, en una sola pantalla.',
      facts: [
        { k: 'Rol', v: 'Desarrollo de la app, la API y su infraestructura' },
        { k: 'En producción', v: 'Desde 2024' },
        { k: 'Servicios', v: 'Taxi, remis, transporte urbano y escolar' },
        { k: 'Stack', v: 'Framework7 · PHP · Node · Docker' },
      ],
      sections: [
        {
          h: 'Qué muestra',
          p: [
            'El conductor entra con su cuenta de ciudadano digital (VeDi) o con su email y ve sus chapas con número interno, tipo de servicio y estado, los titulares de cada una, su carnet de conductor, los datos y la foto del vehículo, el historial de la verificación técnica y si el auto está registrado en el sistema de rastreo. Todo se puede exportar a PDF.',
          ],
        },
        {
          h: 'Una conexión que no controlamos',
          p: [
            'Los datos de conductores y licencias viven en los sistemas del municipio, a los que se llega por un canal privado. Esa conexión quedó aislada en su propio contenedor, junto a la API: si hay que reiniciarla o actualizarla, la API no se toca, y al arrancar espera a que el canal esté listo antes de empezar a atender.',
            'Los dos contenedores se despliegan con el mismo pipeline que el resto de los proyectos.',
          ],
        },
        {
          h: 'Del registro a la libreta',
          p: [
            'La libreta nació del empadronamiento de taxistas. Para la nueva API de movilidad del municipio armé un cliente en Node y TypeScript que consulta vehículos por patente (formato viejo y Mercosur) y personas por CUIL, registra altas, informa la actividad de cada chofer y renueva el token solo cuando vence.',
          ],
        },
      ],
      diagram: {
        title: 'Del login a la libreta',
        text: 'Qué pasa desde que el conductor entra hasta que ve su libreta. En naranja, lo que construí.',
        sub: {
          citizen: 'desde el celular',
          spa: 'Framework7 · PWA',
          php: 'sesión y armado',
          vedi: 'ciudadano digital',
          tracking: 'último estado',
          api: 'Express · JWT',
          itv: 'servicio municipal',
          vpn: 'canal privado aislado',
          sql: 'conductores y licencias',
        },
        edges: { cs: 'HTTPS', sp: 'AJAX', pv: 'token', pa: 'JWT', pt: 'SQL', ai: 'HTTP', av: 'aislada', vs: 'privado' },
        flow: [
          'El conductor entra desde el celular con su cuenta de ciudadano digital o con su email.',
          'El backend valida el token de VeDi y busca a la persona.',
          'Pide un token a la API y lo guarda en la sesión, así el navegador nunca lo ve.',
          'La API consulta los sistemas del municipio por su conexión aislada y trae las chapas, sus titulares y el carnet.',
          'Suma el historial de la verificación técnica, ordenado por fecha, y la foto del vehículo, recomprimida antes de mandarla.',
          'Consulta el último estado en el sistema de rastreo. Si esa base no responde, la libreta igual carga con valores por defecto.',
          'El conductor ve su libreta y la puede descargar en PDF.',
        ],
      },
      stack: [
        {
          group: 'App',
          items: [
            { name: 'Framework7', icon: 'siFramework7', role: 'App web pensada para el celular' },
            { name: 'jsPDF', role: 'Exportación de la libreta a PDF' },
            { name: 'i18next', icon: 'siI18next', role: 'Textos de la interfaz' },
          ],
        },
        {
          group: 'Backend',
          items: [
            { name: 'PHP', icon: 'siPhp', role: 'Sesión, login con VeDi y armado de la libreta' },
            { name: 'Node.js + Express 5', icon: 'siNodedotjs', role: 'API con JWT hacia la base municipal' },
            { name: 'sharp', role: 'Recompresión de las fotos de los vehículos' },
            { name: 'MySQL', icon: 'siMysql', role: 'Datos propios y estado de rastreo' },
            { name: 'Sistemas del municipio', role: 'Conductores y licencias' },
          ],
        },
        {
          group: 'Infraestructura',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'API y conexión con el municipio en contenedores separados' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Build por tag; producción solo baja imágenes' },
          ],
        },
      ],
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'Mostrar menos también es diseño',
            d: 'La base municipal trae más datos de los que el conductor necesita. La API filtra las chapas inactivas y quita los datos personales de los titulares antes de responder.',
          },
          {
            t: 'Una dependencia caída no tumba la pantalla',
            d: 'Si el sistema de rastreo no responde, la libreta carga igual. Mejor un dato por defecto que un conductor sin su libreta en un control.',
          },
          {
            t: 'Aislar lo que no controlás',
            d: 'La conexión con el municipio depende de otros y cambia sin aviso. Tenerla en su propio contenedor permite reiniciarla o actualizarla sin tocar la API.',
          },
        ],
      },
      links: [{ label: 'Tu Libreta Digital', href: 'https://transportedigital.cordoba.gob.ar/tulibreta-digital/#!/landing-page/' }],
    },
    en: {
      slug: 'cordoba-city',
      meta: {
        title: "Tu Libreta Digital: Córdoba's digital taxi driver booklet — Martín Toledo",
        description:
          "Córdoba's digital booklet for taxi, remis and school transport drivers and permit holders: Framework7, PHP and a Node API connected to the city's systems.",
      },
      kicker: 'City of Córdoba',
      title: "The taxi driver's booklet, on the phone",
      lead: "Tu Libreta Digital replaces the paperwork of taxi, remis, urban and school transport drivers and permit holders in Córdoba: their plates, their licence, the vehicle's technical inspection and its status in the tracking system, on a single screen.",
      facts: [
        { k: 'Role', v: 'Built the app, the API and its infrastructure' },
        { k: 'In production', v: 'Since 2024' },
        { k: 'Services', v: 'Taxi, remis, urban and school transport' },
        { k: 'Stack', v: 'Framework7 · PHP · Node · Docker' },
      ],
      sections: [
        {
          h: 'What it shows',
          p: [
            "The driver logs in with their digital citizen account (VeDi) or their email and sees their plates with internal number, service type and status, each plate's holders, their driver's licence, the vehicle data and photo, the technical inspection history and whether the car is registered in the tracking system. Everything can be exported to PDF.",
          ],
        },
        {
          h: "A connection we don't control",
          p: [
            "Driver and licence data live in the city's systems, reached through a private channel. That connection is isolated in its own container next to the API: it can be restarted or updated without touching the API, and on startup the API waits for the channel to be ready before serving requests.",
            'Both containers are deployed with the same pipeline as every other project.',
          ],
        },
        {
          h: 'From registry to booklet',
          p: [
            "The booklet grew out of the taxi driver registry. For the city's new mobility API I built a Node and TypeScript client that checks vehicles by plate (old and Mercosur formats) and people by tax ID, registers new entries, reports each driver's activity and refreshes the token only when it expires.",
          ],
        },
      ],
      diagram: {
        title: 'From login to booklet',
        text: 'What happens from the moment the driver logs in until they see their booklet. In orange, what I built.',
        sub: {
          citizen: 'from the phone',
          spa: 'Framework7 · PWA',
          php: 'session and assembly',
          vedi: 'digital citizen',
          tracking: 'latest status',
          api: 'Express · JWT',
          itv: 'city service',
          vpn: 'isolated private channel',
          sql: 'drivers and licences',
        },
        edges: { cs: 'HTTPS', sp: 'AJAX', pv: 'token', pa: 'JWT', pt: 'SQL', ai: 'HTTP', av: 'isolated', vs: 'private' },
        flow: [
          'The driver logs in from the phone with their digital citizen account or their email.',
          'The backend validates the VeDi token and looks the person up.',
          'It requests a token from the API and keeps it in the session, so the browser never sees it.',
          'The API queries the city systems through its isolated connection and returns the plates, their holders and the licence.',
          'It adds the technical inspection history, sorted by date, and the vehicle photo, recompressed before sending it.',
          'It checks the latest status in the tracking system. If that database does not answer, the booklet still loads with default values.',
          'The driver sees their booklet and can download it as a PDF.',
        ],
      },
      stack: [
        {
          group: 'App',
          items: [
            { name: 'Framework7', icon: 'siFramework7', role: 'Mobile-first web app' },
            { name: 'jsPDF', role: 'Booklet export to PDF' },
            { name: 'i18next', icon: 'siI18next', role: 'Interface texts' },
          ],
        },
        {
          group: 'Backend',
          items: [
            { name: 'PHP', icon: 'siPhp', role: 'Session, VeDi login and booklet assembly' },
            { name: 'Node.js + Express 5', icon: 'siNodedotjs', role: 'JWT API to the city database' },
            { name: 'sharp', role: 'Recompresses vehicle photos' },
            { name: 'MySQL', icon: 'siMysql', role: 'Own data and tracking status' },
            { name: 'City systems', role: 'Drivers and licences' },
          ],
        },
        {
          group: 'Infrastructure',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'API and city connection in separate containers' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Tag builds; production only pulls images' },
          ],
        },
      ],
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: 'Showing less is design too',
            d: 'The city database returns more than the driver needs. The API filters out inactive plates and strips personal data from holders before answering.',
          },
          {
            t: "A failing dependency shouldn't take the screen down",
            d: 'If the tracking system does not answer, the booklet still loads. A default value beats a driver without their booklet at a checkpoint.',
          },
          {
            t: "Isolate what you don't control",
            d: 'The connection to the city depends on others and changes without notice. Keeping it in its own container means it can be restarted or updated without touching the API.',
          },
        ],
      },
      links: [{ label: 'Tu Libreta Digital', href: 'https://transportedigital.cordoba.gob.ar/tulibreta-digital/#!/landing-page/' }],
    },
  },
};
