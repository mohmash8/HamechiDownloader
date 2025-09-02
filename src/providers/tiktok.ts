import { Provider, ProcessResult } from './Provider.js';
import { fetchOEmbed } from './oembed.js';

/** Metadata‑only (legal). */
export class TikTokProvider implements Provider {
  match(urlStr: string) {
    try { const u = new URL(urlStr); return u.hostname.includes('tiktok.com'); } catch { return false; }
  }
  async process(urlStr: string): Promise<ProcessResult> {
    const u = new URL(urlStr);
    const data = await fetchOEmbed('tiktok.com', urlStr);
    return { mode: 'metadata', title: data.title || 'TikTok', originalUrl: urlStr };
  }
}
