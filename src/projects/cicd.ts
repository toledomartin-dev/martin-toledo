import type { Project } from './types';

export const cicd: Project = {
  key: 'cicd',
  diagram: {
    height: 480,
    mobileHeight: 450,
    nodes: [
      { id: 'dev', label: 'Desarrollo', icon: 'siGit', at: [110, 90], m: [60, 40] },
      { id: 'gitlab', label: 'GitLab', icon: 'siGitlab', at: [370, 90], m: [180, 130] },
      { id: 'runner', label: 'Runner build', short: 'Build', icon: 'siDocker', at: [620, 90], m: [60, 225] },
      { id: 'registry', label: 'Registry', icon: 'siDocker', at: [860, 90], m: [60, 320] },
      { id: 'templates', label: 'ci-templates', short: 'Plantillas', icon: 'siGitlab', at: [110, 260], m: [300, 40], core: true },
      { id: 'backup', label: 'Backups', icon: 'siGnubash', at: [370, 260], m: [300, 225] },
      { id: 'deploy', label: 'Runner deploy', short: 'Deploy', icon: 'siDocker', at: [620, 260], m: [180, 320] },
      { id: 'server', label: 'Producción', icon: 'siLinux', at: [620, 420], m: [180, 410] },
    ],
    edges: [
      { id: 'dg', from: 'dev', to: 'gitlab' },
      { id: 'tg', from: 'templates', to: 'gitlab' },
      { id: 'gr', from: 'gitlab', to: 'runner' },
      { id: 'rr', from: 'runner', to: 'registry' },
      { id: 'gd', from: 'gitlab', to: 'deploy' },
      { id: 'pd', from: 'registry', to: 'deploy' },
      { id: 'ds', from: 'deploy', to: 'server' },
      { id: 'gb', from: 'gitlab', to: 'backup', dashed: true },
    ],
    flow: [['dg'], ['tg'], ['gr', 'rr'], ['gd'], ['pd'], ['ds'], ['-ds'], ['gb']],
  },
  text: {
    es: {
      slug: 'ci-cd',
      meta: {
        title: 'CI/CD propio: GitLab autohospedado, deploy por tag y rollback — Martín Toledo',
        description:
          'Plantillas de CI compartidas por más de diez proyectos: builds por tag, deploy por cliente con un clic, verificación de salud y rollback automático.',
      },
      kicker: 'CI/CD propio',
      title: 'Del tag a producción, con vuelta atrás',
      lead: 'GitLab autohospedado con registry y runners, y unas plantillas compartidas que hacen que cualquier proyecto de la empresa se construya, se despliegue por cliente y vuelva a la versión anterior si algo sale mal.',
      facts: [
        { k: 'Rol', v: 'Diseño y mantenimiento' },
        { k: 'Proyectos', v: '10+ usan las plantillas' },
        { k: 'Destinos', v: '~7 servidores de producción' },
        { k: 'Clientes', v: 'Hasta 5 por proyecto, en paralelo' },
      ],
      sections: [
        {
          h: 'El problema',
          p: [
            'Cada proyecto se desplegaba a mano: entrar al servidor, bajar el código, reconstruir, cruzar los dedos. Con varios clientes por proyecto, cada uno en su servidor, una versión nueva era una tarde entera y volver atrás, otra.',
          ],
        },
        {
          h: 'Por qué autohospedado',
          p: [
            'Trabajábamos con Jira y Bitbucket. Cuando empezamos a usar pipelines, chocamos con el límite de minutos de build y con el costo de pasarlo. Lo planteamos a la dirección como una mejora: un GitLab propio en nuestros servidores, con registry y runners, nos daba pipelines sin límite de uso y sin pagar de más por cada build.',
          ],
        },
        {
          h: 'Una plantilla para todos',
          p: [
            'El .gitlab-ci.yml de cada proyecto tiene unas 40 líneas: sus variables, una matriz con un cliente y un runner por fila, y dos includes de las plantillas compartidas. Todo lo demás (construir, publicar, desplegar, verificar, revertir y limpiar) vive en un solo lugar.',
            'Cada tag construye las imágenes y las publica en el registry. El deploy a producción es un clic por cliente: el runner de ese servidor baja solo las imágenes que cambiaron, sin el repositorio y sin construir nada.',
          ],
        },
        {
          h: 'Rollback sin base de datos de versiones',
          p: [
            'Antes de desplegar, el job lee qué versión está corriendo y la guarda. Si después de tres intentos la verificación de salud sigue fallando, reescribe los tags de las imágenes y vuelve a levantar la versión anterior. Para los proyectos PHP que comparten código por volumen, cada versión vive en su carpeta y el cambio es un enlace simbólico que se reemplaza de forma atómica.',
          ],
        },
      ],
      diagram: {
        title: 'El camino de un tag',
        text: 'Qué pasa desde que alguien publica una versión hasta que corre en producción, y cómo vuelve atrás.',
        sub: {
          dev: 'push · tag vX.Y.Z',
          gitlab: 'autohospedado',
          runner: 'build en paralelo',
          registry: 'imágenes por cliente',
          templates: 'compartidas',
          backup: 'diario · 7 + 4',
          deploy: 'uno por servidor',
          server: 'Docker Compose',
        },
        edges: { dg: 'tag', tg: 'include', gr: 'pipeline', rr: 'push', gd: 'deploy (clic)', pd: 'pull', ds: 'up + salud', gb: 'diario' },
        flow: [
          'Alguien publica un tag con la versión. GitLab lo detecta y arranca el pipeline.',
          'El pipeline del proyecto son unas 40 líneas: variables, una matriz de clientes y las plantillas compartidas.',
          'El runner de build construye las imágenes en paralelo y las publica en el registry, una por servicio y por cliente.',
          'El deploy es un clic por cliente. Lo ejecuta el runner que vive en el servidor de ese cliente.',
          'El servidor baja solo las imágenes de los servicios que cambiaron. Producción nunca construye ni necesita el repositorio.',
          'Levanta los contenedores y verifica su salud. Antes guardó qué versión estaba corriendo.',
          'Si después de tres intentos algo sigue mal, vuelve solo a la versión anterior. Diez minutos después, una limpieza deja las últimas tres imágenes.',
          'El propio GitLab se respalda todos los días, con verificación SHA-256: siete copias diarias y cuatro semanales.',
        ],
      },
      stack: [
        {
          group: 'Plataforma',
          items: [
            { name: 'GitLab', icon: 'siGitlab', role: 'Autohospedado en Docker, con registry propio' },
            { name: 'GitLab Runner', icon: 'siGitlab', role: 'Uno de build y uno de deploy por servidor' },
            { name: 'Docker Compose', icon: 'siDocker', role: 'Overlays para construir y para solo bajar imágenes' },
          ],
        },
        {
          group: 'Plantillas',
          items: [
            { name: 'YAML + shell POSIX', icon: 'siGnubash', role: 'Build, deploy, reinicio, rollback y limpieza' },
            { name: 'parallel: matrix', icon: 'siGitlab', role: 'Un entorno por cliente, deploy selectivo' },
          ],
        },
        {
          group: 'Resguardo',
          items: [
            { name: 'Bash', icon: 'siGnubash', role: 'Backups con verificación y retención 7 + 4' },
            { name: 'Git hooks', icon: 'siGit', role: 'Reglas de ramas para el equipo, en Bash y PowerShell' },
          ],
        },
      ],
      lessons: {
        h: 'Lo que aprendí',
        items: [
          {
            t: 'Producción no construye',
            d: 'Construir una vez y desplegar la misma imagen en todos lados evita el "en mi servidor andaba". Los servidores solo bajan y levantan.',
          },
          {
            t: 'El rollback tiene que ser aburrido',
            d: 'Si volver atrás requiere pensar, nadie lo hace a tiempo. Guardar la versión anterior antes de cada deploy lo convierte en un paso automático.',
          },
          {
            t: 'Un clic es una decisión',
            d: 'Construir con cada tag es automático; desplegar a un cliente es un clic. Ese freno nos dejó elegir cuándo y a quién actualizar.',
          },
          {
            t: 'Los runners también se llenan',
            d: 'Sin límites, el caché de builds se comió los discos. Hoy tiene tope de 2 GB y cada servidor guarda solo las últimas imágenes.',
          },
        ],
      },
    },
    en: {
      slug: 'ci-cd',
      meta: {
        title: 'In-house CI/CD: self-hosted GitLab, tag deploys and rollback — Martín Toledo',
        description:
          'Shared CI templates used by more than ten projects: tag builds, one-click deploys per client, health checks and automatic rollback.',
      },
      kicker: 'In-house CI/CD',
      title: 'From tag to production, with a way back',
      lead: 'Self-hosted GitLab with a registry and runners, plus shared templates that let any company project build, deploy per client and go back to the previous version if something goes wrong.',
      facts: [
        { k: 'Role', v: 'Design and maintenance' },
        { k: 'Projects', v: '10+ use the templates' },
        { k: 'Targets', v: '~7 production servers' },
        { k: 'Clients', v: 'Up to 5 per project, in parallel' },
      ],
      sections: [
        {
          h: 'The problem',
          p: [
            'Every project was deployed by hand: log into the server, pull the code, rebuild, cross your fingers. With several clients per project, each on its own server, a new version took a whole afternoon, and rolling back took another.',
          ],
        },
        {
          h: 'Why self-hosted',
          p: [
            'We worked with Jira and Bitbucket. Once we started using pipelines, we hit the build-minute limit and the cost of going over it. We brought it to management as an improvement: our own GitLab on our servers, with a registry and runners, gave us pipelines with no usage limits and no paying extra for every build.',
          ],
        },
        {
          h: 'One template for everything',
          p: [
            "Each project's .gitlab-ci.yml is about 40 lines: its variables, a matrix with one client and one runner per row, and two includes of the shared templates. Everything else (build, publish, deploy, verify, roll back and clean up) lives in one place.",
            "Every tag builds the images and pushes them to the registry. Deploying to production is one click per client: that server's runner pulls only the images that changed, without the repository and without building anything.",
          ],
        },
        {
          h: 'Rollback without a release database',
          p: [
            'Before deploying, the job reads which version is running and saves it. If the health check still fails after three attempts, it rewrites the image tags and brings the previous version back up. For PHP projects that share code through a volume, each version lives in its own folder and switching is a symlink replaced atomically.',
          ],
        },
      ],
      diagram: {
        title: 'The path of a tag',
        text: 'What happens from the moment someone publishes a version until it runs in production, and how it rolls back.',
        sub: {
          dev: 'push · tag vX.Y.Z',
          gitlab: 'self-hosted',
          runner: 'parallel builds',
          registry: 'images per client',
          templates: 'shared templates',
          backup: 'daily · 7 + 4',
          deploy: 'one per server',
          server: 'Docker Compose',
        },
        edges: { dg: 'tag', tg: 'include', gr: 'pipeline', rr: 'push', gd: 'deploy (click)', pd: 'pull', ds: 'up + health', gb: 'daily' },
        flow: [
          'Someone publishes a version tag. GitLab picks it up and starts the pipeline.',
          "The project's pipeline is about 40 lines: variables, a client matrix and the shared templates.",
          'The build runner builds the images in parallel and pushes them to the registry, one per service and client.',
          "Deploying is one click per client. It runs on the runner that lives on that client's server.",
          'The server pulls only the images of the services that changed. Production never builds and never needs the repository.',
          'It starts the containers and checks their health. Before that, it saved which version was running.',
          'If something is still wrong after three attempts, it goes back to the previous version on its own. Ten minutes later, a cleanup keeps the last three images.',
          'GitLab itself is backed up every day with SHA-256 verification: seven daily and four weekly copies.',
        ],
      },
      stack: [
        {
          group: 'Platform',
          items: [
            { name: 'GitLab', icon: 'siGitlab', role: 'Self-hosted in Docker, with its own registry' },
            { name: 'GitLab Runner', icon: 'siGitlab', role: 'One for builds and one deploy runner per server' },
            { name: 'Docker Compose', icon: 'siDocker', role: 'Overlays to build or only pull images' },
          ],
        },
        {
          group: 'Templates',
          items: [
            { name: 'YAML + POSIX shell', icon: 'siGnubash', role: 'Build, deploy, restart, rollback and cleanup' },
            { name: 'parallel: matrix', icon: 'siGitlab', role: 'One environment per client, selective deploys' },
          ],
        },
        {
          group: 'Safety net',
          items: [
            { name: 'Bash', icon: 'siGnubash', role: 'Verified backups with 7 + 4 retention' },
            { name: 'Git hooks', icon: 'siGit', role: 'Branch rules for the team, in Bash and PowerShell' },
          ],
        },
      ],
      lessons: {
        h: 'What I learned',
        items: [
          {
            t: "Production doesn't build",
            d: 'Building once and deploying the same image everywhere avoids "it worked on my server". Servers only pull and run.',
          },
          {
            t: 'Rollback should be boring',
            d: 'If rolling back requires thinking, nobody does it in time. Saving the previous version before every deploy makes it an automatic step.',
          },
          {
            t: 'A click is a decision',
            d: 'Building on every tag is automatic; deploying to a client is a click. That brake let us choose when and whom to update.',
          },
          {
            t: 'Runners fill up too',
            d: 'Without limits, the build cache ate the disks. Today it is capped at 2 GB and each server keeps only the latest images.',
          },
        ],
      },
    },
  },
};
