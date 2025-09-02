import Fastify from 'fastify';
import formbody from '@fastify/formbody';
import { bot } from './tg.js';
import { registerBotHandlers } from './bot.js';
import { CONFIG } from './config.js';
import { logger } from './logger.js';
import { startWorker } from './queue.js';

const fastify = Fastify({ logger });

fastify.register(formbody);

registerBotHandlers(bot);

// Health
fastify.get('/health', async () => ({ ok: true }));

// Telegram Webhook endpoint
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

async function main() {
  // Set webhook
  const webhookUrl = `${CONFIG.baseUrl}/${secret}/telegram`;
  await bot.telegram.setWebhook(webhookUrl);
  logger.info({ webhookUrl }, 'Webhook set');

  // Start worker in same process
  startWorker();

  const port = Number(process.env.PORT || 3000);
  await fastify.listen({ port, host: '0.0.0.0' });
  logger.info('HTTP server up');
}

main().catch((e) => {
  logger.error(e, 'fatal');
  process.exit(1);
});
