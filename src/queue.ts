import { CONFIG } from './config.js';
import { processUrl } from './router.js';
import { updateJob } from './db.js';
import { bot } from './tg.js';
import { getActiveAd } from './services/ads.js';
import { logger } from './logger.js';

// Optional BullMQ import guarded
let Bull: typeof import('bullmq') | null = null;
try { Bull = await import('bullmq'); } catch { Bull = null; }

export type DownloadJob = {
  chatId: number;
  url: string;
  provider: string;
  jobId: number;
};

// Public API
export let addJob: (j: DownloadJob) => Promise<void>;
export function startWorker() {
  if (CONFIG.redisUrl && Bull) {
    const { Queue, Worker, Job } = Bull;
    const queue = new Queue<DownloadJob>('downloads', {
      connection: { url: CONFIG.redisUrl },
      defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
    });
    addJob = async (j) => { await queue.add('download', j); };

    const worker = new Worker<DownloadJob>('downloads', async (job: any) => run(job.data), {
      connection: { url: CONFIG.redisUrl }, concurrency: 3
    });
    worker.on('completed', (job) => logger.info({ jobId: job.id }, 'job completed'));
    worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'job failed'));
    logger.info('Worker (BullMQ) started');
  } else {
    // In-memory simple queue
    const q: DownloadJob[] = [];
    let busy = false;

    addJob = async (j) => { q.push(j); tick(); };

    async function tick() {
      if (busy) return;
      busy = true;
      while (q.length) {
        const job = q.shift()!;
        try { await run(job); logger.info({ jobId: job.jobId }, 'job completed'); }
        catch (err) { logger.error({ err, jobId: job.jobId }, 'job failed'); }
      }
      busy = false;
    }
    logger.info('Worker (in-memory) started');
  }
}

async function run(data: DownloadJob) {
  const { chatId, url, provider, jobId } = data;
  await updateJob(jobId, { status: 'processing' });

  const result = await processUrl(url, provider);
  if (result.mode === 'metadata') {
    await bot.telegram.sendMessage(chatId, `ℹ️ ${result.title}\n${result.originalUrl}`);
    await updateJob(jobId, { status: 'done', filename: result.title });
  } else {
    await bot.telegram.sendDocument(chatId, { source: result.stream, filename: result.filename });
    await updateJob(jobId, { status: 'done', filename: result.filename, size_bytes: result.sizeBytes || null, mime: result.mime || null });
  }
  const ad = await getActiveAd();
  if (ad) await bot.telegram.sendMessage(chatId, `اسپانسر: ${ad.text}${ad.url ? '\n' + ad.url : ''}`);
}
