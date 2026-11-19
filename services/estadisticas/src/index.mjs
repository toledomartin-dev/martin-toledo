// Microservicio de estadísticas de juego. Corre en un contenedor (Docker → ECR → EKS).
//
//   POST /eventos       la consola avisa "abrió Entaxi", "jugó Fort-Deploy"… → cola SQS FIFO
//   GET  /estadisticas  totales de la semana (para la etiqueta "Más jugado" de la consola)
//   GET  /salud         para que Kubernetes sepa si el proceso está vivo
//
// En segundo plano, un consumidor lee la cola, junta los eventos en memoria y cada pocos
// segundos los escribe en DynamoDB de una vez. Es lo que justifica un proceso que queda
// corriendo: una Lambda se ejecuta por evento y no puede ir acumulando entre ejecuciones.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageBatchCommand } from '@aws-sdk/client-sqs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';

// ---------- Configuración (variables de entorno: la misma imagen sirve en mi PC y en EKS)
const { COLA_URL, TABLA } = process.env;
const PUERTO = Number(process.env.PUERTO ?? 8080);
const GUARDAR_CADA_MS = Number(process.env.GUARDAR_CADA_MS ?? 10_000);
if (!COLA_URL || !TABLA) {
  console.error('Faltan las variables COLA_URL y TABLA');
  process.exit(1);
}

// Las credenciales NO están en el código ni en la imagen: el SDK las busca solo
// (en mi PC, el perfil del AWS CLI; en EKS, el rol asignado al pod).
const sqs = new SQSClient({});
const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TIPOS = new Set(['visita', 'ver', 'detalles', 'jugar']);
const JUEGO = /^[a-z0-9-]{1,40}$/;
const SESION = /^[A-Za-z0-9-]{8,64}$/;

// Logs en JSON: en CloudWatch se pueden filtrar por campo ({ $.msg = "Lote guardado" })
const log = (msg, datos = {}) => console.log(JSON.stringify({ t: new Date().toISOString(), msg, ...datos }));
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// Semana ISO, por ejemplo "2026-W47": los contadores se agrupan por semana
function semana(fecha = new Date()) {
  const d = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const inicioDelAnio = Date.UTC(d.getUTCFullYear(), 0, 1);
  const n = Math.ceil(((d.getTime() - inicioDelAnio) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(n).padStart(2, '0')}`;
}

// ---------- API HTTP (sin framework: node:http alcanza para tres rutas y la imagen queda chica)
function responder(res, status, cuerpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(cuerpo));
}

function leerCuerpo(req, limite = 2048) {
  return new Promise((resolve, reject) => {
    let texto = '';
    req.on('data', (parte) => {
      texto += parte;
      if (texto.length > limite) reject(new Error('Cuerpo demasiado grande'));
    });
    req.on('end', () => resolve(texto));
    req.on('error', reject);
  });
}

async function recibirEvento(req, res) {
  let datos;
  try {
    datos = JSON.parse(await leerCuerpo(req));
  } catch {
    return responder(res, 400, { error: 'El cuerpo tiene que ser JSON (y chico)' });
  }
  const sesion = String(datos.sesion ?? '');
  const tipo = String(datos.tipo ?? '');
  const juego = datos.juego == null ? undefined : String(datos.juego);
  if (!SESION.test(sesion) || !TIPOS.has(tipo) || (juego && !JUEGO.test(juego))) {
    return responder(res, 400, { error: 'Evento inválido' });
  }
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: COLA_URL,
      MessageBody: JSON.stringify({ sesion, tipo, juego, fecha: new Date().toISOString() }),
      // Un grupo por visita: los eventos de una misma visita se procesan en orden
      // (así se puede reconstruir el recorrido: vio Entaxi → abrió detalles → jugó)
      MessageGroupId: sesion,
      MessageDeduplicationId: randomUUID(),
    }),
  );
  responder(res, 202, { ok: true });
}

// Las estadísticas cambian poco: se guardan 30 s en memoria para no leer DynamoDB en cada pedido
let cache = { hasta: 0, datos: null };
async function estadisticas(res) {
  if (Date.now() < cache.hasta) return responder(res, 200, cache.datos);
  const sem = semana();
  const r = await db.send(new QueryCommand({ TableName: TABLA, KeyConditionExpression: 'pk = :pk', ExpressionAttributeValues: { ':pk': `SEMANA#${sem}` } }));
  const porJuego = {};
  let visitas = 0;
  for (const item of r.Items ?? []) {
    const [tipo, juego] = item.sk.split('#');
    if (tipo === 'visita') visitas += item.cantidad;
    else if (juego !== '-') (porJuego[juego] ??= {})[tipo] = item.cantidad;
  }
  const masJugado = Object.entries(porJuego).sort((a, b) => (b[1].jugar ?? 0) - (a[1].jugar ?? 0))[0]?.[0] ?? null;
  const datos = { semana: sem, visitas, porJuego, masJugado };
  cache = { hasta: Date.now() + 30_000, datos };
  responder(res, 200, datos);
}

const servidor = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/salud') return responder(res, 200, { ok: true, pendientes: recibos.length });
    if (req.method === 'POST' && req.url === '/eventos') return await recibirEvento(req, res);
    if (req.method === 'GET' && req.url === '/estadisticas') return await estadisticas(res);
    responder(res, 404, { error: 'Ruta desconocida' });
  } catch (err) {
    log('Error atendiendo un pedido', { url: req.url, error: String(err) });
    responder(res, 500, { error: 'Error interno' });
  }
});

// ---------- Consumidor de la cola
let sumas = new Map(); // "tipo#juego" → cuántos eventos llegaron desde el último guardado
let recibos = []; // mensajes ya contados: se borran de la cola recién después de guardarlos
let crudos = []; // cada evento suelto, para ver recorridos (DynamoDB los borra solo a los 30 días)
let corriendo = true;

async function consumir() {
  while (corriendo) {
    try {
      // Long polling: espera hasta 20 s a que haya mensajes, en vez de preguntar sin parar.
      // VisibilityTimeout 60 s: más largo que el intervalo de guardado, para que no reaparezcan antes.
      const r = await sqs.send(new ReceiveMessageCommand({ QueueUrl: COLA_URL, MaxNumberOfMessages: 10, WaitTimeSeconds: 20, VisibilityTimeout: 60 }));
      for (const m of r.Messages ?? []) {
        recibos.push({ Id: m.MessageId, ReceiptHandle: m.ReceiptHandle });
        let e;
        try {
          e = JSON.parse(m.Body);
        } catch {
          log('Evento roto, se descarta', { id: m.MessageId });
          continue;
        }
        const clave = `${e.tipo}#${e.juego ?? '-'}`;
        sumas.set(clave, (sumas.get(clave) ?? 0) + 1);
        crudos.push(e);
      }
    } catch (err) {
      log('Error leyendo la cola', { error: String(err) });
      await esperar(5000);
    }
  }
}

// Escribe lo acumulado de una vez. Si algo falla, los mensajes NO se borran de la cola:
// reaparecen cuando vence su visibilidad y se vuelven a contar ("al menos una vez").
async function guardar() {
  if (!recibos.length) return;
  const [lote, totales, eventos] = [recibos, sumas, crudos];
  [recibos, sumas, crudos] = [[], new Map(), []];
  const pk = `SEMANA#${semana()}`;
  try {
    // 1. Contadores: ADD es atómico, así que varias réplicas del micro pueden sumar a la vez
    await Promise.all(
      [...totales].map(([sk, n]) =>
        db.send(new UpdateCommand({ TableName: TABLA, Key: { pk, sk }, UpdateExpression: 'ADD cantidad :n', ExpressionAttributeValues: { ':n': n } })),
      ),
    );
    // 2. Eventos sueltos, de a 25 (el máximo de BatchWriteItem), con vencimiento para el TTL
    const expira = Math.floor(Date.now() / 1000) + 30 * 86_400;
    for (let i = 0; i < eventos.length; i += 25) {
      const r = await db.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLA]: eventos.slice(i, i + 25).map((e) => ({
              PutRequest: { Item: { pk: `SESION#${e.sesion}`, sk: `${e.fecha}#${e.tipo}`, juego: e.juego, expira } },
            })),
          },
        }),
      );
      const sinGuardar = Object.values(r.UnprocessedItems ?? {}).flat().length;
      if (sinGuardar) log('Algunos eventos sueltos no se guardaron (capacidad)', { sinGuardar });
    }
    // 3. Recién ahora se borran de la cola, de a 10 (el máximo de DeleteMessageBatch)
    for (let i = 0; i < lote.length; i += 10) {
      await sqs.send(new DeleteMessageBatchCommand({ QueueUrl: COLA_URL, Entries: lote.slice(i, i + 10) }));
    }
    log('Lote guardado', { eventos: lote.length, contadores: totales.size });
  } catch (err) {
    log('Error guardando el lote: se reintenta cuando los mensajes reaparezcan', { error: String(err) });
  }
}

async function guardarPeriodicamente() {
  while (corriendo) {
    await esperar(GUARDAR_CADA_MS);
    await guardar();
  }
}

// ---------- Apagado ordenado. Kubernetes manda SIGTERM antes de matar un pod (por ejemplo, al
// actualizar la versión): se deja de leer la cola y se guarda lo acumulado antes de salir.
async function apagar(senal) {
  log('Apagando', { senal });
  corriendo = false;
  servidor.close();
  await guardar();
  process.exit(0);
}
process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));

servidor.listen(PUERTO, () => log('Escuchando', { puerto: PUERTO, guardarCadaMs: GUARDAR_CADA_MS }));
consumir();
guardarPeriodicamente();
