import type { Project } from './types';

// Este mismo sitio: el portfolio, la consola y todo lo que corre detrás en AWS.
// Las piezas de AWS no tienen ícono en simple-icons: se dibujan con monograma.
export const portfolio: Project = {
  key: 'portfolio',
  diagram: {
    height: 480,
    mobileHeight: 530,
    nodes: [
      { id: 'pages', label: 'Cloudflare Pages', short: 'Pages', icon: 'siCloudflarepages', at: [100, 240], m: [180, 40] },
      { id: 'browser', label: 'Navegador', icon: 'siAstro', at: [100, 400], m: [60, 40], core: true },
      { id: 'github', label: 'GitHub', icon: 'siGithub', at: [100, 80], m: [300, 40] },
      { id: 'turnstile', label: 'Turnstile', icon: 'siCloudflare', at: [360, 80], m: [60, 150] },
      { id: 'apigw', label: 'API Gateway', short: 'API GW', at: [360, 240], m: [180, 150], core: true },
      { id: 'cognito', label: 'Cognito', at: [360, 400], m: [300, 150], core: true },
      { id: 'libro', label: 'λ libro', at: [620, 80], m: [60, 260] },
      { id: 'trofeos', label: 'λ trofeos', at: [620, 240], m: [180, 260] },
      { id: 'google', label: 'Google', icon: 'siGoogle', at: [620, 400], m: [300, 260] },
      { id: 'sqs', label: 'SQS FIFO', at: [870, 80], m: [60, 370] },
      { id: 'procesar', label: 'λ procesar', at: [870, 240], m: [60, 480] },
      { id: 'dynamo', label: 'DynamoDB', at: [870, 400], m: [180, 480], core: true },
    ],
    edges: [
      { id: 'gp', from: 'github', to: 'pages', dashed: true },
      { id: 'pb', from: 'pages', to: 'browser' },
      { id: 'bt', from: 'browser', to: 'turnstile', wideOnly: true },
      { id: 'ba', from: 'browser', to: 'apigw' },
      { id: 'bc', from: 'browser', to: 'cognito' },
      { id: 'cg', from: 'cognito', to: 'google' },
      { id: 'al', from: 'apigw', to: 'libro' },
      { id: 'at', from: 'apigw', to: 'trofeos' },
      { id: 'lt', from: 'libro', to: 'turnstile', dashed: true },
      { id: 'ls', from: 'libro', to: 'sqs' },
      { id: 'sp', from: 'sqs', to: 'procesar' },
      { id: 'pd', from: 'procesar', to: 'dynamo' },
      { id: 'td', from: 'trofeos', to: 'dynamo' },
    ],
    flow: [['gp'], ['pb'], ['bt'], ['ba', 'al', 'lt'], ['ls', 'sp', 'pd'], ['bc', 'cg'], ['ba', 'at', 'td']],
  },
  // El micro de estadísticas: de un tag de git a un pod en EKS, expuesto por API Gateway
  extra: {
    height: 500,
    mobileHeight: 420,
    nodes: [
      { id: 'gh', label: 'GitHub', icon: 'siGithub', at: [100, 80], m: [60, 40] },
      { id: 'actions', label: 'GitHub Actions', short: 'Actions', icon: 'siGithubactions', at: [360, 80], m: [180, 40] },
      { id: 'ecr', label: 'ECR', at: [620, 80], m: [300, 40] },
      { id: 'iam', label: 'Pod Identity', at: [870, 80] },
      { id: 'cliente', label: 'Cliente', at: [100, 260], m: [60, 150] },
      { id: 'apigw', label: 'API Gateway', short: 'API GW', at: [360, 260], m: [180, 150] },
      { id: 'lb', label: 'Balanceador', short: 'ELB', at: [620, 260], m: [180, 260] },
      { id: 'pod', label: 'Pod en EKS', short: 'Pod', icon: 'siKubernetes', at: [870, 260], m: [300, 260], core: true },
      { id: 'sqs', label: 'SQS FIFO', at: [620, 420], m: [180, 370] },
      { id: 'dynamo', label: 'DynamoDB', at: [870, 420], m: [300, 370] },
    ],
    edges: [
      { id: 'ga', from: 'gh', to: 'actions' },
      { id: 'ae', from: 'actions', to: 'ecr' },
      { id: 'ep', from: 'ecr', to: 'pod' },
      { id: 'ip', from: 'iam', to: 'pod', dashed: true },
      { id: 'ca', from: 'cliente', to: 'apigw' },
      { id: 'al', from: 'apigw', to: 'lb' },
      { id: 'lp', from: 'lb', to: 'pod' },
      { id: 'ps', from: 'pod', to: 'sqs' },
      { id: 'pd', from: 'pod', to: 'dynamo' },
    ],
    flow: [['ga', 'ae'], ['ep'], ['ip'], ['ca', 'al', 'lp'], ['ps'], ['-ps', 'pd']],
  },
  text: {
    es: {
      slug: 'portfolio-lab',
      meta: {
        title: 'Portfolio Lab: este sitio, la consola y AWS — Martín Toledo',
        description:
          'Mi portfolio es también mi campo de pruebas: Astro y Three.js en Cloudflare, un libro de visitas con API Gateway, SQS FIFO, Lambda y DynamoDB, y login con Google a través de Cognito.',
      },
      kicker: 'Portfolio Lab',
      title: 'Mi portfolio, y mi campo de pruebas',
      lead: 'Lo que estás viendo. Empezó como una página para mostrar proyectos y se convirtió en el lugar donde pruebo tecnologías de verdad: una consola de juegos inventada, un libro de visitas que pasa por una cola de AWS, inicio de sesión con Google y trofeos globales.',
      facts: [
        { k: 'Rol', v: 'Diseño, desarrollo e infraestructura' },
        { k: 'Estado', v: 'En producción, siempre en evolución' },
        { k: 'Costo', v: '≈ US$ 0 al mes (capas gratuitas)' },
        { k: 'Nube', v: 'Cloudflare + AWS (Ohio)' },
      ],
      sections: [
        {
          h: 'El objetivo',
          p: [
            'Quería un portfolio que no fuera solo una lista. Cada proyecto tiene su página con un diagrama animado de la arquitectura, y la consola muestra los mismos proyectos como juegos, con teclado, joystick o el dedo.',
            'Después se sumó otro objetivo: aprender AWS haciendo. En lugar de seguir un tutorial aparte, cada servicio que aprendo termina funcionando acá, a la vista de cualquiera que visite el sitio.',
          ],
        },
        {
          h: 'Un libro de visitas que pasa por una cola',
          p: [
            'Firmar el libro parece simple, pero el mensaje recorre cinco piezas. La web lo manda a API Gateway; una Lambda valida el captcha de Cloudflare Turnstile del lado del servidor y lo deja en una cola SQS FIFO; otra Lambda lo retira y lo guarda en DynamoDB.',
            'La API responde 202 ("lo recibí, lo voy a procesar") y no espera a la base. La cola FIFO mantiene el orden y descarta duplicados, y la Lambda que guarda usa una condición para que procesar el mismo mensaje dos veces no lo repita.',
          ],
        },
        {
          h: 'Iniciar sesión sin librerías',
          p: [
            'En la consola se puede jugar como invitado o con la cuenta de Google. El login pasa por Amazon Cognito con el flujo de código de autorización y PKCE, escrito a mano para entender cada paso: la clave temporal, el intercambio del código por tokens y su renovación.',
            'La API no confía en la web: API Gateway verifica la firma de cada token con un autorizador JWT antes de llamar a la Lambda. Sin token válido, el pedido se corta con 401 y la Lambda ni se entera.',
          ],
        },
        {
          h: 'Trofeos globales',
          p: [
            'Cada trofeo muestra qué porcentaje de jugadores lo consiguió. Los contadores son atómicos (DynamoDB suma en su propio servidor, sin pisarse) y cada desbloqueo es una transacción: se anota el trofeo del usuario y se suma al contador, todo o nada.',
            'La anotación lleva la condición "solo si no existía": repetir el pedido cancela la transacción y el contador no se infla. Usuarios y contadores conviven en una sola tabla, con claves pensadas para las consultas.',
          ],
        },
        {
          h: 'Lo que viene',
          p: [
            'Conectar las estadísticas a la consola para mostrar qué proyecto es el más jugado, y describir toda la infraestructura con Terraform para poder crearla y borrarla con un comando.',
          ],
        },
      ],
      extra: {
        h: 'Un microservicio en Kubernetes',
        p: [
          'Para aprender contenedores armé un microservicio en Node que cuenta qué proyectos se miran y se juegan en la consola. Recibe cada evento por HTTP y lo deja en una cola SQS FIFO, agrupado por visita. En segundo plano lee esa misma cola, junta los eventos en memoria y cada 10 segundos los guarda en DynamoDB de una vez, con contadores atómicos. Por eso es un proceso que queda corriendo y no una Lambda: una Lambda no puede ir acumulando entre ejecuciones.',
          'La imagen de Docker es multi-stage y corre sin root. La sube un pipeline de GitHub Actions al publicar una etiqueta de git, a un repositorio de ECR con versiones inmutables y escaneo de vulnerabilidades. En EKS corre con un Deployment con chequeos de salud y un Service que crea el balanceador, y API Gateway queda delante como única puerta de entrada.',
          'El pod no tiene ninguna clave: EKS Pod Identity le da credenciales temporales de un rol que solo puede usar esa cola y esa tabla. Al actualizar la versión, Kubernetes levanta el pod nuevo y recién entonces le avisa al viejo con SIGTERM, que guarda lo pendiente antes de salir: no se pierde ningún evento.',
          'Lo levanté, lo probé y lo borré en una tarde: el cluster cobra por hora aunque nadie lo use. Queda todo listo para volver a crearlo en media hora.',
        ],
        diagram: {
          title: 'De un tag de git a un pod en EKS',
          text: 'Cómo llega una versión nueva al cluster y qué recorre un evento desde que entra por API Gateway hasta que queda guardado.',
          sub: {
            gh: 'tag estadisticas-v2',
            actions: 'docker build',
            ecr: 'imágenes inmutables',
            iam: 'rol sin claves',
            cliente: 'consola · curl',
            apigw: 'HTTP API',
            lb: 'Service de Kubernetes',
            pod: 'Node · sin root',
            sqs: 'agrupada por visita',
            dynamo: 'contadores · TTL',
          },
          edges: {
            ga: 'push del tag',
            ae: 'docker push',
            ep: 'pull',
            ip: 'credenciales',
            ca: 'POST /eventos',
            al: 'proxy',
            lp: 'puerto 8080',
            ps: 'enviar · leer',
            pd: 'lote cada 10 s',
          },
          flow: [
            'Publicar una etiqueta de git dispara GitHub Actions: construye la imagen y la sube a ECR. Las etiquetas son inmutables: v2 siempre es la misma imagen.',
            'El nodo de EKS descarga la imagen de ECR con su propio rol, y el Deployment mantiene el pod corriendo: si se borra o se cae, levanta otro.',
            'Pod Identity le da al pod credenciales temporales de un rol que solo puede usar la cola y la tabla. Ni la imagen ni el manifiesto tienen claves.',
            'Un evento entra por API Gateway, pasa por el balanceador que creó el Service de Kubernetes y llega al pod, que solo recibe tráfico cuando su chequeo de salud responde.',
            'El pod deja el evento en la cola FIFO y responde 202. Los eventos de una misma visita se procesan en orden, aunque haya varias réplicas.',
            'En segundo plano, el mismo pod lee la cola con long polling, junta lo recibido y cada 10 segundos lo guarda en DynamoDB. Recién después lo borra de la cola.',
          ],
        },
      },
      diagram: {
        title: 'Del navegador a AWS',
        text: 'Cómo llega el sitio a tu navegador, cómo viaja una firma del libro de visitas y cómo se guardan los trofeos de tu cuenta.',
        sub: {
          pages: 'sitio estático',
          browser: 'Astro · Three.js',
          github: 'código',
          turnstile: 'captcha',
          apigw: 'HTTP API · JWT',
          cognito: 'User Pool',
          libro: 'publicar · leer',
          trofeos: 'Node · arm64',
          google: 'OAuth · OIDC',
          sqs: 'orden y sin duplicados',
          procesar: 'cola → base',
          dynamo: 'mensajes · trofeos',
        },
        edges: {
          gp: 'push → build',
          pb: 'HTML',
          bt: 'token',
          ba: 'fetch',
          bc: 'código + PKCE',
          cg: 'OIDC',
          al: 'POST / GET',
          at: 'Bearer JWT',
          lt: 'siteverify',
          ls: 'SendMessage',
          sp: 'disparador',
          pd: 'PutItem',
          td: 'transacción',
        },
        flow: [
          'Cada push a GitHub dispara un build en Cloudflare Pages: Astro genera páginas estáticas en los dos idiomas, con las imágenes optimizadas.',
          'El navegador recibe HTML listo. Three.js dibuja las partículas del inicio y la consola funciona con teclado, joystick (Gamepad API) o touch.',
          'Al firmar el libro de visitas, Cloudflare Turnstile comprueba sin preguntas que no seas un robot y entrega un token.',
          'API Gateway recibe el mensaje, aplica el límite de pedidos y el CORS, y llama a la Lambda, que valida el token del captcha con Cloudflare. Sin captcha válido: 403.',
          'El mensaje entra a la cola SQS FIFO y la API responde 202. Otra Lambda lo retira y lo guarda en DynamoDB, sin duplicados aunque llegue dos veces.',
          'Para entrar con Google, la consola va a Cognito con PKCE; Cognito le pregunta a Google quién sos y devuelve un código que se cambia por tokens JWT.',
          'Cada trofeo nuevo viaja con el token. API Gateway verifica su firma y la Lambda guarda el trofeo y suma al contador global en una transacción.',
        ],
      },
      stack: [
        {
          group: 'Web',
          items: [
            { name: 'Astro', icon: 'siAstro', role: 'Sitio estático en dos idiomas, sin framework en el cliente' },
            { name: 'TypeScript', icon: 'siTypescript', role: 'Todo el código del navegador' },
            { name: 'Tailwind CSS', icon: 'siTailwindcss', role: 'Estilos y tema claro u oscuro' },
            { name: 'Three.js', icon: 'siThreedotjs', role: 'Partículas del inicio y del encendido de la consola' },
          ],
        },
        {
          group: 'AWS',
          items: [
            { name: 'API Gateway', role: 'HTTP API con CORS, límite de pedidos y autorizador JWT' },
            { name: 'Lambda', role: 'Node.js en arm64: publicar, procesar y trofeos' },
            { name: 'SQS FIFO', role: 'Cola ordenada y sin duplicados para el libro de visitas' },
            { name: 'DynamoDB', role: 'Mensajes, trofeos, contadores atómicos y transacciones' },
            { name: 'Cognito', role: 'Usuarios y login federado con Google' },
            { name: 'IAM', role: 'Un rol por Lambda y por pod, con el mínimo permiso' },
          ],
        },
        {
          group: 'Contenedores',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'Imagen multi-stage del microservicio, sin root' },
            { name: 'Kubernetes (EKS)', icon: 'siKubernetes', role: 'Deployment con chequeos de salud, Service y Pod Identity' },
            { name: 'ECR', role: 'Registro privado con versiones inmutables y escaneo' },
            { name: 'GitHub Actions', icon: 'siGithubactions', role: 'Construye y sube la imagen al publicar una etiqueta' },
          ],
        },
        {
          group: 'Identidad y seguridad',
          items: [
            { name: 'Google OAuth / OIDC', icon: 'siGoogle', role: 'Iniciar sesión con la cuenta de Google' },
            { name: 'JWT', icon: 'siJsonwebtokens', role: 'Tokens firmados que verifica API Gateway' },
            { name: 'Cloudflare Turnstile', icon: 'siCloudflare', role: 'Captcha invisible, validado en el servidor' },
          ],
        },
        {
          group: 'Herramientas',
          items: [
            { name: 'Cloudflare Pages', icon: 'siCloudflarepages', role: 'Hosting y deploy en cada push' },
            { name: 'GitHub', icon: 'siGithub', role: 'Código y disparador del deploy' },
            { name: 'Puppeteer', icon: 'siPuppeteer', role: 'Capturas automáticas para revisar cada cambio' },
            { name: 'Claude Code', icon: 'siClaude', role: 'Par de programación y guías paso a paso' },
          ],
        },
      ],
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'La cola confía en el consumidor',
            d: 'Dos mensajes de prueba se perdieron: la Lambda los retiró con el código de ejemplo, antes de que publicara el mío. SQS los dio por procesados. Desde entonces, los errores se reportan por mensaje (ReportBatchItemFailures).',
          },
          {
            t: 'CORS es del navegador, no de la API',
            d: 'Desde PowerShell todo andaba y desde la web daba "Failed to fetch": faltaba permitir el encabezado content-type. Después pasó lo mismo con authorization.',
          },
          {
            t: 'Un límite demasiado bajo también es un error',
            d: 'Con 5 pedidos por segundo, la propia web recibía 429 al cargar. El límite es global para toda la API, no por visitante.',
          },
          {
            t: 'Las URL de retorno, exactas',
            d: 'En OAuth cada dirección de vuelta se carga de antemano, con barra final incluida. Es la protección contra que alguien robe el login mandándolo a su página.',
          },
          {
            t: 'Cuando algo se traba sin error, CloudTrail',
            d: 'El nodo de EKS quedó media hora en "Creando" sin avisar nada. CloudTrail mostró la causa: el plan gratuito de AWS rechazaba ese tipo de instancia en cada intento. Una prueba con --dry-run no lo detecta, porque solo revisa permisos.',
          },
          {
            t: 'Sin root, pero con número',
            d: 'Kubernetes se negó a arrancar el pod: la imagen decía USER node y no podía comprobar que un nombre no fuera root. Con runAsUser: 1000 arrancó. kubectl describe dio el motivo exacto.',
          },
        ],
      },
    },
    en: {
      slug: 'portfolio-lab',
      meta: {
        title: 'Portfolio Lab: this site, the console and AWS — Martín Toledo',
        description:
          'My portfolio is also my testing ground: Astro and Three.js on Cloudflare, a guestbook with API Gateway, SQS FIFO, Lambda and DynamoDB, and Google sign-in through Cognito.',
      },
      kicker: 'Portfolio Lab',
      title: 'My portfolio, and my testing ground',
      lead: "What you're looking at. It started as a page to show projects and became the place where I try technologies for real: a made-up game console, a guestbook that goes through an AWS queue, Google sign-in and global trophies.",
      facts: [
        { k: 'Role', v: 'Design, development and infrastructure' },
        { k: 'Status', v: 'In production, always evolving' },
        { k: 'Cost', v: '≈ US$0 a month (free tiers)' },
        { k: 'Cloud', v: 'Cloudflare + AWS (Ohio)' },
      ],
      sections: [
        {
          h: 'The goal',
          p: [
            "I wanted a portfolio that wasn't just a list. Every project has its own page with an animated architecture diagram, and the console shows the same projects as games, playable with a keyboard, a gamepad or a finger.",
            "Then a second goal came along: learning AWS by doing. Instead of following a separate tutorial, every service I learn ends up running here, in plain sight for anyone visiting the site.",
          ],
        },
        {
          h: 'A guestbook that goes through a queue',
          p: [
            'Signing the guestbook looks simple, but the message travels through five pieces. The site sends it to API Gateway; a Lambda validates the Cloudflare Turnstile captcha server-side and drops it into an SQS FIFO queue; another Lambda picks it up and stores it in DynamoDB.',
            'The API answers 202 ("got it, I\'ll process it") without waiting for the database. The FIFO queue keeps order and drops duplicates, and the storing Lambda uses a condition so that processing the same message twice never repeats it.',
          ],
        },
        {
          h: 'Signing in without libraries',
          p: [
            'In the console you can play as a guest or with your Google account. Sign-in goes through Amazon Cognito using the authorization code flow with PKCE, written by hand to understand every step: the temporary key, exchanging the code for tokens and refreshing them.',
            "The API doesn't trust the site: API Gateway checks every token's signature with a JWT authorizer before calling the Lambda. Without a valid token the request stops with 401 and the Lambda never hears about it.",
          ],
        },
        {
          h: 'Global trophies',
          p: [
            'Every trophy shows what percentage of players earned it. Counters are atomic (DynamoDB adds on its own server, with no lost updates) and each unlock is a transaction: the user\'s trophy is recorded and the counter goes up, all or nothing.',
            'The record carries an "only if it didn\'t exist" condition: repeating the request cancels the transaction and the counter never inflates. Users and counters live in a single table, with keys designed around the queries.',
          ],
        },
        {
          h: "What's next",
          p: [
            'Wiring the stats into the console to show which project is played the most, and describing the whole infrastructure with Terraform so it can be created and destroyed with one command.',
          ],
        },
      ],
      extra: {
        h: 'A microservice on Kubernetes',
        p: [
          'To learn containers I built a Node microservice that counts which projects are viewed and played in the console. It receives each event over HTTP and drops it into an SQS FIFO queue, grouped by visit. In the background it reads that same queue, batches events in memory and every 10 seconds writes them to DynamoDB in one go, with atomic counters. That is why it is a long-running process and not a Lambda: a Lambda cannot keep accumulating between invocations.',
          'The Docker image is multi-stage and runs as non-root. A GitHub Actions pipeline pushes it when a git tag is published, to an ECR repository with immutable versions and vulnerability scanning. On EKS it runs as a Deployment with health checks and a Service that creates the load balancer, with API Gateway in front as the single way in.',
          'The pod has no keys at all: EKS Pod Identity hands it temporary credentials for a role that can only use that queue and that table. On a new version, Kubernetes starts the new pod and only then sends SIGTERM to the old one, which saves what is pending before exiting: no event is lost.',
          'I brought it up, tested it and tore it down in one afternoon: the cluster is billed by the hour even when idle. Everything is ready to create it again in half an hour.',
        ],
        diagram: {
          title: 'From a git tag to a pod on EKS',
          text: 'How a new version reaches the cluster, and the path an event takes from API Gateway until it is stored.',
          sub: {
            gh: 'tag estadisticas-v2',
            actions: 'docker build',
            ecr: 'immutable images',
            iam: 'keyless role',
            cliente: 'console · curl',
            apigw: 'HTTP API',
            lb: 'Kubernetes Service',
            pod: 'Node · non-root',
            sqs: 'grouped by visit',
            dynamo: 'counters · TTL',
          },
          edges: {
            ga: 'tag push',
            ae: 'docker push',
            ep: 'pull',
            ip: 'credentials',
            ca: 'POST /eventos',
            al: 'proxy',
            lp: 'port 8080',
            ps: 'send · receive',
            pd: 'batch every 10 s',
          },
          flow: [
            'Publishing a git tag triggers GitHub Actions: it builds the image and pushes it to ECR. Tags are immutable: v2 is always the same image.',
            'The EKS node pulls the image from ECR with its own role, and the Deployment keeps the pod running: if it is deleted or crashes, another one starts.',
            'Pod Identity gives the pod temporary credentials for a role that can only use the queue and the table. Neither the image nor the manifest holds any keys.',
            'An event comes in through API Gateway, goes through the load balancer created by the Kubernetes Service and reaches the pod, which only gets traffic once its health check answers.',
            'The pod drops the event into the FIFO queue and answers 202. Events from the same visit are processed in order, even with several replicas.',
            'In the background, the same pod reads the queue with long polling, batches what it got and every 10 seconds stores it in DynamoDB. Only then is it deleted from the queue.',
          ],
        },
      },
      diagram: {
        title: 'From the browser to AWS',
        text: 'How the site reaches your browser, how a guestbook entry travels and how your account trophies are stored.',
        sub: {
          pages: 'static site',
          browser: 'Astro · Three.js',
          github: 'code',
          turnstile: 'captcha',
          apigw: 'HTTP API · JWT',
          cognito: 'User Pool',
          libro: 'post · read',
          trofeos: 'Node · arm64',
          google: 'OAuth · OIDC',
          sqs: 'ordered, no duplicates',
          procesar: 'queue → table',
          dynamo: 'messages · trophies',
        },
        edges: {
          gp: 'push → build',
          pb: 'HTML',
          bt: 'token',
          ba: 'fetch',
          bc: 'code + PKCE',
          cg: 'OIDC',
          al: 'POST / GET',
          at: 'Bearer JWT',
          lt: 'siteverify',
          ls: 'SendMessage',
          sp: 'trigger',
          pd: 'PutItem',
          td: 'transaction',
        },
        flow: [
          'Every push to GitHub triggers a build on Cloudflare Pages: Astro generates static pages in both languages, with optimized images.',
          'The browser gets ready-made HTML. Three.js draws the home particles and the console works with a keyboard, a gamepad (Gamepad API) or touch.',
          "When you sign the guestbook, Cloudflare Turnstile checks you're not a bot without asking anything and hands over a token.",
          'API Gateway receives the message, applies rate limits and CORS, and calls the Lambda, which validates the captcha token with Cloudflare. No valid captcha: 403.',
          'The message enters the SQS FIFO queue and the API answers 202. Another Lambda picks it up and stores it in DynamoDB, with no duplicates even if it arrives twice.',
          'To sign in with Google, the console goes to Cognito with PKCE; Cognito asks Google who you are and returns a code that is exchanged for JWT tokens.',
          'Every new trophy travels with the token. API Gateway verifies its signature and the Lambda stores the trophy and bumps the global counter in one transaction.',
        ],
      },
      stack: [
        {
          group: 'Web',
          items: [
            { name: 'Astro', icon: 'siAstro', role: 'Static site in two languages, no client framework' },
            { name: 'TypeScript', icon: 'siTypescript', role: 'All the browser code' },
            { name: 'Tailwind CSS', icon: 'siTailwindcss', role: 'Styles and light or dark theme' },
            { name: 'Three.js', icon: 'siThreedotjs', role: 'Home particles and the console boot animation' },
          ],
        },
        {
          group: 'AWS',
          items: [
            { name: 'API Gateway', role: 'HTTP API with CORS, rate limits and a JWT authorizer' },
            { name: 'Lambda', role: 'Node.js on arm64: publish, process and trophies' },
            { name: 'SQS FIFO', role: 'Ordered, duplicate-free queue for the guestbook' },
            { name: 'DynamoDB', role: 'Messages, trophies, atomic counters and transactions' },
            { name: 'Cognito', role: 'Users and federated sign-in with Google' },
            { name: 'IAM', role: 'One role per Lambda and per pod, least privilege' },
          ],
        },
        {
          group: 'Containers',
          items: [
            { name: 'Docker', icon: 'siDocker', role: 'Multi-stage, non-root image for the microservice' },
            { name: 'Kubernetes (EKS)', icon: 'siKubernetes', role: 'Deployment with health checks, Service and Pod Identity' },
            { name: 'ECR', role: 'Private registry with immutable versions and scanning' },
            { name: 'GitHub Actions', icon: 'siGithubactions', role: 'Builds and pushes the image when a tag is published' },
          ],
        },
        {
          group: 'Identity and security',
          items: [
            { name: 'Google OAuth / OIDC', icon: 'siGoogle', role: 'Sign in with a Google account' },
            { name: 'JWT', icon: 'siJsonwebtokens', role: 'Signed tokens verified by API Gateway' },
            { name: 'Cloudflare Turnstile', icon: 'siCloudflare', role: 'Invisible captcha, validated server-side' },
          ],
        },
        {
          group: 'Tools',
          items: [
            { name: 'Cloudflare Pages', icon: 'siCloudflarepages', role: 'Hosting and a deploy on every push' },
            { name: 'GitHub', icon: 'siGithub', role: 'Code and deploy trigger' },
            { name: 'Puppeteer', icon: 'siPuppeteer', role: 'Automatic screenshots to review every change' },
            { name: 'Claude Code', icon: 'siClaude', role: 'Pair programming and step-by-step guides' },
          ],
        },
      ],
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: 'The queue trusts the consumer',
            d: 'Two test messages were lost: the Lambda picked them up with the sample code, before I deployed mine. SQS considered them done. Since then, failures are reported per message (ReportBatchItemFailures).',
          },
          {
            t: "CORS belongs to the browser, not the API",
            d: 'Everything worked from PowerShell and the site said "Failed to fetch": the content-type header wasn\'t allowed. Later the same happened with authorization.',
          },
          {
            t: 'A limit that is too low is a bug too',
            d: 'At 5 requests per second, the site itself got 429s while loading. The limit applies to the whole API, not per visitor.',
          },
          {
            t: 'Redirect URLs, exactly',
            d: 'In OAuth every return address is registered in advance, trailing slash included. That is what stops someone from stealing the sign-in by sending it to their own page.',
          },
          {
            t: 'When something hangs silently, CloudTrail',
            d: 'The EKS node sat in "Creating" for half an hour with no error. CloudTrail showed why: the AWS free plan rejected that instance type on every attempt. A --dry-run test does not catch it, because it only checks permissions.',
          },
          {
            t: 'Non-root, but as a number',
            d: 'Kubernetes refused to start the pod: the image said USER node and it could not verify that a name was not root. With runAsUser: 1000 it started. kubectl describe gave the exact reason.',
          },
        ],
      },
    },
  },
};
