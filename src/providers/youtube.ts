import { Provider, ProcessResult } from './Provider.js';
import { fetchOEmbed } from './oembed.js';
import { URL } from 'url';

/** Metadata‑only (legal). */
export class YouTubeProvider implements Provider {
  match(urlStr: string) {
    try { const u = new URL(urlStr); return ['youtu.be','youtube.com','www.youtube.com'].includes(u.hostname); } catch { return false; }
  }
  async process(urlStr: string): Promise<ProcessResult> {
    const u = new URL(urlStr);
    const data = await fetchOEmbed(u.hostname, urlStr);
    return { mode: 'metadata', title: data.title || 'YouTube', originalUrl: urlStr };
  }
}
