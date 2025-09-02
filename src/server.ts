import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import pino from 'pino';
import { createBot } from './bot.js';
import { CONFIG } from './config.js';
import { pool } from './db.js';
import { SCHEMA_SQL } from './schema.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const fastify = Fastify({ logger });

fastify.register(formbody);

const bot = createBot();

fastify.get('/health', async () => ({ ok: true }));

const secret = CONFIG.webhookSecret;
fastify.post(`/${secret}/telegram`, async (request, reply) => {
  try {
    await bot.handleUpdate(request.body as any);
    reply.send({ ok: true });
  } catch (e) {
    request.log.error(e);
    reply.status(500).send({ ok: false });
  }
});

async function ensureSchema() {
  try {
    await pool.query(SCHEMA_SQL);
  } catch (e: any) {
    throw new Error('DB schema apply failed: ' + e?.message);
  }
}

async function main() {
  await ensureSchema();

  // start HTTP first
  const port = Number(process.env.PORT || 3000);
  await fastify.listen({ port, host: '0.0.0.0' });
  fastify.log.info('HTTP server up');

  // then set webhook; fallback to long-polling if it fails
  const webhookUrl = `${CONFIG.baseUrl}/${secret}/telegram`;
  try {
    await bot.telegram.setWebhook(webhookUrl);
    fastify.log.info({ webhookUrl }, 'Webhook set');
  } catch (e: any) {
    fastify.log.error({ err: e?.message, webhookUrl }, 'setWebhook failed → fallback to long-polling');
    await bot.telegram.deleteWebhook();
    await bot.launch();
    fastify.log.warn('Long-polling launched');
  }
}

main().catch((e: any) => {
  fastify.log.error({ err: e?.message || e, stack: e?.stack }, 'fatal');
  process.exit(1);
});
