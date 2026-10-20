// Todo el contenido del sitio vive acá, en los dos idiomas.

export type Lang = 'es' | 'en';

export const site = {
  name: 'Martín Toledo',
  fullName: 'Martín Franco Toledo',
  email: 'toledomartinfranco@gmail.com',
  linkedin: 'https://www.linkedin.com/in/martin-franco-toledo',
  github: 'https://github.com/toledomartin-dev',
  photo: '/img/foto.jpg',
  photoFull: '/img/foto-full.jpg',
  photoAbout: '/img/foto-about.jpg',
  talkVideoId: '1oeWi3M2vvg',
};

export const links = {
  bicicba: 'https://bicicba.com',
  tubondi: 'https://tubondi.com',
  tulibreta: 'https://transportedigital.cordoba.gob.ar/tulibreta-digital/#!/landing-page/',
  fcn: 'https://fcn.pages.dev',
};

export const stack = [
  { es: 'Mobile', en: 'Mobile', items: ['React Native', 'Capacitor', 'PWA', 'Firebase', 'Google Play', 'Kotlin (básico)'] },
  { es: 'Frontend', en: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vite', 'Three.js'] },
  { es: 'Backend', en: 'Backend', items: ['Node.js', 'Express', 'PHP', 'WebSockets', 'REST', 'Mercado Pago'] },
  { es: 'Datos', en: 'Data', items: ['MySQL', 'PostgreSQL', 'SQLite', 'Optimización de queries'] },
  { es: 'Mapas y GPS', en: 'Maps & GPS', items: ['Traccar', 'Nominatim', 'GraphHopper', 'OpenLayers', 'MapLibre'] },
  { es: 'DevOps', en: 'DevOps', items: ['Docker', 'GitLab CI/CD', 'Traefik', 'Linux', 'Prometheus', 'Grafana', 'Sentry'] },
  { es: 'IA y automatización', en: 'AI & automation', items: ['Claude', 'n8n'] },
];

export const t = {
  es: {
    meta: {
      title: 'Martín Toledo — Líder Técnico y Desarrollador Full Stack',
      description:
        'Ingeniero en Sistemas y líder técnico. Construyo sistemas de movilidad en producción en Córdoba: apps de taxis, bicicletas públicas y transporte.',
    },
    nav: { projects: 'Proyectos', about: 'Sobre mí', experience: 'Experiencia', stack: 'Stack', talks: 'Charlas', contact: 'Contacto' },
    hero: {
      location: 'Córdoba, Argentina',
      role: 'Líder Técnico y Full Stack Developer',
      headline: 'Construyo sistemas que mueven ciudades.',
      sub: 'Apps de taxis, bicicletas públicas y transporte, del GPS del vehículo a la nube.',
      ctaProjects: 'Ver proyectos',
      ctaCv: 'Descargar CV',
      ctaCvOnline: 'Ver online',
    },
    city: {
      kicker: 'Córdoba · datos reales',
      title: 'Las avenidas de Córdoba, dibujadas con puntos.',
      text: 'Detrás de cada app hay miles de posiciones GPS llegando sin parar. Diseño los sistemas que las reciben por TCP, las procesan y las muestran en tiempo real, sin que colapsen.',
      legendPoints: 'Avenidas (OpenStreetMap)',
      legendVehicles: 'Vehículos simulados',
      credit: 'Mapa © OpenStreetMap contributors',
    },
    bento: {
      kicker: 'Proyectos',
      title: 'Lo que construí, de punta a punta.',
      intro: 'Del relevamiento con el cliente al despliegue en producción.',
      visit: 'Visitar',
      entaxi: {
        tag: 'React Native · Caso de estudio',
        title: 'Entaxi',
        text: 'Lideré la migración de la app de choferes a React Native: acceso nativo al hardware, menos RAM y una app más rápida.',
        cta: 'Leer el caso',
        href: '/caso-entaxi/',
        mock: { status: 'En viaje', destLabel: 'Destino', dest: 'Av. Colón 1200', fare: '$ 4.850', slide: 'Deslizá para cobrar' },
      },
      drivers: {
        live: 'En producción',
        label: 'choferes usan la app con Rapitaxi',
        next: 'Próximo: San Juan',
      },
      cicd: {
        title: 'CI/CD propio',
        text: 'GitLab autohosteado con registry y runners. Cada tag despliega a producción, con rollback.',
      },
      monitor: {
        title: 'Monitoreo e infraestructura',
        text: 'Prometheus, Grafana y alertas con n8n para los servidores de toda la empresa.',
        servers: 'Servidores',
      },
      saldobus: {
        title: 'SaldoBus',
        text: 'Recarga de tarjetas de transporte por NFC, con cifrado AES-256.',
        read: 'Tarjeta leída',
        done: 'Saldo recargado',
      },
      bicicba: { title: 'BiciCba', text: 'Mi primer proyecto: sitio, paneles y reportes de las bicis públicas.' },
      tubondi: { title: 'TuBondi', text: 'Rebranding completo de la app de transporte público.' },
      muni: {
        title: 'Municipalidad de Córdoba',
        text: 'Tu Libreta Digital y el empadronamiento de taxistas, de punta a punta.',
        libreta: 'Tu Libreta Digital',
        padron: 'Empadronamiento',
      },
    },
    about: {
      kicker: 'Sobre mí',
      title: 'Detrás del código.',
      photoAlt: 'Martín Toledo frente a una catedral, de saco celeste, sonriendo',
      zoom: 'Ver foto en tamaño completo',
      close: 'Cerrar',
      paragraphs: [
        'Soy Martín, Ingeniero en Sistemas por la UTN de Córdoba. Entré a Micronauta como único desarrollador y hoy lidero técnicamente un equipo de cuatro personas: soy el puente entre el código, los clientes y la dirección.',
        'Me gustan los problemas que se ven en la calle: un chofer que cobra un viaje, una bici que sale de una estación, un colectivo que reporta su posición. Disfruto tanto diseñar una base de datos como explicarle a un cliente por qué conviene hacerlo de una forma y no de otra.',
        'Y creo en compartir lo que aprendo: armé capacitaciones de Git, Docker y Jira para toda la empresa y di una charla sobre cómo procesamos datos GPS en tiempo real.',
      ],
      facts: [
        { value: '1.º', label: 'desarrollador del equipo' },
        { value: 'UTN', label: 'Ingeniero en Sistemas, 2024' },
        { value: 'TECOM', label: 'speaker sobre GPS en tiempo real' },
      ],
      offTitle: 'Fuera del código',
      off: ['Entrenamiento físico', 'Emprendí con mi hermano una tienda online', 'Voluntariado en misiones solidarias en Chaco'],
    },
    experience: {
      kicker: 'Trayectoria',
      title: 'Experiencia',
      items: [
        {
          role: 'Líder Técnico y Desarrollador Full Stack',
          company: 'Micronauta (Globalvisum)',
          period: 'Jul 2022 — Actualidad',
          points: [
            'Entré como único desarrollador; hoy lidero técnicamente un equipo de 4.',
            'Contacto técnico con la dirección y los clientes: demos, alcances e integraciones.',
            'Inicio proyectos, los llevo a producción y los traspaso al equipo sin dejar de liderarlos.',
            'Monté GitLab autohosteado con CI/CD y dockericé todas las aplicaciones.',
            'Capacité a la empresa en Git, Jira y Docker para la certificación ISO.',
          ],
        },
        {
          role: 'Desarrollador Web y Sistemas (freelance)',
          company: 'Federación Cordobesa de Natación',
          period: '2020 — Actualidad',
          points: ['Sitio institucional en Cloudflare Pages (fcn.pages.dev) y sistemas para eventos de natación.'],
        },
      ],
      education: {
        title: 'Formación',
        degree: 'Ingeniero en Sistemas de Información',
        school: 'Universidad Tecnológica Nacional — FRC',
        period: '2018 — 2024',
      },
    },
    stack: { kicker: 'Herramientas', title: 'Stack', intro: 'Con lo que trabajo todos los días.' },
    talk: {
      kicker: 'Charlas',
      title: 'Del hardware a la nube',
      name: 'Del hardware a la nube: ingeniería detrás de la movilidad inteligente',
      event: 'TECOM',
      description:
        'Cómo procesamos en tiempo real las conexiones TCP y los puntos GPS de flotas de colectivos sin que el sistema colapse.',
      play: 'Ver la charla',
    },
    contact: {
      title: '¿Construimos algo juntos?',
      text: 'Estoy abierto a nuevos desafíos. Escribime y te respondo a la brevedad.',
      cta: 'Enviar email',
    },
    footer: 'Hecho con Astro, Tailwind y Three.js.',
    cvFile: '/cv/martin-toledo-cv-es.pdf',
    cvName: 'Martin-Toledo-CV.pdf',
    cvPage: '/cv/',
    switchLang: { label: 'EN', href: '/en/' },
    theme: 'Cambiar tema',
    back: 'Volver al inicio',
  },
  en: {
    meta: {
      title: 'Martín Toledo — Technical Lead & Full Stack Developer',
      description:
        'Systems Engineer and technical lead. I build production mobility systems in Córdoba, Argentina: taxi apps, public bike sharing and public transport.',
    },
    nav: { projects: 'Projects', about: 'About', experience: 'Experience', stack: 'Stack', talks: 'Talks', contact: 'Contact' },
    hero: {
      location: 'Córdoba, Argentina',
      role: 'Technical Lead & Full Stack Developer',
      headline: 'I build systems that move cities.',
      sub: "Taxi, bike sharing and public transport apps, from the vehicle's GPS to the cloud.",
      ctaProjects: 'See projects',
      ctaCv: 'Download resume',
      ctaCvOnline: 'View online',
    },
    city: {
      kicker: 'Córdoba · real data',
      title: "Córdoba's avenues, drawn in points.",
      text: 'Behind every app there are thousands of GPS positions streaming in nonstop. I design the systems that receive them over TCP, process them and show them in real time, without collapsing.',
      legendPoints: 'Avenues (OpenStreetMap)',
      legendVehicles: 'Simulated vehicles',
      credit: 'Map © OpenStreetMap contributors',
    },
    bento: {
      kicker: 'Projects',
      title: 'What I built, end to end.',
      intro: 'From client discovery to production deployment.',
      visit: 'Visit',
      entaxi: {
        tag: 'React Native · Case study',
        title: 'Entaxi',
        text: 'Led the migration of the driver app to React Native: native hardware access, lower RAM usage and a faster app.',
        cta: 'Read the case study',
        href: '/en/entaxi-case-study/',
        mock: { status: 'On trip', destLabel: 'Destination', dest: 'Av. Colón 1200', fare: '$ 4,850', slide: 'Slide to charge' },
      },
      drivers: {
        live: 'In production',
        label: 'drivers use the app with Rapitaxi',
        next: 'Next: San Juan',
      },
      cicd: {
        title: 'In-house CI/CD',
        text: 'Self-hosted GitLab with registry and runners. Every tag deploys to production, with rollback.',
      },
      monitor: {
        title: 'Monitoring & infrastructure',
        text: "Prometheus, Grafana and n8n alerts for the whole company's servers.",
        servers: 'Servers',
      },
      saldobus: {
        title: 'SaldoBus',
        text: 'NFC transit card top-up, with AES-256 encryption.',
        read: 'Card read',
        done: 'Balance topped up',
      },
      bicicba: { title: 'BiciCba', text: 'My first project: site, dashboards and reports for public bike sharing.' },
      tubondi: { title: 'TuBondi', text: 'Full rebrand of the public transport app.' },
      muni: {
        title: 'Córdoba City Hall',
        text: 'Tu Libreta Digital and the taxi driver registry, built end to end.',
        libreta: 'Tu Libreta Digital',
        padron: 'Driver registry',
      },
    },
    about: {
      kicker: 'About',
      title: 'Behind the code.',
      photoAlt: 'Martín Toledo in front of a cathedral, wearing a light blue blazer, smiling',
      zoom: 'View full-size photo',
      close: 'Close',
      paragraphs: [
        "I'm Martín, a Systems Engineer from UTN in Córdoba, Argentina. I joined Micronauta as the only developer and now lead a team of four: I'm the bridge between the code, the clients and management.",
        'I like problems you can see out on the street: a driver charging for a trip, a bike leaving a station, a bus reporting its position. I enjoy designing a database as much as explaining to a client why one approach beats another.',
        'And I believe in sharing what I learn: I ran Git, Docker and Jira trainings for the whole company and gave a talk on how we process GPS data in real time.',
      ],
      facts: [
        { value: '1st', label: 'developer on the team' },
        { value: 'UTN', label: 'Systems Engineer, 2024' },
        { value: 'TECOM', label: 'speaker on real-time GPS' },
      ],
      offTitle: 'Off the clock',
      off: ['Strength training', 'Co-founded an online store with my brother', 'Volunteering in community missions in Chaco'],
    },
    experience: {
      kicker: 'Career',
      title: 'Experience',
      items: [
        {
          role: 'Technical Lead & Full Stack Developer',
          company: 'Micronauta (Globalvisum)',
          period: 'Jul 2022 — Present',
          points: [
            'Joined as the only developer; I now lead a team of 4.',
            'Technical contact for management and clients: demos, scoping and integrations.',
            'I start projects, take them to production and hand them over while still leading them.',
            'Set up self-hosted GitLab with CI/CD and dockerized every application.',
            'Trained the company in Git, Jira and Docker for ISO certification.',
          ],
        },
        {
          role: 'Web & Systems Developer (freelance)',
          company: 'Córdoba Swimming Federation',
          period: '2020 — Present',
          points: ['Institutional site on Cloudflare Pages (fcn.pages.dev) and systems for swimming events.'],
        },
      ],
      education: {
        title: 'Education',
        degree: 'Systems Engineering',
        school: 'National Technological University (UTN) — Córdoba',
        period: '2018 — 2024',
      },
    },
    stack: { kicker: 'Tools', title: 'Stack', intro: 'What I work with every day.' },
    talk: {
      kicker: 'Talks',
      title: 'From hardware to the cloud',
      name: 'From hardware to the cloud: the engineering behind smart mobility',
      event: 'TECOM (in Spanish)',
      description:
        'How we process TCP connections and GPS data from bus fleets in real time without the system collapsing.',
      play: 'Watch the talk',
    },
    contact: {
      title: "Let's build something together",
      text: "I'm open to new challenges. Send me an email and I'll get back to you soon.",
      cta: 'Send email',
    },
    footer: 'Built with Astro, Tailwind and Three.js.',
    cvFile: '/cv/martin-toledo-resume-en.pdf',
    cvName: 'Martin-Toledo-Resume.pdf',
    cvPage: '/en/resume/',
    switchLang: { label: 'ES', href: '/' },
    theme: 'Toggle theme',
    back: 'Back to home',
  },
};
