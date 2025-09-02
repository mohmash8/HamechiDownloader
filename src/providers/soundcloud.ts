import { Provider, ProcessResult } from './Provider.js';
import { fetchOEmbed } from './oembed.js';
import { URL } from 'url';

/** Metadata‑only (legal). */
export class SoundCloudProvider implements Provider {
  match(urlStr: string) {
    try { const u = new URL(urlStr); return u.hostname.endsWith('soundcloud.com'); } catch { return false; }
  }
  async process(urlStr: string): Promise<ProcessResult> {
    const u = new URL(urlStr);
    const data = await fetchOEmbed(u.hostname, urlStr);
    return { mode: 'metadata', title: data.title || 'SoundCloud', originalUrl: urlStr };
  }
}
