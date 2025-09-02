import { Queue, Worker, Job } from 'bullmq';
import { CONFIG } from './config.js';
import { processUrl } from './router.js';
import { updateJob } from './db.js';
import { bot } from './tg.js';
import { getActiveAd } from './services/ads.js';
import { logger } from './logger.js';

export type DownloadJob = {
  chatId: number;
  url: string;
  provider: string;
  jobId: number;
};

export const queue = new Queue<DownloadJob>('downloads', {
  connection: { url: CONFIG.redisUrl },
  defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 } }
});

export function startWorker() {
  const worker = new Worker<DownloadJob>('downloads', async (job: Job<DownloadJob>) => {
    const { chatId, url, provider, jobId } = job.data;
    await updateJob(jobId, { status: 'processing' });

    const result = await processUrl(url, provider);

    if (result.mode === 'metadata') {
      await bot.telegram.sendMessage(chatId, `ℹ️ ${result.title}\n${result.originalUrl}`);
      await updateJob(jobId, { status: 'done', filename: result.title });
      const ad = await getActiveAd();
      if (ad) await bot.telegram.sendMessage(chatId, `اسپانسر: ${ad.text}${ad.url ? '\n' + ad.url : ''}`);
      return;
    }

    if (result.mode === 'file') {
      await bot.telegram.sendDocument(chatId, { source: result.stream, filename: result.filename });
      await updateJob(jobId, { status: 'done', filename: result.filename, size_bytes: result.sizeBytes || null, mime: result.mime || null });
      const ad = await getActiveAd();
      if (ad) await bot.telegram.sendMessage(chatId, `اسپانسر: ${ad.text}${ad.url ? '\n' + ad.url : ''}`);
    }
  }, { connection: { url: CONFIG.redisUrl }, concurrency: 3 });

  worker.on('completed', (job) => logger.info({ jobId: job.id }, 'job completed'));
  worker.on('failed', (job, err) => logger.error({ jobId: job?.id, err }, 'job failed'));
}
