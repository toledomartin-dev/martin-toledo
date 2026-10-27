import type { Project } from './types';

export const monitoreo: Project = {
  key: 'monitoreo',
  diagram: {
    height: 480,
    mobileHeight: 450,
    nodes: [
      { id: 'kuma', label: 'Uptime Kuma', short: 'Kuma', icon: 'siUptimekuma', at: [110, 90], m: [60, 40] },
      { id: 'servers', label: 'Servidores', icon: 'siLinux', at: [110, 260], m: [180, 40] },
      { id: 'prom', label: 'Prometheus', icon: 'siPrometheus', at: [370, 90], m: [60, 130] },
      { id: 'loki', label: 'Loki', icon: 'siGrafana', at: [370, 260], m: [180, 130] },
      { id: 'alert', label: 'Alertmanager', short: 'Alertas', icon: 'siPrometheus', at: [620, 90], m: [60, 225] },
      { id: 'hub', label: 'hub-admin', icon: 'siReact', at: [620, 260], m: [180, 320], core: true },
      { id: 'ntfy', label: 'ntfy', icon: 'siNtfy', at: [860, 90], m: [300, 225] },
      { id: 'n8n', label: 'n8n', icon: 'siN8n', at: [860, 260], m: [300, 40] },
      { id: 'ollama', label: 'Ollama', icon: 'siOllama', at: [620, 420], m: [180, 410] },
    ],
    edges: [
      { id: 'kp', from: 'kuma', to: 'prom' },
      { id: 'sp', from: 'servers', to: 'prom' },
      { id: 'sl', from: 'servers', to: 'loki' },
      { id: 'pa', from: 'prom', to: 'alert' },
      { id: 'la', from: 'loki', to: 'alert' },
      { id: 'ah', from: 'alert', to: 'hub' },
      { id: 'an', from: 'alert', to: 'ntfy' },
      { id: 'nn', from: 'n8n', to: 'ntfy' },
      { id: 'ho', from: 'hub', to: 'ollama', dashed: true },
    ],
    flow: [['sp', 'sl', 'kp'], ['pa', 'la'], ['ah'], ['an'], ['nn'], ['ho']],
  },
  text: {
    es: {
      slug: 'monitoreo',
      meta: {
        title: 'Monitoreo e infraestructura: Prometheus, Loki y alertas por ntfy — Martín Toledo',
        description:
          'El centro de monitoreo de los servidores de la empresa: métricas, logs, chequeos externos, alertas ruteadas por tema y un panel propio.',
      },
      kicker: 'Monitoreo e infraestructura',
      title: 'Saber qué pasa en cada servidor, antes que el cliente',
      lead: 'Un centro de monitoreo para los servidores de toda la empresa: métricas, logs, chequeos desde afuera y alertas que le llegan a la persona correcta, al celular, sin despertar a todos por cualquier cosa.',
      facts: [
        { k: 'Rol', v: 'Diseño e implementación' },
        { k: 'Servidores', v: '16+ en varios datacenters' },
        { k: 'Stack', v: '~20 contenedores, 7 tableros' },
        { k: 'Retención', v: 'Métricas 30 días · logs 14 días' },
      ],
      sections: [
        {
          h: 'El problema',
          p: [
            'Los problemas se descubrían cuando un cliente llamaba. Había métricas sueltas en algunos servidores, pero nada que juntara métricas, logs y disponibilidad, y ninguna forma de que una alerta le llegara a quien tenía que resolverla.',
          ],
        },
        {
          h: 'Alertas que no cansan',
          p: [
            'Cada regla lleva una severidad y una categoría (recursos, servicios, seguridad, sistema). Los problemas de recursos suenan con prioridad alta; el resto llega en silencio a su tema y se repite cada 12 o 24 horas. Las notificaciones se publican en ntfy en cinco niveles: todo, área, proyecto, servidor y categoría, así cada persona se suscribe a lo suyo.',
            'Las reglas y el árbol de ruteo se prueban en CI con promtool y amtool: una regla sin severidad o sin categoría no pasa.',
          ],
        },
        {
          h: 'Un servidor nuevo, en una línea',
          p: [
            'Sumar un servidor es pegar un comando con un código de instalación que vence a los 15 minutos. El instalador registra el servidor en la base del hub y Prometheus lo descubre solo. Los scripts de monitoreo se actualizan a diario, con canal canario y estable, y se pueden aprobar, revertir o congelar desde el panel.',
          ],
        },
        {
          h: 'Lo que viene: alertas explicadas por IA',
          p: [
            'El próximo paso es conectar hub-admin con nuestro modelo autohospedado: un botón "Explicar" en cada alerta que junte las métricas y los logs del servidor alrededor de esa hora y proponga qué revisar, y un resumen diario de las alertas silenciosas.',
          ],
        },
      ],
      diagram: {
        title: 'De la métrica al celular',
        text: 'Cómo una métrica o un log se convierte en una alerta que le llega a la persona correcta. El panel propio y la integración con IA son lo que más construí.',
        sub: {
          kuma: 'chequeos externos',
          servers: 'exporters · Alloy',
          prom: 'métricas · 30 días',
          loki: 'logs · 14 días',
          alert: 'ruteo y silencios',
          hub: 'panel propio · PWA',
          ntfy: 'push por tema',
          n8n: 'eventos de negocio',
          ollama: 'próximo: explicar',
        },
        edges: { kp: '/metrics', sp: 'scrape', sl: 'Alloy', pa: 'reglas', la: 'ruler', ah: 'historial', an: '5 niveles', nn: 'webhook', ho: 'próximo' },
        flow: [
          'Cada servidor expone sus métricas (sistema, MySQL y scripts propios) y Alloy manda los logs a Loki. Uptime Kuma revisa desde afuera dominios, certificados, DNS y puertos.',
          'Prometheus y Loki evalúan unas 25 reglas. Cada una lleva severidad y categoría, y se valida en CI antes de llegar a producción.',
          'Alertmanager guarda primero cada alerta en el historial de hub-admin, que la conserva 90 días.',
          'Después la rutea a ntfy por tema: los problemas de recursos suenan con prioridad alta y el resto llega en silencio.',
          'Las aplicaciones también avisan eventos de negocio a n8n, que busca quién está suscripto y los publica en ntfy.',
          'Lo próximo: hub-admin le pasa al modelo la alerta con las métricas y los logs de esa hora, y el modelo escribe qué parece haber pasado y qué revisar.',
        ],
      },
      stack: [
        {
          group: 'Métricas y logs',
          items: [
            { name: 'Prometheus', icon: 'siPrometheus', role: 'Métricas con descubrimiento de servidores desde el hub' },
            { name: 'Loki + Alloy', icon: 'siGrafana', role: 'Logs de cada servidor, con token por servidor' },
            { name: 'Grafana', icon: 'siGrafana', role: '7 tableros versionados' },
            { name: 'Uptime Kuma', icon: 'siUptimekuma', role: 'Dominios, TLS, DNS y vencimientos' },
          ],
        },
        {
          group: 'Alertas',
          items: [
            { name: 'Alertmanager', icon: 'siPrometheus', role: 'Ruteo por severidad y categoría' },
            { name: 'ntfy', icon: 'siNtfy', role: 'Push a Android, iOS y web por tema' },
            { name: 'n8n', icon: 'siN8n', role: 'Eventos de negocio a los suscriptos' },
          ],
        },
        {
          group: 'Panel propio',
          items: [
            { name: 'React + Node', icon: 'siReact', role: 'hub-admin: resumen, historial, mapa de dependencias, logs y crons' },
            { name: 'TypeScript', icon: 'siTypescript', role: 'En el panel y en la API' },
            { name: 'MariaDB', icon: 'siMariadb', role: 'Servidores, suscripciones e historial' },
          ],
        },
        {
          group: 'Operación',
          items: [
            { name: 'Docker Compose', icon: 'siDocker', role: 'Todo el stack, con imágenes fijadas por digest' },
            { name: 'nginx + certbot', icon: 'siNginx', role: 'Entrada con TLS y autenticación de los agentes' },
            { name: 'Trivy + nuclei', role: 'Escaneos de seguridad en los servidores' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Tests de reglas y deploy por tag' },
          ],
        },
      ],
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'Un contenedor sano puede estar ciego',
            d: 'Después de un deploy, Prometheus seguía "sano" sin 3 de sus 5 objetivos: los contenedores apuntaban a archivos de configuración ya borrados. Ahora la configuración vive en un volumen que se actualiza sin cambiar de archivo.',
          },
          {
            t: 'Las fugas lentas también avisan',
            d: 'Un servidor juntó 439 mil conexiones TCP a medio cerrar hasta quedarse sin memoria. Hoy una alerta proyecta la tendencia de la memoria y otra vigila los descriptores de archivo.',
          },
          {
            t: 'Menos alertas, mejores alertas',
            d: 'Si todo suena, nada importa. Separar por categoría y dejar en silencio lo que no es urgente hizo que la gente vuelva a mirar las notificaciones.',
          },
          {
            t: 'Un salto de línea, 401 en todo',
            d: 'Un secreto con un salto de línea al final rompió la autenticación de todos los objetivos. Los secretos ahora se entregan como archivos, sin saltos de línea.',
          },
        ],
      },
    },
    en: {
      slug: 'monitoring',
      meta: {
        title: 'Monitoring and infrastructure: Prometheus, Loki and ntfy alerts — Martín Toledo',
        description:
          "The company's server monitoring hub: metrics, logs, external checks, alerts routed by topic and a custom admin panel.",
      },
      kicker: 'Monitoring and infrastructure',
      title: 'Knowing what happens on every server, before the client does',
      lead: "A monitoring hub for the whole company's servers: metrics, logs, outside-in checks and alerts that reach the right person's phone, without waking everyone up for anything.",
      facts: [
        { k: 'Role', v: 'Design and implementation' },
        { k: 'Servers', v: '16+ across several datacenters' },
        { k: 'Stack', v: '~20 containers, 7 dashboards' },
        { k: 'Retention', v: 'Metrics 30 days · logs 14 days' },
      ],
      sections: [
        {
          h: 'The problem',
          p: [
            'Problems were discovered when a client called. Some servers had scattered metrics, but nothing brought metrics, logs and availability together, and there was no way for an alert to reach the person who had to fix it.',
          ],
        },
        {
          h: "Alerts that don't wear you out",
          p: [
            'Every rule carries a severity and a category (resources, services, security, system). Resource problems ring at high priority; the rest arrive silently on their topic and repeat every 12 or 24 hours. Notifications go to ntfy on five levels: everything, area, project, server and category, so each person subscribes to what matters to them.',
            'Rules and the routing tree are tested in CI with promtool and amtool: a rule without a severity or a category does not pass.',
          ],
        },
        {
          h: 'A new server in one line',
          p: [
            "Adding a server means pasting one command with an install code that expires in 15 minutes. The installer registers the server in the hub's database and Prometheus discovers it on its own. Monitoring scripts update daily, with canary and stable channels, and can be approved, rolled back or frozen from the panel.",
          ],
        },
        {
          h: "What's next: alerts explained by AI",
          p: [
            'The next step is connecting hub-admin to our self-hosted model: an "Explain" button on every alert that gathers the server metrics and logs around that time and suggests what to check, plus a daily summary of the silent alerts.',
          ],
        },
      ],
      diagram: {
        title: 'From metric to phone',
        text: 'How a metric or a log line becomes an alert that reaches the right person. The custom panel and the AI integration are what I built the most.',
        sub: {
          kuma: 'external checks',
          servers: 'exporters · Alloy',
          prom: 'metrics · 30 days',
          loki: 'logs · 14 days',
          alert: 'routing and silences',
          hub: 'custom panel · PWA',
          ntfy: 'push by topic',
          n8n: 'business events',
          ollama: 'next: explain',
        },
        edges: { kp: '/metrics', sp: 'scrape', sl: 'Alloy', pa: 'rules', la: 'ruler', ah: 'history', an: '5 levels', nn: 'webhook', ho: 'next' },
        flow: [
          'Each server exposes its metrics (system, MySQL and custom scripts) and Alloy ships logs to Loki. Uptime Kuma checks domains, certificates, DNS and ports from the outside.',
          'Prometheus and Loki evaluate about 25 rules. Each one carries a severity and a category, and is validated in CI before reaching production.',
          'Alertmanager first stores every alert in the hub-admin history, which keeps it for 90 days.',
          'Then it routes it to ntfy by topic: resource problems ring at high priority and the rest arrive silently.',
          'Apps also report business events to n8n, which looks up who is subscribed and publishes them to ntfy.',
          'Next: hub-admin hands the model the alert with the metrics and logs from that time, and the model writes what seems to have happened and what to check.',
        ],
      },
      stack: [
        {
          group: 'Metrics and logs',
          items: [
            { name: 'Prometheus', icon: 'siPrometheus', role: 'Metrics, with server discovery from the hub' },
            { name: 'Loki + Alloy', icon: 'siGrafana', role: 'Logs from every server, with a per-server token' },
            { name: 'Grafana', icon: 'siGrafana', role: '7 versioned dashboards' },
            { name: 'Uptime Kuma', icon: 'siUptimekuma', role: 'Domains, TLS, DNS and expirations' },
          ],
        },
        {
          group: 'Alerts',
          items: [
            { name: 'Alertmanager', icon: 'siPrometheus', role: 'Routing by severity and category' },
            { name: 'ntfy', icon: 'siNtfy', role: 'Push to Android, iOS and web by topic' },
            { name: 'n8n', icon: 'siN8n', role: 'Business events to subscribers' },
          ],
        },
        {
          group: 'Custom panel',
          items: [
            { name: 'React + Node', icon: 'siReact', role: 'hub-admin: summary, history, dependency map, logs and crons' },
            { name: 'TypeScript', icon: 'siTypescript', role: 'Across the panel and the API' },
            { name: 'MariaDB', icon: 'siMariadb', role: 'Servers, subscriptions and history' },
          ],
        },
        {
          group: 'Operations',
          items: [
            { name: 'Docker Compose', icon: 'siDocker', role: 'The whole stack, images pinned by digest' },
            { name: 'nginx + certbot', icon: 'siNginx', role: 'TLS entry point and agent authentication' },
            { name: 'Trivy + nuclei', role: 'Security scans on the servers' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Rule tests and tag deploys' },
          ],
        },
      ],
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: 'A healthy container can be blind',
            d: 'After a deploy, Prometheus stayed "healthy" while missing 3 of its 5 targets: containers pointed at config files that no longer existed. Config now lives in a volume that updates without replacing the file.',
          },
          {
            t: 'Slow leaks warn you too',
            d: 'One server piled up 439k half-closed TCP connections until it ran out of memory. Now one alert projects the memory trend and another watches file descriptors.',
          },
          {
            t: 'Fewer alerts, better alerts',
            d: 'If everything rings, nothing matters. Splitting by category and silencing what is not urgent got people looking at notifications again.',
          },
          {
            t: 'One newline, 401 everywhere',
            d: 'A secret with a trailing newline broke authentication on every target. Secrets are now delivered as files, with no newlines.',
          },
        ],
      },
    },
  },
};
