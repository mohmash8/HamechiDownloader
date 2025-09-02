import { CONFIG } from './config.js';
import { processUrl } from './router.js';
import { bot } from './tg.js';
import { logger } from './logger.js';

let Bull: typeof import('bullmq') | null = null;
try { Bull = await import('bullmq'); } catch { Bull = null; }

export type DownloadJob = { chatId: number; url: string; };

export let addJob: (j: DownloadJob) => Promise<void>;

export function startWorker() {
  if (CONFIG.redisUrl && Bull) {
    const { Queue, Worker } = Bull;
    const queue = new Queue<DownloadJob>('downloads', {
      connection: { } as any,
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    });
    addJob = async (j) => { await queue.add('download', j); };
    const worker = new Worker<DownloadJob>('downloads', async (job) => run(job.data), { connection: { } as any, concurrency: 3 });
    worker.on('completed', (job) => logger.info({ jobId: job.id }, 'job completed'));
    worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'job failed'));
    logger.info('Worker (BullMQ) started');
  } else {
    const q: DownloadJob[] = [];
    let busy = false;
    addJob = async (j) => { q.push(j); tick(); };
    async function tick() {
      if (busy) return;
      busy = true;
      while (q.length) {
        const job = q.shift()!;
        try { await run(job); logger.info('job completed'); } catch (err) { logger.error({ err }, 'job failed'); }
      }
      busy = false;
    }
    logger.info('Worker (in-memory) started');
  }
}

async function run({ chatId, url }: DownloadJob) {
  const result = await processUrl(url);
  if (result.mode === 'metadata') {
    await bot.telegram.sendMessage(chatId, `ℹ️ ${result.title}\n${result.originalUrl}`);
  } else {
    await bot.telegram.sendDocument(chatId, { source: result.stream, filename: result.filename });
  }
}
