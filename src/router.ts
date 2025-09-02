import { pickProvider } from './providers/index.js';
import type { ProcessResult } from './providers/Provider.js';

export async function processUrl(url: string): Promise<ProcessResult> {
  const match = pickProvider(url);
  if (!match) return { mode: 'metadata', title: 'لینک پشتیبانی نمی‌شود', originalUrl: url };
  return await match.prov.process(url);
}
