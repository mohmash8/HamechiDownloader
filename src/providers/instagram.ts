import { Provider, ProcessResult } from './Provider.js';
import { fetchOEmbed } from './oembed.js';
import { URL } from 'url';

/** Metadata‑only (legal). */
export class InstagramProvider implements Provider {
  match(urlStr: string) {
    try { const u = new URL(urlStr); return ['instagram.com','www.instagram.com'].includes(u.hostname); } catch { return false; }
  }
  async process(urlStr: string): Promise<ProcessResult> {
    const u = new URL(urlStr);
    const data = await fetchOEmbed(u.hostname, urlStr);
    return { mode: 'metadata', title: data.title || 'Instagram Post', originalUrl: urlStr };
  }
}
