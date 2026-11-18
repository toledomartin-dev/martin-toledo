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
            'Empaquetar un microservicio en Docker y subirlo a ECR, correrlo en Kubernetes con EKS, y describir toda la infraestructura con Terraform para poder crearla y borrarla con un comando.',
          ],
        },
      ],
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
            { name: 'IAM', role: 'Un rol por Lambda, con el mínimo permiso' },
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
            { name: 'Docker', icon: 'siDocker', role: 'Entorno de desarrollo igual en cualquier máquina' },
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
            'Packaging a microservice with Docker and pushing it to ECR, running it on Kubernetes with EKS, and describing the whole infrastructure with Terraform so it can be created and destroyed with one command.',
          ],
        },
      ],
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
            { name: 'IAM', role: 'One role per Lambda, least privilege' },
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
            { name: 'Docker', icon: 'siDocker', role: 'Same dev environment on any machine' },
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
        ],
      },
    },
  },
};
