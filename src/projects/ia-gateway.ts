import type { Project } from './types';

export const iaGateway: Project = {
  key: 'ia-gateway',
  diagram: {
    height: 410,
    mobileHeight: 370,
    nodes: [
      { id: 'widget', label: 'Asistente', icon: 'siJavascript', at: [110, 80], m: [60, 40] },
      { id: 'proxy', label: 'Proxy PHP', icon: 'siPhp', at: [110, 200], m: [60, 130] },
      { id: 'apps', label: 'Apps y devs', short: 'Apps', at: [110, 320], m: [180, 40] },
      { id: 'gateway', label: 'ia-gateway', icon: 'siNodedotjs', at: [480, 200], m: [180, 230], core: true },
      { id: 'panel', label: 'Panel', icon: 'siReact', at: [480, 340], m: [300, 40], core: true },
      { id: 'ollama', label: 'Ollama', icon: 'siOllama', at: [850, 80], m: [60, 330] },
      { id: 'db', label: 'Postgres 18', short: 'Postgres', icon: 'siPostgresql', at: [850, 200], m: [180, 330] },
      { id: 'code', label: 'Código', icon: 'siGit', at: [850, 320], m: [300, 330] },
    ],
    edges: [
      { id: 'wp', from: 'widget', to: 'proxy' },
      { id: 'pg', from: 'proxy', to: 'gateway' },
      { id: 'ag', from: 'apps', to: 'gateway' },
      { id: 'ng', from: 'panel', to: 'gateway' },
      { id: 'go', from: 'gateway', to: 'ollama' },
      { id: 'gd', from: 'gateway', to: 'db' },
      { id: 'gc', from: 'gateway', to: 'code', dashed: true },
    ],
    flow: [['wp'], ['pg'], ['gd'], ['go'], ['-go', '-pg', '-wp'], ['gc', 'gd'], ['ng'], ['ag', 'go']],
  },
  text: {
    es: {
      slug: 'ia-gateway',
      meta: {
        title: 'ia-gateway: IA autohospedada para explicar pantallas — Martín Toledo',
        description:
          'Un gateway propio delante de Ollama: claves por app, filtro de salida, cola de GPU y un asistente que explica cada pantalla de la web de gestión sin leer el código.',
      },
      kicker: 'ia-gateway',
      title: 'Una IA propia que explica cada pantalla',
      lead: 'Un servicio delante de nuestro servidor de IA autohospedado: le da a cada aplicación de la empresa acceso controlado al modelo, y suma un asistente que explica qué muestra cada pantalla de la web de gestión y si hay algo raro en sus números.',
      facts: [
        { k: 'Rol', v: 'Diseño y desarrollo, de punta a punta' },
        { k: 'Estado', v: 'Beta, en uso interno' },
        { k: 'Modelo', v: 'qwen3.5 9B en una GPU de 16 GB' },
        { k: 'Calidad', v: '~150 tests + E2E con Playwright' },
      ],
      sections: [
        {
          h: 'El objetivo',
          p: [
            'La web de gestión de la empresa tiene cientos de pantallas con reportes, filtros y tablas. Los usuarios nuevos preguntan siempre lo mismo: qué muestra esta pantalla, de dónde sale este número, por qué este total no coincide. Teníamos un servidor de IA propio con Ollama, pero ninguna forma segura de conectarlo a las aplicaciones.',
            'ia-gateway es esa forma. Cada aplicación tiene sus claves con alcances (chat, administración o API compatible con OpenAI), su perfil de filtro de salida y sus límites. Las consultas comparten la GPU con una cola acotada, así una aplicación no deja sin servicio a las demás.',
          ],
        },
        {
          h: 'Por qué el chat no lee el código',
          p: [
            'Darle el código al modelo en cada pregunta habría sido lo fácil, y lo peligroso: cualquier usuario interno podría sacarle consultas SQL, tablas, lógica de permisos o credenciales. Además, un modelo de 9B entiende mejor una descripción corta en lenguaje de negocio que 4.000 líneas de PHP.',
            'Por eso cada pantalla tiene una ficha. Un proceso la genera aparte desde una copia filtrada del código (sin archivos de configuración ni credenciales) y una persona la aprueba en el panel. La aprobación queda atada al hash del código: si el archivo cambia, la ficha se regenera como borrador y el chat sigue usando la versión aprobada.',
          ],
        },
        {
          h: '¿Algo raro en esta pantalla?',
          p: [
            'El segundo botón del asistente busca valores atípicos, concentraciones, ceros sospechosos y filas repetidas en las tablas de la pantalla. Esos cálculos los hace el gateway, de forma exacta (z-score robusto con mediana y MAD), porque un modelo chico cuenta mal y afirma números equivocados con total seguridad.',
            'El modelo solo explica los hallazgos y propone hasta dos gráficos con una receta en JSON. El gateway valida la receta contra las columnas reales y calcula la serie. Si el texto del modelo menciona un número que no está en los datos, se descarta.',
          ],
        },
        {
          h: 'Lo que viene',
          p: [
            'Conectar el modelo al centro de monitoreo para que explique cada alerta con las métricas y los logs del servidor a esa hora, y mande un resumen diario. Después: reportes de problemas que llegan a Jira con detección de duplicados por embeddings, y borradores de corrección siempre revisados por una persona.',
          ],
        },
      ],
      diagram: {
        title: 'Del botón al modelo',
        text: 'Cómo responde el asistente a "¿qué muestra esta pantalla?", y cómo se generan y aprueban las fichas.',
        sub: {
          widget: 'en cada pantalla',
          proxy: 'sesión y permisos',
          apps: 'API compatible OpenAI',
          gateway: 'Node · Express 5',
          panel: 'apps, claves, filtros',
          ollama: 'qwen3.5 · GPU',
          db: 'pgvector · fichas',
          code: 'copia filtrada',
        },
        edges: { wp: 'fetch + CSRF', pg: 'Bearer · SSE', ag: '/v1', ng: 'sesión firmada', go: 'stream', gd: 'SQL', gc: 'solo lectura' },
        flow: [
          'El asistente toma lo visible de la pantalla (títulos, filtros y hasta 20 filas por tabla) y enmascara en el navegador CBU, tarjetas y CUIT.',
          'El proxy PHP valida la sesión, el token CSRF y el permiso sobre esa pantalla. El usuario sale de la sesión del servidor, nunca del navegador.',
          'El gateway valida el pedido, permite una consulta en curso por usuario y diez por minuto, y carga la ficha aprobada de la pantalla.',
          'Espera un lugar en la GPU (cola de 8) mandando latidos para que la conexión no se corte, y le pide la respuesta a Ollama sin el bloque de "pensamiento" de qwen.',
          'Cada fragmento pasa por el filtro de salida, que corta la respuesta si aparece algo con forma de credencial, SQL o IP, y un detector de bucles. Llega al usuario en streaming.',
          'Las fichas se generan aparte: un proceso lee la copia filtrada del código, redacta credenciales e IPs, y deja un borrador en Postgres, que hace también de cola de trabajos.',
          'En el panel una persona aprueba cada ficha y administra las apps, sus claves, los perfiles del filtro y la actividad.',
          'Otras aplicaciones y herramientas de desarrollo usan la API compatible con OpenAI, con su propio filtro y un cupo de GPU que nunca deja sin servicio al asistente.',
        ],
      },
      stack: [
        {
          group: 'Gateway',
          items: [
            { name: 'Node.js 22 + TypeScript', icon: 'siNodedotjs', role: 'Modo estricto en todo el servicio' },
            { name: 'Express 5', icon: 'siExpress', role: 'Captura los errores de los handlers asíncronos' },
            { name: 'Zod', icon: 'siZod', role: 'Valida cada entrada y la configuración' },
            { name: 'Server-Sent Events', role: 'Respuesta en streaming, con cancelación' },
          ],
        },
        {
          group: 'IA y datos',
          items: [
            { name: 'Ollama', icon: 'siOllama', role: 'Servidor del modelo en nuestra GPU' },
            { name: 'qwen3.5 9B', role: 'Modelo de chat, ~114 tokens por segundo' },
            { name: 'PostgreSQL 18', icon: 'siPostgresql', role: 'Fichas, claves, registros y cola de trabajos' },
            { name: 'pgvector', role: 'Embeddings para detectar reportes duplicados' },
          ],
        },
        {
          group: 'Interfaz',
          items: [
            { name: 'React + Vite', icon: 'siReact', role: 'Panel de administración' },
            { name: 'JavaScript', icon: 'siJavascript', role: 'Asistente embebido, con gráficos en SVG propios' },
            { name: 'PHP', icon: 'siPhp', role: 'Proxy del lado del servidor en la web de gestión' },
          ],
        },
        {
          group: 'Calidad y despliegue',
          items: [
            { name: 'Vitest', icon: 'siVitest', role: '~150 tests: filtro, límites, prompts, insights' },
            { name: 'Playwright', role: 'Pruebas de punta a punta del asistente' },
            { name: 'Docker', icon: 'siDocker', role: 'Gateway y base en contenedores, sin puertos expuestos' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Tests en cada push, deploy por tag con rollback' },
          ],
        },
      ],
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'Que el modelo no piense en voz alta',
            d: 'qwen3.5 razona antes de responder. Desactivarlo bajó las respuestas a entre 2 y 15 segundos; en la API compatible, el filtro descarta ese bloque antes de reenviarlo.',
          },
          {
            t: 'Los números, fuera del modelo',
            d: 'Un modelo chico se equivoca al contar y lo dice con seguridad. Los cálculos exactos los hace el código; el modelo explica y cualquier número inventado se descarta.',
          },
          {
            t: 'Una GPU se comparte con reglas',
            d: 'Un pedido de "contame un chiste" quedó en bucle 113 segundos. Con tope de tokens, penalización de repeticiones y un detector de bucles, hoy se rechaza en menos de un segundo.',
          },
          {
            t: 'El filtro también puede ser el problema',
            d: 'Una expresión regular del filtro tardaba 470 ms y congelaba el servidor (ReDoS). Hoy las reglas propias se prueban en un Worker con un límite de 500 ms.',
          },
        ],
      },
    },
    en: {
      slug: 'ia-gateway',
      meta: {
        title: 'ia-gateway: self-hosted AI that explains every screen — Martín Toledo',
        description:
          'A custom gateway in front of Ollama: per-app keys, output guard, a GPU queue and an assistant that explains each screen of the management web without reading its code.',
      },
      kicker: 'ia-gateway',
      title: 'Our own AI that explains every screen',
      lead: "A service in front of our self-hosted AI server: it gives each company app controlled access to the model, and adds an assistant that explains what each screen of the management web shows and whether something looks off in its numbers.",
      facts: [
        { k: 'Role', v: 'Design and development, end to end' },
        { k: 'Status', v: 'Beta, in internal use' },
        { k: 'Model', v: 'qwen3.5 9B on a 16 GB GPU' },
        { k: 'Quality', v: '~150 tests + Playwright E2E' },
      ],
      sections: [
        {
          h: 'The goal',
          p: [
            "The company's management web has hundreds of screens with reports, filters and tables. New users always ask the same things: what does this screen show, where does this number come from, why doesn't this total match. We had our own AI server running Ollama, but no safe way to connect it to our apps.",
            'ia-gateway is that way. Each app gets keys with scopes (chat, admin or an OpenAI-compatible API), its own output guard profile and its own limits. Requests share the GPU through a bounded queue, so no app can starve the others.',
          ],
        },
        {
          h: 'Why the chat never reads code',
          p: [
            'Handing the code to the model on every question would have been easy, and dangerous: any internal user could pull out SQL queries, tables, permission logic or credentials. Besides, a 9B model understands a short business-language description better than 4,000 lines of PHP.',
            'So every screen has a "ficha", a short description. A separate process generates it from a filtered copy of the code (no config files or credentials) and a person approves it in the panel. Approval is tied to the code hash: if the file changes, the ficha is regenerated as a draft and the chat keeps using the approved version.',
          ],
        },
        {
          h: 'Anything odd on this screen?',
          p: [
            "The assistant's second button looks for outliers, concentration, suspicious zeros and duplicate rows in the screen's tables. The gateway does those calculations exactly (a robust z-score with median and MAD), because a small model miscounts and states wrong numbers with full confidence.",
            "The model only explains the findings and suggests up to two charts as a JSON recipe. The gateway checks the recipe against the real columns and computes the series. If the model's text mentions a number that isn't in the data, it is dropped.",
          ],
        },
        {
          h: "What's next",
          p: [
            'Connecting the model to the monitoring hub so it explains each alert using the server metrics and logs around that time, and sends a daily summary. After that: problem reports that reach Jira with duplicate detection through embeddings, and draft fixes always reviewed by a person.',
          ],
        },
      ],
      diagram: {
        title: 'From the button to the model',
        text: 'How the assistant answers "what does this screen show?", and how fichas are generated and approved.',
        sub: {
          widget: 'on every screen',
          proxy: 'session, permissions',
          apps: 'OpenAI-compatible API',
          gateway: 'Node · Express 5',
          panel: 'apps, keys, guards',
          ollama: 'qwen3.5 · GPU',
          db: 'pgvector · fichas',
          code: 'filtered copy',
        },
        edges: { wp: 'fetch + CSRF', pg: 'Bearer · SSE', ag: '/v1', ng: 'signed session', go: 'stream', gd: 'SQL', gc: 'read-only' },
        flow: [
          'The assistant captures what is visible on the screen (titles, filters and up to 20 rows per table) and masks bank accounts, cards and tax IDs in the browser.',
          "The PHP proxy checks the session, the CSRF token and the user's permission on that screen. The user comes from the server session, never from the browser.",
          "The gateway validates the request, allows one query in flight per user and ten per minute, and loads the screen's approved ficha.",
          "It waits for a GPU slot (queue of 8) while sending heartbeats so the connection stays open, and asks Ollama for the answer without qwen's \"thinking\" block.",
          'Every chunk goes through the output guard, which cuts the answer if something shaped like a credential, SQL or an IP shows up, and through a loop detector. It reaches the user as a stream.',
          'Fichas are generated separately: a process reads the filtered copy of the code, redacts credentials and IPs, and stores a draft in Postgres, which also works as the job queue.',
          'In the panel a person approves each ficha and manages apps, their keys, guard profiles and activity.',
          'Other apps and developer tools use the OpenAI-compatible API, with their own guard and a GPU quota that never starves the assistant.',
        ],
      },
      stack: [
        {
          group: 'Gateway',
          items: [
            { name: 'Node.js 22 + TypeScript', icon: 'siNodedotjs', role: 'Strict mode across the service' },
            { name: 'Express 5', icon: 'siExpress', role: 'Catches errors from async handlers' },
            { name: 'Zod', icon: 'siZod', role: 'Validates every input and the config' },
            { name: 'Server-Sent Events', role: 'Streaming answers, with cancellation' },
          ],
        },
        {
          group: 'AI and data',
          items: [
            { name: 'Ollama', icon: 'siOllama', role: 'Model server on our GPU' },
            { name: 'qwen3.5 9B', role: 'Chat model, ~114 tokens per second' },
            { name: 'PostgreSQL 18', icon: 'siPostgresql', role: 'Fichas, keys, logs and job queue' },
            { name: 'pgvector', role: 'Embeddings to detect duplicate reports' },
          ],
        },
        {
          group: 'Interface',
          items: [
            { name: 'React + Vite', icon: 'siReact', role: 'Admin panel' },
            { name: 'JavaScript', icon: 'siJavascript', role: 'Embedded assistant, with hand-made SVG charts' },
            { name: 'PHP', icon: 'siPhp', role: 'Server-side proxy in the management web' },
          ],
        },
        {
          group: 'Quality and deployment',
          items: [
            { name: 'Vitest', icon: 'siVitest', role: '~150 tests: guard, limits, prompts, insights' },
            { name: 'Playwright', role: 'End-to-end tests of the assistant' },
            { name: 'Docker', icon: 'siDocker', role: 'Gateway and database in containers, no exposed ports' },
            { name: 'GitLab CI/CD', icon: 'siGitlab', role: 'Tests on every push, tag deploys with rollback' },
          ],
        },
      ],
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: "Don't let the model think out loud",
            d: 'qwen3.5 reasons before answering. Turning that off brought replies down to 2–15 seconds; on the compatible API, the guard drops that block before forwarding.',
          },
          {
            t: 'Keep numbers out of the model',
            d: 'A small model miscounts and says so confidently. Code does the exact math; the model explains, and any made-up number is dropped.',
          },
          {
            t: 'A GPU is shared with rules',
            d: 'A "tell me a joke" request looped for 113 seconds. With a token cap, repetition penalties and a loop detector, it is now declined in under a second.',
          },
          {
            t: 'The guard can be the problem too',
            d: 'One guard regex took 470 ms and froze the server (ReDoS). Custom rules are now tested in a Worker with a 500 ms limit.',
          },
        ],
      },
    },
  },
};
